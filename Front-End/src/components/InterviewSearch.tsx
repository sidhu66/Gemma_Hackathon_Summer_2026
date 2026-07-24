import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import api from "@/lib/axios";
import debounce from "lodash/debounce";

export type SidebarInterview = {
    id: number;
    institution: string;
    typeofinterview: string;
    score: number;
    interview_date: string;
};

type InterviewSearchProps = {
    onSelect: (interview: SidebarInterview) => void;
};

const InterviewSearch = ({ onSelect }: InterviewSearchProps) => {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SidebarInterview[]>([]);

    const fetchInterviews = async (searchQuery: string) => {
        try {
            const response = await api.get<{ results: SidebarInterview[] }>(
                `/api/interview/searchInterviews?q=${encodeURIComponent(searchQuery)}`
            );
            setResults(response.data.results);
        } catch (err) {
            console.log(err);
            setResults([]);
        }
    };

    const debouncedFetchInterviews = useCallback(
        debounce((searchQuery: string) => {
            fetchInterviews(searchQuery);
        }, 300),
        []
    );

    useEffect(() => {
        if (query) {
            debouncedFetchInterviews(query);
        } else {
            setResults([]);
        }
        return () => {
            debouncedFetchInterviews.cancel();
        };
    }, [query, debouncedFetchInterviews]);

    const handleSelect = (interview: SidebarInterview) => {
        setQuery("");
        setResults([]);
        onSelect(interview);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    return (
        <div className="relative w-full">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                    placeholder="Search by company…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-9 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-lg h-10 focus-visible:ring-indigo-500"
                />
            </div>

            {results.length > 0 && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden max-h-[240px] overflow-y-auto">
                    {results.map((interview) => (
                        <div
                            key={interview.id}
                            onClick={() => handleSelect(interview)}
                            className="w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0 cursor-pointer"
                        >
                            <div className="flex items-center justify-between gap-2">
                                <div className="min-w-0">
                                    <p className="text-slate-900 text-sm font-medium truncate">{interview.institution}</p>
                                    <p className="text-slate-500 text-xs truncate">
                                        {interview.typeofinterview} · {formatDate(interview.interview_date)}
                                    </p>
                                </div>
                                <span className="text-indigo-600 text-sm font-semibold font-mono shrink-0">
                                    {interview.score}/10
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default InterviewSearch;
