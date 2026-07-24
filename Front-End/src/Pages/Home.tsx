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
import InterviewSidebar, { SidebarInterview } from "@/components/InterviewSidebar";
import {
    Plus,
    LogOut,
    Trophy,
    Flame,
    TrendingUp,
    ListChecks,
    PanelLeft,
} from "lucide-react";

type RecentInterviewResponse = {
    recentInterviews: SidebarInterview[];
    latestInterview: {
        chat: string;
        feedback: string | null;
    } | null;
};

/** Consecutive-day practice streak, counting back from the most recent session. */
const computeStreak = (interviews: SidebarInterview[]): number => {
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
    const [recentInterviews, setRecentInterviews] = useState<SidebarInterview[]>([]);
    const [latestInterviewChat, setLatestInterviewChat] = useState<Speaker[]>([]);
    const [latestFeedback, setLatestFeedback] = useState<FeedbackData | null>(null);
    const [selectedLabel, setSelectedLabel] = useState<string>("Latest interview");
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    if (!user) {
        navigate("/login");
    }

    const fetchInterviewData = async () => {
        try {
            const response = await api.get<RecentInterviewResponse>("/api/interview/getRecentInterview");
            const interviews = response.data.recentInterviews;
            setRecentInterviews(interviews);
            setLatestInterviewChat(response.data.latestInterview ? JSON.parse(response.data.latestInterview.chat) : []);
            setLatestFeedback(response.data.latestInterview?.feedback ? JSON.parse(response.data.latestInterview.feedback) : null);
            if (interviews.length > 0) {
                setSelectedId(interviews[0].id);
                setSelectedLabel(`${interviews[0].institution} — ${interviews[0].typeofinterview}`);
            } else {
                setSelectedId(null);
                setSelectedLabel("Latest interview");
            }
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    const onSelectInterview = async (interview: SidebarInterview) => {
        setSelectedId(interview.id);
        setSelectedLabel(`${interview.institution} — ${interview.typeofinterview}`);
        try {
            const response = await api.get<{ interview: { chat: string; feedback: string | null } | null }>(
                `/api/interview/interviewDetail/${interview.id}`,
            );
            const data = response.data.interview;
            setLatestInterviewChat(data ? JSON.parse(data.chat) : []);
            setLatestFeedback(data?.feedback ? JSON.parse(data.feedback) : null);
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
        <div className="min-h-screen w-full bg-slate-50 text-slate-900 flex flex-col">
            <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur">
                <div className="px-4 sm:px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            className="rounded-lg h-10 w-10 p-0 text-slate-500 hover:text-slate-900 lg:hidden"
                            onClick={() => setSidebarOpen((open) => !open)}
                            aria-label="Toggle interview sidebar"
                        >
                            <PanelLeft className="w-4 h-4" />
                        </Button>
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-indigo-600" />
                            <span className="font-semibold tracking-tight text-slate-900">MockMate</span>
                        </div>
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

            <div className="flex-1 flex min-h-0">
                {/* Desktop sidebar */}
                <div className="hidden lg:block w-80 shrink-0 sticky top-[73px] h-[calc(100vh-73px)]">
                    <InterviewSidebar
                        interviews={recentInterviews}
                        selectedId={selectedId}
                        onSelect={onSelectInterview}
                        loading={loading}
                    />
                </div>

                {/* Mobile sidebar drawer */}
                {sidebarOpen && (
                    <div className="lg:hidden fixed inset-0 z-30 flex">
                        <div
                            className="absolute inset-0 bg-slate-900/40"
                            onClick={() => setSidebarOpen(false)}
                        />
                        <div className="relative w-80 max-w-[85vw] h-full shadow-xl">
                            <InterviewSidebar
                                interviews={recentInterviews}
                                selectedId={selectedId}
                                onSelect={(interview) => {
                                    onSelectInterview(interview);
                                    setSidebarOpen(false);
                                }}
                                loading={loading}
                            />
                        </div>
                    </div>
                )}

                <main className="flex-1 min-w-0 overflow-y-auto px-4 sm:px-8 lg:px-10 py-8">
                    <div className="w-full max-w-7xl mx-auto">
                        <div className="mb-8">
                            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900">Welcome back</h1>
                            <p className="text-slate-500 mt-1">Here's how your practice is going.</p>
                        </div>

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
                            <div className="flex flex-col gap-6">
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
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Home;
