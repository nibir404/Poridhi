/** Searchable catalog + Explore menu data (seed). */
export type Kind = "Track" | "Lab" | "Lab guide" | "AI practice";
export type Item = { kind: Kind; title: string; meta: string; href: string; time?: string; pro?: boolean; isNew?: boolean; topic: string };

export const catalog: Item[] = [
  { kind: "Track", title: "DevOps & Cloud Engineer", meta: "Career track · 6 milestones · 73 modules · 180+ labs", href: "/app/course", topic: "DevOps & Cloud" },
  { kind: "Track", title: "Milestone 4 · Kubernetes Mastery", meta: "DevOps & Cloud Engineer · 14 modules · 62 labs · you're 0% in", href: "/app/roadmap/milestone-1", topic: "Kubernetes" },
  { kind: "Track", title: "Backend & System Design", meta: "Career track · 7 milestones · Go, Python, databases", href: "/courses", topic: "Backend & System Design" },
  { kind: "Track", title: "MLOps", meta: "Career track · 5 milestones · pipelines, serving, GPUs", href: "/courses", topic: "AI & MLOps" },
  { kind: "Lab", title: "Kubernetes Administrator (CKA) labs", meta: "14 modules · 99 labs · exam-style tasks", href: "/labs/kubernetes-aws", topic: "Kubernetes" },
  { kind: "Lab", title: "Deploy your first pod with kubectl", meta: "Lab · 30 min · Beginner · 4 checks", href: "/labs/kubernetes-aws", time: "~30 min", topic: "Kubernetes" },
  { kind: "Lab", title: "Rolling updates and rollbacks", meta: "Lab · 45 min · Intermediate · 5 checks", href: "/labs/kubernetes-aws", time: "~45 min", topic: "Kubernetes" },
  { kind: "Lab", title: "Expose a service on AWS with an NLB", meta: "Lab · 45 min · Intermediate · 5 checks", href: "/labs/kubernetes-aws", time: "~45 min", topic: "Kubernetes" },
  { kind: "Lab", title: "Terraform on AWS", meta: "Skill path · 9 labs · 6 hours", href: "/app/lab/launch", time: "~6 h", isNew: true, topic: "DevOps & Cloud" },
  { kind: "Lab", title: "Monitoring with Prometheus & Grafana", meta: "Skill path · 7 labs · 4 hours", href: "/app/lab/launch", time: "~4 h", topic: "DevOps & Cloud" },
  { kind: "Lab", title: "Scaling GitHub Actions runners", meta: "Skill path · 9 labs · 3 hours", href: "/app/lab/launch", time: "~3 h", topic: "DevOps & Cloud" },
  { kind: "Lab", title: "Build a VXLAN overlay between two hosts", meta: "Lab · 5 labs · ~100 min", href: "/app/lab/launch", time: "~100 min", topic: "Linux & Networking" },
  { kind: "Lab", title: "Linux network namespaces from scratch", meta: "Lab · 40 min · Beginner · 4 checks", href: "/app/lab/launch", time: "~40 min", topic: "Linux & Networking" },
  { kind: "Lab", title: "Docker from zero to production", meta: "Lab group · 10 modules · 118 labs", href: "/app/lab/launch", topic: "DevOps & Cloud" },
  { kind: "Lab", title: "Build a URL shortener in Go", meta: "Project · 12 labs · Intermediate", href: "/app/lab/launch", time: "~8 h", topic: "Go & Python" },
  { kind: "Lab", title: "Serve an LLM on Kubernetes with GPUs", meta: "Lab · 60 min · Advanced · 5 checks", href: "/app/lab/launch", time: "~60 min", topic: "AI & MLOps" },
  { kind: "Lab", title: "Build a tool-using agent with MCP", meta: "Lab · 50 min · Intermediate · 4 checks", href: "/app/lab/launch", time: "~50 min", topic: "Agentic engineering" },
  { kind: "Lab", title: "Harden SSH and audit with auditd", meta: "Lab · 35 min · Intermediate · 4 checks", href: "/app/lab/launch", time: "~35 min", topic: "Security" },
  { kind: "Lab guide", title: "How to expose a Docker container with a load balancer", meta: "Guide · free · 4 steps", href: "/labs/guide/expose-docker-lb", topic: "DevOps & Cloud" },
  { kind: "Lab guide", title: "kubectl cheat sheet for daily work", meta: "Guide · free", href: "/labs/guide/expose-docker-lb", topic: "Kubernetes" },
  { kind: "Lab guide", title: "Kubernetes Services explained", meta: "Guide · free · ClusterIP, NodePort, LoadBalancer", href: "/labs/guide/expose-docker-lb", topic: "Kubernetes" },
  { kind: "Lab guide", title: "Debug DNS inside a Kubernetes cluster", meta: "Guide · free", href: "/labs/guide/expose-docker-lb", topic: "Kubernetes" },
  { kind: "AI practice", title: "DevOps engineer mock interview", meta: "AI interview · terminal + voice · 25 min", href: "/app/interview", pro: true, topic: "DevOps & Cloud" },
  { kind: "AI practice", title: "Kubernetes mock interview", meta: "AI interview · voice + whiteboard · 20 min", href: "/app/interview", pro: true, topic: "Kubernetes" },
  { kind: "AI practice", title: "System design: URL shortener", meta: "AI interview · whiteboard · 30 min", href: "/app/interview", pro: true, topic: "Backend & System Design" },
];

export const topics = [
  "DevOps & Cloud", "Kubernetes", "Backend & System Design", "AI & MLOps",
  "Agentic engineering", "Linux & Networking", "Security", "Go & Python",
];

export const exploreLinks = {
  Learn: [{ label: "Career tracks", href: "/courses" }, { label: "Skill paths", href: "/courses" }, { label: "Live classes", href: "/app/course" }],
  Practice: [{ label: "Lab library · 700+", href: "/labs" }, { label: "Playgrounds", href: "/labs" }, { label: "Projects", href: "/labs", isNew: true }],
  "Get hired": [{ label: "AI interview", href: "/app/exam" }, { label: "AI & hands-on exams", href: "/app/exam" }, { label: "Verified certificates", href: "/u/rahim" }],
};
