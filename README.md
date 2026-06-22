# Android App Case Stories

A company-first search site for Android app engineering case studies.

The project collects structured stories from Android Developers and company engineering blogs so mobile engineers can quickly find real examples of app performance work, architecture changes, platform adoption, reliability improvements, and production Android outcomes.

## Features

- Search case stories by company name
- Browse curated Android Developers app stories
- Open structured detail pages for each curated case study
- Discover extra company engineering posts from source feeds
- Optional Gemini-powered web discovery for companies not yet covered by direct feeds
- Responsive yellow/black visual style with floating top/bottom scroll controls

## Current Sources

Curated case studies live in `lib/caseStudies.ts`.

The discovery API also has direct source support for:

- Grab Tech Blog RSS
- Uber Engineering page
- Netflix TechBlog RSS

If a company is not in the direct source list, the API can use Gemini web grounding when `GEMINI_API_KEY` is configured.

## Tech Stack

- Next.js App Router
- React
- TypeScript
- Lucide React icons
- Google Gemini API for optional web discovery

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

Build for production:

```bash
npm run build
```

Start the production server locally:

```bash
npm run start
```

## Environment Variables

Create `.env.local` if you want Gemini discovery locally:

```bash
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-2.5-flash-lite
```

`GEMINI_MODEL` is optional. The app defaults to `gemini-2.5-flash-lite`.

For Vercel, add the same variables in the project environment settings and redeploy.

## Data Model

Each curated story includes:

- Company
- Title
- Publisher and source URL
- Year
- Problem areas and technologies
- Metrics
- Summary
- Problem, solution, and lessons
- Quality score

The main type is `CaseStudy` in `lib/caseStudies.ts`.

## Discovery API

The endpoint is:

```text
/api/discover?q=CompanyName
```

Discovery order:

1. Check direct company sources such as Grab, Uber, and Netflix.
2. Fall back to Gemini web discovery if `GEMINI_API_KEY` is available.
3. Return structured result cards with title, company, publisher, summary, and source URL.

The API includes basic rate limiting, in-memory caching, timeout handling, and source filtering.

## Project Structure

```text
app/
  api/discover/route.ts       Discovery API
  case-studies/[slug]/page.tsx
  globals.css                 Global styles
  layout.tsx
  page.tsx
components/
  CaseStudyExplorer.tsx       Search and result UI
  ScrollControls.tsx          Floating scroll buttons
lib/
  caseStudies.ts              Curated case-study data
```

## Deployment

This app is ready for Vercel.

Recommended settings:

- Framework: Next.js
- Build command: `npm run build`
- Install command: `npm install`
- Output: default Next.js output

## Roadmap

- Add more direct company feeds
- Add source review workflow for discovered articles
- Improve deduplication across feeds and Gemini results
- Add richer company profiles
- Add filters once the data set is larger

## License

Authorized by Huong Nguyen (Vyvien). See `LICENSE` for details.
