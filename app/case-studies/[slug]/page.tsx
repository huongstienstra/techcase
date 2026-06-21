import Link from "next/link";
import { notFound } from "next/navigation";
import { caseStudies } from "@/lib/caseStudies";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return caseStudies.map((study) => ({
    slug: study.slug,
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const study = caseStudies.find((item) => item.slug === slug);

  return {
    title: study ? `${study.title} | Android App Case Studies` : "Case Study | Android App Case Studies",
  };
}

export default async function CaseStudyPage({ params }: PageProps) {
  const { slug } = await params;
  const study = caseStudies.find((item) => item.slug === slug);

  if (!study) {
    notFound();
  }

  return (
    <div className="shell">
      <header className="topbar">
        <div className="topbar-inner">
          <Link className="brand" href="/">
            <span className="brand-mark">AC</span>
            <span>
              <span className="brand-title">Android Cases</span>
              <span className="brand-subtitle">Structured app engineering stories</span>
            </span>
          </Link>
          <nav className="nav-actions" aria-label="Primary">
            <a className="link-button" href={study.sourceUrl}>
              Original source
            </a>
          </nav>
        </div>
      </header>

      <main className="main">
        <article className="detail">
          <Link className="back-link" href="/">
            Back to search
          </Link>
          <div className="case-meta">
            <span>{study.company}</span>
            <span>/</span>
            <span>{study.publisher}</span>
            <span>/</span>
            <span>{study.publisherType}</span>
            <span>/</span>
            <span>{study.year}</span>
          </div>
          <h1>{study.title}</h1>
          <p className="intro-copy">{study.summary}</p>

          <div className="metric-row">
            {study.metrics.map((metric) => (
              <span className="metric" key={metric.label}>
                {metric.label}: {metric.value}
              </span>
            ))}
          </div>

          <section className="detail-section">
            <h2>Problem</h2>
            <p>{study.problem}</p>
          </section>

          <section className="detail-section">
            <h2>Solution</h2>
            <p>{study.solution}</p>
          </section>

          <section className="detail-section">
            <h2>Technologies</h2>
            <div className="tag-row">
              {study.technologies.map((technology) => (
                <span className="tag" key={technology}>
                  {technology}
                </span>
              ))}
            </div>
          </section>

          <section className="detail-section">
            <h2>Lessons</h2>
            <ul>
              {study.lessons.map((lesson) => (
                <li key={lesson}>{lesson}</li>
              ))}
            </ul>
          </section>
        </article>
      </main>
    </div>
  );
}
