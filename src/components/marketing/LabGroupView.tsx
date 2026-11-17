"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import SiteHeader from "@/components/layout/SiteHeader";
import MobileChrome from "@/components/layout/MobileChrome";
import Footer from "@/components/landing/Footer";

/**
 * Lab group (e.g. Kubernetes & AWS): built for 100+ modules. Sticky left sidebar with search,
 * status / level / length / topic filters (with live counts) and the module list scrolling inside
 * itself; the right pane shows the selected module's labs.
 */
type St = "done" | "progress" | "todo";
type Lab = { title: string; min: number; checks: number; st: "passed" | "current" | "todo" };
type Mod = { n: number; title: string; topic: string; level: "Beginner" | "Intermediate" | "Advanced"; labs: Lab[]; st: St };

const TOPICS: [string, string[]][] = [
  ["Workloads", ["Pods & workloads", "Deployments & rollouts", "DaemonSets & Jobs", "Init & sidecar containers", "Probes & lifecycle", "Resource requests & limits", "Pod disruption budgets", "Topology spread"]],
  ["Networking", ["Services & networking", "Ingress & the AWS LB controller", "Network policies", "CoreDNS deep dive", "Service mesh basics", "Gateway API", "VPC CNI on EKS", "IPv6 clusters"]],
  ["Config & storage", ["ConfigMaps & Secrets", "Storage & StatefulSets", "EBS & EFS CSI drivers", "Volume snapshots", "External Secrets", "Backups with Velero"]],
  ["Security", ["RBAC", "IRSA & Pod Identity", "Pod security standards", "Image signing", "OPA Gatekeeper", "Audit logging", "Secrets encryption with KMS"]],
  ["Scaling", ["HPA", "Cluster Autoscaler", "Karpenter", "VPA", "KEDA event scaling", "Spot nodes"]],
  ["Delivery", ["Helm charts", "Kustomize", "Argo CD", "Flux", "Progressive delivery", "Blue/green on EKS"]],
  ["Observability", ["Prometheus on EKS", "Grafana dashboards", "Logs with Loki", "Tracing", "SLOs & alerts", "Cost visibility"]],
  ["Operations", ["EKS upgrades", "Node groups", "Multi-cluster", "Disaster recovery", "Troubleshooting drills", "Chaos experiments"]],
];
const LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;
const VERBS = ["step by step", "from scratch", "on AWS", "under failure", "in production", "debugging drill"];

const MODS: Mod[] = (() => {
  const out: Mod[] = []; let n = 0;
  for (let round = 0; round < 3; round++) TOPICS.forEach(([topic, names]) => names.forEach((name, j) => {
    n++;
    const title = round === 0 ? name : `${name} ${round === 1 ? "II · patterns" : "III · at scale"}`;
    const count = 3 + ((n * 7) % 6);
    const st: St = n <= 2 ? "done" : n === 3 ? "progress" : "todo";
    const labs: Lab[] = Array.from({ length: count }, (_, k) => ({
      title: k === 0 ? `${name.split(" ")[0]} ${VERBS[(n + k) % VERBS.length]}` : `${name}: ${["first look", "hands-on", "break and fix", "on EKS", "hardening", "capstone", "review", "scenario"][k % 8]}`,
      min: 25 + ((n + k * 5) % 6) * 5, checks: 3 + ((n + k) % 3),
      st: st === "done" ? "passed" : st === "progress" ? (k < 2 ? "passed" : k === 2 ? "current" : "todo") : "todo",
    }));
    out.push({ n, title, topic, level: LEVELS[Math.min(2, round + (j % 3 === 2 ? 1 : 0))], labs, st });
  }));
  return out;
})();
const LENGTHS: [string, (m: Mod) => boolean][] = [["Under 3 h", (m) => hours(m) < 3], ["3–5 h", (m) => hours(m) >= 3 && hours(m) <= 5], ["Over 5 h", (m) => hours(m) > 5]];
const STATUS: [St, string][] = [["done", "Completed"], ["progress", "In progress"], ["todo", "Not started"]];
function hours(m: Mod) { return Math.round((m.labs.reduce((a, l) => a + l.min, 0) / 60) * 2) / 2; }

const muted = "var(--dashboard-muted)", border = "1px solid var(--dashboard-border)";
const eyebrow: React.CSSProperties = { fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: muted };

function Check({ on, label, n, toggle }: { on: boolean; label: string; n: number; toggle: () => void }) {
  return (
    <button type="button" role="checkbox" aria-checked={on} onClick={toggle} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "6px 2px", border: 0, background: "transparent", color: "var(--dashboard-text)", font: "13.5px/1.3 var(--font-sans)", cursor: "pointer", textAlign: "left", opacity: n === 0 && !on ? 0.45 : 1 }}>
      <span className="pd-check" aria-hidden><svg viewBox="0 0 16 16" width="12" height="12"><path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
      <span style={{ flex: 1 }}>{label}</span><span style={{ color: muted, fontSize: 12 }}>{n}</span>
    </button>
  );
}

export default function LabGroupView() {
  const [q, setQ] = useState("");
  const [sts, setSts] = useState<string[]>([]);
  const [lvls, setLvls] = useState<string[]>([]);
  const [lens, setLens] = useState<string[]>([]);
  const [tops, setTops] = useState<string[]>([]);
  const [sel, setSel] = useState(3);
  const [filtersOpen, setFiltersOpen] = useState(true);
  const tog = (a: string[], s: (v: string[]) => void, v: string) => s(a.includes(v) ? a.filter((x) => x !== v) : [...a, v]);

  const match = (m: Mod, skip?: string) =>
    (skip === "st" || !sts.length || sts.includes(m.st)) && (skip === "lv" || !lvls.length || lvls.includes(m.level)) &&
    (skip === "len" || !lens.length || LENGTHS.some(([l, f]) => lens.includes(l) && f(m))) && (skip === "top" || !tops.length || tops.includes(m.topic)) &&
    (!q.trim() || `${m.title} ${m.topic} ${m.labs.map((l) => l.title).join(" ")}`.toLowerCase().includes(q.trim().toLowerCase()));
  const list = useMemo(() => MODS.filter((m) => match(m)), [q, sts, lvls, lens, tops]); // eslint-disable-line react-hooks/exhaustive-deps
  const active = sts.length + lvls.length + lens.length + tops.length;
  const clear = () => { setSts([]); setLvls([]); setLens([]); setTops([]); setQ(""); };
  const cur = MODS.find((m) => m.n === sel) ?? MODS[0];
  const done = MODS.filter((m) => m.st === "done").length;
  const totalLabs = MODS.reduce((a, m) => a + m.labs.length, 0);

  return (
    <div style={{ minHeight: "100dvh", background: "var(--dashboard-main)", color: "var(--dashboard-text)", fontFamily: "var(--font-sans)" }}>
      <MobileChrome variant="site" onSearch={() => window.dispatchEvent(new Event("pd-open-search"))} />
      <SiteHeader />
      <main style={{ width: "min(1320px, calc(100% - 40px))", margin: "0 auto", padding: "32px 0 80px" }}>
        <nav aria-label="Breadcrumb" style={{ fontSize: 14, color: muted }}><Link href="/labs" style={{ color: "inherit", textDecoration: "none" }}>Labs</Link> / Lab groups</nav>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 20, flexWrap: "wrap", margin: "10px 0 28px" }}>
          <div style={{ display: "grid", gap: 8 }}>
            <h1 style={{ margin: 0, font: "600 clamp(30px, 4vw, 44px)/1.1 var(--font-sans)", letterSpacing: "-.03em" }}>Kubernetes &amp; AWS for DevOps</h1>
            <span style={{ fontSize: 15, color: muted }}>{MODS.length} modules · {totalLabs} labs · {done} completed</span>
          </div>
          <div style={{ width: 260, display: "grid", gap: 6 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: muted }}><span>Group progress</span><span>{Math.round((done / MODS.length) * 100)}%</span></div>
            <div style={{ height: 5, borderRadius: 3, background: "var(--dashboard-hover)" }}><div style={{ width: `${(done / MODS.length) * 100}%`, height: "100%", borderRadius: 3, background: "var(--dashboard-success)" }} /></div>
          </div>
        </div>

        <div className="pd-labgroup" style={{ display: "grid", gridTemplateColumns: "360px minmax(0, 1fr)", gap: 32, alignItems: "start" }}>
          {/* Sidebar */}
          <aside aria-label="Modules" style={{ position: "sticky", top: 84, height: "calc(100dvh - 104px)", display: "flex", flexDirection: "column", border, borderRadius: 12, background: "var(--dashboard-panel)", overflow: "hidden" }}>
            <div style={{ padding: 14, display: "grid", gap: 10, borderBottom: border }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, height: 38, padding: "0 10px", border, borderRadius: 8, color: muted }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden><path d="M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.3-4.3" /></svg>
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${MODS.length} modules and ${totalLabs} labs`} aria-label="Search modules and labs" style={{ flex: 1, border: 0, outline: 0, background: "transparent", color: "var(--dashboard-text)", fontSize: 14 }} />
              </label>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <button type="button" aria-expanded={filtersOpen} onClick={() => setFiltersOpen(!filtersOpen)} style={{ border: 0, background: "transparent", color: "var(--dashboard-text)", fontWeight: 600, fontSize: 14, cursor: "pointer", padding: 0 }}>Filters{active ? ` · ${active}` : ""} <span aria-hidden style={{ display: "inline-block", transform: filtersOpen ? "rotate(180deg)" : "none", transition: "transform .2s" }}>▾</span></button>
                {active > 0 && <button type="button" onClick={clear} style={{ border: 0, background: "transparent", color: "var(--dashboard-text)", textDecoration: "underline", fontSize: 13, cursor: "pointer" }}>Clear all</button>}
              </div>
            </div>

            <div style={{ flex: 1, overflowY: "auto", overscrollBehavior: "contain" }} data-lenis-prevent>
              {filtersOpen && (
                <div style={{ padding: "4px 14px 12px", display: "grid", gap: 4, borderBottom: border }}>
                  <span style={{ ...eyebrow, padding: "10px 0 2px" }}>Status</span>
                  {STATUS.map(([k, l]) => <Check key={k} label={l} on={sts.includes(k)} n={MODS.filter((m) => m.st === k && match(m, "st")).length} toggle={() => tog(sts, setSts, k)} />)}
                  <span style={{ ...eyebrow, padding: "10px 0 2px" }}>Level</span>
                  {LEVELS.map((l) => <Check key={l} label={l} on={lvls.includes(l)} n={MODS.filter((m) => m.level === l && match(m, "lv")).length} toggle={() => tog(lvls, setLvls, l)} />)}
                  <span style={{ ...eyebrow, padding: "10px 0 2px" }}>Length</span>
                  {LENGTHS.map(([l, f]) => <Check key={l} label={l} on={lens.includes(l)} n={MODS.filter((m) => f(m) && match(m, "len")).length} toggle={() => tog(lens, setLens, l)} />)}
                  <span style={{ ...eyebrow, padding: "10px 0 2px" }}>Topic</span>
                  {TOPICS.map(([t]) => <Check key={t} label={t} on={tops.includes(t)} n={MODS.filter((m) => m.topic === t && match(m, "top")).length} toggle={() => tog(tops, setTops, t)} />)}
                </div>
              )}
              <div style={{ padding: "10px 8px 14px", display: "grid", gap: 2 }}>
                <span role="status" style={{ ...eyebrow, padding: "4px 6px 8px" }}>{list.length} of {MODS.length} modules</span>
                {list.length === 0 && <div className="pd-hatch" style={{ margin: 6, padding: 20, borderRadius: 8, border, textAlign: "center", color: muted, fontSize: 13 }}>No modules match. <button type="button" onClick={clear} style={{ border: 0, background: "transparent", color: "var(--dashboard-text)", textDecoration: "underline", cursor: "pointer" }}>Clear filters</button></div>}
                {list.map((m) => {
                  const on = m.n === cur.n, passed = m.labs.filter((l) => l.st === "passed").length;
                  return (
                    <button key={m.n} type="button" onClick={() => setSel(m.n)} aria-current={on ? "true" : undefined}
                      style={{ display: "grid", gridTemplateColumns: "32px 1fr", gap: 12, alignItems: "center", padding: "10px", borderRadius: 8, border: on ? "1px solid var(--dashboard-text)" : "1px solid transparent", background: on ? "var(--dashboard-hover)" : "transparent", color: "var(--dashboard-text)", textAlign: "left", cursor: "pointer" }}>
                      <span style={{ width: 32, height: 32, borderRadius: 8, display: "grid", placeItems: "center", fontSize: 12, fontWeight: 600, background: m.st === "done" ? "color-mix(in oklab, var(--dashboard-success) 18%, transparent)" : m.st === "progress" ? "var(--dashboard-accent)" : "var(--dashboard-hover)", color: m.st === "done" ? "var(--dashboard-success)" : m.st === "progress" ? "var(--dashboard-accent-ink)" : "var(--dashboard-text)" }}>{m.st === "done" ? "✓" : m.n}</span>
                      <span style={{ display: "grid", gap: 3, minWidth: 0 }}>
                        <span style={{ fontSize: 14, fontWeight: on ? 600 : 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.title}</span>
                        {m.st === "progress"
                          ? <span style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ flex: 1, height: 4, borderRadius: 2, background: "var(--dashboard-border)" }}><span style={{ display: "block", width: `${(passed / m.labs.length) * 100}%`, height: "100%", borderRadius: 2, background: "var(--dashboard-text)" }} /></span><span style={{ fontSize: 12, color: muted }}>{passed} / {m.labs.length}</span></span>
                          : <span style={{ fontSize: 12, color: muted }}>{m.st === "done" ? `${m.labs.length} / ${m.labs.length} labs` : `${m.labs.length} labs · ~${hours(m)} h`} · {m.level}</span>}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Selected module */}
          <section aria-label={cur.title} style={{ display: "grid", gap: 16 }}>
            <div style={{ padding: 24, borderRadius: 12, border, background: "var(--dashboard-panel)", display: "grid", gap: 10 }}>
              <span style={{ fontSize: 13, color: muted }}>Module {cur.n} · {cur.topic} · {cur.level} · {cur.labs.length} labs · ~{hours(cur)} h</span>
              <h2 style={{ margin: 0, fontSize: 26, letterSpacing: "-.02em" }}>{cur.title}</h2>
              <span style={{ fontSize: 14, color: muted }}>{cur.labs.filter((l) => l.st === "passed").length} of {cur.labs.length} done</span>
            </div>
            {cur.labs.map((l, i) => (
              <article key={i} style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", borderRadius: 12, border: l.st === "current" ? "1px solid var(--dashboard-text)" : border, background: "var(--dashboard-panel)" }}>
                <span style={{ width: 36, height: 36, borderRadius: 8, display: "grid", placeItems: "center", background: "var(--dashboard-hover)", fontFamily: "var(--font-mono)", fontSize: 13 }}>{i + 1}</span>
                <span style={{ flex: 1, display: "grid", gap: 3, minWidth: 0 }}>
                  <b style={{ fontSize: 15 }}>{l.title}</b>
                  <span style={{ fontSize: 13, color: muted }}>Lab {i + 1} · {l.min} min · {l.checks} checks</span>
                </span>
                {l.st === "passed" && <span style={{ fontSize: 13, color: "var(--dashboard-success)", fontWeight: 600 }}>✓ Passed</span>}
                {l.st === "current"
                  ? <Link href="/app/lab/launch" className="puku-btn puku-btn-default pd-glow-btn" style={{ height: 38, display: "inline-flex", alignItems: "center", padding: "0 16px", borderRadius: 8, background: "var(--dashboard-accent)", color: "var(--dashboard-accent-ink)", fontWeight: 600, fontSize: 14, textDecoration: "none" }}>Continue</Link>
                  : <Link href="/labs/guide/expose-docker-lb" style={{ height: 38, display: "inline-flex", alignItems: "center", padding: "0 14px", borderRadius: 8, border, color: "var(--dashboard-text)", fontSize: 14, textDecoration: "none", whiteSpace: "nowrap" }}>{l.st === "passed" ? "Review" : "Read guide →"}</Link>}
              </article>
            ))}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
