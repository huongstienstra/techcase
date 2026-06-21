"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { caseStudies } from "@/lib/caseStudies";
import { ArrowUpRight, Search } from "lucide-react";

type DiscoveryResult = {
  title: string;
  company: string;
  sourceUrl: string;
  publisher: string;
  summary: string;
  reason: string;
};

type DiscoverySource = "company-feed" | "gemini";

const DISCOVERY_TIMEOUT_MS = 1000 * 24;

function normalizeText(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, " ");
}

function searchableWords(value: string): string[] {
  return normalizeText(value).split(/\s+/).filter(Boolean);
}

function editDistance(a: string, b: string): number {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const distances = Array.from({ length: rows }, () => Array<number>(cols).fill(0));

  for (let i = 0; i < rows; i += 1) {
    distances[i][0] = i;
  }

  for (let j = 0; j < cols; j += 1) {
    distances[0][j] = j;
  }

  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      distances[i][j] = Math.min(
        distances[i - 1][j] + 1,
        distances[i][j - 1] + 1,
        distances[i - 1][j - 1] + cost,
      );
    }
  }

  return distances[a.length][b.length];
}

function tokenMatches(token: string, fullText: string, words: string[]): boolean {
  if (fullText.includes(token)) {
    return true;
  }

  if (token.length < 5) {
    return false;
  }

  return words.some((word) => {
    if (word.includes(token) || token.includes(word)) {
      return true;
    }

    if (Math.abs(word.length - token.length) > 2) {
      return false;
    }

    return editDistance(token, word) <= 2;
  });
}

export function CaseStudyExplorer() {
  const [query, setQuery] = useState("");
  const [discoveryResults, setDiscoveryResults] = useState<DiscoveryResult[]>([]);
  const [discoveryError, setDiscoveryError] = useState("");
  const [discoverySource, setDiscoverySource] = useState<DiscoverySource>("gemini");
  const [didSearchGemini, setDidSearchGemini] = useState(false);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const hasActiveSearch = query.trim() !== "";

  const localResults = useMemo(() => {
    const normalizedQuery = normalizeText(query.trim());
    const queryTokens = normalizedQuery.split(/\s+/).filter(Boolean);

    if (queryTokens.length > 0) {
      return [];
    }

    return caseStudies.filter((study) => {
      const searchable = normalizeText([
        study.title,
        study.company,
        study.publisher,
        study.domain,
        study.summary,
        ...study.problemAreas,
        ...study.technologies,
      ]
        .join(" "));
      const words = searchableWords(searchable);

      const matchesQuery =
        queryTokens.length === 0 ||
        queryTokens.every((token) => tokenMatches(token, searchable, words));
      return matchesQuery;
    });
  }, [query]);

  const shownCount = hasActiveSearch ? discoveryResults.length : localResults.length;
  const featured = caseStudies[0];

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setDiscoveryResults([]);
      setDiscoveryError("");
      setDidSearchGemini(false);
      setIsDiscovering(false);
      return;
    }

    const controller = new AbortController();
    setIsDiscovering(true);
    setDiscoveryError("");
    setDidSearchGemini(false);

    const timer = window.setTimeout(async () => {
      const timeout = window.setTimeout(() => {
        controller.abort();
      }, DISCOVERY_TIMEOUT_MS);

      try {
        const response = await fetch(`/api/discover?q=${encodeURIComponent(trimmedQuery)}`, {
          signal: controller.signal,
        });
        const payload = (await response.json()) as {
          error?: string;
          results?: DiscoveryResult[];
          source?: DiscoverySource;
        };

        if (!response.ok) {
          setDiscoveryError(payload.error ?? "Gemini discovery failed.");
          setDiscoveryResults([]);
          return;
        }

        setDiscoveryResults(payload.results ?? []);
        setDiscoverySource(payload.source ?? "gemini");
        setDidSearchGemini(true);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          setDiscoveryError("Gemini search took too long. Please try again.");
          setDiscoveryResults([]);
          setDidSearchGemini(true);
          return;
        }

        setDiscoveryError("Gemini discovery failed.");
        setDiscoveryResults([]);
        setDidSearchGemini(true);
      } finally {
        window.clearTimeout(timeout);
        setIsDiscovering(false);
      }
    }, 650);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query]);

  return (
    <section className="workspace" id="library" aria-label="Case study explorer">
      <div className="library-column">
        <div className="results-head">
          <div>
            <p className="section-title">Search the library</p>
            <p className="section-window">Type a company, platform, technology, problem, or metric</p>
          </div>
          <p className="results-count">
            {isDiscovering ? "Searching..." : `${shownCount} ${shownCount === 1 ? "result" : "results"}`}
          </p>
        </div>

        <div className="filters">
          <label className="search-field" htmlFor="search">
            <Search size={17} />
            <input
              id="search"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search for iOS image loading, Android startup, Kafka reliability..."
              value={query}
            />
          </label>
        </div>

        {hasActiveSearch ? (
          <div className="discovery-block">
            {isDiscovering ? (
              <div className="search-progress" role="status">
                <span className="spinner" aria-hidden="true" />
                <span>Searching company tech blogs and web sources...</span>
              </div>
            ) : null}
            {discoveryError ? (
              <div className="search-progress is-error">
                <span>{discoveryError}</span>
                <button
                  className="inline-reset-button"
                  onClick={() => {
                    setQuery("");
                  }}
                  type="button"
                >
                  Clear
                </button>
              </div>
            ) : null}
            {!isDiscovering &&
            didSearchGemini &&
            discoveryResults.length === 0 &&
            !discoveryError ? (
              <div className="search-progress">
                <span>No company blog or web results found.</span>
                <button
                  className="inline-reset-button"
                  onClick={() => {
                    setQuery("");
                  }}
                  type="button"
                >
                  Clear
                </button>
              </div>
            ) : null}
            {discoveryResults.length > 0 && !isDiscovering ? (
              <div className="discovery-results" aria-label="Gemini discovered results">
                <p className="discovery-label">
                  {discoverySource === "company-feed"
                    ? "Latest from company tech blog"
                    : "Discovered by Gemini Search"}
                </p>
                {discoveryResults.map((result) => (
                  <a
                    className="discovery-card"
                    href={result.sourceUrl}
                    key={result.sourceUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <div>
                      <div className="case-meta">
                        <span>{result.company || "Unknown company"}</span>
                        <span>{result.publisher || "Web source"}</span>
                      </div>
                      <h2 className="case-title">{result.title}</h2>
                      <p className="case-summary">{result.summary || result.reason}</p>
                    </div>
                    <ArrowUpRight className="case-arrow" size={19} />
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        ) : (
          <div className="cards">
            {localResults.map((study) => (
              <Link className="case-card" href={`/case-studies/${study.slug}`} key={study.slug}>
                <div className="case-duration">{study.qualityScore}/5</div>
                <div className="case-thumb" aria-hidden="true">
                  {study.company.slice(0, 2)}
                </div>
                <div className="case-body">
                  <div className="case-meta">
                    <span>{study.company}</span>
                    <span>{study.publisherType}</span>
                    <span>{study.year}</span>
                  </div>
                  <h2 className="case-title">{study.title}</h2>
                  <p className="case-summary">{study.summary}</p>
                  <div className="tag-row">
                    {study.problemAreas.slice(0, 3).map((area) => (
                      <span className="tag" key={`${study.slug}-${area}`}>
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
                <ArrowUpRight className="case-arrow" size={19} />
              </Link>
            ))}
          </div>
        )}
      </div>

      <aside className="feature-panel" aria-label="Featured case study">
        <Link className="feature-card" href={`/case-studies/${featured.slug}`}>
          <div className="feature-image" aria-hidden="true">
            <div className="feature-grid" />
          </div>
          <div className="feature-copy">
            <div className="feature-pill">{featured.publisherType} / {featured.year}</div>
            <p className="feature-kicker">Featured dossier</p>
            <h2>{featured.title}</h2>
            <p>{featured.summary}</p>
            <div className="metric-row">
              {featured.metrics.slice(0, 4).map((metric) => (
                <span className="metric" key={`${featured.slug}-feature-${metric.label}`}>
                  {metric.label}: {metric.value}
                </span>
              ))}
            </div>
          </div>
        </Link>
      </aside>
    </section>
  );
}
