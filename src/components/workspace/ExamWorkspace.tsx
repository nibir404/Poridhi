"use client";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Workspace, { type RailItem } from "./Workspace";
import { Composer, Editor, Terminal, Thread, type Msg, type TermLine } from "./parts";
import { examQuestions } from "@/data/entities";
import { usePlan } from "@/data/plan";
import { ProWall } from "./ProGate";

/**
 * AI exam workspace (Claude / Codex layout): the rail lists all ten questions; the thread holds
 * the task, the rubric and a proctor who answers clarifications (never solutions); the working pane
 * has the IDE, a terminal (terraform validate / plan) and the rubric. Submit grades against the rubric.
 */
type NoId<T> = T extends unknown ? Omit<T, "id"> : never;
let seq = 0;
const m = (x: NoId<Msg>): Msg => ({ ...x, id: ++seq } as Msg);

const RUBRIC = [
  { k: "listener", t: "ALB listens on port 80", test: (s: string) => /port\s*=\s*80/.test(s) && /aws_lb_listener/.test(s) },
  { k: "tg", t: "Target group checks /health", test: (s: string) => /path\s*=\s*"\/health"/.test(s) },
  { k: "subnets", t: "ALB in both public subnets", test: (s: string) => /subnets\s*=\s*\[[^\]]*public[^\]]*,[^\]]*public/.test(s) },
  { k: "sg", t: "Security group allows 80 from anywhere", test: (s: string) => /from_port\s*=\s*80/.test(s) && /0\.0\.0\.0\/0/.test(s) },
  { k: "targets", t: "Both instances attached", test: (s: string) => (s.match(/aws_lb_target_group_attachment/g) ?? []).length >= 2 },
];
const START = `resource "aws_lb" "web" {
  name               = "exam-alb"
  load_balancer_type = "application"
  subnets            = [aws_subnet.public_a.id]
  security_groups    = [aws_security_group.alb.id]
}

resource "aws_lb_target_group" "web" {
  name     = "web"
  port     = 80
  protocol = "HTTP"
  vpc_id   = aws_vpc.main.id
}

# TODO: listener on port 80, health check on /health,
# both public subnets, attach ec2-a and ec2-b
`;

export default function ExamWorkspace() {
  const { plan } = usePlan();
  if (plan !== "pro") return <ProWall back="/app/exam" crumb="Milestone 1 · Linux, Scripting & Containerization · Milestone exam" title="AI exam" what="The AI exam" about="Exams run on a real sandbox and are graded by AI against a rubric, and passing earns your certificate." />;
  return <ExamInner />;
}

function ExamInner() {
  const qs = useSearchParams();
  const q = examQuestions.find((x) => String(x.n) === qs.get("q")) ?? examQuestions[3];
  const [files, setFiles] = useState<Record<string, string>>({ "main.tf": START, "variables.tf": 'variable "region" {\n  default = "ap-south-1"\n}\n', "outputs.tf": 'output "alb_dns" {\n  value = aws_lb.web.dns_name\n}\n' });
  const [file, setFile] = useState("main.tf");
  const [tab, setTab] = useState("editor");
  const [term, setTerm] = useState<TermLine[]>([{ text: "exam-vm · terraform v1.9 · AWS sandbox ready", tone: "dim" }]);
  const [submitted, setSubmitted] = useState<null | number>(null);
  const [typing, setTyping] = useState(false);
  const [secs, setSecs] = useState(9 * 60 + 12);
  useEffect(() => { const t = setInterval(() => setSecs((s) => Math.max(0, s - 1)), 1000); return () => clearInterval(t); }, []);
  const results = useMemo(() => RUBRIC.map((r) => ({ ...r, ok: r.test(files["main.tf"] ?? "") })), [files]);
  const [msgs, setMsgs] = useState<Msg[]>(() => [
    m({ from: "system", text: `Milestone 1 exam · Q${q.n} of 10 · ${q.level} · ${q.points} points · 15 min` }),
    m({ from: "ai", text: <><b>{q.title}.</b> Put an Application Load Balancer in front of <code>ec2-a</code> and <code>ec2-b</code> so the app answers on port 80 at the ALB's DNS name. Use both public subnets and a health check on <code>/health</code>.</> }),
    m({ from: "code", text: "Internet → ALB :80 → target group (/health) → ec2-a, ec2-b (private subnets)" }),
    m({ from: "ai", text: <>I'm the proctor: ask me to clarify anything, but I won't give you the answer. Your work is graded against the rubric on the right when you submit.</> }),
  ]);

  const run = (cmd: string) => {
    const s = files["main.tf"] ?? "";
    const ok = results.filter((r) => r.ok).length;
    const out: TermLine[] = [{ text: cmd, tone: "cmd" }];
    if (/terraform validate/.test(cmd)) out.push(/resource "aws_lb_listener"/.test(s) || !/TODO/.test(s) ? { text: "Success! The configuration is valid.", tone: "ok" } : { text: "Warning: no aws_lb_listener: the ALB will not accept traffic.", tone: "err" });
    else if (/terraform plan/.test(cmd)) out.push({ text: `Plan: ${4 + ok} to add, 0 to change, 0 to destroy.`, tone: ok === 5 ? "ok" : undefined });
    else if (/curl/.test(cmd)) out.push(ok === 5 ? { text: "HTTP/1.1 200 OK", tone: "ok" } : { text: "curl: (7) Failed to connect to exam-alb port 80", tone: "err" });
    else out.push({ text: "Try: terraform validate · terraform plan · curl -sI http://exam-alb", tone: "dim" });
    setTerm((t) => [...t, ...out]);
  };
  const ask = (text: string) => {
    setMsgs((x) => [...x, m({ from: "you", text })]);
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      const a = /answer|solution|code for|write it/i.test(text) ? "I can't give you the solution, but I can clarify the task. Which part is unclear?" : /subnet/i.test(text) ? "Yes: the ALB must sit in both public subnets (public_a and public_b). The instances stay in private subnets." : /health/i.test(text) ? "The target group's health check should use path /health and expect 200." : /time|minutes/i.test(text) ? `You have ${Math.floor(secs / 60)} minutes left on this question.` : "Clarified: only the ALB, listener, target group, health check and attachments are graded for this question.";
      setMsgs((x) => [...x, m({ from: "ai", text: a })]);
    }, 700);
  };
  const submit = () => {
    const ok = results.filter((r) => r.ok).length;
    const sc = Math.round((ok / RUBRIC.length) * q.points);
    setSubmitted(sc);
    setTab("rubric");
    setMsgs((x) => [...x,
      m({ from: "system", text: "Submitted · graded by AI against the rubric" }),
      ...results.map((r) => m({ from: "check", ok: r.ok, text: r.t })),
      m({ from: "ai", text: <>Score: <b>{sc} / {q.points}</b>. {ok === RUBRIC.length ? "Everything in the rubric is met." : "You can retry this question; the best attempt counts."} <a href="/app/exam/questions" style={{ color: "inherit", fontWeight: 600 }}>Back to all questions →</a></> }),
    ]);
  };

  const rail: RailItem[] = examQuestions.map((x) => ({ id: String(x.n), title: `Q${x.n} · ${x.title}`, meta: `${x.tool} · ${x.points} pts`, status: x.n < 3 ? "done" : x.n === q.n ? "current" : x.n === 3 ? "done" : "todo", active: x.n === q.n, href: `/app/exam/q4/instructions?q=${x.n}` }));
  const mm = Math.floor(secs / 60), ss = secs % 60;
  const Rubric = (
    <div style={{ padding: 16, display: "grid", gap: 8 }}>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--dashboard-muted)" }}>Rubric · {q.points} points · live check</span>
      {results.map((r) => <div key={r.k} style={{ display: "flex", alignItems: "center", gap: 10, padding: 10, borderRadius: "var(--puku-radius)", border: "1px solid var(--dashboard-border)" }}><span style={{ width: 18, height: 18, borderRadius: 999, display: "grid", placeItems: "center", background: r.ok ? "var(--dashboard-success)" : "transparent", border: r.ok ? 0 : "1.5px solid var(--dashboard-border)", color: "var(--dashboard-main)", fontSize: 12 }}>{r.ok ? "✓" : ""}</span><span style={{ fontSize: 14 }}>{r.t}</span></div>)}
      {submitted != null && <div style={{ marginTop: 8, fontSize: 15 }}>Score: <b>{submitted} / {q.points}</b></div>}
    </div>
  );

  return (
    <Workspace back="/app/exam/questions" crumb={`Milestone 1 · Milestone exam · Q${q.n} of 10`} title={q.title}
      progress={{ done: results.filter((r) => r.ok).length, total: RUBRIC.length, label: "rubric items" }} timer={`${mm}:${String(ss).padStart(2, "0")} left`} timerTone={secs < 180 ? "warn" : "ok"}
      railTitle="Questions" railAction={{ label: "All questions", href: "/app/exam/questions" }} rail={rail}
      tab={tab} setTab={setTab}
      tabs={[
        { id: "editor", label: "Editor", icon: "M8 8l-4 4 4 4M16 8l4 4-4 4", body: <Editor files={files} active={file} setActive={setFile} onChange={(f, v) => setFiles((x) => ({ ...x, [f]: v }))} /> },
        { id: "terminal", label: "Terminal", icon: "M3 4h18v16H3zM7 10l3 2.5L7 15M12.5 15H17", body: <Terminal lines={term} onRun={run} prompt="exam@vm:~$" suggestions={["terraform validate"]} /> },
        { id: "rubric", label: "Rubric", icon: "M9 11l2 2 4-4M5 3h14v18H5z", body: Rubric },
      ]}
      actions={submitted == null ? <button type="button" onClick={submit} className="puku-btn puku-btn-default pd-glow-btn" style={{ height: 32, padding: "0 14px", borderRadius: "var(--puku-radius)", border: 0, background: "var(--dashboard-accent)", color: "var(--dashboard-accent-ink)", fontWeight: 600, cursor: "pointer" }}>Submit Q{q.n}</button> : undefined}
      thread={<Thread msgs={msgs} typing={typing} composer={<Composer placeholder="Ask the proctor to clarify…" onSend={ask} chips={[{ label: "Which subnets?", value: "Which subnets should the ALB use?" }, { label: "Health check?", value: "What should the health check be?" }]} />} />}
    />
  );
}
