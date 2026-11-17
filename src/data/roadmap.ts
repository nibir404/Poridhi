import { slug } from "./entities";

/**
 * Seed data for the roadmap explorer (/app/roadmap/milestone-1).
 * Track → milestones → modules → items. Every milestone and module has a story and outcomes.
 */
export type ItemKind = "class" | "reading" | "lab" | "quiz" | "interview" | "live" | "exam";
export type Status = "done" | "current" | "todo" | "locked";
export type Item = { title: string; kind: ItemKind; meta: string; status: Status; href: string; summary: string; checks?: string[]; checksDone?: number; pro?: boolean };
export type Module = { slug: string; title: string; story: string; outcomes: string[]; items: Item[]; status: Status };
export type Milestone = { n: number; title: string; story: string; outcomes: string[]; certificate: string; modules: Module[] };

type Spec = [title: string, story: string, outcomes: [string, string, string], lab: string, lesson: string];

const M: { title: string; story: string; outcomes: string[]; certificate: string; status: "current" | "locked"; modules: Spec[] }[] = [
  {
    title: "Linux, Scripting & Containerization",
    story: "Every cloud system ends up as Linux processes talking over a network. This milestone gets you fluent on one box first: the shell, text tools, scripts, then containers and the network tricks Docker uses underneath. By the end you can package any service and run it the same way on any host.",
    outcomes: ["Work comfortably in a Linux shell and read system state", "Automate repeatable tasks with safe Bash scripts", "Build, run and network containers, and keep their data", "Explain how namespaces and overlays make container networking work"],
    certificate: "Linux & Containers certificate · +300 XP",
    status: "current",
    modules: [
      ["Linux fundamentals", "Before you can debug a server you need to read it: processes, files, permissions and services.", ["Navigate the filesystem and manage permissions", "Inspect and control processes and signals", "Run and debug services with systemd"], "Recover a crashed service with systemd", "Processes, signals and systemd"],
      ["Text processing & regex", "Logs and configs are text. Engineers who can slice text quickly find answers in minutes.", ["Search logs with grep and regular expressions", "Transform output with sed and awk", "Chain tools into one-line investigations"], "Find the failing request in 2 GB of logs", "grep, sed and awk on real logs"],
      ["Docker networking & storage", "Containers are disposable, but data and connections are not. This module is about keeping both alive.", ["Choose between bridge, host and user-defined networks", "Persist data with volumes and know when bind mounts fit", "Expose a container safely behind a load balancer"], "Publish nginx through the load balancer", "Volumes vs bind mounts"],
      ["Bash scripting", "The second time you type a command, script it. Safe scripts are the start of every automation.", ["Write scripts that fail loudly with set -euo pipefail", "Use functions, arguments and exit codes", "Schedule and log scripts properly"], "Write a backup script with rotation", "Writing safe scripts with set -euo pipefail"],
      ["Network namespaces", "Docker networking is not magic. You will build its pieces by hand to see exactly how packets move.", ["Create namespaces and connect them with veth pairs", "Route between namespaces with a bridge", "Trace packets with tcpdump"], "Wire two namespaces through a bridge", "Building a namespace and veth pair by hand"],
      ["Overlay networking", "Containers on different hosts still need to talk. Overlays tunnel one network across another.", ["Explain encapsulation and why MTU matters", "Build a VXLAN between two hosts", "Debug cross-host connectivity"], "Build a VXLAN overlay between two hosts", "VXLAN between two hosts"],
      ["Docker fundamentals", "Images, layers and the build cache decide how fast and how safe your deploys are.", ["Write small, cache-friendly Dockerfiles", "Use multi-stage builds", "Scan and tag images for release"], "Shrink an image from 900 MB to 60 MB", "Images, layers and the build cache"],
    ],
  },
  {
    title: "Cloud fundamentals with AWS",
    story: "Now the box becomes a fleet. You will build an AWS account the way production teams do: identity first, then a network, compute that scales, storage, databases and a first serverless function.",
    outcomes: ["Design least-privilege IAM for people and services", "Build a VPC with public and private subnets", "Run autoscaling compute behind a load balancer", "Pick the right storage and database for a workload"],
    certificate: "AWS Foundations certificate · +300 XP",
    status: "locked",
    modules: [
      ["IAM & accounts", "Every AWS incident review starts with who could do what. Get identity right first.", ["Create roles instead of long-lived keys", "Write least-privilege policies", "Audit access with CloudTrail"], "Lock down an account with roles", "Users, roles and least privilege"],
      ["VPC from scratch", "A VPC is your data centre's floor plan. You will draw it, then build it.", ["Plan CIDR ranges and subnets", "Route public and private traffic", "Add a NAT gateway for private egress"], "Build a two-tier VPC", "Subnets, route tables and NAT"],
      ["EC2 & autoscaling", "Servers come and go. Templates and scaling policies keep capacity matched to load.", ["Launch instances from templates", "Scale on CPU and request count", "Roll out a new AMI without downtime"], "Autoscale a web tier under load", "Launch templates and scaling policies"],
      ["Load balancers", "The load balancer is the front door. Health checks decide who gets traffic.", ["Choose between ALB and NLB", "Configure target groups and health checks", "Terminate TLS at the edge"], "Fix a 502 behind an ALB", "ALB vs NLB and target health"],
      ["S3 & CloudFront", "Static files belong in object storage behind a CDN, private by default.", ["Create private buckets with policies", "Serve through CloudFront with origin access", "Version and lifecycle objects"], "Host a private site behind CloudFront", "Private buckets behind a CDN"],
      ["RDS & DynamoDB", "Relational or key-value? The access pattern decides, not habit.", ["Run a managed Postgres with backups", "Model a DynamoDB table from access patterns", "Choose between them for a workload"], "Migrate a table to DynamoDB", "Choosing between relational and key-value"],
      ["Serverless basics", "Some code should not need a server at all. Lambda and API Gateway make that real.", ["Write and deploy a Lambda", "Expose it with API Gateway", "Watch cold starts and costs"], "Ship a URL shortener on Lambda", "Lambda with API Gateway"],
    ],
  },
  {
    title: "Infrastructure as Code",
    story: "Clicking in a console does not scale and cannot be reviewed. Here everything you built becomes code: Terraform for cloud resources, Ansible for configuration, Packer for images, and policy as a safety net.",
    outcomes: ["Describe infrastructure in Terraform and review changes as plans", "Share state safely across a team", "Configure servers idempotently with Ansible", "Stop risky changes with policy as code"],
    certificate: "Infrastructure as Code certificate · +300 XP",
    status: "locked",
    modules: [
      ["Terraform basics", "Write what you want; Terraform works out how to get there.", ["Use providers, resources and variables", "Read a plan before applying", "Import existing resources"], "Rebuild your VPC in Terraform", "Providers, resources and plan"],
      ["State & backends", "State is Terraform's memory. Lose it or share it badly and you lose control.", ["Store state remotely in S3", "Lock state with DynamoDB", "Move and refactor resources safely"], "Recover from a state conflict", "Remote state with S3 and locking"],
      ["Terraform modules", "Good modules turn a 400-line file into three readable calls.", ["Design module inputs and outputs", "Version and publish modules", "Compose modules into environments"], "Extract a reusable VPC module", "Writing a reusable VPC module"],
      ["Workspaces & envs", "Dev, staging and prod should differ in size, not in shape.", ["Structure code for many environments", "Pass environment-specific values", "Promote changes between environments"], "Promote a change from dev to prod", "dev, staging and prod from one codebase"],
      ["Ansible config", "Servers drift. Ansible pulls them back to the state you declared.", ["Write playbooks and roles", "Keep tasks idempotent", "Manage secrets with Vault"], "Configure a fleet with one playbook", "Playbooks, roles and idempotency"],
      ["Packer images", "Bake once, boot many times. Golden images make scaling fast and predictable.", ["Build AMIs with Packer", "Provision images with Ansible", "Version and roll images"], "Bake a golden AMI", "Baking golden AMIs"],
      ["Policy as code", "Reviews miss things at 2 AM. Policies do not.", ["Write OPA policies for Terraform plans", "Block unsafe changes in CI", "Report violations clearly"], "Block a public S3 bucket in CI", "Guardrails with OPA"],
    ],
  },
  {
    title: "Kubernetes Mastery",
    story: "Kubernetes is where containers, networking and automation meet. You will deploy, expose, configure, store, package, secure and scale real workloads on a cluster you can break and fix.",
    outcomes: ["Deploy and update workloads with zero downtime", "Expose services and route traffic with Ingress", "Run stateful apps with persistent storage", "Secure and autoscale a production namespace"],
    certificate: "Kubernetes certificate · +400 XP",
    status: "locked",
    modules: [
      ["Pods & deployments", "Pods are the unit; Deployments keep the right number of them alive.", ["Write Deployments and ReplicaSets", "Roll out and roll back", "Debug pods with logs and describe"], "Roll out a new version safely", "Your first Deployment and ReplicaSet"],
      ["Services & ingress", "Pods move; Services give them a stable address and Ingress a front door.", ["Choose ClusterIP, NodePort or LoadBalancer", "Route hosts and paths with Ingress", "Debug DNS inside the cluster"], "Expose two apps behind one Ingress", "ClusterIP, NodePort and Ingress"],
      ["ConfigMaps & secrets", "Configuration changes more often than code. Keep it out of the image.", ["Inject config and secrets", "Reload config without rebuilding", "Keep secrets out of Git"], "Rotate a secret without downtime", "Configuring apps without rebuilding"],
      ["Storage & PVCs", "Databases need disks that survive pods. StatefulSets and PVCs give them that.", ["Request storage with PVCs", "Run StatefulSets", "Back up and restore volumes"], "Run Postgres as a StatefulSet", "StatefulSets and persistent volumes"],
      ["Helm charts", "Twelve YAML files become one chart you can version and install anywhere.", ["Write and template a chart", "Manage values per environment", "Upgrade and roll back releases"], "Package an app as a Helm chart", "Packaging an app with Helm"],
      ["RBAC & security", "Who can do what in the cluster should be written down and enforced.", ["Write Roles and RoleBindings", "Use service accounts for workloads", "Apply pod security standards"], "Lock down a namespace", "Roles, bindings and service accounts"],
      ["Autoscaling", "Traffic is never flat. Scale pods and nodes to match it.", ["Configure the HPA on CPU and custom metrics", "Add cluster autoscaling", "Load-test and tune"], "Autoscale under a traffic spike", "HPA on CPU and custom metrics"],
    ],
  },
  {
    title: "Observability stack",
    story: "You cannot fix what you cannot see. This milestone builds the metrics, logs, traces and alerts that let a team understand a system at 3 AM.",
    outcomes: ["Collect and query metrics with Prometheus", "Build dashboards that answer one question each", "Correlate logs and traces across services", "Alert on user impact using SLOs"],
    certificate: "Observability certificate · +300 XP",
    status: "locked",
    modules: [
      ["Metrics with Prometheus", "Numbers over time tell you something changed before users do.", ["Scrape targets and write PromQL", "Instrument an app", "Record rules for heavy queries"], "Instrument a Go service", "Scraping and PromQL basics"],
      ["Grafana dashboards", "A good dashboard answers one question at a glance.", ["Build panels from PromQL", "Use variables for many services", "Share and version dashboards"], "Build a service health dashboard", "Dashboards that answer one question"],
      ["Logs with Loki", "Logs explain why. Loki makes them searchable without indexing everything.", ["Ship logs with Promtail", "Query with LogQL", "Link logs to metrics"], "Find the error behind a spike", "Shipping and querying logs"],
      ["Tracing with Tempo", "One slow request can touch ten services. Traces show where the time went.", ["Add OpenTelemetry tracing", "Read a trace waterfall", "Jump from metrics to traces"], "Find the slow hop in a request", "Following a request across services"],
      ["Alerting & SLOs", "Alert on what users feel, not on every CPU blip.", ["Define SLIs and SLOs", "Alert on error-budget burn", "Route alerts to the right people"], "Replace noisy alerts with SLO alerts", "Alerts from error budgets"],
      ["On-call drills", "Practise incidents on purpose so the real ones feel familiar.", ["Run a game day", "Write a clear incident timeline", "Turn findings into fixes"], "Run a game day on a broken cluster", "Running a game day"],
      ["Cost monitoring", "The bill is a metric too. Find what is expensive and why.", ["Attribute cost to teams and pods", "Find idle and oversized workloads", "Set budgets and alerts"], "Cut a cluster bill by 30%", "Finding the expensive pods"],
    ],
  },
  {
    title: "Production CI/CD & GitOps",
    story: "Everything comes together in the delivery pipeline: build, test, ship and roll out safely, with Git as the source of truth. The capstone is a service you take from commit to production.",
    outcomes: ["Build fast, cached pipelines", "Deploy with GitOps and detect drift", "Release progressively with automatic rollback", "Ship a complete service end to end"],
    certificate: "DevOps & Cloud Engineer certificate · +500 XP",
    status: "locked",
    modules: [
      ["GitHub Actions", "A pipeline turns every push into a tested, versioned artifact.", ["Write workflows with jobs and matrices", "Build and push images", "Gate merges on checks"], "Build a pipeline from push to image", "A pipeline from push to image"],
      ["Build & cache", "Slow pipelines get skipped. Caching keeps them fast enough to trust.", ["Cache dependencies and layers", "Parallelise test suites", "Measure and cut build time"], "Cut a 12-minute build to 3", "Fast builds with layer caching"],
      ["Argo CD", "Git says what should run; Argo CD makes the cluster match.", ["Install and configure Argo CD", "Sync apps from Git", "Detect and fix drift"], "Deploy with GitOps", "GitOps sync and drift"],
      ["Progressive delivery", "Release to 5% first and let metrics decide the rest.", ["Run canary releases", "Analyse metrics during rollout", "Roll back automatically"], "Canary a release with auto-rollback", "Canary releases with Argo Rollouts"],
      ["Secrets in CI", "Long-lived keys in CI are a breach waiting to happen.", ["Use OIDC to assume cloud roles", "Scope credentials per job", "Audit secret usage"], "Remove every static key from CI", "OIDC instead of long-lived keys"],
      ["Capstone project", "Take one service from an empty repo to production with everything you learned.", ["Design and build the service", "Ship it with the full pipeline", "Operate it with dashboards and alerts"], "Ship your capstone service", "Ship a service end to end"],
      ["Final review", "Pull it all together and prove it in a mock exam and interview.", ["Review weak areas", "Pass the mock exam", "Complete a mock DevOps interview"], "Mock exam environment", "Review and mock exam"],
    ],
  },
];

const labSlug: Record<string, string> = { "Publish nginx through the load balancer": "publish-nginx-lb" };

/** Docker networking & storage uses the exact items from the design. */
const dockerItems = (m: string): Item[] => [
  { title: "Bridge vs host networks", kind: "class", meta: "Class · 32 min", status: "done", href: `/app/learn/class?m=${m}`, summary: "How the default bridge, host networking and user-defined networks differ, and why containers on the default bridge cannot resolve each other by name." },
  { title: "Volumes vs bind mounts", kind: "reading", meta: "Reading · 8 min", status: "done", href: `/app/learn/class?m=${m}`, summary: "Named volumes live outside the container's writable layer and survive docker rm. Use them for databases; bind mounts for dev hot-reload." },
  { title: "Publish nginx through the load balancer", kind: "lab", meta: "Lab · ~40 min · 2 / 4 checks", status: "current", href: "/app/lab?lab=publish-nginx-lb", summary: "Run nginx in Docker, prove it answers on 8080, then expose it at a public URL.", checks: ["Pull and run nginx", "Map port 8080 → 80", "Publish through the load balancer", "Scale to 3 replicas"], checksDone: 2 },
  { title: "Persist Postgres with volumes", kind: "lab", meta: "Lab · ~35 min", status: "todo", href: "/app/lab/launch?lab=persist-postgres", summary: "Run Postgres with a named volume, remove the container and prove the data survives.", checks: ["Create a named volume", "Run Postgres on it", "Insert rows, remove the container", "Start again and read the rows"], checksDone: 0 },
  { title: "Networking quick check", kind: "quiz", meta: "Quiz · 6 questions", status: "todo", href: `/app/learn/check?m=${m}`, summary: "Six questions on networks and storage. Pass to unlock the module exam." },
  { title: "Explain Docker volumes", kind: "interview", meta: "AI interview · 15 min", status: "todo", href: "/app/interview", summary: "Explain volumes to an AI interviewer as you would in a real interview. You get a score and feedback per answer.", pro: true },
  { title: "Module exam", kind: "exam", meta: "AI exam · unlocks at 6 / 7", status: "locked", href: "/app/learn/locked", summary: "A hands-on exam graded by AI in a real VM. Unlocks once the other items are done." },
];

function itemsFor(spec: Spec, status: Status, progress: number): Item[] {
  const [title, , , lab, lesson] = spec;
  const m = slug(title);
  if (title === "Docker networking & storage") return dockerItems(m);
  const base: Omit<Item, "status">[] = [
    { title: lesson, kind: "class", meta: "Class · ~25 min", href: `/app/learn/class?m=${m}`, summary: `The core idea of ${title.toLowerCase()}, taught on a real system with a transcript you can search and annotate.` },
    { title: `${title}: cheat sheet`, kind: "reading", meta: "Reading · 8 min", href: `/app/learn/class?m=${m}`, summary: `The commands and concepts from this module on one page, for review before the lab and the exam.` },
    { title: lab, kind: "lab", meta: "Lab · ~40 min · 4 checks", href: labSlug[lab] ? `/app/lab?lab=${labSlug[lab]}` : "/app/lab/launch", summary: `Hands-on in a fresh VM: ${lab.toLowerCase()}. Every step is checked inside the machine.`, checks: ["Set up the environment", "Do the main task", "Verify it works", "Handle the failure case"] },
    { title: `${title} quick check`, kind: "quiz", meta: "Quiz · 5 questions", href: `/app/learn/check?m=${m}`, summary: "Five short questions. Pass to unlock the module exam." },
    { title: "Module exam", kind: "exam", meta: "AI exam · after the lab", href: "/app/exam", summary: "A hands-on exam graded by AI in a real VM." },
  ];
  return base.map((it, i) => ({ ...it, status: status === "locked" ? "locked" : status === "done" || i < progress ? "done" : i === progress ? "current" : "todo", checksDone: it.checks ? (status === "done" || i < progress ? 4 : 0) : undefined }));
}

const moduleStatus: Record<string, [Status, number]> = {
  "linux-fundamentals": ["done", 5], "text-processing-and-regex": ["done", 5], "docker-networking-and-storage": ["current", 2],
  "bash-scripting": ["todo", 0], "network-namespaces": ["todo", 0], "overlay-networking": ["locked", 0], "docker-fundamentals": ["locked", 0],
};

export const track = {
  title: "DevOps & Cloud Engineer",
  milestones: M.map((ms, i): Milestone => ({
    n: i + 1,
    title: ms.title,
    story: ms.story,
    outcomes: ms.outcomes,
    certificate: ms.certificate,
    modules: ms.modules.map((spec): Module => {
      const s = slug(spec[0]);
      const [status, progress] = ms.status === "locked" ? (["locked", 0] as [Status, number]) : moduleStatus[s] ?? ["todo", 0];
      return { slug: s, title: spec[0], story: spec[1], outcomes: spec[2], status, items: itemsFor(spec, status, progress) };
    }),
  })),
};

export const doneCount = (m: Module) => m.items.filter((i) => i.status === "done").length;
