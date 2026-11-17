"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import SiteHeader from "@/components/layout/SiteHeader";
import MobileChrome from "@/components/layout/MobileChrome";
import Footer from "@/components/landing/Footer";
import { stackLogos } from "@/data/stackLogos";

const LOGO: Record<string, string> = { linux: "Linux", aws: "AWS", go: "Go", python: "Python", kubernetes: "Kubernetes", terraform: "Terraform", prometheus: "Prometheus", github: "GitHub Actions" };
function Mark({ k }: { k: string }) {
  const p = stackLogos.find((l) => l.name === LOGO[k])?.path;
  return <svg viewBox="0 0 24 24" width="64" height="64" aria-hidden style={{ position: "absolute", right: 22, top: "50%", transform: "translateY(-50%)", opacity: 0.92 }}>{p ? <path d={p} fill="#fff" /> : <path d="M12 2l2.4 6.9L21 12l-6.6 3.1L12 22l-2.4-6.9L3 12l6.6-3.1z" fill="#fff" />}</svg>;
}

/**
 * Career tracks, laid out like the lab library: sticky filter sidebar (real checkboxes with counts),
 * search and sort above a card grid. Filters combine (AND across groups, OR within a group).
 */
type Track = { slug: string; title: string; cat: "DevOps & Cloud" | "Backend" | "AI & MLOps" | "Agentic"; level: "Beginner" | "Intermediate" | "Advanced"; months: number; modules: number; labs: number; learners: number; thumb: string; hue: [string, string]; tag?: string; isNew?: boolean };
const TRACKS: Track[] = [
  { slug: "devops-cloud", title: "DevOps & Cloud Engineer", cat: "DevOps & Cloud", level: "Beginner", months: 9, modules: 82, labs: 118, learners: 14200, thumb: "linux", hue: ["#6D28D9", "#2563EB"], tag: "Most started · Season 4" },
  { slug: "backend-aws", title: "Backend & System Design with AWS", cat: "Backend", level: "Intermediate", months: 7, modules: 64, labs: 72, learners: 8900, thumb: "aws", hue: ["#EA580C", "#B45309"] },
  { slug: "ai-engineering", title: "AI Engineering Career Track", cat: "AI & MLOps", level: "Intermediate", months: 8, modules: 70, labs: 64, learners: 7600, thumb: "ai", hue: ["#DB2777", "#7C3AED"], isNew: true },
  { slug: "forward-deployed", title: "Forward Deployed Engineer", cat: "Agentic", level: "Advanced", months: 6, modules: 48, labs: 40, learners: 2100, thumb: "ai", hue: ["#0EA5E9", "#6366F1"], isNew: true },
  { slug: "go-aws", title: "Building Systems with Go & AWS", cat: "Backend", level: "Intermediate", months: 6, modules: 52, labs: 58, learners: 4300, thumb: "go", hue: ["#0891B2", "#0E7490"] },
  { slug: "mlops", title: "MLOps with Cloud", cat: "AI & MLOps", level: "Intermediate", months: 6, modules: 46, labs: 50, learners: 3800, thumb: "python", hue: ["#16A34A", "#0D9488"] },
  { slug: "python-aws", title: "Backend Engineering with Python & AWS", cat: "Backend", level: "Beginner", months: 6, modules: 58, labs: 61, learners: 6100, thumb: "python", hue: ["#2563EB", "#CA8A04"] },
  { slug: "kubernetes", title: "Kubernetes & Platform Engineering", cat: "DevOps & Cloud", level: "Advanced", months: 5, modules: 44, labs: 66, learners: 5200, thumb: "kubernetes", hue: ["#2563EB", "#1D4ED8"] },
  { slug: "terraform", title: "Infrastructure as Code with Terraform", cat: "DevOps & Cloud", level: "Intermediate", months: 3, modules: 26, labs: 34, learners: 4700, thumb: "terraform", hue: ["#7C3AED", "#5B21B6"] },
  { slug: "sre", title: "SRE & Observability", cat: "DevOps & Cloud", level: "Advanced", months: 4, modules: 32, labs: 38, learners: 2900, thumb: "prometheus", hue: ["#EA580C", "#DC2626"] },
  { slug: "agents", title: "Building AI Agents in Production", cat: "Agentic", level: "Intermediate", months: 4, modules: 30, labs: 28, learners: 3300, thumb: "ai", hue: ["#9333EA", "#EC4899"], isNew: true },
  { slug: "cicd", title: "CI/CD & GitOps", cat: "DevOps & Cloud", level: "Beginner", months: 2, modules: 18, labs: 24, learners: 3900, thumb: "github", hue: ["#334155", "#0F172A"] },
];
const CATS = ["DevOps & Cloud", "Backend", "AI & MLOps", "Agentic"] as const;
const LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;
const LENGTHS: [string, (t: Track) => boolean][] = [["Under 4 months", (t) => t.months < 4], ["4–6 months", (t) => t.months >= 4 && t.months <= 6], ["Over 6 months", (t) => t.months > 6]];
const SORTS: [string, (a: Track, b: Track) => number][] = [["Most started", (a, b) => b.learners - a.learners], ["Newest", (a, b) => Number(!!b.isNew) - Number(!!a.isNew)], ["Shortest", (a, b) => a.months - b.months], ["Most labs", (a, b) => b.labs - a.labs]];
const muted = "var(--dashboard-muted)", border = "1px solid var(--dashboard-border)";

function Check({ on, label, n, toggle }: { on: boolean; label: string; n: number; toggle: () => void }) {
  return (
    <button type="button" role="checkbox" aria-checked={on} onClick={toggle} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "7px 2px", border: 0, background: "transparent", color: "var(--dashboard-text)", font: "14px/1.3 var(--font-sans)", cursor: "pointer", textAlign: "left" }}>
      <span className="pd-check" aria-hidden><svg viewBox="0 0 16 16" width="12" height="12"><path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
      <span style={{ flex: 1 }}>{label}</span><span style={{ color: muted, fontSize: 13 }}>{n}</span>
    </button>
  );
}

export default function CoursesView() {
  const [q, setQ] = useState("");
  const [cats, setCats] = useState<string[]>([]);
  const [levels, setLevels] = useState<string[]>([]);
  const [lens, setLens] = useState<string[]>([]);
  const [sort, setSort] = useState(0);
  const tog = (arr: string[], set: (v: string[]) => void, v: string) => set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const match = (t: Track, skip?: string) =>
    (skip === "cat" || !cats.length || cats.includes(t.cat)) &&
    (skip === "lvl" || !levels.length || levels.includes(t.level)) &&
    (skip === "len" || !lens.length || LENGTHS.some(([l, f]) => lens.includes(l) && f(t))) &&
    (!q.trim() || `${t.title} ${t.cat}`.toLowerCase().includes(q.trim().toLowerCase()));
  const list = useMemo(() => TRACKS.filter((t) => match(t)).sort(SORTS[sort][1]), [q, cats, levels, lens, sort]); // eslint-disable-line react-hooks/exhaustive-deps
  const active = cats.length + levels.length + lens.length;
  const clear = () => { setCats([]); setLevels([]); setLens([]); setQ(""); };
  const group: React.CSSProperties = { display: "grid", gap: 2, paddingBottom: 16, borderBottom: border };
  const eyebrow: React.CSSProperties = { fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: muted, padding: "12px 0 6px" };

  return (
    <div style={{ minHeight: "100dvh", background: "var(--dashboard-main)", color: "var(--dashboard-text)", fontFamily: "var(--font-sans)" }}>
      <MobileChrome variant="site" onSearch={() => window.dispatchEvent(new Event("pd-open-search"))} />
      <SiteHeader />
      <main style={{ width: "min(1280px, calc(100% - 40px))", margin: "0 auto", padding: "40px 0 96px" }}>
        <nav aria-label="Breadcrumb" style={{ fontSize: 14, color: muted }}><Link href="/" style={{ color: "inherit", textDecoration: "none" }}>Home</Link> / Career tracks</nav>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24, flexWrap: "wrap", margin: "12px 0 32px" }}>
          <div style={{ display: "grid", gap: 10, maxWidth: 640 }}>
            <h1 style={{ margin: 0, font: "600 clamp(36px, 5vw, 56px)/1.05 var(--font-sans)", letterSpacing: "-.035em" }}>Career tracks</h1>
            <p style={{ margin: 0, fontSize: 17, lineHeight: 1.55, color: muted }}>{TRACKS.length} structured paths from first command to job-ready engineer. Every track is free to read; labs, exams and AI interviews need Pro.</p>
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: 8, width: "min(360px, 100%)", height: 44, padding: "0 12px", border, borderRadius: "var(--puku-radius)", color: muted }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden><path d="M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.3-4.3" /></svg>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${TRACKS.length} tracks`} aria-label="Search tracks" style={{ flex: 1, border: 0, outline: 0, background: "transparent", color: "var(--dashboard-text)", fontSize: 15 }} />
          </label>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "minmax(200px, 240px) minmax(0, 1fr)", gap: 40, alignItems: "start" }} className="pd-courses">
          {/* Filters */}
          <aside aria-label="Filters" style={{ position: "sticky", top: 88, display: "grid" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <b style={{ fontSize: 15 }}>Filters{active ? ` · ${active}` : ""}</b>
              {active > 0 && <button type="button" onClick={clear} style={{ border: 0, background: "transparent", color: "var(--dashboard-text)", textDecoration: "underline", fontSize: 13, cursor: "pointer" }}>Clear all</button>}
            </div>
            <div style={group}><span style={eyebrow}>Category</span>{CATS.map((c) => <Check key={c} label={c} on={cats.includes(c)} n={TRACKS.filter((t) => t.cat === c && match(t, "cat")).length} toggle={() => tog(cats, setCats, c)} />)}</div>
            <div style={group}><span style={eyebrow}>Level</span>{LEVELS.map((c) => <Check key={c} label={c} on={levels.includes(c)} n={TRACKS.filter((t) => t.level === c && match(t, "lvl")).length} toggle={() => tog(levels, setLevels, c)} />)}</div>
            <div style={group}><span style={eyebrow}>Length</span>{LENGTHS.map(([c, f]) => <Check key={c} label={c} on={lens.includes(c)} n={TRACKS.filter((t) => f(t) && match(t, "len")).length} toggle={() => tog(lens, setLens, c)} />)}</div>
            <Link href="/labs" className="pd-hatch" style={{ marginTop: 16, padding: 14, borderRadius: "var(--puku-radius)", border, display: "grid", gap: 4, textDecoration: "none", color: "inherit" }}>
              <b style={{ fontSize: 14 }}>Just want hands-on?</b><span style={{ fontSize: 13, color: muted }}>Browse 712 standalone labs →</span>
            </Link>
          </aside>

          {/* Results */}
          <section aria-label="Tracks" style={{ display: "grid", gap: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <span role="status" style={{ fontSize: 14, color: muted }}><b style={{ color: "var(--dashboard-text)" }}>{list.length}</b> {list.length === 1 ? "track" : "tracks"}</span>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: muted }}>Sort
                <select value={sort} onChange={(e) => setSort(Number(e.target.value))} style={{ height: 36, padding: "0 10px", borderRadius: "var(--puku-radius)", border, background: "var(--dashboard-panel)", color: "var(--dashboard-text)", fontSize: 14 }}>
                  {SORTS.map(([l], i) => <option key={l} value={i}>{l}</option>)}
                </select>
              </label>
            </div>
            {list.length === 0 && <div className="pd-hatch" style={{ padding: 48, borderRadius: "var(--puku-radius)", border, textAlign: "center", color: muted }}>No tracks match. <button type="button" onClick={clear} style={{ border: 0, background: "transparent", color: "var(--dashboard-text)", textDecoration: "underline", cursor: "pointer", fontSize: 15 }}>Clear filters</button></div>}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
              {list.map((t) => (
                <article key={t.slug} className="pd-course-card" style={{ display: "grid", gridTemplateRows: "140px 1fr", borderRadius: 12, border, overflow: "hidden", background: "var(--dashboard-panel)" }}>
                  <div style={{ position: "relative", background: `radial-gradient(90% 120% at 100% 0%, ${t.hue[0]}, transparent 70%), radial-gradient(80% 120% at 0% 100%, ${t.hue[1]}, transparent 70%), #0B0B12`, overflow: "hidden" }}>
                    <span aria-hidden style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,.18) 1px, transparent 1.2px)", backgroundSize: "8px 8px", maskImage: "linear-gradient(90deg, transparent, #000 60%)", WebkitMaskImage: "linear-gradient(90deg, transparent, #000 60%)" }} />
                    <Mark k={t.thumb} />
                    <span style={{ position: "absolute", left: 14, top: 14, display: "flex", gap: 6 }}>
                      <span style={{ padding: "3px 8px", borderRadius: 999, background: "rgba(0,0,0,.45)", color: "#fff", fontSize: 12 }}>{t.cat}</span>
                      {t.isNew && <span style={{ padding: "3px 8px", borderRadius: 999, background: "#fff", color: "#000", fontSize: 12, fontWeight: 600 }}>New</span>}
                    </span>
                  </div>
                  <div style={{ padding: 16, display: "grid", gap: 10, alignContent: "start" }}>
                    {t.tag && <span style={{ fontSize: 12, color: muted }}>{t.tag}</span>}
                    <b style={{ fontSize: 17, lineHeight: 1.3, letterSpacing: "-.01em" }}>{t.title}</b>
                    <span style={{ display: "flex", flexWrap: "wrap", gap: 6, fontSize: 12 }}>
                      {[t.level, `${t.months} months`, `${t.modules} modules`, `${t.labs} labs`].map((x) => <span key={x} style={{ padding: "3px 8px", borderRadius: 6, background: "var(--dashboard-hover)" }}>{x}</span>)}
                    </span>
                    <span style={{ fontSize: 13, color: muted }}>{t.learners.toLocaleString()} learners</span>
                    <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                      <Link href="/app/course" className="puku-btn puku-btn-default" style={{ flex: 1, height: 38, display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: "var(--puku-radius)", background: "var(--dashboard-accent)", color: "var(--dashboard-accent-ink)", fontWeight: 600, fontSize: 14, textDecoration: "none" }}>Learn more</Link>
                      <Link href="/app/roadmap" style={{ height: 38, display: "inline-flex", alignItems: "center", padding: "0 14px", borderRadius: "var(--puku-radius)", border, color: "var(--dashboard-text)", fontSize: 14, textDecoration: "none" }}>Roadmap</Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
