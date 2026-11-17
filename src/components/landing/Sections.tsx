"use client";
import { useState } from "react";
import Link from "next/link";
import { Arrow, Badge, Button, Card, Check, Icon, Reveal, S, SectionHead, WIDTH, eyebrow, mono } from "./ui";
import RankBadge from "./RankBadge";

/** Sections carried over from the previous landing, rebuilt with Puku primitives. */
const section = (top = 28): React.CSSProperties => ({ width: WIDTH, margin: `${S(top)}px auto 0` });

export function Stats() {
  const items = [["700+", "hands-on labs"], ["12", "career tracks"], ["~30s", "from click to a running VM"], ["2018", "training engineers since"], ["৳0", "to read every track and lab guide"]];
  return (
    <Reveal style={{ width: WIDTH, margin: `${S(10)}px auto 0` }}>
      <div className="pd-l-stats" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", border: "1px solid var(--dashboard-border)", borderRadius: "var(--puku-radius-panel)", background: "var(--dashboard-panel)", overflow: "hidden" }}>
        {items.map(([v, d], i) => (
          <div key={d} style={{ padding: `${S(5)}px ${S(6)}px`, borderLeft: i ? "1px solid var(--dashboard-border)" : 0 }}>
            <div style={{ ...mono, fontSize: 32, lineHeight: 1.1, letterSpacing: "-.02em" }}>{v}</div>
            <div style={{ marginTop: S(2), fontSize: 14, lineHeight: 1.45, color: "var(--dashboard-muted)" }}>{d}</div>
          </div>
        ))}
      </div>
    </Reveal>
  );
}

const TRACKS = [
  { t: "DevOps & Cloud Engineer", meta: "Linux → Kubernetes → GitOps · 73 modules", href: "/courses/devops", current: true, i: "M6 6m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0M18 18m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0M8 6h6a3 3 0 0 1 0 6h-4a3 3 0 0 0 0 6h6" },
  { t: "Backend & System Design", meta: "Python & Go · system design on AWS", href: "/courses", i: "M8 8l-4 4 4 4M16 8l4 4-4 4M14 5l-4 14" },
  { t: "AI & MLOps Engineer", meta: "LLMs, MLOps & agentic systems", href: "/courses", i: "M7 7h10v10H7zM10 3v4M14 3v4M10 17v4M14 17v4M3 10h4M3 14h4M17 10h4M17 14h4" },
  { t: "Forward Deployed Engineer", meta: "Ship AI with customers · Claude Code", href: "/courses", i: "M3 4h18v16H3zM7 10l3 2.5L7 15M12.5 15H17" },
];
export function Tracks() {
  return (
    <section style={section()}>
      <SectionHead k="Career tracks" title="Pick the engineer you want to become." action={<Button href="/courses" variant="outline">Explore all tracks <Arrow /></Button>} />
      <div className="pd-l-4" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: S(4), marginTop: S(10) }}>
        {TRACKS.map((t, i) => (
          <Reveal key={t.t} delay={i * 0.04}>
            <Card style={{ height: "100%", display: "flex", flexDirection: "column", gap: S(4) }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ width: 40, height: 40, borderRadius: "var(--puku-radius)", display: "grid", placeItems: "center", background: "var(--dashboard-hover)" }}><Icon d={t.i} /></span>
                {t.current ? <Badge tone="accent">Most started</Badge> : <Badge>Career track</Badge>}
              </div>
              <div style={{ display: "grid", gap: S(2), flex: 1 }}>
                <h3 style={{ margin: 0, font: "500 20px/1.25 var(--font-sans)", letterSpacing: "-.01em" }}>{t.t}</h3>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: "var(--dashboard-muted)" }}>{t.meta}</p>
              </div>
              <div style={{ display: "flex", gap: S(2) }}>
                <Button href={t.href} variant="secondary" size="sm">Learn more</Button>
                <Button href="/app/roadmap" variant="ghost" size="sm">Roadmap <Arrow /></Button>
              </div>
            </Card>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function TimeBank() {
  const rows: [string, string][] = [["Pro plan, every month", "+40 h"], ["Pass a milestone exam", "+3 h"], ["Redeem 1,000 coins", "+2 h"], ["Reading, classes, quizzes", "free"]];
  return (
    <section style={section()}>
      <div className="pd-l-split" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: S(10), alignItems: "center" }}>
        <SectionHead k="Time bank" title="Your progress pays for your practice." body="Lab minutes are the only thing that costs anything on Poridhi. Finishing milestones earns coins you can turn into more lab time." />
        <Reveal delay={0.08}>
          <Card pad={0} style={{ overflow: "hidden" }}>
            <div style={{ padding: S(6), display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--dashboard-border)" }}>
              <div><div style={eyebrow}>Bank</div><div style={{ ...mono, fontSize: 36, lineHeight: 1.1, marginTop: S(2) }}>2h 40m</div></div>
              <Button href="/app/me/time-bank" variant="outline" size="sm">Open time bank</Button>
            </div>
            {rows.map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: `${S(4)}px ${S(6)}px`, borderBottom: "1px solid var(--dashboard-border)", fontSize: 15 }}>
                <span>{k}</span><span style={{ ...mono, color: v === "free" ? "var(--dashboard-muted)" : "var(--dashboard-success)" }}>{v}</span>
              </div>
            ))}
            <div style={{ padding: S(6), display: "flex", gap: S(3), alignItems: "center", background: "var(--dashboard-hover)" }}>
              <Icon d="M7 3h10M7 21h10M8 3v3.5a4 4 0 0 0 1.6 3.2L12 12l2.4-2.3A4 4 0 0 0 16 6.5V3M8 21v-3.5a4 4 0 0 1 1.6-3.2L12 12l2.4 2.3a4 4 0 0 1 1.6 3.2V21" />
              <span style={{ fontSize: 14 }}>This lab uses about <b>40 minutes</b>. Time only counts while the VM runs.</span>
            </div>
          </Card>
        </Reveal>
      </div>
    </section>
  );
}

export function Interview() {
  const stages = ["Requirements", "High-level design", "Deep dive", "Trade-offs", "Wrap-up"];
  return (
    <section style={section()}>
      <div className="pd-l-split" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: S(10), alignItems: "center" }}>
        <Reveal delay={0.06}>
          <Card pad={0} style={{ overflow: "hidden" }}>
            <div style={{ display: "flex", gap: S(1), padding: S(3), borderBottom: "1px solid var(--dashboard-border)", overflowX: "auto" }}>
              {stages.map((s, i) => <span key={s} style={{ whiteSpace: "nowrap", height: 32, display: "inline-flex", alignItems: "center", padding: `0 ${S(3)}px`, borderRadius: "var(--puku-radius)", fontSize: 13, background: i === 1 ? "var(--dashboard-accent)" : "transparent", color: i === 1 ? "var(--dashboard-accent-ink)" : "var(--dashboard-muted)" }}>{i + 1}. {s}</span>)}
            </div>
            <div style={{ padding: S(6), display: "grid", gap: S(4) }}>
              <span style={eyebrow}>Interviewer · 14:20</span>
              <p style={{ margin: 0, font: "500 20px/1.35 var(--font-sans)" }}>How will users be redirected from a short URL to the original long URL?</p>
              <div style={{ display: "flex", alignItems: "center", gap: S(3), padding: S(4), borderRadius: "var(--puku-radius)", background: "var(--dashboard-hover)" }}>
                <span aria-hidden style={{ display: "flex", gap: 3, alignItems: "center", height: 24 }}>{Array.from({ length: 18 }, (_, i) => <span key={i} className="pd-eq" style={{ width: 3, height: 6 + ((i * 7) % 18), borderRadius: 2, background: "var(--dashboard-text)", animationDelay: `${(i % 6) * 0.1}s` }} />)}</span>
                <span style={{ fontSize: 14, color: "var(--dashboard-muted)" }}>Listening…</span>
              </div>
              <div style={{ display: "flex", gap: S(2), flexWrap: "wrap" }}><Badge tone="success">Clear trade-offs</Badge><Badge>Add a cache layer</Badge><Badge>Lean hire</Badge></div>
            </div>
          </Card>
        </Reveal>
        <SectionHead k="AI interview" title="Rehearse the interview before the real one." body="Speak your answer, draw the architecture, run the commands. The AI scores each stage and tells you exactly what to fix." action={<Button href="/app/interview" variant="outline">Try a mock interview <Arrow /></Button>} />
      </div>
    </section>
  );
}

export function Ranks() {
  const ranks = [["Intern", "0"], ["Junior", "1,000"], ["Engineer", "3,000"], ["Senior", "7,500"], ["Staff", "15,000"], ["Principal", "30,000"]];
  const current = 2;
  return (
    <section style={section()}>
      <SectionHead k="Ranks" title="From Intern to Principal, earned one lab at a time." body="Every passed check earns XP. Levels can't be bought, only earned, and each one shows on your public portfolio." />
      <Reveal delay={0.08}>
        <ol className="pd-l-ranks" style={{ listStyle: "none", margin: `${S(10)}px 0 0`, padding: 0, display: "grid", gridTemplateColumns: "repeat(6, 1fr)", border: "1px solid var(--dashboard-border)", borderRadius: "var(--puku-radius-panel)", overflow: "hidden" }}>
          {ranks.map(([r, xp], i) => (
            <li key={r} style={{ padding: S(5), borderLeft: i ? "1px solid var(--dashboard-border)" : 0, background: i === current ? "var(--dashboard-hover)" : "var(--dashboard-panel)", display: "grid", gap: S(2) }}>
              <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ ...mono, fontSize: 12, color: i <= current ? "var(--dashboard-text)" : "var(--dashboard-muted)" }}>L{i + 1}{i === current ? " · you" : ""}</span>
                <RankBadge rank={r} size={40} locked={i > current} />
              </span>
              <span style={{ font: "500 17px/1.25 var(--font-sans)", color: i <= current ? "var(--dashboard-text)" : "var(--dashboard-muted)" }}>{r}</span>
              <span style={{ ...mono, fontSize: 12, color: "var(--dashboard-muted)" }}>{xp} XP</span>
              <span aria-hidden style={{ height: 4, borderRadius: 999, background: i < current ? "var(--dashboard-text)" : i === current ? "linear-gradient(90deg, var(--dashboard-text) 40%, var(--dashboard-border) 40%)" : "var(--dashboard-border)" }} />
            </li>
          ))}
        </ol>
      </Reveal>
    </section>
  );
}

export function Pricing() {
  const plans = [
    { n: "Free", p: "৳0", d: "Learn everything, forever.", f: ["Every track, class and lab guide", "30 lab minutes on sign-up", "Quick checks and notes", "Public portfolio"], cta: "Start free", href: "/signin", v: "outline" as const },
    { n: "Pro", p: "৳1,500", d: "Machines and AI, every month.", f: ["40 hours of lab time a month", "AI interviews and AI exams", "Verified certificates", "Live classes and TA sessions"], cta: "Start 7-day trial", href: "/signin?plan=pro", v: "default" as const, tag: "Most learners" },
  ];
  return (
    <section style={section()}>
      <SectionHead k="Pricing" title="One subscription. Every track included." body="No more buying courses one by one. Learn everything for free; subscribe when you want the machines and the AI." align="center" />
      <div className="pd-l-2" style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 420px))", justifyContent: "center", gap: S(4), marginTop: S(10) }}>
        {plans.map((p, i) => (
          <Reveal key={p.n} delay={i * 0.05}>
            <Card style={{ height: "100%", display: "flex", flexDirection: "column", gap: S(5), borderColor: p.tag ? "var(--dashboard-text)" : "var(--dashboard-border)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ font: "500 18px/1 var(--font-sans)" }}>{p.n}</span>{p.tag && <Badge tone="accent">{p.tag}</Badge>}</div>
              <div><span style={{ ...mono, fontSize: 44, letterSpacing: "-.03em" }}>{p.p}</span><span style={{ color: "var(--dashboard-muted)" }}> / month</span><p style={{ margin: `${S(2)}px 0 0`, color: "var(--dashboard-muted)", fontSize: 15 }}>{p.d}</p></div>
              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: S(3), flex: 1 }}>{p.f.map((x) => <li key={x} style={{ display: "flex", gap: S(3), fontSize: 15 }}><Check color="var(--dashboard-text)" />{x}</li>)}</ul>
              <Button href={p.href} variant={p.v}>{p.cta}</Button>
            </Card>
          </Reveal>
        ))}
      </div>
      <p style={{ textAlign: "center", marginTop: S(5), fontSize: 14, color: "var(--dashboard-muted)" }}><Link href="/pricing" style={{ color: "inherit" }}>Compare plans in detail →</Link></p>
    </section>
  );
}

const FAQS: [string, string][] = [
  ["Is Poridhi really free to learn?", "Yes. Every track, class recording, note and lab guide is free to read, without an account. You only pay for VM time when you want to practise on real machines."],
  ["What is the Time Bank and how do I earn lab minutes?", "It holds your lab minutes. Time counts down only while a VM is running. Pro adds 40 hours a month, passing a milestone exam adds 3 hours, and 1,000 coins redeem for 2 hours."],
  ["Do I need a powerful computer for the labs?", "No. Labs run on our machines and open in your browser with VS Code, terminals and a load balancer. Any recent laptop with a stable connection works."],
  ["Do I need a credit card to start?", "No. Sign up and get 30 free lab minutes. Add a card only if you choose Pro."],
  ["How do verified certificates work?", "Each milestone ends with an AI-graded hands-on exam. Pass it and you get a certificate anyone can verify from your public profile."],
];
export function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section style={section()}>
      <div className="pd-l-split" style={{ display: "grid", gridTemplateColumns: "minmax(0, .8fr) minmax(0, 1.2fr)", gap: S(10), alignItems: "start" }}>
        <SectionHead k="FAQ" title="What learners ask before starting." action={<Button href="/app/me/support" variant="ghost">Ask us anything <Arrow /></Button>} />
        <div style={{ borderTop: "1px solid var(--dashboard-border)" }}>
          {FAQS.map(([q, a], i) => {
            const on = open === i;
            return (
              <div key={q} style={{ borderBottom: "1px solid var(--dashboard-border)" }}>
                <button type="button" onClick={() => setOpen(on ? -1 : i)} aria-expanded={on} aria-controls={`faq-${i}`} style={{ width: "100%", minHeight: 64, display: "flex", alignItems: "center", justifyContent: "space-between", gap: S(4), padding: `${S(4)}px 0`, border: 0, background: "transparent", color: "var(--dashboard-text)", textAlign: "left", font: "500 17px/1.35 var(--font-sans)", cursor: "pointer" }}>
                  {q}<span aria-hidden style={{ ...mono, fontSize: 18, color: "var(--dashboard-muted)", transform: on ? "rotate(45deg)" : "none", transition: "transform .16s" }}>+</span>
                </button>
                <div id={`faq-${i}`} hidden={!on} style={{ paddingBottom: S(5), fontSize: 15, lineHeight: 1.6, color: "var(--dashboard-muted)", maxWidth: 640 }}>{a}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
