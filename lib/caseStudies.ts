export type Metric = {
  label: string;
  value: string;
};

export type CaseStudy = {
  slug: string;
  title: string;
  company: string;
  publisher: string;
  publisherType: "Developer Platform" | "Engineering Blog" | "Vendor Case Study" | "Postmortem";
  sourceUrl: string;
  year: number;
  domain: string;
  problemAreas: string[];
  technologies: string[];
  metrics: Metric[];
  summary: string;
  problem: string;
  solution: string;
  lessons: string[];
  qualityScore: number;
};

export const caseStudies: CaseStudy[] = [
  {
    slug: "tiktok-android-performance",
    title: "TikTok Optimizes User Experience with Android Tools",
    company: "TikTok",
    publisher: "Android Developers",
    publisherType: "Developer Platform",
    sourceUrl: "https://developer.android.com/stories/apps/tiktok",
    year: 2022,
    domain: "Mobile",
    problemAreas: ["Android", "Performance", "Startup Time", "Video Playback"],
    technologies: ["Android Studio", "Systrace", "Simpleperf", "Jetpack App Startup", "Layout Inspector"],
    metrics: [
      { label: "Startup time", value: "-45%" },
      { label: "Jank", value: "-49%" },
      { label: "First video frame", value: "41% faster" },
      { label: "Video lag", value: "-27%" },
    ],
    summary:
      "TikTok used Android performance tooling to improve app startup, reduce UI jank, and make video playback feel faster across diverse devices and network conditions.",
    problem:
      "A global Android user base meant TikTok had to keep startup, scrolling, and playback smooth across many device classes and network profiles.",
    solution:
      "The team used Android profiling tools, refactored startup around Jetpack App Startup, simplified view hierarchy with Layout Inspector, spread complex tasks across frames, and optimized video player reuse and preloading.",
    lessons: [
      "Performance case studies are strongest when they include concrete user-facing metrics.",
      "Startup, rendering, and playback should be measured as separate product experiences.",
      "Developer platform stories are useful discovery sources, but the original technical links should be preserved.",
    ],
    qualityScore: 4,
  },
  {
    slug: "twitter-compose-android",
    title: "Twitter Adopts Jetpack Compose",
    company: "Twitter / X",
    publisher: "Android Developers",
    publisherType: "Developer Platform",
    sourceUrl: "https://developer.android.com/stories/apps/twitter-compose",
    year: 2022,
    domain: "Mobile",
    problemAreas: ["Android", "UI Migration", "Developer Productivity"],
    technologies: ["Jetpack Compose", "Kotlin", "Android Studio"],
    metrics: [{ label: "Source type", value: "Migration" }],
    summary:
      "A large-scale Android app migration story showing how Compose can be introduced into an existing product without rewriting the whole UI at once.",
    problem:
      "A mature Android codebase needed a path to modern UI development while preserving product velocity and existing app behavior.",
    solution:
      "The team adopted Compose incrementally, using interop boundaries so new UI could coexist with legacy Android views.",
    lessons: [
      "Migration stories should be tagged by boundary strategy, not only by technology.",
      "Developer productivity is a valid outcome even when hard performance numbers are unavailable.",
    ],
    qualityScore: 3,
  },
  {
    slug: "netflix-edge-reliability",
    title: "Netflix Shares Reliability Lessons from Large-Scale Streaming",
    company: "Netflix",
    publisher: "Netflix Tech Blog",
    publisherType: "Engineering Blog",
    sourceUrl: "https://netflixtechblog.com/",
    year: 2024,
    domain: "Platform",
    problemAreas: ["Reliability", "Distributed Systems", "Observability"],
    technologies: ["Cloud Infrastructure", "Telemetry", "Chaos Engineering"],
    metrics: [{ label: "Source type", value: "Engineering" }],
    summary:
      "Netflix engineering posts are canonical sources for reliability, resilience, and operating large distributed systems.",
    problem:
      "Streaming systems need to remain reliable under traffic spikes, regional failures, client variance, and dependency degradation.",
    solution:
      "Netflix commonly documents resilience patterns across observability, controlled failure testing, fallback paths, and platform automation.",
    lessons: [
      "Engineering blogs usually have better tradeoff detail than vendor case studies.",
      "A case-study database should connect broad company sources to individual deep technical posts.",
    ],
    qualityScore: 4,
  },
  {
    slug: "shopify-platform-scale",
    title: "Shopify Engineering Writes About Scaling Commerce Infrastructure",
    company: "Shopify",
    publisher: "Shopify Engineering",
    publisherType: "Engineering Blog",
    sourceUrl: "https://shopify.engineering/",
    year: 2024,
    domain: "Commerce",
    problemAreas: ["Scale", "Data Platform", "Developer Productivity"],
    technologies: ["Ruby", "Kubernetes", "Databases"],
    metrics: [{ label: "Source type", value: "Engineering" }],
    summary:
      "Shopify's engineering blog is a strong source for commerce scale, platform design, and operational tradeoffs.",
    problem:
      "Commerce infrastructure has to absorb seasonal spikes, product launches, merchant workflows, and global traffic.",
    solution:
      "The engineering organization documents platform patterns, database work, infrastructure changes, and developer workflow improvements.",
    lessons: [
      "Some sources are better stored as source hubs first, then split into specific case studies.",
      "Industry tags help users find patterns beyond a single company name.",
    ],
    qualityScore: 4,
  },
  {
    slug: "facebook-ios-faster-photos",
    title: "Faster Photos in Facebook for iOS",
    company: "Meta / Facebook",
    publisher: "Engineering at Meta",
    publisherType: "Engineering Blog",
    sourceUrl: "https://engineering.fb.com/2015/01/28/ios/faster-photos-in-facebook-for-ios/",
    year: 2015,
    domain: "Mobile",
    problemAreas: ["iOS", "Image Loading", "Performance", "Networking"],
    technologies: ["Progressive JPEG", "iOS", "Image Pipeline", "Mobile Networking"],
    metrics: [
      { label: "Data usage", value: "-10%" },
      { label: "Good image display", value: "15% faster" },
    ],
    summary:
      "Facebook optimized photo delivery on iOS by adopting Progressive JPEG, reducing mobile data use while showing useful image previews sooner.",
    problem:
      "Photo-heavy mobile feeds can feel slow and expensive on constrained networks when users wait for full-resolution images before seeing useful visual content.",
    solution:
      "The team used Progressive JPEG so the app could display an early, acceptable version of a photo while higher-quality scans continued loading.",
    lessons: [
      "Image-loading case studies should capture both perceived speed and bandwidth cost.",
      "Progressive rendering can improve user experience without waiting for full image completion.",
      "Mobile performance records should distinguish network transfer, decode/render timing, and perceived visual readiness.",
    ],
    qualityScore: 5,
  },
  {
    slug: "threads-ios-image-render-performance",
    title: "How Meta Thinks About Threads' iOS Performance",
    company: "Meta / Threads",
    publisher: "Engineering at Meta",
    publisherType: "Engineering Blog",
    sourceUrl: "https://engineering.fb.com/2024/12/18/ios/how-we-think-about-threads-ios-performance/",
    year: 2024,
    domain: "Mobile",
    problemAreas: ["iOS", "Image Loading", "Performance", "Observability"],
    technologies: ["iOS", "Performance Metrics", "Image Rendering", "Mobile Observability"],
    metrics: [{ label: "Key metric", value: "%FIRE" }],
    summary:
      "Threads tracks frustrating image-render experiences on iOS as a product-level performance signal for slow or failed image loading.",
    problem:
      "A social app with many photos needs to detect regressions when images load slowly or fail, because image-render frustration directly affects engagement.",
    solution:
      "The team monitors a dedicated frustrating image-render experience metric and uses it to alert on image-loading regressions for iOS users.",
    lessons: [
      "For image-heavy apps, observability should measure user frustration, not just technical latency.",
      "Search records should include metric names even when a public post does not disclose exact values.",
      "A good case-study database should support queries like iOS image load even when the story is framed as performance monitoring.",
    ],
    qualityScore: 4,
  },
  {
    slug: "uber-driver-android-architecture",
    title: "Rethinking Android Architecture for the Uber Driver App",
    company: "Uber",
    publisher: "Uber Engineering",
    publisherType: "Engineering Blog",
    sourceUrl: "https://www.uber.com/us/en/blog/activity-service-dependency-android-app-architecture/",
    year: 2019,
    domain: "Mobile",
    problemAreas: ["Android", "Architecture", "Mobile", "Driver Experience"],
    technologies: ["Android", "RIBs", "Activity", "Service", "Mobile Architecture"],
    metrics: [{ label: "Source type", value: "Architecture" }],
    summary:
      "Uber describes architectural decisions behind the rebuilt Driver app, including how Android Activity and Service dependencies were reconsidered for a large production app.",
    problem:
      "The Uber Driver app needed a maintainable Android architecture for a high-scale product used by millions of driver-partners, with navigation, earnings, trip, and background-service behavior all competing for clean ownership.",
    solution:
      "Uber's mobile engineering team reconsidered Activity and Service dependencies as part of the Carbon Driver app architecture, aligning Android implementation details with a broader mobile architecture strategy.",
    lessons: [
      "Large Android apps need clear ownership boundaries between lifecycle components and business logic.",
      "Architecture case studies should be tagged by platform and by the lifecycle or state-management problem they solve.",
      "Company plus platform searches are common, so seed records need strong company, platform, and technology metadata.",
    ],
    qualityScore: 4,
  },
];

export const allProblemAreas = Array.from(
  new Set(caseStudies.flatMap((study) => study.problemAreas)),
).sort();

export const allPublisherTypes = Array.from(
  new Set(caseStudies.map((study) => study.publisherType)),
).sort();
