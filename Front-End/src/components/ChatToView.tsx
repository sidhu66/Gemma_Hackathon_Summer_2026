import { ViewChatLogProps } from "@/utils/types";
import Message from "./Message";

const ChatToView = ({interviewer, chatLog}: ViewChatLogProps) =>{
    const interviewerName = interviewer?.name.split("(")[0];


    return (
        <div className="w-full h-full flex flex-col justify-center">
            <div
                className="relative w-full h-fit max-h-[300px] flex flex-col overflow-y-scroll mb-2 hide-scrollbar"
            >
                <div className="mt-auto" />

                {chatLog?.map((person, i) => <Message person={person} interviewerName={interviewerName} key={i} />)}

                <div />
            </div>
        </div>
    )
}

export default ChatToView;