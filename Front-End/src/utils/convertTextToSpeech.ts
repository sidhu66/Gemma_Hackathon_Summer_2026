import { dataFromGemini, bodyTTS, audioDataFromTTS } from "./types";
import { AxiosResponse } from "axios";
import { AppDispatch } from '@/redux/store'; 
import api from "@/lib/axios";
import { addToQueue, skipChunk } from "@/redux/features/audioQueueSlice";

/** Deepgram TTS rejects some unicode punctuation from LLMs (curly quotes, etc.). */
const sanitizeForTts = (text: string) =>
  text
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
    .replace(/[\u2013\u2014\u2212]/g, "-")
    .replace(/\u2026/g, "...")
    .replace(/\u00A0/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export const convertTextToSpeech = async (data: dataFromGemini, dispatch: AppDispatch, model: string) => {
    const sanitized = sanitizeForTts(data.chunk || "");

    if (!sanitized) {
        dispatch(skipChunk(data.chunkNumber));
        return;
    }

    try {
        const body: bodyTTS = { text: sanitized, chunkNumber: data.chunkNumber, model };
        const response: AxiosResponse = await api.post('/api/interview/tts', body, {
            responseType: 'text'
        });
        const dataFromTTS: audioDataFromTTS =  JSON.parse(response.data)
        const audioBuffer = Uint8Array.from(atob(dataFromTTS.audio), c => c.charCodeAt(0)).buffer;
        const audioBlob = new Blob([audioBuffer], { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);

        dispatch(addToQueue({chunkNumber: dataFromTTS.chunkNumber, audio: audioUrl, chunkText: data.chunk}));
    } catch (error) {
        console.error('Error converting text to speech:', error);
        // Keep chunk sequence contiguous so playback / mic unpause are not stuck
        dispatch(skipChunk(data.chunkNumber));
    }
  };
