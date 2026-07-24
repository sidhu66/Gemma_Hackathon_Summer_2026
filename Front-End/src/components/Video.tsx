import { videoProps } from "@/utils/types";
import { useEffect } from "react";
import { BiMicrophone, BiMicrophoneOff } from "react-icons/bi";

const Video = ({ videoRef, stopVideo, startVideo, isRecording }: videoProps) => {
    useEffect(() => {
        startVideo();
        return () => {
            stopVideo();
        };
    }, []);

    return (
        <div className="flex items-end justify-center h-full">
            <div className="relative w-[300px] h-[180px] border border-[var(--mm-ink-line)]">
                <video
                    className="w-full h-full object-cover overflow-hidden max-h-[87vh]"
                    ref={videoRef}
                    autoPlay
                    playsInline
                />
                <div className="absolute right-0 bottom-0 h-9 px-3 bg-[var(--mm-ink)]/85 border-t border-l border-[var(--mm-ink-line)] z-20 flex flex-row items-center gap-2">
                    {isRecording ? (
                        <BiMicrophone className="scale-110 text-[var(--mm-signal)] text-[14px]" />
                    ) : (
                        <BiMicrophoneOff className="scale-110 text-[var(--mm-slate)] text-[14px]" />
                    )}
                    <p className="mm-font-mono text-xs uppercase tracking-widest text-[var(--mm-paper)]">You</p>
                </div>
            </div>
        </div>
    );
};

export default Video;