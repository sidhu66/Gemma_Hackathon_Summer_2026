import { useAppSelector } from "@/redux/store";
import { interviewContent, MeetingState, dataForResults } from "@/utils/types";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "@/lib/axios";
import ReactMarkdown from "react-markdown";
import ChatToView from "@/components/ChatToView";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import * as Sentry from "@sentry/react";
import Waveform from "@/components/Waveform";

const gradeColor = (grade: number) => {
  if (grade >= 8) return { text: "text-[var(--mm-teal)]", border: "border-[var(--mm-teal)]", bg: "bg-[var(--mm-teal-dim)]" };
  if (grade >= 5) return { text: "text-[var(--mm-signal)]", border: "border-[var(--mm-signal)]", bg: "bg-[var(--mm-signal-dim)]" };
  return { text: "text-[var(--mm-red)]", border: "border-[var(--mm-red)]", bg: "bg-[rgba(224,102,95,0.12)]" };
};

/** ReactMarkdown requires a string; the model sometimes returns objects. */
const toMarkdownText = (value: unknown): string => {
  if (typeof value === "string") return value;
  if (value == null) return "";
  if (typeof value === "object") {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  }
  return String(value);
};

/** ReactMarkdown requires a string; the model sometimes returns objects. */
const toMarkdownText = (value: unknown): string => {
  if (typeof value === "string") return value;
  if (value == null) return "";
  if (typeof value === "object") {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  }
  return String(value);
};

const starKeys = ["situation", "task", "action", "result"] as const;

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const interviewId: number = location.state?.interviewId;
  const state: MeetingState = location.state?.state;
  const fromMeeting: boolean | undefined = location.state?.fromMeeting;

  const user = useAppSelector((state) => state.user.user);

  const [data, setData] = useState<dataForResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/");
    } else if (!fromMeeting) {
      navigate("/home");
    }

    const fetchInterviewData = async () => {
      try {
        const response = await api.get(
          `/api/interview/feedback/${interviewId}`,
        );
        const result: interviewContent | undefined = response.data;
        if (result) {
          setError(null);
          const data: dataForResults = {
            id: result.id,
            interview_id: result.interview_id,
            chat: JSON.parse(result.chat),
            feedback: result.feedback ? JSON.parse(result.feedback) : null,
          };
          setData(data); // Store data in state
          setLoading(false); // Stop loading when data is available
        } else {
          setError("Data is null");
          throw new Error("Data is null"); // Trigger retry if data is null
        }
      } catch (err: any) {
        setError(err?.message);
        console.error("Error fetching interview data:", err);
      }
    };

    const interval = setInterval(fetchInterviewData, 3000);
    fetchInterviewData();

    return () => clearInterval(interval);
  }, [user, fromMeeting, interviewId, navigate]);

  const grade = data?.feedback?.grade ?? 0;
  const colors = gradeColor(grade);

  return (
    <div className="min-h-screen w-full pb-16 bg-[var(--mm-ink)] text-[var(--mm-paper)]">
      {/* Header */}
      <div className="w-full lg:px-40 md:px-20 px-6 flex justify-between items-center h-20 mb-2 border-b border-[var(--mm-ink-line)]">
        <Button
          variant="ghost"
          className="gap-2 text-[var(--mm-slate)] hover:text-[var(--mm-paper)] hover:bg-transparent"
          onClick={() => navigate("/home")}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to dashboard
        </Button>
        <div className="flex items-center gap-2">
          <Waveform bars={10} className="text-[var(--mm-signal)] h-3" />
          <span className="mm-font-mono text-xs uppercase tracking-widest text-[var(--mm-slate)]">Debrief</span>
        </div>
      </div>

      <div className="w-full flex flex-col items-center px-4">
        <div className="w-full max-w-4xl space-y-8 pt-10">
          {/* Title Area */}
          <div className="text-center space-y-2">
            <span className="mm-eyebrow">Session complete</span>
            <h1 className="mm-font-display text-4xl text-[var(--mm-paper)] tracking-tight">
              Interview debrief
            </h1>
            {state?.position && (
              <p className="text-[var(--mm-slate)] text-base mm-font-mono">
                {state.companyName && <span>{state.companyName} · </span>}
                {state.position}
              </p>
            )}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2 className="w-8 h-8 text-[var(--mm-signal)] animate-spin" />
              <p className="text-[var(--mm-slate)] text-sm mm-font-mono">
                Generating your debrief — this may take a few minutes…
              </p>
            </div>
          ) : error ? (
            <div className="mm-panel border-[var(--mm-red)]/40 py-8 text-center">
              <p className="text-[var(--mm-red)]">{error}</p>
            </div>
          ) : (
            <>
              {/* Grade + Summary Hero */}
              {data?.feedback ? (
                <div className="mm-panel overflow-hidden">
                  <div className="p-8">
                    <div className="flex flex-col sm:flex-row items-center gap-8">
                      {/* Grade Ring */}
                      <div className="flex-shrink-0">
                        <div
                          className={`w-28 h-28 rounded-full border-4 ${colors.border} ${colors.bg} flex items-center justify-center`}
                        >
                          <div className="text-center">
                            <span className={`text-4xl font-bold mm-font-display ${colors.text}`}>
                              {grade}
                            </span>
                            <span className="text-[var(--mm-slate)] text-sm block -mt-1">/10</span>
                          </div>
                        </div>
                      </div>

                      {/* Summary */}
                      <div className="flex-1 text-center sm:text-left">
                        <h2 className="mm-eyebrow mb-2">
                          Overall summary
                        </h2>
                        <div className="text-[var(--mm-paper)] text-sm leading-relaxed prose prose-sm max-w-none prose-headings:text-[var(--mm-paper)] prose-p:text-[var(--mm-paper)] prose-strong:text-[var(--mm-paper)]">
                          <ReactMarkdown>{toMarkdownText(data.feedback.summary)}</ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mm-panel py-8 text-center">
                  <Loader2 className="w-6 h-6 text-[var(--mm-signal)] animate-spin mx-auto mb-2" />
                  <p className="text-[var(--mm-slate)] text-sm mm-font-mono">Feedback loading…</p>
                </div>
              )}

              {/* STAR Evaluation */}
              {data?.feedback?.star && (
                <div className="space-y-4">
                  <h2 className="mm-font-display text-xl text-[var(--mm-paper)] tracking-tight px-1">
                    STAR evaluation
                  </h2>
                  <div className="grid gap-4 md:grid-cols-2">
                    {starKeys.map((key) => {
                      const category = data.feedback!.star?.[key];
                      if (!category) return null;
                      const catColors = gradeColor(category.score);
                      return (
                        <div
                          key={key}
                          className="mm-panel p-5 hover:border-[var(--mm-signal)]/40 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <span className="mm-font-mono text-xs uppercase tracking-widest text-[var(--mm-slate)]">{key}</span>
                            <span className={`text-sm font-bold mm-font-mono ${catColors.text}`}>
                              {category.score}/10
                            </span>
                          </div>
                          <div className="space-y-3">
                            {category.issues?.length > 0 && (
                              <div>
                                <p className="text-xs uppercase tracking-wider text-[var(--mm-red)] mm-font-mono font-semibold mb-1">Issues</p>
                                <ul className="list-disc list-inside text-[var(--mm-slate)] text-sm space-y-1">
                                  {category.issues.map((issue, i) => (
                                    <li key={i}>{issue}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {category.improvements?.length > 0 && (
                              <div>
                                <p className="text-xs uppercase tracking-wider text-[var(--mm-teal)] mm-font-mono font-semibold mb-1">Improvements</p>
                                <ul className="list-disc list-inside text-[var(--mm-slate)] text-sm space-y-1">
                                  {category.improvements.map((tip, i) => (
                                    <li key={i}>{tip}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Mock Answer */}
              {data?.feedback?.mockAnswer && (
                <div className="space-y-3">
                  <h2 className="mm-font-display text-xl text-[var(--mm-paper)] tracking-tight px-1">
                    Mock answer
                  </h2>
                  <div className="mm-panel p-6">
                    <div className="text-[var(--mm-paper)] text-sm leading-relaxed prose prose-sm max-w-none prose-headings:text-[var(--mm-paper)] prose-p:text-[var(--mm-paper)] prose-strong:text-[var(--mm-paper)]">
                      <ReactMarkdown>{toMarkdownText(data.feedback.mockAnswer)}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              )}

              {/* Suggestions */}
              {(() => {
                const suggestions = Array.isArray(data?.feedback?.suggestions)
                  ? data.feedback.suggestions
                  : typeof data?.feedback?.suggestions === "string" && data.feedback.suggestions.trim()
                    ? [data.feedback.suggestions]
                    : [];
                if (suggestions.length === 0) return null;
                return (
                <div className="space-y-3">
                  <h2 className="mm-font-display text-xl text-[var(--mm-paper)] tracking-tight px-1">
                    Suggestions
                  </h2>
                  <div className="mm-panel p-6">
                    <ul className="space-y-2">
                      {suggestions.map((suggestion, i) => (
                        <li key={i} className="flex items-start gap-2 text-[var(--mm-slate)] text-sm">
                          <span className="text-[var(--mm-signal)] mt-0.5">&#8226;</span>
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                );
              })()}

              {/* Chat Log — Collapsible */}
              <div className="space-y-3">
                <button
                  onClick={() => setChatOpen(!chatOpen)}
                  className="w-full flex items-center justify-between px-1 group"
                >
                  <h2 className="mm-font-display text-xl text-[var(--mm-paper)] tracking-tight">
                    Chat log
                  </h2>
                  <span className="text-[var(--mm-slate)] group-hover:text-[var(--mm-paper)] transition-colors">
                    {chatOpen ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </span>
                </button>
                {chatOpen && (
                  <div className="mm-panel p-6">
                    <ChatToView interviewer={undefined} chatLog={data?.chat} />
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Results;