import { useAppSelector } from "@/redux/store";
import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MeetingState, UseWebSocketHook } from "@/utils/types";
import useWebSocket from "@/hooks/useWebSocket";
import useAudioQueue from "@/hooks/useAudioQueue";
import { useAppDispatch } from "@/redux/store";
import MeetingOptions from "@/components/MeetingOptions";
import Chat from "@/components/Chat";
import Video from "@/components/Video";
import useVideo from "@/hooks/useVideo";
import { clearQueue } from "@/redux/features/audioQueueSlice";
import { clearChatLog, resetSpeaker } from "@/redux/features/chatLogSlice";
import { handleWebSocketThunk } from "@/redux/features/chatLogThunk";
import { convertTextToSpeech } from "@/utils/convertTextToSpeech";
import AiCircle from "@/components/AiCircle";
import api from "@/lib/axios";
import Waveform from "@/components/Waveform";
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

export default function Meeting(): JSX.Element {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as MeetingState;
  const { currentSpeaker, chatLog } = useAppSelector((state) => state.chatLog);
  const user = useAppSelector((state) => state.user.user);
  const dispatch = useAppDispatch();
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const microphoneRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [killSocket, setKillSocket] = useState(false);

  const { currentAudio, setCurrentAudio } = useAudioQueue(setKillSocket);

  const handleWebSocketMessage = async (data: any) => {
    if (data.chunk && state.interviewer) {
      await convertTextToSpeech(data, dispatch, state.interviewer.model);
    }
    dispatch(handleWebSocketThunk(data));
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
  );
  const { videoRef, stopVideo, startVideo, isVideoOn } = useVideo();

  const toggleMute = () => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsRecording((prevState) => !prevState);
    }
  };

  const handleRecord = () => {
    if (isConnected) {
      setKillSocket(true);
    } else {
      connect(import.meta.env.VITE_WEBSOCKET_URL);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate("/");
    } else if (!state?.fromIntake) {
      navigate("/home");
    }
  }, [user, state?.fromIntake]);

  useEffect(() => {
    if ((currentAudio && isRecording) || (!currentAudio && !isRecording)) {
      toggleMute();
    }
  }, [currentAudio, currentSpeaker]);

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
    };
  }, [killSocket]);

  return (
    <div className="h-[100vh] w-[100vw] absolute top-0 left-0 z-10 bg-[var(--mm-ink)] text-[var(--mm-paper)]">
      <div className="w-full h-16 flex flex-row justify-between items-center px-8 border-b border-[var(--mm-ink-line)]">
        <div className="flex items-center gap-2">
          <Waveform
            live={isConnected}
            bars={12}
            className={isConnected ? "text-[var(--mm-signal)] h-4" : "text-[var(--mm-slate)] h-4"}
          />
          <p className="mm-font-mono text-sm tracking-widest uppercase text-[var(--mm-paper)]">MockMate</p>
        </div>
        <span className="mm-font-mono text-xs text-[var(--mm-slate)]">
          {isConnected ? "Recording session…" : "Not connected"}
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
        {/* <MeetingOptions isConnected={isConnected} handleRecord={handleRecord} stopVideo={stopVideo} startVideo={startVideo} isVideoOn={isVideoOn} isRecording={isRecording} toggleMute={toggleMute} currentSpeaker={currentSpeaker} /> */}
        <Chat
          interviewer={state?.interviewer}
          isConnected={isConnected}
          handleRecord={handleRecord}
        />
      </div>
    </div>
  );
}