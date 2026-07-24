import { useAppSelector } from "@/redux/store";
import { interviewContent, MeetingState, dataForResults } from "@/utils/types";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "@/lib/axios";
import ReactMarkdown from "react-markdown";
import ChatToView from "@/components/ChatToView";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronDown, ChevronUp, Loader2, Printer, TrendingUp, TrendingDown } from "lucide-react";

const gradeColor = (grade: number) => {
  if (grade >= 8) return { text: "text-emerald-600", ring: "#059669", bg: "bg-emerald-50" };
  if (grade >= 5) return { text: "text-amber-600", ring: "#D97706", bg: "bg-amber-50" };
  return { text: "text-red-600", ring: "#DC2626", bg: "bg-red-50" };
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
  const [averageScore, setAverageScore] = useState<number | null>(null);

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
          setData(data);
          setLoading(false);
        } else {
          setError("Data is null");
          throw new Error("Data is null");
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
        console.error("Error fetching interview data:", err);
      }
    };

    const interval = setInterval(fetchInterviewData, 3000);
    fetchInterviewData();

    return () => clearInterval(interval);
  }, [user, fromMeeting, interviewId, navigate]);

  // Comparison stat — reuses the same endpoint the dashboard already calls.
  useEffect(() => {
    const fetchAverage = async () => {
      try {
        const response = await api.get<{ recentInterviews: { score: number }[] }>(
          "/api/interview/getRecentInterview",
        );
        const scores = (response.data.recentInterviews || []).map((i) => i.score).filter((s) => typeof s === "number");
        if (scores.length) {
          setAverageScore(scores.reduce((a, b) => a + b, 0) / scores.length);
        }
      } catch (err) {
        console.log(err);
      }
    };
    fetchAverage();
  }, []);

  const grade = data?.feedback?.grade ?? 0;
  const colors = gradeColor(grade);
  const ringCircumference = 2 * Math.PI * 52;
  const ringOffset = ringCircumference - (grade / 10) * ringCircumference;
  const delta = averageScore !== null ? grade - averageScore : null;

  return (
    <div className="min-h-screen w-full pb-16 bg-slate-50 text-slate-900">
      {/* Header */}
      <div className="w-full lg:px-40 md:px-20 px-6 flex justify-between items-center h-20 border-b border-slate-200 bg-white">
        <Button
          variant="ghost"
          className="gap-2 text-slate-500 hover:text-slate-900 hover:bg-transparent"
          onClick={() => navigate("/home")}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to dashboard
        </Button>
        <Button
          variant="ghost"
          className="gap-2 text-slate-500 hover:text-slate-900 hover:bg-transparent"
          onClick={() => window.print()}
        >
          <Printer className="w-4 h-4" />
          Save as PDF
        </Button>
      </div>

      <div className="w-full flex flex-col items-center px-4">
        <div className="w-full max-w-4xl space-y-6 pt-10">
          {/* Title Area */}
          <div className="text-center space-y-2">
            <span className="text-xs font-medium uppercase tracking-wide text-indigo-600">Session complete</span>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
              Interview debrief
            </h1>
            {state?.position && (
              <p className="text-slate-500 text-sm">
                {state.companyName && <span>{state.companyName} · </span>}
                {state.position}
              </p>
            )}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
              <p className="text-slate-500 text-sm">
                Generating your debrief — this may take a few minutes…
              </p>
            </div>
          ) : error ? (
            <div className="bg-white rounded-2xl border border-red-200 py-8 text-center">
              <p className="text-red-600">{error}</p>
            </div>
          ) : (
            <>
              {/* Grade + Summary Hero */}
              {data?.feedback ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-8">
                  <div className="flex flex-col sm:flex-row items-center gap-8">
                    {/* Grade Ring */}
                    <div className="flex-shrink-0 flex flex-col items-center gap-2">
                      <svg width="120" height="120" viewBox="0 0 120 120" className="-rotate-90">
                        <circle cx="60" cy="60" r="52" fill="none" stroke="#E5E7EB" strokeWidth="8" />
                        <circle
                          cx="60" cy="60" r="52" fill="none"
                          stroke={colors.ring} strokeWidth="8" strokeLinecap="round"
                          strokeDasharray={ringCircumference}
                          strokeDashoffset={ringOffset}
                        />
                        <text
                          x="60" y="66" textAnchor="middle" transform="rotate(90 60 60)"
                          className={`text-2xl font-bold ${colors.text}`}
                          fill="currentColor"
                        >
                          {grade}
                        </text>
                      </svg>
                      {delta !== null && (
                        <span className={`flex items-center gap-1 text-xs font-medium ${delta >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                          {delta >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                          {delta >= 0 ? "+" : ""}{delta.toFixed(1)} vs your average
                        </span>
                      )}
                    </div>

                    {/* Summary */}
                    <div className="flex-1 text-center sm:text-left">
                      <h2 className="text-xs font-medium uppercase tracking-wide text-slate-400 mb-2">
                        Overall summary
                      </h2>
                      <div className="text-slate-700 text-sm leading-relaxed prose prose-sm max-w-none prose-headings:text-slate-900 prose-p:text-slate-700 prose-strong:text-slate-900">
                        <ReactMarkdown>{toMarkdownText(data.feedback.summary)}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 py-8 text-center">
                  <Loader2 className="w-6 h-6 text-indigo-600 animate-spin mx-auto mb-2" />
                  <p className="text-slate-500 text-sm">Feedback loading…</p>
                </div>
              )}

              {/* STAR Evaluation */}
              {data?.feedback?.star && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-slate-900 px-1">
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
                          className="bg-white rounded-2xl border border-slate-200 p-5"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">{key}</span>
                            <span className={`text-sm font-bold ${catColors.text}`}>
                              {category.score}/10
                            </span>
                          </div>
                          <div className="space-y-3">
                            {category.issues?.length > 0 && (
                              <div>
                                <p className="text-xs uppercase tracking-wide text-red-500 font-semibold mb-1">Issues</p>
                                <ul className="list-disc list-inside text-slate-600 text-sm space-y-1">
                                  {category.issues.map((issue, i) => (
                                    <li key={i}>{issue}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {category.improvements?.length > 0 && (
                              <div>
                                <p className="text-xs uppercase tracking-wide text-emerald-600 font-semibold mb-1">Improvements</p>
                                <ul className="list-disc list-inside text-slate-600 text-sm space-y-1">
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
                  <h2 className="text-lg font-semibold text-slate-900 px-1">
                    Mock answer
                  </h2>
                  <div className="bg-white rounded-2xl border border-slate-200 p-6">
                    <div className="text-slate-700 text-sm leading-relaxed prose prose-sm max-w-none prose-headings:text-slate-900 prose-p:text-slate-700 prose-strong:text-slate-900">
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
                    <h2 className="text-lg font-semibold text-slate-900 px-1">
                      Suggestions
                    </h2>
                    <div className="bg-white rounded-2xl border border-slate-200 p-6">
                      <ul className="space-y-2">
                        {suggestions.map((suggestion, i) => (
                          <li key={i} className="flex items-start gap-2 text-slate-600 text-sm">
                            <span className="text-indigo-500 mt-0.5">&#8226;</span>
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
                  <h2 className="text-lg font-semibold text-slate-900">
                    Chat log
                  </h2>
                  <span className="text-slate-400 group-hover:text-slate-600 transition-colors">
                    {chatOpen ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </span>
                </button>
                {chatOpen && (
                  <div className="bg-white rounded-2xl border border-slate-200 p-6">
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