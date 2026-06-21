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

type DiscoveryResult = {
  title: string;
  company: string;
  sourceUrl: string;
  publisher: string;
  summary: string;
  reason: string;
};

type DiscoveryPayload = {
  citations?: Array<{
    title: string;
    uri: string;
  }>;
  results: DiscoveryResult[];
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
      reject(new Error("Gemini discovery timed out. Please try again."));
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

function resultsFromCitations(
  citations: Array<{
    title: string;
    uri: string;
  }>,
  query: string,
): DiscoveryResult[] {
  return citations.slice(0, 5).map((citation) => ({
    title: citation.title,
    company: "",
    sourceUrl: citation.uri,
    publisher: new URL(citation.uri).hostname.replace(/^www\./, ""),
    summary: `Web result discovered for "${query}". Open the source to review whether it is a case study.`,
    reason: "Generated from Gemini grounding citation metadata.",
  }));
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
          "Gemini search is not configured. Add GEMINI_API_KEY in Vercel environment variables and redeploy.",
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
        contents: `Find source-backed technical case-study articles for: "${query}".

Search for articles from company engineering blogs, official developer stories, vendor case studies, and credible technical publications.
Prefer big-company case stories. Avoid generic tutorials, SEO listicles, job posts, and unrelated marketing pages.
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
    const citationResults = resultsFromCitations(citations, query);
    const parsed = tryExtractJson(response.text ?? "[]");
    const normalizedResults = normalizeResults(parsed);
    const results = citationResults.length > 0 ? citationResults : normalizedResults;

    const payload = { results, citations };

    discoveryCache.set(normalizedQuery, {
      expiresAt: Date.now() + CACHE_TTL_MS,
      payload,
    });

    return NextResponse.json(payload);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gemini discovery failed.";

    return NextResponse.json(
      {
        error: message,
        results: [],
      },
      { status: 500 },
    );
  }
}
