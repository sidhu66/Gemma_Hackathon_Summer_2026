import { Speaker } from "@/utils/types";

const Message = ({ person, interviewerName }: {person: Speaker, interviewerName: string | undefined}) =>{
    return(
        <>
            <div className={`relative w-full h-fit z-20 mb-4`}>
                <p className={`mm-font-mono text-xs uppercase tracking-widest mb-2 w-fit ${person.speaker == "Gemini" ? "text-[var(--mm-signal)]" : "text-[var(--mm-teal)]" }`}>
                    {person.speaker == "Gemini" ? (interviewerName || "Interviewer") : "You"}
                </p>
                <p className="relative text-sm text-left w-full text-[var(--mm-paper)] leading-relaxed">
                {person.text}
                </p>
            </div>
        </>

    )
}

export default Message;