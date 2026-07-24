import { useEffect, useRef, useState } from "react";
import { ChatLogProps } from "@/utils/types";
import Message from "./Message";
import { useAppSelector } from "@/redux/store";
import Waveform from "./Waveform";

const Chat = ({
  interviewer,
  isConnected,
  handleRecord,
  onDoneSpeaking,
  canSubmitAnswer,
  micPaused,
}: ChatLogProps) => {
  const { chatLog, currentSpeaker } = useAppSelector((state) => state.chatLog);
  const interviewerName = interviewer?.name.split("(")[0];
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatLog]);

  const handleScroll = () => {
    if (chatContainerRef.current) {
      setScrollTop(chatContainerRef.current.scrollTop);
    }
  };

  return (
    <div className="w-1/4 h-full flex flex-col justify-center">
      <div
        className="relative w-full h-2/3 flex flex-col  overflow-y-scroll mb-4 hide-scrollbar"
        ref={chatContainerRef}
        onScroll={handleScroll}
      >
        <div className="mt-auto" />

        <div
          className={`absolute left-0 w-full h-1/3 bg-gradient-to-b from-[var(--mm-ink)]/90 to-[var(--mm-ink)]/5 z-50`}
          style={{
            top: scrollTop - 20,
          }}
        />

        {chatLog.map((person, i) => (
          <Message person={person} interviewerName={interviewerName} key={i} />
        ))}
        <Message person={currentSpeaker} interviewerName={interviewerName} />

        <div ref={chatEndRef} />
      </div>

      {isConnected && (
        <button
          type="button"
          disabled={!canSubmitAnswer}
          onClick={onDoneSpeaking}
          className={`w-full h-14 mb-3 border flex items-center justify-center gap-3 transition-colors mm-font-mono text-xs uppercase tracking-widest ${
            canSubmitAnswer
              ? "bg-[var(--mm-signal)] border-[var(--mm-signal)] text-[var(--mm-ink)] cursor-pointer hover:opacity-90"
              : "bg-[var(--mm-ink-soft)] border-[var(--mm-ink-line)] text-[var(--mm-slate)] cursor-not-allowed opacity-60"
          }`}
        >
          {micPaused
            ? "Waiting for interviewer…"
            : canSubmitAnswer
              ? "Done speaking"
              : "Speak to enable Done"}
        </button>
      )}

      <div
        className="w-full h-14 bg-[var(--mm-ink-soft)] border border-[var(--mm-ink-line)] hover:border-[var(--mm-signal)] transition-colors flex items-center justify-center gap-3 cursor-pointer"
        onClick={handleRecord}
      >
        <Waveform
          live={isConnected && !micPaused}
          bars={10}
          className={
            isConnected && !micPaused
              ? "text-[var(--mm-signal)] h-4"
              : "text-[var(--mm-slate)] h-4"
          }
        />
        <p className="pointer-events-none mm-font-mono text-xs uppercase tracking-widest text-[var(--mm-paper)]">
          {isConnected ? "Finished? Click to end" : "Start the interview"}
        </p>
      </div>
    </div>
  );
};

export default Chat;
