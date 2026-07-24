import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import api from "@/lib/axios";
import debounce from "lodash/debounce";

type SearchResult = {
    id: number;
    institution: string;
    typeofinterview: string;
    score: number;
    interview_date: string;
};

type InterviewSearchProps = {
    onSelect: (interview: SearchResult) => void;
};

const InterviewSearch = ({ onSelect }: InterviewSearchProps) => {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);

    const fetchInterviews = async (searchQuery: string) => {
        try {
            const response = await api.get<{ results: SearchResult[] }>(
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

    const handleSelect = (interview: SearchResult) => {
        setQuery(interview.institution);
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
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--mm-slate)]" />
                <Input
                    placeholder="Search by company name..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-9 bg-[var(--mm-ink)] border-[var(--mm-ink-line)] text-[var(--mm-paper)] placeholder:text-[var(--mm-slate)] rounded-none h-11 focus-visible:ring-[var(--mm-signal)]"
                />
            </div>

            {results.length > 0 && (
                <div className="absolute z-20 w-full mt-1 bg-[var(--mm-ink)] border border-[var(--mm-ink-line)] shadow-2xl overflow-hidden max-h-[240px] overflow-y-auto">
                    {results.map((interview) => (
                        <div
                            key={interview.id}
                            onClick={() => handleSelect(interview)}
                            className="w-full px-4 py-3 text-left bg-[var(--mm-ink)] hover:bg-[var(--mm-ink-soft)] transition-colors border-b border-[var(--mm-ink-line)] last:border-b-0 cursor-pointer"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[var(--mm-paper)] text-sm font-medium">{interview.institution}</p>
                                    <p className="text-[var(--mm-slate)] text-xs mm-font-mono">{interview.typeofinterview} &middot; {formatDate(interview.interview_date)}</p>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="text-[var(--mm-signal)] text-sm font-semibold mm-font-mono">{interview.score}</span>
                                    <span className="text-[var(--mm-slate)] text-xs">/10</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default InterviewSearch;