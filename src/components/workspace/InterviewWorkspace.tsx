"use client";
import { useEffect, useState } from "react";
import Workspace, { type RailItem } from "./Workspace";
import { usePlan } from "@/data/plan";
import { ProWall } from "./ProGate";
import { Composer, Terminal, Thread, Whiteboard, type Box, type Msg, type TermLine } from "./parts";

/**
 * AI interview workspace (Claude / Codex layout): the interviewer asks one question per stage in
 * the thread; you answer by typing or with the mic. Each answer gets scored feedback, then the next
 * stage. Whiteboard (drag boxes) and Terminal live in the working pane; a report closes the round.
 */
type NoId<T> = T extends unknown ? Omit<T, "id"> : never;
let seq = 0;
const m = (x: NoId<Msg>): Msg => ({ ...x, id: ++seq } as Msg);

const STAGES = [
  { name: "Requirements", q: "Let's design a URL shortener. What are the functional and non-functional requirements?", keys: ["redirect", "custom", "expir", "latency", "availab", "scale"], tip: "Name read/write ratio and latency targets, not just features." },
  { name: "High-level design", q: "Sketch the high-level design. How does a request get from a short URL to the original long URL?", keys: ["cache", "database", "load balancer", "lb", "redirect", "301", "302"], tip: "Put a cache in front of the database for hot keys." },
  { name: "Deep dive", q: "How do you generate short codes so they never collide, even with many writers?", keys: ["base62", "counter", "id", "hash", "collision", "snowflake"], tip: "A counter range per writer plus base62 avoids collisions without coordination." },
  { name: "Trade-offs", q: "301 or 302 for the redirect? What do you give up with each?", keys: ["301", "302", "cache", "analytics", "permanent"], tip: "301 is cacheable by browsers but hides clicks from analytics." },
  { name: "Wrap-up", q: "What would you monitor in production, and what breaks first at 100× traffic?", keys: ["latency", "error", "cache hit", "p99", "database", "hot"], tip: "Lead with p99 latency and cache hit rate." },
];

function score(answer: string, keys: string[]) {
  const a = answer.toLowerCase();
  const hit = keys.filter((k) => a.includes(k)).length;
  return Math.min(100, 45 + hit * 14 + Math.min(20, Math.floor(answer.length / 25)));
}

export default function InterviewWorkspace() {
  const { plan } = usePlan();
  if (plan !== "pro") return <ProWall back="/app/interview" crumb="AI interview · System design" title="Design a URL shortener" what="The AI interview" about="A live interviewer asks follow-ups, scores every stage and writes you a hiring-style report." />;
  return <InterviewInner />;
}

function InterviewInner() {
  const [stage, setStage] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [msgs, setMsgs] = useState<Msg[]>(() => [
    m({ from: "system", text: "AI interview · System design · Design a URL shortener · ~35 min" }),
    m({ from: "ai", text: <>Hi Rahim. We'll go through five stages. Think out loud; I score your reasoning, not just the final answer. You can use the whiteboard and the terminal on the right.</> }),
    m({ from: "ai", text: <><b>Stage 1 · {STAGES[0].name}.</b> {STAGES[0].q}</> }),
  ]);
  const [typing, setTyping] = useState(false);
  const [tab, setTab] = useState("whiteboard");
  const [mic, setMic] = useState(false);
  const [boxes, setBoxes] = useState<Box[]>([{ id: "c", x: 24, y: 40, label: "Client" }, { id: "lb", x: 190, y: 40, label: "Load balancer" }, { id: "app", x: 356, y: 40, label: "App servers" }, { id: "cache", x: 356, y: 150, label: "Redis cache" }, { id: "db", x: 190, y: 150, label: "Database" }]);
  const [term, setTerm] = useState<TermLine[]>([{ text: "staging-cluster · kubectl ready", tone: "dim" }]);
  const [secs, setSecs] = useState(14 * 60 + 20);
  useEffect(() => { const t = setInterval(() => setSecs((s) => s + 1), 1000); return () => clearInterval(t); }, []);
  const done = stage >= STAGES.length;

  const answer = (text: string) => {
    if (done) return;
    setMsgs((x) => [...x, m({ from: "you", text })]);
    setTyping(true);
    setTimeout(() => {
      const st = STAGES[stage];
      const sc = score(text, st.keys);
      setScores((s) => [...s, sc]);
      const next = stage + 1;
      setMsgs((x) => [
        ...x,
        m({ from: "check", ok: sc >= 70, text: `Stage ${stage + 1} · ${st.name}: ${sc} / 100` }),
        m({ from: "ai", tone: sc < 70 ? "hint" : undefined, text: sc >= 70 ? <>Good. {st.tip}</> : <>Partly there. {st.tip}</> }),
        ...(next < STAGES.length ? [m({ from: "ai", text: <><b>Stage {next + 1} · {STAGES[next].name}.</b> {STAGES[next].q}</> })] : [m({ from: "ai", text: <>That's the round. Your report is ready: <a href="/app/interview/report" style={{ color: "inherit", fontWeight: 600 }}>open the report →</a></> })]),
      ]);
      setStage(next);
      setTyping(false);
    }, 900);
  };
  const toggleMic = () => {
    if (mic) { setMic(false); answer("Users shorten a URL and get redirected fast. Reads dominate writes, so I'd put a cache in front of the database and target p99 latency under 50 ms with high availability."); }
    else setMic(true);
  };
  const runCmd = (cmd: string) => setTerm((t) => [...t, { text: cmd, tone: "cmd" }, /^kubectl get pods/.test(cmd) ? { text: "shortener-api-7d9c  Running\nshortener-api-x2kf  Running\nredis-0             Running" } : /^kubectl top/.test(cmd) ? { text: "shortener-api-7d9c  212m  180Mi\nredis-0             40m   64Mi" } : { text: `${cmd.split(" ")[0]}: try kubectl get pods`, tone: "dim" }]);

  const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
  const rail: RailItem[] = STAGES.map((s, i) => ({ id: s.name, title: `${i + 1}. ${s.name}`, meta: scores[i] != null ? `${scores[i]} / 100` : i === stage ? "In progress" : undefined, status: i < stage ? "done" : i === stage ? "current" : "todo", active: i === stage }));
  const mm = Math.floor(secs / 60), ss = secs % 60;

  return (
    <Workspace back="/app/interview" crumb="AI interview · System design" title="Design a URL shortener"
      progress={{ done: Math.min(stage, 5), total: 5, label: "stages" }} timer={`${mm}:${String(ss).padStart(2, "0")}`}
      railTitle={avg != null ? `Stages · avg ${avg}` : "Stages"} railAction={{ label: "New interview", href: "/app/interview" }} rail={rail}
      tab={tab} setTab={setTab}
      tabs={[
        { id: "whiteboard", label: "Whiteboard", icon: "M4 20l4-1 11-11-3-3L5 16z", body: <Whiteboard boxes={boxes} setBoxes={setBoxes} edges={[["c", "lb"], ["lb", "app"], ["app", "cache"], ["app", "db"]]} /> },
        { id: "terminal", label: "Terminal", icon: "M3 4h18v16H3zM7 10l3 2.5L7 15M12.5 15H17", body: <Terminal lines={term} onRun={runCmd} prompt="rahim@staging:~$" suggestions={["kubectl get pods"]} /> },
      ]}
      thread={<Thread msgs={msgs} typing={typing} composer={done
        ? <a href="/app/interview/report" className="puku-btn puku-btn-default pd-glow-btn" style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 44, borderRadius: "var(--puku-radius)", background: "var(--dashboard-accent)", color: "var(--dashboard-accent-ink)", fontWeight: 600, textDecoration: "none" }}>Open the report</a>
        : <Composer placeholder={mic ? "Listening… press the mic again to send" : "Answer the interviewer…"} onSend={answer} mic={{ on: mic, toggle: toggleMic }} chips={[{ label: "Ask to clarify", value: "Can I assume 100M new URLs a month and a 100:1 read/write ratio?" }]} />} />}
    />
  );
}
