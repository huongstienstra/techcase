"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { allCompanies, caseStudies } from "@/lib/caseStudies";
import { ArrowUpRight, Search, X } from "lucide-react";

const PAGE_SIZE = 8;
const FEATURE_ROTATION_MS = 1000 * 10;
const DISCOVERY_MIN_QUERY_LENGTH = 3;
const DISCOVERY_DEBOUNCE_MS = 450;

type DiscoveryResult = {
  title: string;
  company: string;
  sourceUrl: string;
  publisher: string;
  summary: string;
};

type DiscoveryResponse = {
  error?: string;
  results?: DiscoveryResult[];
};

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

function pickRandomCaseStudy(currentSlug?: string) {
  if (caseStudies.length <= 1) {
    return caseStudies[0];
  }

  const candidates = currentSlug
    ? caseStudies.filter((study) => study.slug !== currentSlug)
    : caseStudies;
  const index = Math.floor(Math.random() * candidates.length);
  return candidates[index];
}

export function CaseStudyExplorer() {
  const [query, setQuery] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [page, setPage] = useState(1);
  const [featured, setFeatured] = useState(caseStudies[0]);
  const [discoveryResults, setDiscoveryResults] = useState<DiscoveryResult[]>([]);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [discoveryError, setDiscoveryError] = useState("");
  const normalizedQuery = normalizeText(query.trim());
  const queryTokens = normalizedQuery.split(/\s+/).filter(Boolean);
  const trimmedQuery = query.trim();

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

  const shouldSearchSources =
    trimmedQuery.length >= DISCOVERY_MIN_QUERY_LENGTH && localResults.length === 0;
  const shownCount =
    localResults.length > 0 ? localResults.length : shouldSearchSources ? discoveryResults.length : 0;
  const pageCount = Math.max(1, Math.ceil(localResults.length / PAGE_SIZE));
  const pageStart = (page - 1) * PAGE_SIZE;
  const pagedLocalResults = localResults.slice(pageStart, pageStart + PAGE_SIZE);
  const firstVisibleResult = localResults.length > 0 ? pageStart + 1 : 0;
  const lastVisibleResult = Math.min(pageStart + pagedLocalResults.length, localResults.length);

  useEffect(() => {
    setPage(1);
  }, [query, selectedCompany]);

  useEffect(() => {
    setFeatured((currentFeatured) => pickRandomCaseStudy(currentFeatured.slug));

    const interval = window.setInterval(() => {
      setFeatured((currentFeatured) => pickRandomCaseStudy(currentFeatured.slug));
    }, FEATURE_ROTATION_MS);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (page > pageCount) {
      setPage(pageCount);
    }
  }, [page, pageCount]);

  useEffect(() => {
    if (!shouldSearchSources) {
      setDiscoveryResults([]);
      setDiscoveryError("");
      setIsDiscovering(false);
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setIsDiscovering(true);
      setDiscoveryError("");

      try {
        const response = await fetch(`/api/discover?q=${encodeURIComponent(trimmedQuery)}`, {
          signal: controller.signal,
        });
        const payload = (await response.json()) as DiscoveryResponse;

        if (!response.ok) {
          throw new Error(payload.error || "Search failed.");
        }

        setDiscoveryResults(payload.results ?? []);
      } catch (error) {
        if (!controller.signal.aborted) {
          setDiscoveryResults([]);
          setDiscoveryError(error instanceof Error ? error.message : "Search failed.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsDiscovering(false);
        }
      }
    }, DISCOVERY_DEBOUNCE_MS);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [shouldSearchSources, trimmedQuery]);

  return (
    <section className="workspace" id="library" aria-label="Case study explorer">
      <div className="library-column">
        <div className="results-head">
          <div>
            <p className="section-title">Search the library</p>
            <p className="section-window">Type a company, platform, technology, problem, or metric</p>
          </div>
          <p className="results-count">
            {shownCount} {shownCount === 1 ? "result" : "results"}
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
            {query ? (
              <button
                aria-label="Clear search"
                className="search-clear-button"
                onClick={() => setQuery("")}
                type="button"
              >
                <X size={15} />
              </button>
            ) : null}
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
          <>
            <div className="cards">
              {pagedLocalResults.map((study) => (
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
            {localResults.length > PAGE_SIZE ? (
              <nav className="pagination" aria-label="Case study pages">
                <button
                  className="pagination-button"
                  disabled={page === 1}
                  onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
                  type="button"
                >
                  Previous
                </button>
                <span className="pagination-summary">
                  {firstVisibleResult}-{lastVisibleResult} of {localResults.length}
                </span>
                <button
                  className="pagination-button"
                  disabled={page === pageCount}
                  onClick={() => setPage((currentPage) => Math.min(pageCount, currentPage + 1))}
                  type="button"
                >
                  Next
                </button>
              </nav>
            ) : null}
          </>
        ) : shouldSearchSources ? (
          <div className="discovery-block" aria-live="polite">
            {isDiscovering ? (
              <div className="discovery-wait-card">
                <div>
                  <p className="discovery-label">Finding relevant case stories</p>
                  <p className="discovery-wait-copy">
                    Checking source pages and preparing readable result cards.
                  </p>
                </div>
                <div className="discovery-skeleton-list" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </div>
                <button
                  className="discovery-reset-button"
                  onClick={() => {
                    setQuery("");
                    setSelectedCompany("");
                    setDiscoveryError("");
                    setDiscoveryResults([]);
                  }}
                  type="button"
                >
                  Back to local list
                </button>
              </div>
            ) : null}
            {!isDiscovering && discoveryError ? (
              <div className="discovery-fallback">
                <p className="discovery-label">Search is temporarily unavailable.</p>
                <button
                  className="discovery-reset-button"
                  onClick={() => {
                    setQuery("");
                    setSelectedCompany("");
                    setDiscoveryError("");
                    setDiscoveryResults([]);
                  }}
                  type="button"
                >
                  Back to local list
                </button>
              </div>
            ) : null}
            {discoveryResults.length > 0 ? (
              <div className="discovery-results">
                {discoveryResults.map((result) => (
                  <a
                    className="discovery-card"
                    href={result.sourceUrl}
                    key={result.sourceUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <div className="case-body">
                      <div className="case-meta">
                        {result.company ? <span>{result.company}</span> : null}
                        {result.publisher ? <span>{result.publisher}</span> : null}
                      </div>
                      <h2 className="case-title">{result.title}</h2>
                      {result.summary ? <p className="case-summary">{result.summary}</p> : null}
                    </div>
                    <ArrowUpRight className="case-arrow" size={19} />
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
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
