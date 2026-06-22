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
            <a
              className="link-button"
              href="https://www.linkedin.com/in/huong-stienstra/"
              rel="noreferrer"
              target="_blank"
            >
              Huong Nguyen
            </a>
          </header>

          <section className="intro">
            <div>
              <p className="eyebrow">Training / Android app case studies</p>
              <h1>Find Android app stories by company.</h1>
            </div>
          </section>

          <CaseStudyExplorer />
        </section>
      </main>
    </div>
  );
}
