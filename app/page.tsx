import { CaseStudyExplorer } from "@/components/CaseStudyExplorer";
import { Archive, BookOpen, Bookmark, CalendarDays, Home as HomeIcon, UserRound } from "lucide-react";

export default function Home() {
  return (
    <div className="shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <main className="app-frame">
        <aside className="side-rail" aria-label="Primary sections">
          <a className="rail-brand" href="/" aria-label="Tech Cases home">
            ac
          </a>
          <nav className="rail-nav">
            <a className="rail-button is-active" href="/" aria-label="Home">
              <HomeIcon size={20} />
            </a>
            <a className="rail-button" href="#library" aria-label="Library">
              <BookOpen size={20} />
            </a>
            <a className="rail-button" href="#library" aria-label="Sources">
              <Archive size={20} />
            </a>
            <a className="rail-button" href="#library" aria-label="Saved">
              <Bookmark size={20} />
            </a>
            <a className="rail-button" href="#library" aria-label="Profile">
              <UserRound size={20} />
            </a>
          </nav>
        </aside>

        <section className="dashboard-shell">
          <header className="dashboard-top">
            <a className="wordmark" href="/">
              androidcases
            </a>
            <nav className="date-strip" aria-label="Browse modes">
              <span>Startup</span>
              <span>Vitals</span>
              <span>Compose</span>
              <strong>Today</strong>
              <span>CameraX</span>
              <span>Kotlin</span>
            </nav>
            <a className="source-toggle" href="https://developer.android.com/stories/apps">
              <CalendarDays size={18} />
              Sources
            </a>
          </header>

          <section className="intro">
            <div>
              <p className="eyebrow">Curated Android app stories</p>
              <h1>Search Android app case studies by company, problem, and outcome.</h1>
            </div>
          </section>

          <CaseStudyExplorer />
        </section>
      </main>
    </div>
  );
}
