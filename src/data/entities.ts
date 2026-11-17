/**
 * Seed entities that buttons point at. A link carries the item's id in the query string
 * (?m= module, ?lab= lab, ?q= exam question); the screen it opens swaps the design's sample
 * text for that item (see applyContext in src/components/app/context.ts).
 */
export const slug = (s: string) => s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

type Module = { title: string; milestone: string; lesson: string; status: "done" | "in-progress" | "locked" };
const M1 = "Linux, Scripting & Containers";
const M2 = "AWS Cloud Fundamentals";
const M3 = "Infrastructure as Code";
const M4 = "Kubernetes Mastery";
const M5 = "Observability stack";
const M6 = "Production CI/CD & GitOps";

const list: [string, string, string, Module["status"]][] = [
  ["Linux fundamentals", M1, "Processes, signals and systemd", "done"],
  ["Text processing & regex", M1, "grep, sed and awk on real logs", "done"],
  ["Docker networking & storage", M1, "Volumes vs bind mounts", "in-progress"],
  ["Bash scripting", M1, "Writing safe scripts with set -euo pipefail", "in-progress"],
  ["Network namespaces", M1, "Building a namespace and veth pair by hand", "in-progress"],
  ["Overlay networking", M1, "VXLAN between two hosts", "in-progress"],
  ["Docker fundamentals", M1, "Images, layers and the build cache", "done"],
  ["IAM & accounts", M2, "Users, roles and least privilege", "locked"],
  ["VPC from scratch", M2, "Subnets, route tables and NAT", "locked"],
  ["EC2 & autoscaling", M2, "Launch templates and scaling policies", "locked"],
  ["Load balancers", M2, "ALB vs NLB and target health", "locked"],
  ["S3 & CloudFront", M2, "Private buckets behind a CDN", "locked"],
  ["RDS & DynamoDB", M2, "Choosing between relational and key-value", "locked"],
  ["Serverless basics", M2, "Lambda with API Gateway", "locked"],
  ["Terraform basics", M3, "Providers, resources and plan", "locked"],
  ["State & backends", M3, "Remote state with S3 and locking", "locked"],
  ["Terraform modules", M3, "Writing a reusable VPC module", "locked"],
  ["Workspaces & envs", M3, "dev, staging and prod from one codebase", "locked"],
  ["Ansible config", M3, "Playbooks, roles and idempotency", "locked"],
  ["Packer images", M3, "Baking golden AMIs", "locked"],
  ["Policy as code", M3, "Guardrails with OPA", "locked"],
  ["Pods & deployments", M4, "Your first Deployment and ReplicaSet", "locked"],
  ["Services & ingress", M4, "ClusterIP, NodePort and Ingress", "locked"],
  ["ConfigMaps & secrets", M4, "Configuring apps without rebuilding", "locked"],
  ["Storage & PVCs", M4, "StatefulSets and persistent volumes", "locked"],
  ["Helm charts", M4, "Packaging an app with Helm", "locked"],
  ["RBAC & security", M4, "Roles, bindings and service accounts", "locked"],
  ["Autoscaling", M4, "HPA on CPU and custom metrics", "locked"],
  ["Metrics with Prometheus", M5, "Scraping and PromQL basics", "locked"],
  ["Grafana dashboards", M5, "Dashboards that answer one question", "locked"],
  ["Logs with Loki", M5, "Shipping and querying logs", "locked"],
  ["Tracing with Tempo", M5, "Following a request across services", "locked"],
  ["Alerting & SLOs", M5, "Alerts from error budgets", "locked"],
  ["On-call drills", M5, "Running a game day", "locked"],
  ["Cost monitoring", M5, "Finding the expensive pods", "locked"],
  ["GitHub Actions", M6, "A pipeline from push to image", "locked"],
  ["Build & cache", M6, "Fast builds with layer caching", "locked"],
  ["Argo CD", M6, "GitOps sync and drift", "locked"],
  ["Progressive delivery", M6, "Canary releases with Argo Rollouts", "locked"],
  ["Secrets in CI", M6, "OIDC instead of long-lived keys", "locked"],
  ["Capstone project", M6, "Ship a service end to end", "locked"],
  ["Final review", M6, "Review and mock exam", "locked"],
  ["Caching at scale", "System design practice", "Cache-aside, TTLs and stampedes", "in-progress"],
];
export const modules: Record<string, Module> = Object.fromEntries(
  list.map(([title, milestone, lesson, status]) => [slug(title), { title, milestone, lesson, status }]),
);

export type Lab = { title: string; goal: string; minutes: number };
export const labs: Record<string, Lab> = {
  "publish-nginx-lb": { title: "Publish nginx through the load balancer", goal: "Run nginx in Docker, prove it answers on 8080, then expose it at a public URL.", minutes: 35 },
  "persist-postgres": { title: "Persist Postgres with volumes", goal: "Run Postgres with a named volume, remove the container and prove the data survives.", minutes: 35 },
  "redis-failover": { title: "Redis cluster failover", goal: "Build a 3-node Redis cluster, kill the primary and confirm a replica takes over.", minutes: 40 },
};

export type Question = { n: number; title: string; tool: string; level: "Beginner" | "Medium" | "Hard"; points: number };
export const examQuestions: Question[] = [
  { n: 1, title: "VPC with NAT gateway", tool: "Terraform · AWS", level: "Beginner", points: 80 },
  { n: 2, title: "Private subnet with internet access", tool: "Terraform", level: "Medium", points: 100 },
  { n: 3, title: "Public subnet with Elastic IP", tool: "Terraform", level: "Beginner", points: 80 },
  { n: 4, title: "Load balancer configuration", tool: "Terraform · ELB", level: "Medium", points: 100 },
  { n: 5, title: "Security groups setup", tool: "Ansible", level: "Beginner", points: 80 },
  { n: 6, title: "Auto Scaling group", tool: "CloudFormation", level: "Medium", points: 100 },
  { n: 7, title: "VPN connection", tool: "Ansible", level: "Hard", points: 120 },
  { n: 8, title: "Route table association", tool: "Terraform", level: "Beginner", points: 80 },
  { n: 9, title: "EC2 instance initialisation", tool: "Ansible", level: "Medium", points: 100 },
  { n: 10, title: "CloudWatch monitoring", tool: "CloudFormation", level: "Hard", points: 160 },
];

export type Note = { card: string; title: string; at?: string; course: "devops" | "k8s" | "go" | "lab"; module: "M1" | "M2" | "M3" | "lab"; highlight?: string; body: string; meta: string; tags: string[]; m?: string };
/** Saved notes shown on /app/me/notes; `card` is the note's card layer in the design. */
export const notes: Note[] = [
  { card: "HMA-0", title: "Volumes vs bind mounts", at: "12:48", course: "devops", module: "M2", highlight: "A named volume lives outside the container's writable layer, so it survives docker rm.", body: "Use named volumes for databases. Bind mounts only for dev hot-reload.", meta: "M2 · DOCKER NETWORKING & STORAGE · MODULE 3", tags: ["#storage", "#postgres"], m: "docker-networking-and-storage" },
  { card: "HMN-0", title: "Bridge vs host networks", at: "07:15", course: "devops", module: "M2", body: "Containers on the default bridge can't resolve each other by name. Create a user-defined network.", meta: "M2 · DOCKER NETWORKING & STORAGE · MODULE 3", tags: ["#networking", "#dns"], m: "docker-networking-and-storage" },
  { card: "HMY-0", title: "Lab · Publish nginx through the LB", course: "lab", module: "lab", body: "LB targets the container port, not the host port. Fixed 502 by retargeting to :8080.", meta: "LAB · PUBLISH NGINX THROUGH THE LOAD BALANCER", tags: ["#loadbalancer", "#502"] },
];
