import { useAppSelector } from "@/redux/store";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Graph } from "../components/Graph";
import { useEffect, useMemo, useState } from "react";
import api from "@/lib/axios";
import { LogoutHook, useLogout } from "@/hooks/useLogout";
import { Speaker, FeedbackData } from "@/utils/types";
import ChatToView from "@/components/ChatToView";
import FeedbackCarousel from "@/components/FeedbackCarousel";
import InterviewSearch from "@/components/InterviewSearch";
import {
    Plus,
    LogOut,
    Trophy,
    Flame,
    TrendingUp,
    ListChecks,
    ChevronRight,
} from "lucide-react";

type RecentInterview = {
    id: number;
    institution: string;
    typeofinterview: string;
    score: number;
    interview_date: string;
};

type RecentInterviewResponse = {
    recentInterviews: RecentInterview[];
    latestInterview: {
        chat: string;
        feedback: string | null;
    } | null;
};

/** Consecutive-day practice streak, counting back from the most recent session. */
const computeStreak = (interviews: RecentInterview[]): number => {
    if (!interviews.length) return 0;
    const oneDay = 86400000;
    const dayTimestamps = Array.from(
        new Set(interviews.map((i) => new Date(i.interview_date).toDateString())),
    )
        .map((d) => new Date(d).getTime())
        .sort((a, b) => b - a);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffFromToday = Math.round((today.getTime() - dayTimestamps[0]) / oneDay);
    if (diffFromToday > 1) return 0;

    let streak = 1;
    for (let i = 1; i < dayTimestamps.length; i++) {
        const diff = Math.round((dayTimestamps[i - 1] - dayTimestamps[i]) / oneDay);
        if (diff === 1) streak++;
        else break;
    }
    return streak;
};

const Home = () => {
    const user = useAppSelector((state) => state.user.user);
    const navigate = useNavigate();
    const { logout }: LogoutHook = useLogout();
    const [recentInterviews, setRecentInterviews] = useState<RecentInterview[]>([]);
    const [latestInterviewChat, setLatestInterviewChat] = useState<Speaker[]>([]);
    const [latestFeedback, setLatestFeedback] = useState<FeedbackData | null>(null);
    const [selectedLabel, setSelectedLabel] = useState<string>("Latest interview");
    const [loading, setLoading] = useState(true);

    if (!user) {
        navigate("/login");
    }

    const fetchInterviewData = async () => {
        try {
            const response = await api.get<RecentInterviewResponse>("/api/interview/getRecentInterview");
            setRecentInterviews(response.data.recentInterviews);
            setLatestInterviewChat(response.data.latestInterview ? JSON.parse(response.data.latestInterview.chat) : []);
            setLatestFeedback(response.data.latestInterview?.feedback ? JSON.parse(response.data.latestInterview.feedback) : null);
            setSelectedLabel("Latest interview");
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    const onSelectInterview = async (interview: { id: number; institution: string; typeofinterview: string }) => {
        try {
            const response = await api.get<{ interview: { chat: string; feedback: string | null } | null }>(
                `/api/interview/interviewDetail/${interview.id}`,
            );
            const data = response.data.interview;
            setLatestInterviewChat(data ? JSON.parse(data.chat) : []);
            setLatestFeedback(data?.feedback ? JSON.parse(data.feedback) : null);
            setSelectedLabel(`${interview.institution} — ${interview.typeofinterview}`);
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        fetchInterviewData();
    }, []);

    const stats = useMemo(() => {
        const scores = recentInterviews.map((i) => i.score).filter((s) => typeof s === "number");
        const total = recentInterviews.length;
        const average = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
        const best = scores.length ? Math.max(...scores) : null;
        const streak = computeStreak(recentInterviews);
        return { total, average, best, streak };
    }, [recentInterviews]);

    const statCards = [
        { label: "Sessions completed", value: stats.total || "—", icon: ListChecks },
        { label: "Average score", value: stats.average !== null ? stats.average.toFixed(1) : "—", icon: TrendingUp },
        { label: "Best score", value: stats.best !== null ? stats.best : "—", icon: Trophy },
        { label: "Day streak", value: stats.streak, icon: Flame },
    ];

    return (
        <div className="min-h-screen w-full bg-slate-50 text-slate-900">
            {/* Top bar */}
            <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-indigo-600" />
                        <span className="font-semibold tracking-tight text-slate-900">MockMate</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="hidden sm:inline text-sm text-slate-500">{user?.email}</span>
                        <Button
                            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg h-10 px-4 gap-2"
                            onClick={() => navigate("/intake")}
                        >
                            <Plus className="w-4 h-4" />
                            New interview
                        </Button>
                        <Button
                            variant="ghost"
                            className="rounded-lg h-10 w-10 p-0 text-slate-500 hover:text-slate-900"
                            onClick={() => logout()}
                            aria-label="Log out"
                        >
                            <LogOut className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-10">
                <div className="mb-8">
                    <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900">Welcome back</h1>
                    <p className="text-slate-500 mt-1">Here's how your practice is going.</p>
                </div>

                {/* Stat cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {statCards.map(({ label, value, icon: Icon }) => (
                        <div key={label} className="bg-white rounded-2xl border border-slate-200 p-5">
                            <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center mb-3">
                                <Icon className="w-4 h-4 text-indigo-600" />
                            </div>
                            <p className="text-2xl font-semibold tracking-tight text-slate-900">{value}</p>
                            <p className="text-sm text-slate-500 mt-0.5">{label}</p>
                        </div>
                    ))}
                </div>

                {!loading && recentInterviews.length === 0 ? (
                    /* Empty state */
                    <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
                        <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mx-auto mb-4">
                            <Plus className="w-5 h-5 text-indigo-600" />
                        </div>
                        <h2 className="text-lg font-semibold text-slate-900">Run your first mock interview</h2>
                        <p className="text-slate-500 mt-1 max-w-sm mx-auto">
                            Tell us the role and company, and we'll run a live practice session and score it against STAR.
                        </p>
                        <Button
                            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg h-10 px-5 mt-6"
                            onClick={() => navigate("/intake")}
                        >
                            Start now
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main column */}
                        <div className="lg:col-span-2 flex flex-col gap-6">
                            <div className="bg-white rounded-2xl border border-slate-200 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-semibold text-slate-900">Performance over time</h2>
                                    <span className="text-xs text-slate-400 font-mono uppercase tracking-wide">Scored 1–10</span>
                                </div>
                                <Graph interviews={recentInterviews} />
                            </div>

                            <div className="bg-white rounded-2xl border border-slate-200 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-semibold text-slate-900">{selectedLabel}</h2>
                                    <span className="text-xs text-slate-400 font-mono uppercase tracking-wide">Debrief</span>
                                </div>
                                <FeedbackCarousel feedback={latestFeedback} />
                            </div>

                            <div className="bg-white rounded-2xl border border-slate-200 p-6">
                                <h2 className="text-lg font-semibold text-slate-900 mb-4">Transcript</h2>
                                <ChatToView interviewer={undefined} chatLog={latestInterviewChat} />
                            </div>
                        </div>

                        {/* Side column */}
                        <div className="flex flex-col gap-6">
                            <div className="bg-white rounded-2xl border border-slate-200 p-6">
                                <h2 className="text-sm font-medium text-slate-500 mb-3">Search sessions</h2>
                                <InterviewSearch onSelect={onSelectInterview} />
                            </div>

                            <div className="bg-white rounded-2xl border border-slate-200 p-6">
                                <h2 className="text-sm font-medium text-slate-500 mb-3">Recent sessions</h2>
                                <div className="flex flex-col divide-y divide-slate-100">
                                    {recentInterviews.slice(0, 6).map((interview) => (
                                        <button
                                            key={interview.id}
                                            onClick={() => onSelectInterview(interview)}
                                            className="flex items-center justify-between gap-3 py-3 text-left group"
                                        >
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-slate-900 truncate">{interview.institution}</p>
                                                <p className="text-xs text-slate-500 truncate">{interview.typeofinterview}</p>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <span className="text-xs font-mono text-slate-500">{interview.score}/10</span>
                                                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500" />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Home;