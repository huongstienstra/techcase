import { CaseStudyExplorer } from "@/components/CaseStudyExplorer";

export default function Home() {
  return (
    <div className="shell">
      <main className="app-frame">
        <section className="dashboard-shell">
          <header className="dashboard-top">
            <a className="wordmark" href="/">
              Android Developers
            </a>
            <a className="source-toggle" href="https://developer.android.com/stories/apps">
              Source hub
            </a>
          </header>

          <section className="intro">
            <div>
              <p className="eyebrow">Training / Android app case studies</p>
              <h1>Find Android app stories by company, problem, and outcome.</h1>
            </div>
          </section>

          <CaseStudyExplorer />
        </section>
      </main>
    </div>
  );
}
