import { Mic, MicOff, Video as VideoIcon, VideoOff, X, Play } from "lucide-react";
import { Button } from "./ui/button";
import { Speaker } from "@/utils/types";

type MeetingOptionsProps = {
    isConnected: boolean,
    handleRecord: () => void,
    stopVideo: () => void,
    startVideo: () => void,
    isVideoOn: boolean,
    isRecording: boolean,
    toggleMute: () => void,
    currentSpeaker: Speaker
}

const MeetingOptions = ({ isConnected, handleRecord, stopVideo, startVideo, isVideoOn, isRecording, toggleMute, currentSpeaker }: MeetingOptionsProps) => {
    const handleOnClick = () => {
        if (currentSpeaker.speaker != "Gemini") {
            toggleMute();
        }
    }
    return (
        <div className="col-span-2 flex items-center justify-center border-t border-[var(--mm-ink-line)] pt-4">
            <div className="w-[280px] h-[70%] flex items-center justify-evenly">
                <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full w-14 h-14 bg-[var(--mm-ink-soft)] border-[var(--mm-ink-line)] hover:border-[var(--mm-signal)]"
                    onClick={handleOnClick}
                >
                    {isRecording ? <Mic className="w-5 h-5 text-[var(--mm-paper)]" /> : <MicOff className="w-5 h-5 text-[var(--mm-slate)]" />}
                </Button>

                <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full w-16 h-16 border-2 border-[var(--mm-signal)] bg-transparent hover:bg-[var(--mm-signal)] text-[var(--mm-signal)] hover:text-white transition-colors"
                    onClick={handleRecord}
                >
                    {isConnected ? <X className="w-6 h-6" /> : <Play className="w-5 h-5" />}
                </Button>

                <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full w-14 h-14 bg-[var(--mm-ink-soft)] border-[var(--mm-ink-line)] hover:border-[var(--mm-signal)]"
                    onClick={isVideoOn ? stopVideo : startVideo}
                >
                    {isVideoOn ? <VideoIcon className="w-5 h-5 text-[var(--mm-paper)]" /> : <VideoOff className="w-5 h-5 text-[var(--mm-slate)]" />}
                </Button>
            </div>
        </div>
    )
}

export default MeetingOptions;