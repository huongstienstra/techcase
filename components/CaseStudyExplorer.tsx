"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { allCompanies, caseStudies } from "@/lib/caseStudies";
import { ArrowUpRight, Search } from "lucide-react";

type DiscoveryResult = {
  title: string;
  company: string;
  sourceUrl: string;
  publisher: string;
  summary: string;
  reason: string;
};

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
    if (word.includes(token) || (word.length >= 5 && token.includes(word))) {
      return true;
    }

    if (word[0] !== token[0] || Math.abs(word.length - token.length) > 2) {
      return false;
    }

    return editDistance(token, word) <= 2;
  });
}

export function CaseStudyExplorer() {
  const [query, setQuery] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [aiResults, setAiResults] = useState<DiscoveryResult[]>([]);
  const [aiError, setAiError] = useState("");
  const [didSearchAi, setDidSearchAi] = useState(false);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const hasActiveSearch = query.trim() !== "" || selectedCompany !== "";
  const normalizedQuery = normalizeText(query.trim());
  const queryTokens = normalizedQuery.split(/\s+/).filter(Boolean);
  const queryMatchesKnownCompany = allCompanies.some((company) => {
    const normalizedCompany = normalizeText(company);
    const companyWords = searchableWords(company);

    return queryTokens.some((token) => tokenMatches(token, normalizedCompany, companyWords));
  });

  const localResults = useMemo(() => {
    return caseStudies.filter((study) => {
      if (selectedCompany && study.company !== selectedCompany) {
        return false;
      }

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
  }, [queryTokens, selectedCompany]);

  const shouldDiscoverWithAi =
    query.trim().length >= 3 &&
    selectedCompany === "" &&
    localResults.length === 0 &&
    !queryMatchesKnownCompany;
  const shownCount = shouldDiscoverWithAi ? aiResults.length : localResults.length;
  const featured = caseStudies[0];

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (!shouldDiscoverWithAi) {
      setAiResults([]);
      setAiError("");
      setDidSearchAi(false);
      setIsDiscovering(false);
      return;
    }

    const controller = new AbortController();
    setAiResults([]);
    setAiError("");
    setDidSearchAi(false);
    setIsDiscovering(true);

    const timer = window.setTimeout(async () => {
      const timeout = window.setTimeout(() => {
        controller.abort();
      }, DISCOVERY_TIMEOUT_MS);

      try {
        const response = await fetch(`/api/discover?q=${encodeURIComponent(`${trimmedQuery} Android app case study`)}`, {
          signal: controller.signal,
        });
        const payload = (await response.json()) as {
          error?: string;
          results?: DiscoveryResult[];
        };

        if (!response.ok) {
          setAiError(payload.error ?? "Expanded search failed.");
          setAiResults([]);
          return;
        }

        setAiResults(payload.results ?? []);
        setDidSearchAi(true);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          setAiError("Expanded search took too long. Please try again.");
          setAiResults([]);
          setDidSearchAi(true);
          return;
        }

        setAiError("Expanded search failed.");
        setAiResults([]);
        setDidSearchAi(true);
      } finally {
        window.clearTimeout(timeout);
        setIsDiscovering(false);
      }
    }, 650);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query, shouldDiscoverWithAi]);

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
              placeholder="Search Lyft startup, TikTok jank, Monzo CameraX..."
              value={query}
            />
          </label>
          <label className="select-field" htmlFor="company-filter">
            <span>Company</span>
            <select
              id="company-filter"
              onChange={(event) => setSelectedCompany(event.target.value)}
              value={selectedCompany}
            >
              <option value="">All companies</option>
              {allCompanies.map((company) => (
                <option key={company} value={company}>
                  {company}
                </option>
              ))}
            </select>
          </label>
        </div>

        {localResults.length > 0 ? (
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
        ) : shouldDiscoverWithAi ? (
          <div className="discovery-block">
            {isDiscovering ? (
              <div className="search-progress" role="status">
                <span className="spinner" aria-hidden="true" />
                <span>Searching Android app story sources...</span>
              </div>
            ) : null}
            {aiError ? (
              <div className="search-progress is-error">
                <span>{aiError}</span>
              </div>
            ) : null}
            {!isDiscovering && didSearchAi && aiResults.length === 0 && !aiError ? (
              <div className="search-progress">
                <span>No Android app story sources found.</span>
              </div>
            ) : null}
            {aiResults.length > 0 && !isDiscovering ? (
              <div className="discovery-results" aria-label="Suggested Android app stories">
                {aiResults.map((result) => (
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
          <div className="empty">
            <p>No Android app stories found for "{query.trim()}".</p>
            <p className="empty-note">
              Try a company or Android topic like Lyft, startup, CameraX, Compose, Kotlin, app quality,
              or video playback.
            </p>
            {hasActiveSearch ? (
              <button
                className="reset-button"
                onClick={() => {
                  setQuery("");
                  setSelectedCompany("");
                }}
                type="button"
              >
                Clear search
              </button>
            ) : null}
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
