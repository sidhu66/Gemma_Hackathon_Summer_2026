import { RxCross2 } from "react-icons/rx";
import { FaMicrophone, FaMicrophoneSlash, FaPlay } from "react-icons/fa";
import { BsCameraVideoFill, BsCameraVideoOffFill} from "react-icons/bs";
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


const MeetingOptions = ({isConnected, handleRecord, stopVideo, startVideo, isVideoOn, isRecording, toggleMute, currentSpeaker}: MeetingOptionsProps) =>{
    const handleOnClick = () =>{
        if(currentSpeaker.speaker != "Gemini"){
            toggleMute();
        }
    }
    return(
        <div className="col-span-2 flex items-center justify-center border-t border-[var(--mm-ink-line)]">
            <div className="w-[300px] h-[70%] flex items-center justify-evenly">
                <Button variant="outline" size="icon" className="rounded-none w-14 h-14 bg-[var(--mm-ink-soft)] border-[var(--mm-ink-line)] hover:border-[var(--mm-signal)]" onClick={handleOnClick}>
                    {isRecording ? <FaMicrophone className="scale-[1.3] text-[var(--mm-paper)]"/> : <FaMicrophoneSlash className="scale-[1.3] text-[var(--mm-slate)]"/>}
                </Button>

                <Button variant="outline" size="icon" className="rounded-none w-14 h-14 border-[var(--mm-signal)] border-2 bg-[var(--mm-ink)] hover:bg-[var(--mm-signal)] text-[var(--mm-signal)] hover:text-[var(--mm-ink)]" onClick={handleRecord}>
                    {isConnected ? <RxCross2 className="scale-[1.6]"/> : <FaPlay className="scale-[1.2]"/>}
                </Button>

                <Button variant="outline" size="icon" className="rounded-none w-14 h-14 bg-[var(--mm-ink-soft)] border-[var(--mm-ink-line)] hover:border-[var(--mm-signal)]" onClick={isVideoOn ? stopVideo : startVideo}>
                    {isVideoOn ?  <BsCameraVideoFill className="scale-[1.2] text-[var(--mm-paper)]"/> : <BsCameraVideoOffFill className="scale-[1.2] text-[var(--mm-slate)]"/>}
                </Button>
            </div>
        </div>
    )
}

export default MeetingOptions;