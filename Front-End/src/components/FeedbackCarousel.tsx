import { useState } from "react";
import { FeedbackData } from "@/utils/types";
import { ChevronLeft, ChevronRight } from "lucide-react";

type FeedbackCarouselProps = {
    feedback: FeedbackData | null;
};

const starKeys = ["situation", "task", "action", "result"] as const;

type CarouselCard =
    | { type: "summary" }
    | { type: "star"; starKey: typeof starKeys[number] }
    | { type: "section"; index: number }
    | { type: "mockAnswer" }
    | { type: "suggestions" };

/** Normalize suggestions whether the API returns a string[] or a single string/object. */
const normalizeSuggestions = (suggestions: unknown): string[] => {
    if (Array.isArray(suggestions)) {
        return suggestions.map((s) => (typeof s === "string" ? s : String(s))).filter(Boolean);
    }
    if (typeof suggestions === "string" && suggestions.trim()) {
        return [suggestions.trim()];
    }
    if (suggestions && typeof suggestions === "object") {
        return Object.values(suggestions)
            .map((s) => (typeof s === "string" ? s : String(s)))
            .filter(Boolean);
    }
    return [];
};

const buildCards = (feedback: FeedbackData): CarouselCard[] => {
    const cards: CarouselCard[] = [{ type: "summary" }];

    const availableStarKeys = starKeys.filter((k) => feedback.star?.[k]);
    if (availableStarKeys.length > 0) {
        cards.push(...availableStarKeys.map((k) => ({ type: "star" as const, starKey: k })));
    } else if (Array.isArray(feedback.sections) && feedback.sections.length > 0) {
        cards.push(...feedback.sections.map((_, index) => ({ type: "section" as const, index })));
    }

    if (feedback.mockAnswer) {
        cards.push({ type: "mockAnswer" });
    }
    if (normalizeSuggestions(feedback.suggestions).length > 0) {
        cards.push({ type: "suggestions" });
    }

    return cards;
};

const cardStyle = "bg-[var(--mm-ink)] rounded-none p-5 border border-[var(--mm-ink-line)]";

const toDisplayText = (value: unknown): string => {
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

const FeedbackCarousel = ({ feedback }: FeedbackCarouselProps) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [animating, setAnimating] = useState(false);

    if (!feedback) {
        return <p className="text-[var(--mm-slate)] text-sm mt-4 mm-font-mono">No feedback available yet.</p>;
    }

    const cards = buildCards(feedback);
    const total = cards.length;

    const goTo = (newIndex: number) => {
        if (newIndex === activeIndex) return;
        setAnimating(true);
        setTimeout(() => {
            setActiveIndex(newIndex);
            setAnimating(false);
        }, 150);
    };

    const prev = () => goTo(activeIndex === 0 ? total - 1 : activeIndex - 1);
    const next = () => goTo(activeIndex === total - 1 ? 0 : activeIndex + 1);

    const current = cards[activeIndex];

    const renderCard = () => {
        switch (current.type) {
            case "summary":
                return (
                    <div className={cardStyle}>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 rounded-full bg-[var(--mm-signal-dim)] border border-[var(--mm-signal)]/50 flex items-center justify-center">
                                <span className="mm-font-display text-xl text-[var(--mm-signal)]">{feedback.grade}</span>
                            </div>
                            <div>
                                <p className="text-xs text-[var(--mm-signal)] uppercase tracking-wider mm-font-mono font-semibold">Overall Grade</p>
                                <p className="text-[var(--mm-paper)] text-sm font-medium">{feedback.grade}/10</p>
                            </div>
                        </div>
                        <p className="text-[var(--mm-slate)] text-sm leading-relaxed">{toDisplayText(feedback.summary)}</p>
                    </div>
                );

            case "star": {
                const cat = feedback.star?.[current.starKey];
                if (!cat) {
                    return (
                        <div className={cardStyle}>
                            <p className="text-gray-400 text-sm">No {current.starKey} feedback available.</p>
                        </div>
                    );
                }
                return (
                    <div className={cardStyle}>
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-[var(--mm-paper)] mm-font-mono text-xs uppercase tracking-widest">{current.starKey}</h4>
                            <span className="text-[var(--mm-signal)] text-sm font-bold mm-font-mono">{cat.score}/10</span>
                        </div>
                        {cat.issues?.length > 0 && (
                            <div className="mb-2">
                                <p className="text-xs text-[var(--mm-red)] uppercase tracking-wider mm-font-mono font-semibold mb-1">Issues</p>
                                <ul className="text-[var(--mm-slate)] text-sm space-y-0.5 list-disc list-inside">
                                    {cat.issues.map((issue: string, i: number) => <li key={i}>{issue}</li>)}
                                </ul>
                            </div>
                        )}
                        {cat.improvements?.length > 0 && (
                            <div>
                                <p className="text-xs text-[var(--mm-teal)] uppercase tracking-wider mm-font-mono font-semibold mb-1">Improvements</p>
                                <ul className="text-[var(--mm-slate)] text-sm space-y-0.5 list-disc list-inside">
                                    {cat.improvements.map((tip: string, i: number) => <li key={i}>{tip}</li>)}
                                </ul>
                            </div>
                        )}
                    </div>
                );
            }

            case "section": {
                const section = feedback.sections?.[current.index];
                if (!section) {
                    return (
                        <div className={cardStyle}>
                            <p className="text-gray-400 text-sm">No section feedback available.</p>
                        </div>
                    );
                }
                return (
                    <div className={cardStyle}>
                        <h4 className="text-indigo-200 font-semibold mb-2 text-base">{section.title}</h4>
                        <p className="text-gray-200 text-sm leading-relaxed">{section.content}</p>
                    </div>
                );
            }

            case "mockAnswer":
                return (
                    <div className={cardStyle}>
                        <h4 className="text-[var(--mm-paper)] mm-font-mono text-xs uppercase tracking-widest mb-2">Mock Answer</h4>
                        <p className="text-[var(--mm-slate)] text-sm leading-relaxed">{toDisplayText(feedback.mockAnswer)}</p>
                    </div>
                );

            case "suggestions": {
                const suggestions = normalizeSuggestions(feedback.suggestions);
                return (
                    <div className={cardStyle}>
                        <h4 className="text-[var(--mm-paper)] mm-font-mono text-xs uppercase tracking-widest mb-2">Suggestions</h4>
                        <ul className="text-[var(--mm-slate)] text-sm space-y-1 list-disc list-inside">
                            {suggestions.map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                    </div>
                );
            }
        }
    };

    return (
        <div className="mt-4 flex flex-col items-center gap-4">
            <div className="relative w-full min-h-[180px] flex items-center justify-center">
                {/* Left Arrow */}
                <button
                    onClick={prev}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-1 border border-[var(--mm-ink-line)] hover:border-[var(--mm-signal)] transition-colors"
                >
                    <ChevronLeft className="w-5 h-5 text-[var(--mm-paper)]" />
                </button>

                {/* Card */}
                <div
                    className={`w-[85%] transition-all duration-150 ${
                        animating ? "opacity-0 scale-95 translate-y-1" : "opacity-100 scale-100 translate-y-0"
                    }`}
                >
                    {renderCard()}
                </div>

                {/* Right Arrow */}
                <button
                    onClick={next}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-1 border border-[var(--mm-ink-line)] hover:border-[var(--mm-signal)] transition-colors"
                >
                    <ChevronRight className="w-5 h-5 text-[var(--mm-paper)]" />
                </button>
            </div>

            {/* Dots */}
            <div className="flex gap-2">
                {cards.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => goTo(i)}
                        className={`h-1.5 rounded-none transition-all ${
                            i === activeIndex ? "bg-[var(--mm-signal)] w-6" : "bg-[var(--mm-ink-line)] w-1.5"
                        }`}
                    />
                ))}
            </div>
        </div>
    );
};

export default FeedbackCarousel;