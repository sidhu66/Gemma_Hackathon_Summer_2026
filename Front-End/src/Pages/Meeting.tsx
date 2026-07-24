import { useAppSelector } from "@/redux/store";
import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MeetingState, UseWebSocketHook } from "@/utils/types";
import useWebSocket from "@/hooks/useWebSocket";
import useAudioQueue from "@/hooks/useAudioQueue";
import { useAppDispatch } from "@/redux/store";
import Chat from "@/components/Chat";
import Video from "@/components/Video";
import useVideo from "@/hooks/useVideo";
import { clearQueue } from "@/redux/features/audioQueueSlice";
import { clearChatLog, resetSpeaker, updateChatLog, updateSpeaker } from "@/redux/features/chatLogSlice";
import { handleWebSocketThunk } from "@/redux/features/chatLogThunk";
import { convertTextToSpeech } from "@/utils/convertTextToSpeech";
import AiCircle from "@/components/AiCircle";
import { PhoneOff } from "lucide-react";
/*
Custom hooks allow us to store stateful logic in them. This means each
hook has a independant section compared to every other
call of the same hook. If hooks do not use 
any other hooks declare them as a normal function.

PURE FUNCTIONS:
- make sure there is a complete understanding of the output based on the input
- if we want to mutate a variable it must be defined in the scope of the function
since each component renders asynchronously. Try to express logic with rendering alone
useEffect should be last option.
*/

const formatElapsed = (seconds: number) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};
import Waveform from "@/components/Waveform";

export default function Meeting(): JSX.Element {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as MeetingState;
  const { currentSpeaker, chatLog } = useAppSelector((state) => state.chatLog);
  const { audioQueue } = useAppSelector((state) => state.audioQueue);
  const user = useAppSelector((state) => state.user.user);
  const dispatch = useAppDispatch();
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const microphoneRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const micPausedRef = useRef(true);
  const userTurnActiveRef = useRef(false);
  const sentTurnReadyRef = useRef(false);
  const [micPaused, setMicPaused] = useState(true);
  const [awaitingAiResponse, setAwaitingAiResponse] = useState(false);
  const [killSocket, setKillSocket] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const { currentAudio, setCurrentAudio } = useAudioQueue(setKillSocket);

  const handleWebSocketMessage = async (data: any) => {
    if (data.type === "ai_response_complete") {
      setAwaitingAiResponse(false);
      return;
    }
    // Update chat / clear audio queue for a new AI turn before TTS enqueue
    await dispatch(handleWebSocketThunk(data));
    // Ignore late TTS after the user's turn has already started
    if (data.chunk && state.interviewer && !userTurnActiveRef.current) {
      await convertTextToSpeech(data, dispatch, state.interviewer.model);
    }
  };

  const {
    connect,
    disconnect,
    isConnected,
    socketRef,
    interviewId,
  }: UseWebSocketHook = useWebSocket(
    handleWebSocketMessage,
    microphoneRef,
    streamRef,
    setIsRecording,
    state,
    micPausedRef,
  );
  const { videoRef, stopVideo, startVideo } = useVideo();

  const beginAiTurn = () => {
    userTurnActiveRef.current = false;
    sentTurnReadyRef.current = false;
    setAwaitingAiResponse(true);
    micPausedRef.current = true;
    setMicPaused(true);
  };

  const handleRecord = () => {
    if (isConnected) {
      setKillSocket(true);
    } else {
      dispatch(clearQueue());
      dispatch(clearChatLog());
      dispatch(resetSpeaker());
      beginAiTurn();
      connect(import.meta.env.VITE_WEBSOCKET_URL);
    }
  };

  const confirmEndInterview = () => {
    setShowEndConfirm(false);
    if (isConnected) {
      setKillSocket(true);
    }
  };

  const onDoneSpeaking = () => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      return;
    }
    beginAiTurn();
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = false;
      });
    }
    setIsRecording(false);
    socketRef.current.send(JSON.stringify({ type: "user_finished_speaking" }));
  };

  const canSubmitAnswer =
    isConnected &&
    !micPaused &&
    currentSpeaker.speaker === "User" &&
    currentSpeaker.text.trim().length > 0;

  useEffect(() => {
    if (!user) {
      navigate("/");
    } else if (!state?.fromIntake) {
      navigate("/home");
    }
  }, [user, state?.fromIntake]);

  // Pause mic while awaiting AI text or while TTS is playing (including between chunks)
  useEffect(() => {
    const aiAudioPending =
      !userTurnActiveRef.current &&
      (currentAudio !== null || audioQueue.length > 0);

    const shouldPause =
      !isConnected || awaitingAiResponse || aiAudioPending;

    const wasPaused = micPausedRef.current;
    micPausedRef.current = shouldPause;
    setMicPaused(shouldPause);

    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !shouldPause;
      });
    }
    setIsRecording(isConnected && !shouldPause);

    // Enter user turn once when AI audio fully finished
    if (
      wasPaused &&
      !shouldPause &&
      isConnected &&
      !sentTurnReadyRef.current &&
      socketRef.current?.readyState === WebSocket.OPEN
    ) {
      sentTurnReadyRef.current = true;
      userTurnActiveRef.current = true;

      if (currentSpeaker.speaker === "Gemini" && currentSpeaker.text.trim()) {
        dispatch(updateChatLog());
      }
      dispatch(updateSpeaker({ speaker: "User", text: "" }));

      socketRef.current.send(JSON.stringify({ type: "user_turn_ready" }));
    }
  }, [awaitingAiResponse, currentAudio, audioQueue.length, isConnected]);

  // Session timer — purely cosmetic, doesn't affect connection state.
  useEffect(() => {
    if (!isConnected) return;
    const interval = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [isConnected]);

  useEffect(() => {
    if (killSocket) {
      navigate("/results", {
        state: {
          interviewId,
          state,
          fromMeeting: true,
        },
      });
    }
    return () => {
      setCurrentAudio((audio) => {
        if (audio) {
          audio.src = "";
        }
        return null;
      });
      if (microphoneRef.current) {
        microphoneRef.current.stop();
        microphoneRef.current = null;
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      if (isConnected) {
        socketRef.current?.send(
          JSON.stringify({
            type: "end_deepgram_session",
            chatLog: [...chatLog, currentSpeaker],
          }),
        );
        disconnect();
      }

      stopVideo();

      dispatch(clearQueue());
      dispatch(resetSpeaker());
      dispatch(clearChatLog());
      setIsRecording(false);
      setKillSocket(false);
      setCurrentAudio(null);
      setAwaitingAiResponse(false);
      micPausedRef.current = true;
      userTurnActiveRef.current = false;
      sentTurnReadyRef.current = false;
      setMicPaused(true);
      setElapsedSeconds(0);
    };
  }, [killSocket]);

  return (
    <div className="h-[100vh] w-[100vw] absolute top-0 left-0 z-10 bg-[var(--mm-ink)] text-[var(--mm-paper)]">
      <div className="w-full h-16 flex flex-row justify-between items-center px-8 border-b border-[var(--mm-ink-line)]">
        <div className="flex items-center gap-2">
          <Waveform
            live={isConnected && !micPaused}
            bars={12}
            className={isConnected && !micPaused ? "text-[var(--mm-signal)] h-4" : "text-[var(--mm-slate)] h-4"}
          />
          <p className="mm-font-mono text-sm tracking-widest uppercase text-[var(--mm-paper)]">CareerCoach</p>
        </div>
        <span className="mm-font-mono text-xs text-[var(--mm-slate)]">
          {!isConnected
            ? "Not connected"
            : micPaused
              ? awaitingAiResponse
                ? "Interviewer responding…"
                : "Interviewer speaking…"
              : "Your turn — speak, then tap Done"}
        </span>
      </div>

      <div className="w-full h-[calc(100vh-100px)] flex flex-row items-center justify-between px-10 py-6 pr-24">
        <Video
          videoRef={videoRef}
          stopVideo={stopVideo}
          startVideo={startVideo}
          isRecording={isRecording}
        />
        <AiCircle
          interviewer={state?.interviewer}
          currentSpeaker={currentSpeaker}
        />
        <Chat
          interviewer={state?.interviewer}
          isConnected={isConnected}
          handleRecord={handleRecord}
          onDoneSpeaking={onDoneSpeaking}
          canSubmitAnswer={canSubmitAnswer}
          micPaused={micPaused}
        />
      </div>

      {/* End-interview confirmation */}
      {showEndConfirm && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-white text-slate-900 rounded-2xl p-6 w-full max-w-sm">
            <h2 className="text-lg font-semibold">End this interview?</h2>
            <p className="text-sm text-slate-500 mt-1">
              We'll wrap up the session and take you straight to your debrief.
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowEndConfirm(false)}
                className="text-sm font-medium px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100"
              >
                Keep going
              </button>
              <button
                onClick={confirmEndInterview}
                className="text-sm font-medium px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                End interview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
