import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppSelector } from "@/redux/store";
import { useNavigate } from "react-router-dom";
import Waveform from "@/components/Waveform";

const sessionLog = [
  { time: "00:00", label: "Practice", copy: "Run a full mock interview against a role you're actually applying for — not a generic question bank." },
  { time: "00:41", label: "Review", copy: "Get a scored breakdown the moment you finish: what landed, what didn't, and why." },
  { time: "01:18", label: "Repeat", copy: "Come back before the real thing and run it again. Progress shows up on the dashboard, not just in your head." },
];

const features = [
  { tag: "MOCK", title: "Live mock interview", copy: "A conversational AI interviewer that asks follow-ups the way a real one would, paced like an actual call." },
  { tag: "GRADE", title: "STAR-based scoring", copy: "Every answer scored against Situation, Task, Action, Result — with specific issues and fixes, not vague praise." },
  { tag: "ROLE", title: "Role-specific prep", copy: "Tell it the company, the position, the job description. The questions adjust to match." },
  { tag: "TRACK", title: "Session history", copy: "Every interview is saved and searchable, so you can see whether you're actually improving." },
];

export default function Landing(): JSX.Element {
  const user = useAppSelector(state => state.user.user);
  const navigate = useNavigate();

  if (user) {
    navigate('/home');
  }

  return (
    <div className="flex flex-col bg-[var(--mm-ink)] text-[var(--mm-paper)] font-[var(--font-body)]">
      {/* ---- Hero ---- */}
      <section className="w-full px-6 md:px-14 pt-16 md:pt-24 pb-16 border-b border-[var(--mm-ink-line)]">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Waveform live bars={16} className="text-[var(--mm-signal)] h-4" />
            <span className="mm-eyebrow">Recording — MockMate Session</span>
          </div>

          <div className="grid lg:grid-cols-[1.3fr_1fr] gap-12 items-end">
            <div>
              <h1 className="mm-font-display text-5xl md:text-7xl font-medium leading-[1.05] text-[var(--mm-paper)]">
                Rehearse the interview
                <br />
                <span className="italic text-[var(--mm-signal)]">before it counts.</span>
              </h1>
              <p className="mt-6 max-w-xl text-base md:text-lg text-[var(--mm-slate)] leading-8">
                MockMate runs you through a real, spoken mock interview, then hands you a
                scored debrief — what worked, what didn't, and exactly what to fix before
                the next one.
              </p>
              <div className="mt-9 flex flex-col sm:flex-row gap-4">
                <Button
                  className="mm-btn-primary rounded-none px-6 py-6 h-auto"
                  onClick={() => navigate('/signup')}
                >
                  Start a mock interview →
                </Button>
                <a href="#how-it-works">
                  <Button className="mm-btn-ghost rounded-none px-6 py-6 h-auto w-full sm:w-auto">
                    See how it works
                  </Button>
                </a>
              </div>
            </div>

            <div className="mm-panel p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="mm-eyebrow text-[var(--mm-teal)]">Latest debrief</span>
                <span className="mm-font-mono text-xs text-[var(--mm-slate)]">8.7 / 10</span>
              </div>
              <p className="mm-font-display text-xl italic text-[var(--mm-paper)] mb-3">
                "Strong Result, thin Action."
              </p>
              <p className="text-sm text-[var(--mm-slate)] leading-6">
                You named the outcome clearly but skipped the specific steps you took to
                get there. Next time, spend two more sentences on the Action before
                jumping to the win.
              </p>
              <div className="mt-5 pt-4 mm-tape">
                <Waveform bars={40} className="text-[var(--mm-teal)] h-6" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---- How it works — transcript / timestamp framing ---- */}
      <section id="how-it-works" className="w-full px-6 md:px-14 py-16 md:py-24 border-b border-[var(--mm-ink-line)]">
        <div className="max-w-6xl mx-auto">
          <span className="mm-eyebrow">How a session runs</span>
          <h2 className="mm-font-display text-3xl md:text-5xl font-medium mt-3 mb-14 text-[var(--mm-paper)]">
            One conversation, three moments.
          </h2>

          <div className="grid md:grid-cols-3 gap-0 border-t border-[var(--mm-ink-line)]">
            {sessionLog.map((step, i) => (
              <div
                key={step.time}
                className={`p-6 md:p-8 ${i < sessionLog.length - 1 ? "md:border-r" : ""} border-b md:border-b-0 border-[var(--mm-ink-line)]`}
              >
                <span className="mm-font-mono text-sm text-[var(--mm-signal)]">{step.time}</span>
                <h3 className="mm-font-display text-2xl mt-3 mb-3 text-[var(--mm-paper)]">{step.label}</h3>
                <p className="text-sm text-[var(--mm-slate)] leading-7">{step.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Features ---- */}
      <section className="w-full px-6 md:px-14 py-16 md:py-24 border-b border-[var(--mm-ink-line)]">
        <div className="max-w-6xl mx-auto">
          <span className="mm-eyebrow">What's inside</span>
          <h2 className="mm-font-display text-3xl md:text-5xl font-medium mt-3 mb-14 text-[var(--mm-paper)]">
            Built to feel like the real thing.
          </h2>
          <div className="grid md:grid-cols-2 gap-5">
            {features.map((f) => (
              <div key={f.tag} className="mm-panel p-6 flex gap-5">
                <span className="mm-font-mono text-xs text-[var(--mm-teal)] pt-1 shrink-0">{f.tag}</span>
                <div>
                  <h3 className="mm-font-display text-xl text-[var(--mm-paper)] mb-2">{f.title}</h3>
                  <p className="text-sm text-[var(--mm-slate)] leading-7">{f.copy}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Waitlist / CTA ---- */}
      <section className="w-full px-6 md:px-14 py-16 md:py-24">
        <div className="max-w-6xl mx-auto mm-panel px-6 py-10 md:px-12 md:py-16">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <span className="mm-eyebrow">Stay in the loop</span>
              <h2 className="mm-font-display text-3xl md:text-5xl font-medium mt-3 text-[var(--mm-paper)]">
                Get notified about new interview modes.
              </h2>
              <p className="mt-4 text-[var(--mm-slate)] leading-7">
                We're expanding beyond behavioral interviews. Leave your email and we'll
                let you know when new formats ship.
              </p>
            </div>

            <div className="flex w-full flex-col sm:flex-row gap-3">
              <Input
                type="email"
                placeholder="you@example.com"
                className="bg-[var(--mm-ink)] border-[var(--mm-ink-line)] text-[var(--mm-paper)] placeholder:text-[var(--mm-slate)] rounded-none h-12"
              />
              <Button type="submit" className="mm-btn-primary rounded-none h-12 px-6">
                Notify me
              </Button>
            </div>
          </div>
        </div>
      </section>

      <footer className="flex flex-col md:flex-row gap-4 w-full justify-between px-6 md:px-14 py-8 items-center border-t border-[var(--mm-ink-line)] text-sm text-[var(--mm-slate)]">
        <div className="flex items-center gap-2">
          <Waveform bars={10} className="text-[var(--mm-signal)] h-3" />
          <span className="mm-font-mono text-[var(--mm-paper)] tracking-widest uppercase text-xs">MockMate</span>
        </div>
        <p className="text-center md:text-right mm-font-mono text-xs">
          © 2026 MockMate. All rights reserved.
        </p>
      </footer>
    </div>
  );
}