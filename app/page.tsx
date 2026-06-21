import { CaseStudyExplorer } from "@/components/CaseStudyExplorer";
import { BookOpen, Camera, Gauge, Layers, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="shell">
      <main className="app-frame">
        <aside className="side-rail" aria-label="Primary sections">
          <a className="rail-brand" href="/" aria-label="Tech Cases home">
            Android Cases
          </a>
          <nav className="rail-nav">
            <a className="rail-button is-active" href="/" aria-label="Case studies">
              <BookOpen size={18} />
              <span>Case studies</span>
            </a>
            <a className="rail-button" href="#library" aria-label="Performance">
              <Gauge size={18} />
              <span>Performance</span>
            </a>
            <a className="rail-button" href="#library" aria-label="Compose">
              <Layers size={18} />
              <span>Compose</span>
            </a>
            <a className="rail-button" href="#library" aria-label="Camera">
              <Camera size={18} />
              <span>CameraX</span>
            </a>
            <a className="rail-button" href="#library" aria-label="AI discovery">
              <Sparkles size={18} />
              <span>AI discovery</span>
            </a>
          </nav>
        </aside>

        <section className="dashboard-shell">
          <header className="dashboard-top">
            <a className="wordmark" href="/">
              Android Developers
            </a>
            <nav className="date-strip" aria-label="Browse modes">
              <span>Essentials</span>
              <span>Design & Plan</span>
              <strong>Develop</strong>
              <span>Google Play</span>
              <span>Blog</span>
            </nav>
            <a className="source-toggle" href="https://developer.android.com/stories/apps">
              Source hub
            </a>
          </header>

          <section className="intro">
            <div>
              <p className="eyebrow">Training / Android app case studies</p>
              <h1>Find Android app stories by company, problem, and outcome.</h1>
              <p className="intro-copy">
                Browse source-backed stories from Android Developers, then use Gemini discovery when
                a company is not in the catalog yet.
              </p>
            </div>
          </section>

          <CaseStudyExplorer />
        </section>
      </main>
    </div>
  );
}
