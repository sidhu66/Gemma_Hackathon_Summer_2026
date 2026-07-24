import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppSelector } from "@/redux/store";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  MessageSquare,
  ClipboardCheck,
  Building2,
  History,
  ChevronDown,
  ArrowRight,
} from "lucide-react";

const steps = [
  { n: "1", title: "Set up the role", copy: "Tell MockMate the company, the position, and the job description. Questions adjust to match." },
  { n: "2", title: "Run the call", copy: "A conversational AI interviewer asks follow-ups the way a real one would, at a real pace." },
  { n: "3", title: "Read the debrief", copy: "Get a STAR-based score the moment you finish — what landed, what didn't, and why." },
];

const features = [
  { icon: MessageSquare, title: "Live mock interview", copy: "A conversational AI interviewer that asks follow-ups the way a real one would." },
  { icon: ClipboardCheck, title: "STAR-based scoring", copy: "Every answer scored against Situation, Task, Action, Result — with specific fixes." },
  { icon: Building2, title: "Role-specific prep", copy: "The company, the position, the job description — the questions adjust to match." },
  { icon: History, title: "Session history", copy: "Every interview is saved and searchable, so you can see whether you're improving." },
];

const faqs = [
  { q: "What kind of interviews does MockMate run?", a: "Behavioral interviews scored against the STAR framework, tailored to the role and company you provide." },
  { q: "How long does a session take?", a: "Most sessions run 15–25 minutes, followed by an instant scored debrief." },
  { q: "Can I retake an interview for the same role?", a: "Yes — run it as many times as you want. Every attempt is saved to your dashboard so you can track improvement." },
  { q: "Do I need a webcam?", a: "A camera is optional. Audio is what the interviewer listens to and scores." },
];

export default function Landing(): JSX.Element {
  const user = useAppSelector(state => state.user.user);
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  if (user) {
    navigate('/home');
  }

  return (
    <div className="flex flex-col bg-white text-slate-900">
      {/* ---- Nav ---- */}
      <nav className="sticky top-0 z-20 w-full border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600" />
            <span className="font-semibold tracking-tight">MockMate</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-slate-600">
            <a href="#how-it-works" className="hover:text-slate-900">How it works</a>
            <a href="#features" className="hover:text-slate-900">Features</a>
            <a href="#faq" className="hover:text-slate-900">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="text-slate-600 hover:text-slate-900" onClick={() => navigate('/login')}>
              Log in
            </Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg h-10 px-4" onClick={() => navigate('/signup')}>
              Sign up free
            </Button>
          </div>
        </div>
      </nav>

      {/* ---- Hero ---- */}
      <section className="w-full px-6 pt-20 pb-24 border-b border-slate-100">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="inline-flex items-center text-xs font-medium text-indigo-700 bg-indigo-50 rounded-full px-3 py-1 mb-6">
              Practice out loud, before it counts
            </span>
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight leading-[1.1] text-slate-900">
              Rehearse the interview.
              <br />
              Walk in already prepared.
            </h1>
            <p className="mt-6 max-w-lg text-base text-slate-600 leading-7">
              MockMate runs you through a real, spoken mock interview for the exact role you're
              applying for, then hands you a scored debrief — what worked, what didn't, and what
              to fix before the next one.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Button
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-6 h-12 gap-2"
                onClick={() => navigate('/signup')}
              >
                Start a mock interview
                <ArrowRight className="w-4 h-4" />
              </Button>
              <a href="#how-it-works">
                <Button variant="outline" className="rounded-lg px-6 h-12 w-full sm:w-auto border-slate-300 text-slate-700">
                  See how it works
                </Button>
              </a>
            </div>
          </div>

          {/* Debrief preview card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-400">Latest debrief</span>
              <span className="text-sm font-semibold text-emerald-600">8.7 / 10</span>
            </div>
            <div className="grid grid-cols-4 gap-2 mb-5">
              {["Situation", "Task", "Action", "Result"].map((k, i) => (
                <div key={k} className="text-center">
                  <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden mb-1.5">
                    <div className="h-full bg-indigo-500" style={{ width: `${[90, 85, 65, 95][i]}%` }} />
                  </div>
                  <span className="text-[11px] text-slate-500">{k}</span>
                </div>
              ))}
            </div>
            <p className="text-base font-medium text-slate-900 mb-2">
              Strong Result, thin Action.
            </p>
            <p className="text-sm text-slate-600 leading-6">
              You named the outcome clearly but skipped the specific steps you took to get there.
              Spend two more sentences on the Action before jumping to the win.
            </p>
          </div>
        </div>
      </section>

      {/* ---- How it works ---- */}
      <section id="how-it-works" className="w-full px-6 py-24 border-b border-slate-100">
        <div className="max-w-6xl mx-auto">
          <span className="text-xs font-medium uppercase tracking-wide text-indigo-600">How a session runs</span>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mt-3 mb-14 text-slate-900">
            One conversation, three steps.
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div key={step.n}>
                <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold mb-4">
                  {step.n}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-sm text-slate-600 leading-6">{step.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Features ---- */}
      <section id="features" className="w-full px-6 py-24 border-b border-slate-100">
        <div className="max-w-6xl mx-auto">
          <span className="text-xs font-medium uppercase tracking-wide text-indigo-600">What's inside</span>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mt-3 mb-14 text-slate-900">
            Built to feel like the real thing.
          </h2>
          <div className="grid md:grid-cols-2 gap-5">
            {features.map((f) => (
              <div key={f.title} className="rounded-2xl border border-slate-200 p-6 flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                  <f.icon className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900 mb-1">{f.title}</h3>
                  <p className="text-sm text-slate-600 leading-6">{f.copy}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- FAQ ---- */}
      <section id="faq" className="w-full px-6 py-24 border-b border-slate-100">
        <div className="max-w-3xl mx-auto">
          <span className="text-xs font-medium uppercase tracking-wide text-indigo-600">FAQ</span>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mt-3 mb-10 text-slate-900">
            Good to know.
          </h2>
          <div className="divide-y divide-slate-200 border-t border-b border-slate-200">
            {faqs.map((item, i) => (
              <div key={item.q}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between py-5 text-left"
                >
                  <span className="font-medium text-slate-900">{item.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                {openFaq === i && (
                  <p className="text-sm text-slate-600 leading-6 pb-5">{item.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Waitlist / CTA ---- */}
      <section className="w-full px-6 py-24">
        <div className="max-w-6xl mx-auto bg-indigo-600 rounded-3xl px-8 py-14 md:px-16 md:py-16">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <span className="text-xs font-medium uppercase tracking-wide text-indigo-200">Stay in the loop</span>
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mt-3 text-white">
                Get notified about new interview modes.
              </h2>
              <p className="mt-4 text-indigo-100 leading-6">
                We're expanding beyond behavioral interviews. Leave your email and we'll let you
                know when new formats ship.
              </p>
            </div>
            <div className="flex w-full flex-col sm:flex-row gap-3">
              <Input
                type="email"
                placeholder="you@example.com"
                className="bg-white border-transparent rounded-lg h-12 placeholder:text-slate-400"
              />
              <Button className="bg-slate-900 hover:bg-slate-800 text-white rounded-lg h-12 px-6">
                Notify me
              </Button>
            </div>
          </div>
        </div>
      </section>

      <footer className="flex flex-col md:flex-row gap-4 w-full justify-between px-6 py-8 items-center border-t border-slate-100 text-sm text-slate-500">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-indigo-600" />
          <span className="font-medium text-slate-900 text-sm">MockMate</span>
        </div>
        <p className="text-center md:text-right text-xs">
          © 2026 MockMate. All rights reserved.
        </p>
      </footer>
    </div>
  );
}