import { Ollama } from 'ollama';
import { randomUUID } from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

const ollama = new Ollama({
    host: process.env.OLLAMA_HOST || 'http://127.0.0.1:11434'
});
const model = process.env.OLLAMA_MODEL || 'gemma4:12b';

const buildIntroPrompt = (parsedMessage) => `
        # INTERVIEWER ROLE & CONTEXT
        You are ${parsedMessage.interviewerName}, a senior technical interviewer conducting a ${parsedMessage.jobType} interview for the ${parsedMessage.position} position at ${parsedMessage.companyName}.

        **Interviewee:** ${parsedMessage.firstName} ${parsedMessage.lastName}
        **Position:** ${parsedMessage.position}
        **Company:** ${parsedMessage.companyName}
        **Interview Type:** ${parsedMessage.jobType}

        # JOB REQUIREMENTS
        ${parsedMessage.jobDescription}

        # INTERVIEW CONDUCT GUIDELINES
        1. **Professional & Welcoming**: Be warm but professional in your introduction
        2. **One Question at a Time**: Ask only ONE question per response - never multiple questions
        3. **Active Listening**: Acknowledge their responses before moving to the next question
        4. **Follow-up Questions**: Ask relevant follow-ups based on their answers
        5. **Natural Flow**: Create a conversational, realistic interview experience
        6. **No Analysis**: Never analyze or evaluate their answers during the interview
        7. **Technical Focus**: Prioritize technical questions relevant to ${parsedMessage.position}

        # QUESTION STRATEGY
        - Start with introduction and background questions
        - Include 3-4 behavioral questions using STAR method
        - End naturally after 6-8 total exchanges

        # INTERVIEW ENDING
        - When the interview is complete, ALWAYS end with: "Have a great day!" or "Have a good day!"
        - This is MANDATORY - never end without this phrase
        - Thank them for their time and end professionally

        # RESPONSE FORMAT
        - Speak naturally as a human interviewer
        - Keep responses concise (2-3 sentences max)
        - Use professional but friendly tone
        - Never provide answers or hints to technical questions

        # CURRENT TASK
        Provide your opening introduction to ${parsedMessage.firstName}. Welcome them warmly, introduce yourself, and ask them to tell you about their background and experience relevant to ${parsedMessage.position}.

        Remember: This is a REAL interview with a REAL person. Be professional, engaging, and conduct this as you would any important technical interview.
                    `;

const toOllamaMessages = (history) =>
    history.map((message) => ({
        role: message.role === 'developer' ? 'system' : message.role,
        content: message.content
    }));

export function createNewChat(userId) {
    return {
        sessionId: randomUUID(),
        userId,
        interviewId: null,
        history: []
    };
}

export function seedChat(chat, parsedMessage, interviewId) {
    chat.sessionId = randomUUID();
    chat.interviewId = interviewId;
    chat.history = [
        {
            role: 'developer',
            content: buildIntroPrompt(parsedMessage)
        }
    ];
}

export async function askAndrespond(chat, msg, ws, messageEvent){
    try{
        console.log('[ollama] askAndrespond:start', {
            model,
            messageEvent,
            historyLength: chat.history.length,
            msgPreview: typeof msg === 'string' ? msg.slice(0, 100) : msg
        });

        if (messageEvent !== "intro") {
            chat.history.push({
                role: 'user',
                content: msg
            });
        }

        const messages = toOllamaMessages(chat.history);

        if (messageEvent === "intro") {
            messages.push({
                role: 'user',
                content: 'Provide your opening introduction now.'
            });
        }

        const responseStream = await ollama.chat({
            model,
            messages,
            stream: true,
            think: false,
            options: {
                temperature: 0.7,
                num_predict: 300
            }
        });

        let text = '';
        let textToSend = '';
        let chunkCount = 0;
        const CHUNK_CHAR_THRESHOLD = 120;

        for await (const part of responseStream) {
            const chunkText = part.message?.content || '';
            if (!chunkText) {
                continue;
            }

            textToSend += chunkText;
            text += chunkText;

            const endsWithSentence = /[.!?\n]\s*$/.test(textToSend);
            if (endsWithSentence || textToSend.length >= CHUNK_CHAR_THRESHOLD) {
                ws.send(JSON.stringify({ chunkNumber: chunkCount, chunk: textToSend }));
                chunkCount += 1;
                textToSend = '';
            }
        }

        if (textToSend !== '') {
            ws.send(JSON.stringify({ chunkNumber: chunkCount, chunk: textToSend }));
            chunkCount += 1;
        }

        console.log('[ollama] stream-complete', {
            sessionId: chat.sessionId,
            totalTextLength: text.length,
            chunkCount
        });

        chat.history.push({
            role: 'assistant',
            content: text
        });

        return text;
    } catch(error){
        console.log('[ollama] askAndrespond:error', {
            sessionId: chat.sessionId,
            interviewId: chat.interviewId,
            model,
            messageEvent,
            error: error.message
        })
    }
}
