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

export function CaseStudyExplorer() {
  const [query, setQuery] = useState("");
  const [discoveryResults, setDiscoveryResults] = useState<DiscoveryResult[]>([]);
  const [discoveryError, setDiscoveryError] = useState("");
  const [isDiscovering, setIsDiscovering] = useState(false);
  const hasActiveSearch = query.trim() !== "";

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const queryTokens = normalizedQuery.split(/\s+/).filter(Boolean);

    return caseStudies.filter((study) => {
      const searchable = [
        study.title,
        study.company,
        study.publisher,
        study.domain,
        study.summary,
        ...study.problemAreas,
        ...study.technologies,
      ]
        .join(" ")
        .toLowerCase();

      const matchesQuery =
        queryTokens.length === 0 || queryTokens.every((token) => searchable.includes(token));
      return matchesQuery;
    });
  }, [query]);

  const featured = filtered[0] ?? caseStudies[0];

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery || filtered.length > 0) {
      setDiscoveryResults([]);
      setDiscoveryError("");
      setIsDiscovering(false);
      return;
    }

    const controller = new AbortController();
    setIsDiscovering(true);
    setDiscoveryError("");

    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/discover?q=${encodeURIComponent(trimmedQuery)}`, {
          signal: controller.signal,
        });
        const payload = (await response.json()) as {
          error?: string;
          results?: DiscoveryResult[];
        };

        if (!response.ok) {
          setDiscoveryError(payload.error ?? "Gemini discovery failed.");
          setDiscoveryResults([]);
          return;
        }

        setDiscoveryResults(payload.results ?? []);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setDiscoveryError("Gemini discovery failed.");
        setDiscoveryResults([]);
      } finally {
        setIsDiscovering(false);
      }
    }, 650);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [filtered.length, query]);

  return (
    <section className="workspace" id="library" aria-label="Case study explorer">
      <div className="library-column">
        <div className="results-head">
          <div>
            <p className="section-title">Search the library</p>
            <p className="section-window">Type a company, platform, technology, problem, or metric</p>
          </div>
          <p className="results-count">
            {filtered.length} {filtered.length === 1 ? "case study" : "case studies"}
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

        {filtered.length === 0 ? (
          <div className="discovery-block">
            <div className="empty">
              <p>
                {isDiscovering
                  ? "Searching the web with Gemini..."
                  : "No reviewed local case studies yet."}
              </p>
              {discoveryError ? <p className="empty-note">{discoveryError}</p> : null}
              {hasActiveSearch ? (
                <button
                  className="reset-button"
                  onClick={() => {
                    setQuery("");
                  }}
                  type="button"
                >
                  Clear search
                </button>
              ) : null}
            </div>
            {discoveryResults.length > 0 ? (
              <div className="discovery-results" aria-label="Gemini discovered results">
                <p className="discovery-label">Discovered by Gemini Search</p>
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
            {filtered.map((study) => (
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
