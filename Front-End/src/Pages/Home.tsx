import { useAppSelector } from "@/redux/store";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Graph } from "../components/Graph";
import { Area } from "../components/Area";
import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { LogoutHook, useLogout } from "@/hooks/useLogout";
import { Speaker, FeedbackData } from "@/utils/types";
import ChatToView from "@/components/ChatToView";
import FeedbackCarousel from "@/components/FeedbackCarousel";
import InterviewSearch from "@/components/InterviewSearch";
import Waveform from "@/components/Waveform";


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

const Home = () => {
    const user = useAppSelector((state) => state.user.user);
    const navigate = useNavigate();
    const { logout }: LogoutHook = useLogout();
    const [recentInterviews, setRecentInterviews] = useState<RecentInterview[]>([]);
    const [latestInterviewChat, setLatestInterviewChat] = useState<Speaker[]>([]);
    const [latestFeedback, setLatestFeedback] = useState<FeedbackData | null>(null);
    const [selectedLabel, setSelectedLabel] = useState<string>("Latest Interview");

    if (!user) {
        navigate('/login');
    }

    const fetchInterviewData = async () =>{
        try{
            const response = await api.get<RecentInterviewResponse>("/api/interview/getRecentInterview");
            setRecentInterviews(response.data.recentInterviews);
            setLatestInterviewChat(response.data.latestInterview ? JSON.parse(response.data.latestInterview.chat) : []);
            setLatestFeedback(response.data.latestInterview?.feedback ? JSON.parse(response.data.latestInterview.feedback) : null);
            setSelectedLabel("Latest Interview");
        }catch(err){
            console.log(err);
        }
    }

    const onSelectInterview = async (interview: { id: number; institution: string; typeofinterview: string }) => {
        try {
            const response = await api.get<{ interview: { chat: string; feedback: string | null } | null }>(
                `/api/interview/interviewDetail/${interview.id}`
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
        fetchInterviewData()
    }, []);

    return (
        <div className="w-full min-h-screen bg-[var(--mm-ink)] text-[var(--mm-paper)] font-[var(--font-body)] px-6 md:px-12 py-8">

            {/* Ticket-stub header — perforated strip instead of a plain nav bar */}
            <div className="mm-ticket flex flex-col md:flex-row justify-between md:items-end gap-4 pb-6 mb-8">
                <div>
                    <h1 className="mm-font-display text-3xl md:text-4xl text-[var(--mm-paper)]">
                        Welcome back
                    </h1>
                    <p className="mm-font-mono text-sm text-[var(--mm-slate)] mt-1">{user?.email}</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="mm-eyebrow hidden md:inline">Ready when you are</span>
                    <Button className="mm-btn-primary rounded-none h-11 px-5" onClick={() => navigate("/intake")}>
                        Begin interview
                    </Button>
                    <Button className="mm-btn-ghost rounded-none h-11 px-5" onClick={() => logout()}>
                        Log out
                    </Button>
                </div>
            </div>

            {/* Asymmetric two-column bento — 8/4 split, unequal on purpose */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Left column — wide */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    <div className="mm-panel p-6">
                        <div className="flex items-center justify-between mb-1">
                            <h2 className="mm-font-display text-xl text-[var(--mm-paper)]">Recent performance</h2>
                            <span className="mm-eyebrow">Scored 1–10</span>
                        </div>
                        <Graph interviews={recentInterviews} />
                    </div>

                    <div className="mm-panel p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="mm-font-display text-xl text-[var(--mm-paper)]">{selectedLabel}</h2>
                            <span className="mm-eyebrow">Debrief</span>
                        </div>
                        <FeedbackCarousel feedback={latestFeedback} />
                    </div>
                </div>

                {/* Right column — narrow rail */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    <div className="mm-panel p-6">
                        <div className="flex items-center justify-between mb-1">
                            <h2 className="mm-font-display text-lg text-[var(--mm-paper)]">Average</h2>
                            <span className="mm-eyebrow">Scale 1–10</span>
                        </div>
                        <Area interviews={recentInterviews} />
                    </div>

                    <div className="mm-panel p-6">
                        <span className="mm-eyebrow block mb-3">Search</span>
                        <InterviewSearch onSelect={onSelectInterview} />
                    </div>
                </div>
            </div>

            {/* Transcript strip — receipt-style horizontal scroller, deliberately
                different texture from the boxed panels above */}
            <div className="mt-6 border border-dashed border-[var(--mm-ink-line)] p-5 bg-[var(--mm-ink-soft)]/40">
                <div className="flex items-center gap-2 mb-3">
                    <Waveform bars={12} className="text-[var(--mm-signal)] h-3" />
                    <span className="mm-eyebrow">Transcript</span>
                </div>
                <ChatToView interviewer={undefined} chatLog={latestInterviewChat} />
            </div>
        </div>
    )
}

export default Home;