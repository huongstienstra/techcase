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
  year: number | "Source";
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

const curatedCaseStudies: CaseStudy[] = [
  {
    slug: "lyft-android-startup",
    title: "Lyft Improves Android App Startup Time for Drivers by 21%",
    company: "Lyft",
    publisher: "Android Developers",
    publisherType: "Developer Platform",
    sourceUrl: "https://developer.android.com/stories/apps/lyft",
    year: 2022,
    domain: "Android Apps",
    problemAreas: ["Android", "Startup Time", "Performance", "Driver Experience"],
    technologies: ["Android vitals", "Play Console", "Startup profiling", "Caching"],
    metrics: [
      { label: "Startup time", value: "-21%" },
      { label: "Driver sessions", value: "+5%" },
      { label: "Baseline gap", value: "15-20% slower" },
    ],
    summary:
      "Lyft used Android vitals to prove the Lyft Driver app startup gap, found a bootstrapping bottleneck, and improved startup with fewer network calls, async work, and cached data.",
    problem:
      "The Lyft Driver Android app was starting more slowly than comparable rideshare apps, creating friction in a time-sensitive driver workflow.",
    solution:
      "The team used Android vitals to make the business case, broke startup into phases, located the network-heavy bootstrapping phase, removed unnecessary calls, moved other work async, and cached data between sessions.",
    lessons: [
      "Android vitals can turn a performance concern into a clear business case.",
      "Startup work should be measured by phase so bottlenecks are easier to isolate.",
      "Small platform-focused fixes can produce product metrics, not only technical wins.",
    ],
    qualityScore: 5,
  },
  {
    slug: "tiktok-android-performance",
    title: "TikTok Optimizes User Experience with Android Tools",
    company: "TikTok",
    publisher: "Android Developers",
    publisherType: "Developer Platform",
    sourceUrl: "https://developer.android.com/stories/apps/tiktok",
    year: 2022,
    domain: "Android Apps",
    problemAreas: ["Android", "Performance", "Startup Time", "Video Playback"],
    technologies: ["Android Studio", "Systrace", "Simpleperf", "Jetpack App Startup", "Layout Inspector"],
    metrics: [
      { label: "Startup time", value: "-45%" },
      { label: "Jank", value: "-49%" },
      { label: "First video frame", value: "41% faster" },
      { label: "Video lag", value: "-27%" },
    ],
    summary:
      "TikTok used Android performance tooling to improve startup, reduce UI jank, and make video playback faster across diverse devices and network conditions.",
    problem:
      "A global Android user base meant TikTok had to keep startup, scrolling, and playback smooth across many device classes and network profiles.",
    solution:
      "The team used Android profiling tools, refactored startup around Jetpack App Startup, simplified view hierarchy with Layout Inspector, spread complex tasks across frames, and optimized video player reuse and preloading.",
    lessons: [
      "Performance stories are strongest when they include user-facing metrics.",
      "Startup, rendering, and playback should be measured as separate product experiences.",
      "Android platform stories make useful source seeds because they preserve tools, symptoms, and outcomes together.",
    ],
    qualityScore: 5,
  },
  {
    slug: "monzo-camerax-signup",
    title: "Monzo Reduces Over 9,000 Lines of Code with CameraX",
    company: "Monzo",
    publisher: "Android Developers",
    publisherType: "Developer Platform",
    sourceUrl: "https://developer.android.com/stories/apps/monzo-camerax",
    year: 2022,
    domain: "Android Apps",
    problemAreas: ["Android", "Camera", "Signup Flow", "Crash Reduction"],
    technologies: ["CameraX", "Android Jetpack", "Unit testing"],
    metrics: [
      { label: "Code removed", value: "9,000+ lines" },
      { label: "Signup drop-off", value: "25% to 5%" },
    ],
    summary:
      "Monzo replaced custom camera code with CameraX, simplifying identity verification and improving reliability in the signup flow.",
    problem:
      "Monzo needed reliable document and selfie capture for onboarding, but custom camera code was complex, crash-prone, and hard to maintain.",
    solution:
      "The team adopted CameraX to reduce camera implementation complexity, improve testability, and make signup-flow changes easier to ship.",
    lessons: [
      "Platform libraries can remove product risk when they replace fragile custom device code.",
      "Camera flows should be judged by both engineering maintenance cost and funnel drop-off.",
      "A good case study links API adoption to a user journey, not only to code cleanup.",
    ],
    qualityScore: 5,
  },
  {
    slug: "square-compose-productivity",
    title: "Square Sees Increased Productivity with Jetpack Compose",
    company: "Square",
    publisher: "Android Developers",
    publisherType: "Developer Platform",
    sourceUrl: "https://developer.android.com/stories/apps/square-compose",
    year: 2021,
    domain: "Android Apps",
    problemAreas: ["Android", "UI Migration", "Developer Productivity", "Design System"],
    technologies: ["Jetpack Compose", "Android Studio", "Declarative UI"],
    metrics: [{ label: "Outcome", value: "Productivity" }],
    summary:
      "Square adopted Jetpack Compose so Android engineers could build UI with code that was easier to reason about, organize, and preview.",
    problem:
      "The Android team wanted to spend less effort solving general UI framework problems and more effort on Square-specific product and UI infrastructure.",
    solution:
      "Square introduced Compose for declarative UI and used Android Studio tooling to speed up component iteration.",
    lessons: [
      "Compose adoption is often a productivity story before it is a performance story.",
      "Preview tooling matters when teams maintain a design system.",
      "Migration records should capture the boundary between existing UI infrastructure and new Compose components.",
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
    domain: "Android Apps",
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
      "Large Android teams need a gradual path from Views to Compose.",
    ],
    qualityScore: 4,
  },
  {
    slug: "headspace-android-reboot",
    title: "Headspace's Android Reboot Increases Monthly Active Users by 15%",
    company: "Headspace",
    publisher: "Android Developers",
    publisherType: "Developer Platform",
    sourceUrl: "https://developer.android.com/stories/apps/headspace-excellence",
    year: 2021,
    domain: "Android Apps",
    problemAreas: ["Android", "Architecture", "App Quality", "Kotlin Migration"],
    technologies: ["Kotlin", "MVVM", "Android Jetpack", "Hilt", "In-App Review API"],
    metrics: [
      { label: "Monthly active users", value: "+15%" },
      { label: "Paid subscriber parity", value: "+20%" },
      { label: "Test coverage", value: "15% to 80%" },
    ],
    summary:
      "Headspace rebuilt its Android app architecture with Kotlin, MVVM, Jetpack, and Play review tooling to unlock new features and improve business metrics.",
    problem:
      "The existing Android architecture was slowing feature delivery and limiting the team's ability to expand into new wellness experiences.",
    solution:
      "The team paused feature work, rewrote the app in Kotlin, adopted MVVM and Jetpack libraries, improved test coverage, and used Play In-App Review to surface better user feedback.",
    lessons: [
      "Architecture investments need product goals, not only code quality goals.",
      "A rewrite can be justified when the current architecture costs more than a deliberate rebuild.",
      "App quality stories should connect engineering changes to store reviews, subscriptions, and active users.",
    ],
    qualityScore: 5,
  },
  {
    slug: "duolingo-kotlin-android",
    title: "Duolingo Uses Kotlin to Improve Android Development",
    company: "Duolingo",
    publisher: "Android Developers",
    publisherType: "Developer Platform",
    sourceUrl: "https://developer.android.com/stories/apps/duolingo-kotlin",
    year: 2020,
    domain: "Android Apps",
    problemAreas: ["Android", "Kotlin Migration", "Developer Productivity", "Code Quality"],
    technologies: ["Kotlin", "Android Studio", "Java interoperability"],
    metrics: [{ label: "Outcome", value: "Modernization" }],
    summary:
      "Duolingo's Android story is a Kotlin migration example for improving code quality and developer velocity in a large consumer app.",
    problem:
      "A mature Android codebase needed a safer, more expressive language path while continuing to ship product work.",
    solution:
      "The team adopted Kotlin incrementally, relying on Java interoperability and Android tooling so migration could coexist with ongoing feature development.",
    lessons: [
      "Language migration should be incremental in production Android apps.",
      "Interop is a core migration strategy, not a temporary afterthought.",
      "Developer productivity stories should include team adoption and maintenance signals.",
    ],
    qualityScore: 4,
  },
  {
    slug: "microsoft-camerax",
    title: "Microsoft Uses CameraX in Android Camera Experiences",
    company: "Microsoft",
    publisher: "Android Developers",
    publisherType: "Developer Platform",
    sourceUrl: "https://developer.android.com/stories/apps/microsoft-camerax",
    year: 2021,
    domain: "Android Apps",
    problemAreas: ["Android", "Camera", "Device Compatibility"],
    technologies: ["CameraX", "Android Jetpack", "Camera APIs"],
    metrics: [{ label: "Source type", value: "CameraX" }],
    summary:
      "Microsoft's CameraX story is useful for understanding how Android teams reduce camera-device variance with Jetpack camera APIs.",
    problem:
      "Camera features on Android have to work across a wide range of devices, camera hardware, and OS versions.",
    solution:
      "The team used CameraX to reduce low-level camera handling and focus more effort on product behavior.",
    lessons: [
      "CameraX case studies are strongest when tagged by compatibility and lifecycle risk.",
      "Device fragmentation is a product concern when the camera is part of a core flow.",
      "Platform APIs can move complexity from app code to maintained Android libraries.",
    ],
    qualityScore: 3,
  },
  {
    slug: "swiggy-android-performance",
    title: "Swiggy Improves Android App Quality",
    company: "Swiggy",
    publisher: "Android Developers",
    publisherType: "Developer Platform",
    sourceUrl: "https://developer.android.com/stories/apps/swiggy",
    year: 2022,
    domain: "Android Apps",
    problemAreas: ["Android", "Performance", "App Quality", "Food Delivery"],
    technologies: ["Android vitals", "Play Console", "Performance monitoring"],
    metrics: [{ label: "Source type", value: "App quality" }],
    summary:
      "Swiggy's Android story belongs in the catalog as an app-quality example for a high-frequency delivery product.",
    problem:
      "Food delivery apps need reliable Android experiences across customer, logistics, and time-sensitive ordering flows.",
    solution:
      "The story is a source seed for tracking Android app quality and performance improvements from a large delivery platform.",
    lessons: [
      "Marketplace apps should be searchable by business workflow as well as Android technology.",
      "Delivery apps make good reliability and latency examples because user intent is time-sensitive.",
      "Some records start as source seeds and can be expanded after deeper review.",
    ],
    qualityScore: 3,
  },
  {
    slug: "roblox-android-app",
    title: "Roblox Improves Android Experience",
    company: "Roblox",
    publisher: "Android Developers",
    publisherType: "Developer Platform",
    sourceUrl: "https://developer.android.com/stories/apps/roblox",
    year: 2021,
    domain: "Android Apps",
    problemAreas: ["Android", "Performance", "Large User Base", "Gaming"],
    technologies: ["Android", "Google Play", "Performance monitoring"],
    metrics: [{ label: "Source type", value: "App story" }],
    summary:
      "Roblox is an Android app-story seed for performance and quality work in a large-scale gaming and social platform.",
    problem:
      "High-engagement Android apps need stable, performant experiences across many devices and user sessions.",
    solution:
      "The story is cataloged as a source to review for Android performance, Play quality, and user-experience lessons.",
    lessons: [
      "Gaming-adjacent app stories should still be searchable through Android performance terms.",
      "Large user-base records are useful when comparing quality investments across companies.",
      "Seed records can be expanded as the source review becomes more detailed.",
    ],
    qualityScore: 3,
  },
  {
    slug: "sharechat-android-app",
    title: "ShareChat Improves Android App Experience",
    company: "ShareChat",
    publisher: "Android Developers",
    publisherType: "Developer Platform",
    sourceUrl: "https://developer.android.com/stories/apps/sharechat",
    year: 2022,
    domain: "Android Apps",
    problemAreas: ["Android", "Performance", "Social", "Emerging Markets"],
    technologies: ["Android", "Play Console", "Performance monitoring"],
    metrics: [{ label: "Source type", value: "App story" }],
    summary:
      "ShareChat is an Android app-story seed for social app performance and quality work in diverse device and network conditions.",
    problem:
      "Social Android apps in emerging markets need to perform well across varied devices, network quality, and content-heavy sessions.",
    solution:
      "The story is cataloged as a source for Android performance and app-quality review.",
    lessons: [
      "Social apps should be searchable by device diversity and network conditions.",
      "Regional Android scale is an important dimension for case-study discovery.",
      "Source seeds help build breadth before every case is fully annotated.",
    ],
    qualityScore: 3,
  },
];

type AndroidStorySource = {
  slug: string;
  label: string;
  company: string;
  sourceUrl: string;
};

const androidStorySources: AndroidStorySource[] = [
  {
    slug: "xiaohongshu",
    label: "Xiaohongshu",
    company: "Xiaohongshu",
    sourceUrl: "https://developer.android.com/stories/apps/xiaohongshu",
  },
  {
    slug: "cuvva-compose",
    label: "Cuvva - Compose",
    company: "Cuvva",
    sourceUrl: "https://developer.android.com/stories/apps/cuvva-compose",
  },
  {
    slug: "square-compose",
    label: "Square - Compose",
    company: "Square",
    sourceUrl: "https://developer.android.com/stories/apps/square-compose",
  },
  {
    slug: "vlc-android-tv",
    label: "VLC - Android TV",
    company: "VLC",
    sourceUrl: "https://developer.android.com/stories/apps/vlc-android-tv",
  },
  {
    slug: "djay2",
    label: "Djay2",
    company: "Djay2",
    sourceUrl: "https://developer.android.com/stories/apps/djay2",
  },
  {
    slug: "vlc",
    label: "VLC",
    company: "VLC",
    sourceUrl: "https://developer.android.com/stories/apps/vlc",
  },
  {
    slug: "concepts",
    label: "Concepts",
    company: "Concepts",
    sourceUrl: "https://developer.android.com/stories/apps/concepts",
  },
  {
    slug: "duolingo-excellence",
    label: "Duolingo - Excellence",
    company: "Duolingo",
    sourceUrl: "https://developer.android.com/stories/apps/duolingo-excellence",
  },
  {
    slug: "duolingo-kotlin",
    label: "Duolingo - Kotlin",
    company: "Duolingo",
    sourceUrl: "https://developer.android.com/stories/apps/duolingo-kotlin",
  },
  {
    slug: "google-home",
    label: "Google Home",
    company: "Google Home",
    sourceUrl: "https://developer.android.com/stories/apps/google-home",
  },
  {
    slug: "google-duo",
    label: "Google Duo",
    company: "Google Duo",
    sourceUrl: "https://developer.android.com/stories/apps/google-duo",
  },
  {
    slug: "google-photos",
    label: "Google Photos",
    company: "Google Photos",
    sourceUrl: "https://developer.android.com/stories/apps/google-photos",
  },
  {
    slug: "reflectly",
    label: "Reflectly",
    company: "Reflectly",
    sourceUrl: "https://developer.android.com/stories/apps/reflectly",
  },
  {
    slug: "tamedia",
    label: "Tamedia",
    company: "Tamedia",
    sourceUrl: "https://developer.android.com/stories/apps/tamedia",
  },
  {
    slug: "roblox",
    label: "Roblox",
    company: "Roblox",
    sourceUrl: "https://developer.android.com/stories/apps/roblox",
  },
  {
    slug: "infinite-painter",
    label: "Infinite painter",
    company: "Infinite Painter",
    sourceUrl: "https://developer.android.com/stories/apps/infinite-painter",
  },
  {
    slug: "squid",
    label: "Squid",
    company: "Squid",
    sourceUrl: "https://developer.android.com/stories/apps/squid",
  },
  {
    slug: "evernote",
    label: "Evernote",
    company: "Evernote",
    sourceUrl: "https://developer.android.com/stories/apps/evernote",
  },
  {
    slug: "beautyplus",
    label: "BeautyPlus",
    company: "BeautyPlus",
    sourceUrl: "https://developer.android.com/stories/apps/beautyplus",
  },
  {
    slug: "tinder",
    label: "Tinder",
    company: "Tinder",
    sourceUrl: "https://developer.android.com/stories/apps/tinder",
  },
  {
    slug: "zillow",
    label: "Zillow",
    company: "Zillow",
    sourceUrl: "https://developer.android.com/stories/apps/zillow",
  },
  {
    slug: "iheartradio",
    label: "iHeartRadio",
    company: "iHeartRadio",
    sourceUrl: "https://developer.android.com/stories/apps/iheartradio",
  },
  {
    slug: "hike",
    label: "Hike",
    company: "Hike",
    sourceUrl: "https://developer.android.com/stories/apps/hike",
  },
  {
    slug: "spiegel-online",
    label: "Spiegel Online",
    company: "Spiegel Online",
    sourceUrl: "https://developer.android.com/stories/apps/spiegel-online",
  },
  {
    slug: "condenast-shopping",
    label: "Glamour.de",
    company: "Glamour.de",
    sourceUrl: "https://developer.android.com/stories/apps/condenast-shopping",
  },
  {
    slug: "el-mundo",
    label: "El Mundo",
    company: "El Mundo",
    sourceUrl: "https://developer.android.com/stories/apps/el-mundo",
  },
  {
    slug: "twitter-compose",
    label: "Twitter - Compose",
    company: "Twitter / X",
    sourceUrl: "https://developer.android.com/stories/apps/twitter-compose",
  },
  {
    slug: "twitter-kotlin",
    label: "Twitter - Kotlin",
    company: "Twitter / X",
    sourceUrl: "https://developer.android.com/stories/apps/twitter-kotlin",
  },
  {
    slug: "monzo-camerax",
    label: "Monzo - CameraX",
    company: "Monzo",
    sourceUrl: "https://developer.android.com/stories/apps/monzo-camerax",
  },
  {
    slug: "monzo-compose",
    label: "Monzo - Compose",
    company: "Monzo",
    sourceUrl: "https://developer.android.com/stories/apps/monzo-compose",
  },
  {
    slug: "truecaller",
    label: "Truecaller",
    company: "Truecaller",
    sourceUrl: "https://developer.android.com/stories/apps/truecaller",
  },
  {
    slug: "alarmy",
    label: "Alarmy",
    company: "Alarmy",
    sourceUrl: "https://developer.android.com/stories/apps/alarmy",
  },
  {
    slug: "smartnews",
    label: "SmartNews",
    company: "SmartNews",
    sourceUrl: "https://developer.android.com/stories/apps/smartnews",
  },
  {
    slug: "headspace",
    label: "Headspace",
    company: "Headspace",
    sourceUrl: "https://developer.android.com/stories/apps/headspace",
  },
  {
    slug: "headspace-excellence",
    label: "Headspace App Excellence",
    company: "Headspace",
    sourceUrl: "https://developer.android.com/stories/apps/headspace-excellence",
  },
  {
    slug: "mercari",
    label: "Mercari - Compose",
    company: "Mercari",
    sourceUrl: "https://developer.android.com/stories/apps/mercari",
  },
  {
    slug: "microsoft",
    label: "Microsoft",
    company: "Microsoft",
    sourceUrl: "https://developer.android.com/stories/apps/microsoft",
  },
  {
    slug: "microsoft-camerax",
    label: "Microsoft - CameraX",
    company: "Microsoft",
    sourceUrl: "https://developer.android.com/stories/apps/microsoft-camerax",
  },
  {
    slug: "zomato",
    label: "Zomato",
    company: "Zomato",
    sourceUrl: "https://developer.android.com/stories/apps/zomato",
  },
  {
    slug: "josh",
    label: "Josh",
    company: "Josh",
    sourceUrl: "https://developer.android.com/stories/apps/josh",
  },
  {
    slug: "lyft",
    label: "Lyft",
    company: "Lyft",
    sourceUrl: "https://developer.android.com/stories/apps/lyft",
  },
  {
    slug: "okcredit",
    label: "OkCredit",
    company: "OkCredit",
    sourceUrl: "https://developer.android.com/stories/apps/okcredit",
  },
  {
    slug: "swiggy",
    label: "Swiggy",
    company: "Swiggy",
    sourceUrl: "https://developer.android.com/stories/apps/swiggy",
  },
  {
    slug: "myjio",
    label: "MyJio",
    company: "MyJio",
    sourceUrl: "https://developer.android.com/stories/apps/myjio",
  },
  {
    slug: "jiosaavn",
    label: "JioSaavn",
    company: "JioSaavn",
    sourceUrl: "https://developer.android.com/stories/apps/jiosaavn",
  },
  {
    slug: "tiktok",
    label: "TikTok",
    company: "TikTok",
    sourceUrl: "https://developer.android.com/stories/apps/tiktok",
  },
  {
    slug: "futu",
    label: "Futu",
    company: "Futu",
    sourceUrl: "https://developer.android.com/stories/apps/futu",
  },
  {
    slug: "sharechat",
    label: "ShareChat",
    company: "ShareChat",
    sourceUrl: "https://developer.android.com/stories/apps/sharechat",
  },
];

function inferProblemAreas(source: AndroidStorySource): string[] {
  const text = `${source.slug} ${source.label}`.toLowerCase();
  const areas = ["Android", "App Story"];

  if (text.includes("compose")) {
    areas.push("UI Migration", "Developer Productivity");
  }

  if (text.includes("camerax")) {
    areas.push("Camera", "Device Compatibility");
  }

  if (text.includes("kotlin")) {
    areas.push("Kotlin Migration", "Code Quality");
  }

  if (text.includes("excellence")) {
    areas.push("App Quality");
  }

  if (text.includes("startup") || ["josh", "zomato", "lyft", "tiktok"].includes(source.slug)) {
    areas.push("Startup Time", "Performance");
  }

  if (text.includes("android-tv")) {
    areas.push("Android TV");
  }

  return Array.from(new Set(areas));
}

function inferTechnologies(source: AndroidStorySource): string[] {
  const text = `${source.slug} ${source.label}`.toLowerCase();
  const technologies = ["Android", "Google Play"];

  if (text.includes("compose")) {
    technologies.push("Jetpack Compose");
  }

  if (text.includes("camerax")) {
    technologies.push("CameraX");
  }

  if (text.includes("kotlin")) {
    technologies.push("Kotlin");
  }

  if (text.includes("excellence") || ["josh", "zomato", "lyft", "tiktok"].includes(source.slug)) {
    technologies.push("Android vitals", "Play Console");
  }

  if (text.includes("android-tv")) {
    technologies.push("Android TV");
  }

  return Array.from(new Set(technologies));
}

function createSourceSeed(source: AndroidStorySource): CaseStudy {
  const problemAreas = inferProblemAreas(source);
  const technologies = inferTechnologies(source);

  return {
    slug: `android-story-${source.slug}`,
    title: `${source.label} Android app story`,
    company: source.company,
    publisher: "Android Developers",
    publisherType: "Developer Platform",
    sourceUrl: source.sourceUrl,
    year: "Source",
    domain: "Android Apps",
    problemAreas,
    technologies,
    metrics: [{ label: "Source type", value: "Android story" }],
    summary: `${source.label} is an Android Developers app story source. Open the original story to review the details and promote it into a fully annotated case study.`,
    problem:
      "This source is cataloged for discovery first, so it needs a deeper review before we treat its problem statement as fully curated.",
    solution:
      "Use the Android Developers source page as the canonical reference, then enrich this record with the exact challenge, implementation details, metrics, and lessons.",
    lessons: [
      "Source seed records keep the catalog broad without pretending every case has been fully reviewed.",
      "Company, platform, and technology metadata make the source searchable immediately.",
      "Reviewed records can be promoted later with stronger summaries and metrics.",
    ],
    qualityScore: 2,
  };
}

const curatedSourceUrls = new Set(curatedCaseStudies.map((study) => study.sourceUrl));

export const caseStudies = [
  ...curatedCaseStudies,
  ...androidStorySources
    .filter((source) => !curatedSourceUrls.has(source.sourceUrl))
    .map(createSourceSeed),
];

export const allCompanies = Array.from(
  new Set(caseStudies.map((study) => study.company)),
).sort((a, b) => a.localeCompare(b));

export const allProblemAreas = Array.from(
  new Set(caseStudies.flatMap((study) => study.problemAreas)),
).sort();

export const allPublisherTypes = Array.from(
  new Set(caseStudies.map((study) => study.publisherType)),
).sort();
