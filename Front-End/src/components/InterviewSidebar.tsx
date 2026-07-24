import { ChevronRight } from "lucide-react";
import InterviewSearch, { SidebarInterview } from "@/components/InterviewSearch";

export type { SidebarInterview };

type InterviewSidebarProps = {
  interviews: SidebarInterview[];
  selectedId: number | null;
  onSelect: (interview: SidebarInterview) => void;
  loading?: boolean;
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const InterviewSidebar = ({
  interviews,
  selectedId,
  onSelect,
  loading = false,
}: InterviewSidebarProps) => {
  return (
    <aside className="w-full h-full flex flex-col bg-white border-r border-slate-200">
      <div className="px-5 pt-6 pb-4 border-b border-slate-100">
        <h2 className="text-sm font-semibold tracking-tight text-slate-900">
          Previous interviews
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Select a session to view its debrief
        </p>
        <div className="mt-4">
          <InterviewSearch onSelect={onSelect} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2">
        {loading ? (
          <p className="px-3 py-4 text-sm text-slate-400">Loading sessions…</p>
        ) : interviews.length === 0 ? (
          <p className="px-3 py-4 text-sm text-slate-400">
            No scored interviews yet.
          </p>
        ) : (
          <ul className="flex flex-col gap-0.5">
            {interviews.map((interview) => {
              const isSelected = selectedId === interview.id;
              return (
                <li key={interview.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(interview)}
                    className={`w-full flex items-center justify-between gap-2 rounded-xl px-3 py-3 text-left transition-colors ${
                      isSelected
                        ? "bg-indigo-50 text-indigo-900"
                        : "hover:bg-slate-50 text-slate-900"
                    }`}
                  >
                    <div className="min-w-0">
                      <p
                        className={`text-sm font-medium truncate ${
                          isSelected ? "text-indigo-900" : "text-slate-900"
                        }`}
                      >
                        {interview.institution}
                      </p>
                      <p
                        className={`text-xs truncate ${
                          isSelected ? "text-indigo-600/80" : "text-slate-500"
                        }`}
                      >
                        {interview.typeofinterview}
                      </p>
                      <p
                        className={`text-[11px] mt-0.5 ${
                          isSelected ? "text-indigo-500/70" : "text-slate-400"
                        }`}
                      >
                        {formatDate(interview.interview_date)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className={`text-xs font-mono ${
                          isSelected ? "text-indigo-700" : "text-slate-500"
                        }`}
                      >
                        {interview.score}/10
                      </span>
                      <ChevronRight
                        className={`w-4 h-4 ${
                          isSelected ? "text-indigo-400" : "text-slate-300"
                        }`}
                      />
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
};

export default InterviewSidebar;
