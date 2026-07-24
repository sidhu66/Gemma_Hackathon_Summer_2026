import { AiCircleProps } from "@/utils/types";
import Waveform from "./Waveform";

const AiCircle = ({ interviewer, currentSpeaker }: AiCircleProps) => {
  const interviewerName = interviewer?.name.split("(")[0];
  const isSpeaking = currentSpeaker.speaker == "Gemini";

  return (
    <div className="h-full flex flex-col items-center justify-center gap-4">
      <div className="relative">
        {/* Outer ring */}
        <div
          className={`flex items-center justify-center w-48 h-48 rounded-full border-2 border-[var(--mm-signal)]/60 ${
            isSpeaking ? "animate-pulse" : ""
          }`}
          style={{
            background: "radial-gradient(circle, rgba(231,163,62,0.18) 0%, rgba(20,22,31,0) 70%)",
          }}
        />

        {/* Inner circle */}
        <div className="absolute inset-0 flex items-center justify-center w-36 h-36 m-auto rounded-full bg-[var(--mm-ink-soft)] border border-[var(--mm-ink-line)] shadow-xl">
          <p className="text-[var(--mm-paper)] mm-font-display text-2xl">{interviewerName}</p>
        </div>
      </div>
      <Waveform
        live={isSpeaking}
        bars={22}
        className={`h-6 ${isSpeaking ? "text-[var(--mm-signal)]" : "text-[var(--mm-slate)]"}`}
      />
    </div>
  );
};

export default AiCircle;