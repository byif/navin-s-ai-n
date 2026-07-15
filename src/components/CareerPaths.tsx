import { type ElementType, useEffect, useMemo, useRef, useState } from "react";
import {
  Brain,
  Code2,
  Database,
  Filter,
  GitBranch,
  GraduationCap,
  Layers,
  Moon,
  Network,
  Search,
  Sparkles,
  Sun,
  Timer,
} from "lucide-react";

import lightOffImage from "../assets/career-lightoff.png";
import lightOnImage from "../assets/career-lighton.png";

type ResourceCategory =
  | "Programming"
  | "Web Development"
  | "Data Structures & Algorithms"
  | "AI & Machine Learning"
  | "Data Science"
  | "Interview Preparation";

interface LearningResource {
  topic: string;
  category: ResourceCategory;
  description: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  time: string;
  link: string;
  source: string;
}

const resourceCategories: Array<ResourceCategory | "All"> = [
  "All",
  "Programming",
  "Web Development",
  "Data Structures & Algorithms",
  "AI & Machine Learning",
  "Data Science",
  "Interview Preparation",
];

const learningResources: LearningResource[] = [
  {
    topic: "C++",
    category: "Programming",
    description: "Master syntax, STL, memory basics, and competitive programming foundations.",
    difficulty: "Intermediate",
    time: "4 weeks",
    link: "https://www.geeksforgeeks.org/c-plus-plus/",
    source: "GeeksForGeeks",
  },
  {
    topic: "Java",
    category: "Programming",
    description: "Build strong OOP, collections, JVM, and backend-ready Java fundamentals.",
    difficulty: "Beginner",
    time: "5 weeks",
    link: "https://dev.java/learn/",
    source: "Java Learn",
  },
  {
    topic: "Python",
    category: "Programming",
    description: "Learn practical Python for automation, backend logic, data work, and AI.",
    difficulty: "Beginner",
    time: "3 weeks",
    link: "https://www.freecodecamp.org/news/learn-python-free-python-courses-for-beginners/",
    source: "freeCodeCamp",
  },
  {
    topic: "JavaScript",
    category: "Programming",
    description: "Understand modern JS, async programming, DOM APIs, and app architecture.",
    difficulty: "Beginner",
    time: "4 weeks",
    link: "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
    source: "MDN",
  },
  {
    topic: "HTML",
    category: "Web Development",
    description: "Create semantic, accessible page structures for professional web products.",
    difficulty: "Beginner",
    time: "1 week",
    link: "https://developer.mozilla.org/en-US/docs/Learn/HTML",
    source: "MDN",
  },
  {
    topic: "CSS",
    category: "Web Development",
    description: "Build responsive layouts, polished interfaces, animations, and design systems.",
    difficulty: "Beginner",
    time: "3 weeks",
    link: "https://web.dev/learn/css",
    source: "web.dev",
  },
  {
    topic: "React",
    category: "Web Development",
    description: "Develop component-driven interfaces with hooks, state, routing, and effects.",
    difficulty: "Intermediate",
    time: "4 weeks",
    link: "https://react.dev/learn",
    source: "React Docs",
  },
  {
    topic: "Node.js",
    category: "Web Development",
    description: "Create server-side JavaScript services, APIs, tooling, and real-time apps.",
    difficulty: "Intermediate",
    time: "3 weeks",
    link: "https://nodejs.org/en/learn",
    source: "Node.js Learn",
  },
  {
    topic: "Express",
    category: "Web Development",
    description: "Ship REST APIs, middleware, authentication flows, and production routes.",
    difficulty: "Intermediate",
    time: "2 weeks",
    link: "https://expressjs.com/en/starter/installing.html",
    source: "Express Docs",
  },
  {
    topic: "Next.js",
    category: "Web Development",
    description: "Learn routing, rendering patterns, server actions, and full-stack React apps.",
    difficulty: "Advanced",
    time: "4 weeks",
    link: "https://nextjs.org/learn",
    source: "Next.js Learn",
  },
  {
    topic: "Arrays",
    category: "Data Structures & Algorithms",
    description: "Practice traversal, sliding windows, prefix sums, sorting, and two pointers.",
    difficulty: "Beginner",
    time: "1 week",
    link: "https://www.geeksforgeeks.org/array-data-structure-guide/",
    source: "GeeksForGeeks",
  },
  {
    topic: "Linked Lists",
    category: "Data Structures & Algorithms",
    description: "Understand pointer movement, reversal, cycle detection, and merge patterns.",
    difficulty: "Intermediate",
    time: "1 week",
    link: "https://www.geeksforgeeks.org/data-structures/linked-list/",
    source: "GeeksForGeeks",
  },
  {
    topic: "Trees",
    category: "Data Structures & Algorithms",
    description: "Build confidence with traversal, BST logic, recursion, heaps, and tries.",
    difficulty: "Intermediate",
    time: "2 weeks",
    link: "https://www.geeksforgeeks.org/binary-tree-data-structure/",
    source: "GeeksForGeeks",
  },
  {
    topic: "Graphs",
    category: "Data Structures & Algorithms",
    description: "Study BFS, DFS, shortest paths, topological sort, and connectivity.",
    difficulty: "Advanced",
    time: "3 weeks",
    link: "https://www.geeksforgeeks.org/graph-data-structure-and-algorithms/",
    source: "GeeksForGeeks",
  },
  {
    topic: "Dynamic Programming",
    category: "Data Structures & Algorithms",
    description: "Learn recurrence design, memoization, tabulation, and optimization patterns.",
    difficulty: "Advanced",
    time: "4 weeks",
    link: "https://www.geeksforgeeks.org/dynamic-programming/",
    source: "GeeksForGeeks",
  },
  {
    topic: "Machine Learning",
    category: "AI & Machine Learning",
    description: "Cover supervised learning, evaluation, feature engineering, and model basics.",
    difficulty: "Intermediate",
    time: "5 weeks",
    link: "https://developers.google.com/machine-learning/crash-course",
    source: "Google ML",
  },
  {
    topic: "Deep Learning",
    category: "AI & Machine Learning",
    description: "Explore neural networks, optimization, CNNs, sequence models, and training.",
    difficulty: "Advanced",
    time: "6 weeks",
    link: "https://www.deeplearning.ai/courses/",
    source: "DeepLearning.AI",
  },
  {
    topic: "Computer Vision",
    category: "AI & Machine Learning",
    description: "Learn image processing, CNN workflows, detection, and practical CV systems.",
    difficulty: "Advanced",
    time: "4 weeks",
    link: "https://opencv.org/university/free-opencv-course/",
    source: "OpenCV",
  },
  {
    topic: "NLP",
    category: "AI & Machine Learning",
    description: "Study text preprocessing, embeddings, transformers, and language tasks.",
    difficulty: "Advanced",
    time: "4 weeks",
    link: "https://huggingface.co/learn/nlp-course/chapter1/1",
    source: "Hugging Face",
  },
  {
    topic: "TensorFlow",
    category: "AI & Machine Learning",
    description: "Train, evaluate, and deploy neural models with the TensorFlow ecosystem.",
    difficulty: "Intermediate",
    time: "3 weeks",
    link: "https://www.tensorflow.org/learn",
    source: "TensorFlow Docs",
  },
  {
    topic: "PyTorch",
    category: "AI & Machine Learning",
    description: "Build flexible deep learning workflows with tensors, modules, and training loops.",
    difficulty: "Intermediate",
    time: "3 weeks",
    link: "https://pytorch.org/tutorials/",
    source: "PyTorch Tutorials",
  },
  {
    topic: "Pandas",
    category: "Data Science",
    description: "Clean, transform, aggregate, and explore tabular datasets confidently.",
    difficulty: "Beginner",
    time: "2 weeks",
    link: "https://pandas.pydata.org/docs/getting_started/index.html",
    source: "Pandas Docs",
  },
  {
    topic: "NumPy",
    category: "Data Science",
    description: "Learn arrays, vectorization, numerical operations, and scientific Python basics.",
    difficulty: "Beginner",
    time: "2 weeks",
    link: "https://numpy.org/learn/",
    source: "NumPy Learn",
  },
  {
    topic: "SQL",
    category: "Data Science",
    description: "Write queries, joins, aggregations, subqueries, and analytics-ready SQL.",
    difficulty: "Beginner",
    time: "3 weeks",
    link: "https://learn.microsoft.com/en-us/training/browse/?terms=sql",
    source: "Microsoft Learn",
  },
  {
    topic: "Statistics",
    category: "Data Science",
    description: "Strengthen probability, distributions, hypothesis testing, and inference.",
    difficulty: "Intermediate",
    time: "4 weeks",
    link: "https://www.khanacademy.org/math/statistics-probability",
    source: "Khan Academy",
  },
  {
    topic: "Power BI",
    category: "Data Science",
    description: "Create dashboards, data models, DAX measures, and business reports.",
    difficulty: "Intermediate",
    time: "3 weeks",
    link: "https://learn.microsoft.com/en-us/training/powerplatform/power-bi",
    source: "Microsoft Learn",
  },
  {
    topic: "Aptitude",
    category: "Interview Preparation",
    description: "Practice quantitative ability, logic, verbal reasoning, and placement tests.",
    difficulty: "Beginner",
    time: "2 weeks",
    link: "https://www.geeksforgeeks.org/aptitude-questions-and-answers/",
    source: "GeeksForGeeks",
  },
  {
    topic: "HR Questions",
    category: "Interview Preparation",
    description: "Prepare confident answers for behavioral, motivation, and culture-fit rounds.",
    difficulty: "Beginner",
    time: "1 week",
    link: "https://www.geeksforgeeks.org/hr-interview-questions/",
    source: "GeeksForGeeks",
  },
  {
    topic: "System Design",
    category: "Interview Preparation",
    description: "Learn scalable architecture, caching, databases, queues, and tradeoffs.",
    difficulty: "Advanced",
    time: "5 weeks",
    link: "https://roadmap.sh/system-design",
    source: "Roadmap.sh",
  },
  {
    topic: "Coding Interview",
    category: "Interview Preparation",
    description: "Build a structured practice plan for algorithms, patterns, and mock interviews.",
    difficulty: "Intermediate",
    time: "6 weeks",
    link: "https://www.freecodecamp.org/news/coding-interview-prep-guide/",
    source: "freeCodeCamp",
  },
  {
    topic: "Resume Tips",
    category: "Interview Preparation",
    description: "Improve resume structure, action bullets, ATS keywords, and achievement framing.",
    difficulty: "Beginner",
    time: "3 days",
    link: "https://www.coursera.org/articles/how-to-write-a-resume",
    source: "Coursera",
  },
];

const categoryIcons: Record<ResourceCategory, ElementType> = {
  Programming: Code2,
  "Web Development": Layers,
  "Data Structures & Algorithms": GitBranch,
  "AI & Machine Learning": Brain,
  "Data Science": Database,
  "Interview Preparation": GraduationCap,
};

const difficultyStyles = {
  Beginner: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  Intermediate: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  Advanced: "border-rose-400/30 bg-rose-400/10 text-rose-200",
};

export default function CareerPaths() {
  const [lightOn, setLightOn] = useState(false);
  const [isChanging, setIsChanging] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ResourceCategory | "All">("All");
  const hubRef = useRef<HTMLDivElement>(null);

  const filteredResources = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return learningResources.filter((resource) => {
      const matchesCategory = selectedCategory === "All" || resource.category === selectedCategory;
      const matchesSearch =
        !query ||
        resource.topic.toLowerCase().includes(query) ||
        resource.description.toLowerCase().includes(query) ||
        resource.category.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [searchTerm, selectedCategory]);

  useEffect(() => {
    if (!lightOn) return;

    const scrollTimer = window.setTimeout(() => {
      hubRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 700);

    return () => window.clearTimeout(scrollTimer);
  }, [lightOn]);

  const toggleLight = () => {
    if (isChanging) return;

    setIsChanging(true);
    setLightOn((prev) => !prev);

    window.setTimeout(() => {
      setIsChanging(false);
    }, 600);
  };

  return (
    <section className="relative w-full overflow-hidden bg-[#020617] py-8 md:py-12">
      <div className="pointer-events-none absolute inset-0 select-none">
        <div
          className={`absolute left-1/2 top-1/2 h-[500px] w-[85vw] -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-1000 blur-[130px] ${
            lightOn ? "bg-amber-500/5 opacity-100" : "bg-violet-600/10 opacity-40"
          }`}
        />
      </div>

      <div className="relative mx-auto w-full max-w-[1536px] px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="relative z-10 mb-4 text-center">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-violet-400/15 bg-violet-500/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-violet-300 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 animate-pulse" />
            Interactive Experience
          </div>
        </div>

        <div className="group relative w-full overflow-hidden rounded-[28px] border border-white/10 bg-[#040a15] shadow-[0_30px_90px_-20px_rgba(0,0,0,0.95)]">
          <div className="relative h-[380px] w-full sm:h-[460px] md:h-[560px] lg:h-[640px]">
            <img
              src={lightOffImage}
              alt="Workspace standby mode"
              className={`absolute inset-0 h-full w-full object-fill object-center transition-all duration-1000 ease-in-out ${
                lightOn ? "scale-[1.005] opacity-0" : "scale-100 opacity-100"
              }`}
            />

            <img
              src={lightOnImage}
              alt="Active illuminated developer workspace"
              className={`absolute inset-0 h-full w-full object-fill object-center transition-all duration-1000 ease-in-out ${
                lightOn ? "scale-100 opacity-100" : "scale-[1.005] opacity-0"
              }`}
            />

            <div
              className={`pointer-events-none absolute inset-0 bg-gradient-to-t from-[#020617]/40 via-transparent to-[#020617]/25 transition-opacity duration-1000 ${
                lightOn ? "opacity-15" : "opacity-55"
              }`}
            />

            <div className="absolute bottom-[33%] right-[24.5%] z-30 transition-all duration-300 group/hologram sm:bottom-[35%] sm:right-[22%] md:bottom-[36%] md:right-[20.5%] lg:bottom-[38%] lg:right-[18.5%]">
              <button
                type="button"
                onClick={toggleLight}
                aria-label={lightOn ? "Deactivate Workspace View" : "Activate Workspace View"}
                className="relative flex h-[110px] w-[110px] cursor-pointer items-center justify-center rounded-full border-0 bg-transparent focus:outline-none focus:ring-0 sm:h-[130px] sm:w-[130px] md:h-[160px] md:w-[160px] lg:h-[190px] lg:w-[190px]"
              >
                <div
                  className={`absolute h-2.5 w-2.5 rounded-full opacity-20 transition-all duration-500 group-hover/hologram:scale-125 group-hover/hologram:opacity-100 ${
                    lightOn
                      ? "bg-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.8)]"
                      : "bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.8)]"
                  }`}
                />
                <div
                  className={`absolute inset-0 scale-90 animate-spin rounded-full border border-dashed opacity-[0.03] transition-all duration-700 [animation-duration:20s] group-hover/hologram:scale-100 group-hover/hologram:opacity-30 ${
                    lightOn ? "border-amber-300 bg-amber-400/[0.01]" : "border-violet-400 bg-violet-400/[0.01]"
                  }`}
                />
                <div
                  className={`absolute inset-4 scale-75 rounded-full border opacity-0 transition-all duration-1000 group-hover/hologram:scale-105 group-hover/hologram:opacity-20 ${
                    lightOn ? "border-amber-400/40 bg-amber-400/5" : "border-violet-400/40 bg-violet-500/5"
                  }`}
                />
                <div
                  className={`absolute inset-8 scale-50 animate-spin rounded-full border border-dotted opacity-0 transition-all duration-700 [animation-duration:14s] group-hover/hologram:scale-95 group-hover/hologram:opacity-15 ${
                    lightOn ? "border-amber-300/60" : "border-violet-400/60"
                  }`}
                />
              </button>
            </div>

            <div className="absolute left-6 top-6 z-20 md:left-8 md:top-8">
              <div
                className={`flex items-center gap-2.5 rounded-full border px-4 py-2 text-xs font-bold tracking-wider backdrop-blur-md transition-all duration-700 ${
                  lightOn
                    ? "border-amber-300/30 bg-amber-400/10 text-amber-300 shadow-[0_4px_12px_rgba(251,191,36,0.1)]"
                    : "border-violet-400/25 bg-[#050b18]/70 text-violet-300"
                }`}
              >
                {lightOn ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
                <span>{lightOn ? "WORKSPACE ONLINE" : "STANDBY MODE"}</span>
              </div>
            </div>

            <div
              className={`absolute bottom-6 left-1/2 z-20 hidden -translate-x-1/2 items-center gap-4 rounded-full border border-white/10 bg-[#050b18]/85 px-8 py-3.5 shadow-2xl backdrop-blur-xl transition-all duration-700 md:flex ${
                lightOn ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
              }`}
            >
              {["Analyze", "Learn", "Apply", "Interview", "Grow"].map((item, index) => (
                <div key={item} className="flex items-center gap-4">
                  <span className="text-xs font-semibold tracking-wide text-white/90">{item}</span>
                  {index < 4 && <span className="h-1 w-1 rounded-full bg-violet-400/60" />}
                </div>
              ))}
            </div>

            <div
              className={`pointer-events-none absolute inset-0 z-40 bg-amber-100/5 transition-opacity duration-200 ${
                isChanging ? "opacity-100" : "opacity-0"
              }`}
            />
          </div>
        </div>

        <div className="mt-4 text-center">
          <p
            className={`text-sm font-semibold tracking-wide transition-all duration-700 ${
              lightOn ? "text-amber-300 drop-shadow-sm" : "text-slate-500"
            }`}
          >
            {lightOn
              ? "Workspace active. Time to engineer your goals."
              : "Hover your cursor near the wall area between the laptop and lamp base to engage the control field."}
          </p>
        </div>

        <div
          ref={hubRef}
          className={`grid transition-all duration-1000 ease-out ${
            lightOn ? "mt-12 grid-rows-[1fr] opacity-100" : "mt-0 grid-rows-[0fr] opacity-0"
          }`}
          aria-hidden={!lightOn}
        >
          <div className="overflow-hidden">
            <div className="relative rounded-[28px] border border-white/10 bg-[#040a15]/95 p-5 shadow-[0_30px_90px_-35px_rgba(124,58,237,0.65)] backdrop-blur md:p-8">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.10),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(124,58,237,0.14),transparent_32%)]" />

              <div className="relative">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                  <div className="max-w-3xl">
                    <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.24em] text-amber-200">
                      <Network className="h-3.5 w-3.5" />
                      AI learning portal
                    </div>
                    <h2 className="mt-4 animate-[fadeInUp_0.8s_ease-out] text-3xl font-black tracking-tight text-white sm:text-4xl">
                      Career Learning Hub
                    </h2>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
                      Curated roadmaps, docs, and practice tracks to turn career intent into interview-ready skill depth.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] lg:min-w-[520px]">
                    <label className="relative block">
                      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <input
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        placeholder="Search topics, skills, or categories"
                        className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.06] pl-11 pr-4 text-sm font-medium text-white outline-none transition placeholder:text-slate-500 focus:border-amber-300/40 focus:bg-white/[0.09]"
                      />
                    </label>
                    <div className="flex h-12 items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-4 text-slate-300">
                      <Filter className="h-4 w-4 text-amber-300" />
                      <span className="text-xs font-bold uppercase tracking-[0.18em]">{filteredResources.length} tracks</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
                  {resourceCategories.map((category) => {
                    const active = selectedCategory === category;

                    return (
                      <button
                        key={category}
                        type="button"
                        onClick={() => setSelectedCategory(category)}
                        className={`shrink-0 rounded-full border px-4 py-2 text-xs font-bold transition ${
                          active
                            ? "border-amber-300/40 bg-amber-300/15 text-amber-100 shadow-[0_0_28px_rgba(251,191,36,0.12)]"
                            : "border-white/10 bg-white/[0.04] text-slate-400 hover:border-violet-300/30 hover:text-white"
                        }`}
                      >
                        {category}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {filteredResources.map((resource) => {
                    const Icon = categoryIcons[resource.category];

                    return (
                      <article
                        key={`${resource.category}-${resource.topic}`}
                        className="group rounded-2xl border border-white/10 bg-white/[0.045] p-5 shadow-[0_18px_50px_-30px_rgba(0,0,0,0.85)] transition duration-300 hover:-translate-y-1 hover:border-amber-300/30 hover:bg-white/[0.07] hover:shadow-[0_22px_70px_-30px_rgba(251,191,36,0.45)]"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-violet-300/20 bg-violet-400/10 text-violet-200 transition group-hover:border-amber-300/30 group-hover:text-amber-100">
                            <Icon className="h-5 w-5" />
                          </div>
                          <span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${difficultyStyles[resource.difficulty]}`}>
                            {resource.difficulty}
                          </span>
                        </div>

                        <div className="mt-5">
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-300">{resource.category}</p>
                          <h3 className="mt-2 text-xl font-bold text-white">{resource.topic}</h3>
                          <p className="mt-3 min-h-[72px] text-sm leading-6 text-slate-400">{resource.description}</p>
                        </div>

                        <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
                          <span className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400">
                            <Timer className="h-4 w-4 text-amber-300" />
                            {resource.time}
                          </span>
                          <a
                            href={resource.link}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-xl bg-white px-4 py-2 text-xs font-bold text-slate-950 transition hover:bg-amber-200"
                          >
                            Start Learning
                          </a>
                        </div>
                        <p className="mt-3 text-xs font-medium text-slate-500">Source: {resource.source}</p>
                      </article>
                    );
                  })}
                </div>

                {filteredResources.length === 0 && (
                  <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center text-sm text-slate-400">
                    No learning tracks match that search yet. Try a broader skill or switch categories.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
