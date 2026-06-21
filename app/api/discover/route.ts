import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 25;

const CACHE_TTL_MS = 1000 * 60 * 60 * 6;
const RATE_LIMIT_WINDOW_MS = 1000 * 60;
const RATE_LIMIT_MAX_REQUESTS = 8;
const MAX_QUERY_LENGTH = 120;
const GEMINI_TIMEOUT_MS = 1000 * 20;
const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-2.5-flash-lite";
const BLOCKED_HOSTS = new Set([
  "google.com",
  "www.google.com",
  "vertexaisearch.cloud.google.com",
]);
const TECH_SOURCE_HINTS = [
  "engineering",
  "developer",
  "developers",
  "case-study",
  "case-studies",
  "case study",
  "architecture",
  "performance",
  "reliability",
  "scaling",
  "scale",
  "migration",
  "infrastructure",
  "technical",
  "technology",
  "postmortem",
  "incident",
  "android",
  "ios",
  "mobile",
  "cloud",
  "data",
  "machine-learning",
  "ai",
];

type DiscoveryResult = {
  title: string;
  company: string;
  sourceUrl: string;
  publisher: string;
  summary: string;
  reason: string;
};

type CompanySource = {
  aliases: string[];
  company: string;
  feedUrl: string;
  pageUrl?: string;
  publisher: string;
  type: "rss" | "uber-page";
};

type DiscoveryPayload = {
  citations?: Array<{
    title: string;
    uri: string;
  }>;
  results: DiscoveryResult[];
  source?: "company-feed" | "gemini";
};

type CacheEntry = {
  expiresAt: number;
  payload: DiscoveryPayload;
};

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const globalStore = globalThis as typeof globalThis & {
  discoveryCache?: Map<string, CacheEntry>;
  discoveryRateLimit?: Map<string, RateLimitEntry>;
};

const discoveryCache = globalStore.discoveryCache ?? new Map<string, CacheEntry>();
const discoveryRateLimit = globalStore.discoveryRateLimit ?? new Map<string, RateLimitEntry>();

globalStore.discoveryCache = discoveryCache;
globalStore.discoveryRateLimit = discoveryRateLimit;

const COMPANY_SOURCES: CompanySource[] = [
  {
    aliases: ["grab"],
    company: "Grab",
    feedUrl: "https://engineering.grab.com/feed.xml",
    publisher: "Grab Tech Blog",
    type: "rss",
  },
  {
    aliases: ["uber"],
    company: "Uber",
    feedUrl: "",
    pageUrl: "https://eng.uber.com/",
    publisher: "Uber Engineering",
    type: "uber-page",
  },
];

function getClientId(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const firstForwardedIp = forwardedFor?.split(",")[0]?.trim();
  return (
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-real-ip") ??
    firstForwardedIp ??
    "unknown"
  );
}

function isRateLimited(clientId: string): boolean {
  const now = Date.now();
  const existing = discoveryRateLimit.get(clientId);

  if (!existing || existing.resetAt <= now) {
    discoveryRateLimit.set(clientId, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return false;
  }

  existing.count += 1;
  return existing.count > RATE_LIMIT_MAX_REQUESTS;
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timeout: ReturnType<typeof setTimeout> | undefined;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeout = setTimeout(() => {
      reject(new Error("Expanded search timed out. Please try again."));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeout) {
      clearTimeout(timeout);
    }
  }
}

function extractJson(text: string): unknown {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const jsonText = fenced?.[1] ?? trimmed;
  return JSON.parse(jsonText);
}

function tryExtractJson(text: string): unknown {
  try {
    return extractJson(text);
  } catch {
    const arrayMatch = text.match(/\[[\s\S]*\]/);

    if (!arrayMatch) {
      return [];
    }

    try {
      return JSON.parse(arrayMatch[0]);
    } catch {
      return [];
    }
  }
}

function normalizeResults(value: unknown): DiscoveryResult[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const record = item as Record<string, unknown>;
      const title = typeof record.title === "string" ? record.title.trim() : "";
      const company = typeof record.company === "string" ? record.company.trim() : "";
      const sourceUrl = typeof record.sourceUrl === "string" ? record.sourceUrl.trim() : "";
      const publisher = typeof record.publisher === "string" ? record.publisher.trim() : "";
      const summary = typeof record.summary === "string" ? record.summary.trim() : "";
      const reason = typeof record.reason === "string" ? record.reason.trim() : "";

      if (!title || !sourceUrl || !sourceUrl.startsWith("http")) {
        return null;
      }

      return {
        title,
        company,
        sourceUrl,
        publisher,
        summary,
        reason,
      };
    })
    .filter((item): item is DiscoveryResult => item !== null)
    .slice(0, 5);
}

function decodeXml(value: string): string {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function stripHtml(value: string): string {
  return decodeXml(value)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeQuery(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, " ");
}

function queryTermsWithoutCompany(query: string, source: CompanySource): string[] {
  const terms = normalizeQuery(query).split(/\s+/).filter(Boolean);
  const aliases = new Set(source.aliases.map((alias) => alias.toLowerCase()));
  return terms.filter((term) => !aliases.has(term));
}

function matchesCompanySource(query: string): CompanySource | null {
  const terms = new Set(normalizeQuery(query).split(/\s+/).filter(Boolean));
  return (
    COMPANY_SOURCES.find((source) =>
      source.aliases.some((alias) => terms.has(alias.toLowerCase())),
    ) ?? null
  );
}

function parseFeedItems(xml: string, source: CompanySource, query: string): DiscoveryResult[] {
  const terms = queryTermsWithoutCompany(query, source);
  const itemMatches = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];

  return itemMatches
    .map((match) => {
      const item = match[1];
      const title = stripHtml(item.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? "");
      const link = stripHtml(item.match(/<link>([\s\S]*?)<\/link>/)?.[1] ?? "");
      const description = stripHtml(
        item.match(/<description>([\s\S]*?)<\/description>/)?.[1] ?? "",
      );
      const pubDate = stripHtml(item.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] ?? "");
      const searchable = normalizeQuery(`${title} ${description}`);

      if (!title || !link || !link.startsWith("http")) {
        return null;
      }

      if (terms.length > 0 && !terms.every((term) => searchable.includes(term))) {
        return null;
      }

      return {
        title,
        company: source.company,
        sourceUrl: link,
        publisher: source.publisher,
        summary: description.slice(0, 220) || `Recent ${source.company} engineering post.`,
        reason: pubDate ? `Published ${pubDate}` : `Fetched from ${source.publisher}`,
      };
    })
    .filter((item): item is DiscoveryResult => item !== null)
    .slice(0, 5);
}

function parseUberPage(html: string, source: CompanySource, query: string): DiscoveryResult[] {
  const terms = queryTermsWithoutCompany(query, source);
  const cardMatches = [...html.matchAll(/<a class="blog-card"([\s\S]*?)<\/a>/g)];

  return cardMatches
    .map((match) => {
      const card = match[0];
      const href = card.match(/href="([^"]+)"/)?.[1] ?? "";
      const title = stripHtml(card.match(/<h3 class="blog-card-title">([\s\S]*?)<\/h3>/)?.[1] ?? "");
      const excerpt = stripHtml(
        card.match(/<p class="blog-card-excerpt">([\s\S]*?)<\/p>/)?.[1] ?? "",
      );
      const date = match[1].match(/data-date="([^"]+)"/)?.[1] ?? "";
      const category = stripHtml(
        card.match(/<span class="blog-card-category"[^>]*>([\s\S]*?)<\/span>/)?.[1] ?? "",
      );
      const searchable = normalizeQuery(`${title} ${excerpt} ${category}`);

      if (!title || !href || !href.startsWith("http")) {
        return null;
      }

      if (terms.length > 0 && !terms.every((term) => searchable.includes(term))) {
        return null;
      }

      return {
        title,
        company: source.company,
        sourceUrl: href,
        publisher: source.publisher,
        summary: excerpt || `Recent ${source.company} engineering post.`,
        reason: date ? `Published ${date}` : `Fetched from ${source.publisher}`,
      };
    })
    .filter((item): item is DiscoveryResult => item !== null)
    .slice(0, 5);
}

async function discoverFromCompanyFeed(query: string): Promise<DiscoveryResult[]> {
  const source = matchesCompanySource(query);

  if (!source) {
    return [];
  }

  const response = await fetch(source.type === "rss" ? source.feedUrl : source.pageUrl ?? "", {
    headers: {
      Accept:
        source.type === "rss"
          ? "application/rss+xml, application/xml, text/xml"
          : "text/html,application/xhtml+xml",
      "User-Agent": "TechCaseBot/1.0",
    },
    next: {
      revalidate: 60 * 60,
    },
  });

  if (!response.ok) {
    return [];
  }

  const text = await response.text();
  return source.type === "rss" ? parseFeedItems(text, source, query) : parseUberPage(text, source, query);
}

function safeHostname(sourceUrl: string): string {
  try {
    return new URL(sourceUrl).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function isLikelyUsefulSource(title: string, sourceUrl: string): boolean {
  let url: URL;

  try {
    url = new URL(sourceUrl);
  } catch {
    return false;
  }

  const hostname = url.hostname.replace(/^www\./, "");

  if (BLOCKED_HOSTS.has(hostname)) {
    return false;
  }

  const path = url.pathname.replace(/\/$/, "");

  if (!path || path === "") {
    return false;
  }

  const haystack = `${title} ${hostname} ${url.pathname}`.toLowerCase();
  return TECH_SOURCE_HINTS.some((hint) => haystack.includes(hint));
}

async function resolveSourceUrl(sourceUrl: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2500);

  try {
    const response = await fetch(sourceUrl, {
      method: "HEAD",
      redirect: "follow",
      signal: controller.signal,
    });
    return response.url || sourceUrl;
  } catch {
    return sourceUrl;
  } finally {
    clearTimeout(timeout);
  }
}

function resultsFromCitations(
  citations: Array<{
    title: string;
    uri: string;
  }>,
  query: string,
): Promise<DiscoveryResult[]> {
  return Promise.all(
    citations.map(async (citation) => ({
      title: citation.title,
      resolvedUrl: await resolveSourceUrl(citation.uri),
    })),
  ).then((resolved) =>
    resolved
      .filter((citation) => isLikelyUsefulSource(citation.title, citation.resolvedUrl))
      .slice(0, 5)
      .map((citation) => ({
        title: citation.title,
        company: "",
        sourceUrl: citation.resolvedUrl,
        publisher: safeHostname(citation.resolvedUrl),
        summary: `Potential technical source discovered for "${query}". Open the article to review and save it as a curated case study.`,
        reason: "Generated from web discovery citation metadata.",
      })),
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();

  if (!query || query.length < 3) {
    return NextResponse.json({ results: [] });
  }

  if (query.length > MAX_QUERY_LENGTH) {
    return NextResponse.json(
      {
        error: `Search query must be ${MAX_QUERY_LENGTH} characters or fewer.`,
        results: [],
      },
      { status: 400 },
    );
  }

  const normalizedQuery = query.toLowerCase();
  const cached = discoveryCache.get(normalizedQuery);

  if (cached && cached.expiresAt > Date.now()) {
    return NextResponse.json({
      ...cached.payload,
      cached: true,
    });
  }

  const companyResults = await discoverFromCompanyFeed(query);

  if (companyResults.length > 0) {
    const payload = {
      results: companyResults,
      source: "company-feed" as const,
    };

    discoveryCache.set(normalizedQuery, {
      expiresAt: Date.now() + CACHE_TTL_MS,
      payload,
    });

    return NextResponse.json(payload);
  }

  if (isRateLimited(getClientId(request))) {
    return NextResponse.json(
      {
        error: "Too many discovery searches. Please wait a minute and try again.",
        results: [],
      },
      { status: 429 },
    );
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "Expanded search is not configured. Add the search API key in Vercel environment variables and redeploy.",
        results: [],
      },
      { status: 503 },
    );
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await withTimeout(
      ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: `Find Android app case-study sources for this search query: "${query}".

Search for official Android Developers app stories, company Android engineering posts, official mobile engineering case studies, and credible technical publications about Android app performance, architecture, app quality, Compose, Kotlin, CameraX, startup, ANRs, crashes, rendering, Play Console, or Android vitals.
Prefer URLs whose path includes developer, android, stories, apps, case-study, engineering, mobile, architecture, performance, compose, kotlin, camerax, startup, vitals, or app-quality.
Avoid company homepages, product landing pages, docs homepages, generic tutorials, SEO listicles, job posts, newsletters, and unrelated marketing pages.
Return a short list of the best matching sources with one sentence each.`,
        config: {
          tools: [{ googleSearch: {} }],
        },
      }),
      GEMINI_TIMEOUT_MS,
    );

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
    const citations = groundingChunks
      .map((chunk) => ({
        title: chunk.web?.title ?? "",
        uri: chunk.web?.uri ?? "",
      }))
      .filter((chunk) => chunk.title && chunk.uri)
      .slice(0, 8);
    const citationResults = await resultsFromCitations(citations, query);
    const parsed = tryExtractJson(response.text ?? "[]");
    const normalizedResults = normalizeResults(parsed);
    const results = citationResults.length > 0 ? citationResults : normalizedResults;

    const payload = { results, citations, source: "gemini" as const };

    discoveryCache.set(normalizedQuery, {
      expiresAt: Date.now() + CACHE_TTL_MS,
      payload,
    });

    return NextResponse.json(payload);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Expanded search failed.";

    return NextResponse.json(
      {
        error: message,
        results: [],
      },
      { status: 500 },
    );
  }
}
