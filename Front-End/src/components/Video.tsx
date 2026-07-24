import { videoProps } from "@/utils/types";
import { useEffect } from "react";
import { Mic, MicOff } from "lucide-react";

const Video = ({ videoRef, stopVideo, startVideo, isRecording }: videoProps) => {
    useEffect(() => {
        startVideo();
        return () => {
            stopVideo();
        };
    }, []);

    return (
        <div className="flex items-end justify-center h-full">
            <div className="relative w-[300px] h-[180px] rounded-2xl overflow-hidden border border-[var(--mm-ink-line)]">
                <video
                    className="w-full h-full object-cover overflow-hidden max-h-[87vh]"
                    ref={videoRef}
                    autoPlay
                    playsInline
                />
                <div className="absolute right-2 bottom-2 h-8 px-3 rounded-full bg-[var(--mm-ink)]/85 border border-[var(--mm-ink-line)] z-20 flex flex-row items-center gap-2">
                    {isRecording ? (
                        <Mic className="w-3.5 h-3.5 text-[var(--mm-signal)]" />
                    ) : (
                        <MicOff className="w-3.5 h-3.5 text-[var(--mm-slate)]" />
                    )}
                    <p className="text-xs font-medium text-[var(--mm-paper)]">You</p>
                </div>
            </div>
        </div>
    );
};

export default Video;