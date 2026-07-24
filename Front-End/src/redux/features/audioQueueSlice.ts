import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { audioDataFromTTS, audioQueueState } from "@/utils/types";

const initialState: audioQueueState = {
    audioQueue: [],
    prevChunkNumber: -1,
    playChunkFlag: false,
    skippedChunks: [],
};

const advancePastSkipped = (state: audioQueueState) => {
    while (state.skippedChunks.includes(state.prevChunkNumber + 1)) {
        state.prevChunkNumber += 1;
    }
    // Heal gaps from failed/missing TTS chunks so playback never stalls forever
    if (
        state.audioQueue.length > 0 &&
        state.audioQueue[0].chunkNumber > state.prevChunkNumber + 1
    ) {
        state.prevChunkNumber = state.audioQueue[0].chunkNumber - 1;
    }
    state.playChunkFlag =
        state.audioQueue.length > 0 &&
        state.audioQueue[0].chunkNumber === state.prevChunkNumber + 1;
};

//slice doesnt mutate array so immer doesn't catch it
const audioQueueSlice = createSlice({
    name: "audioQueue",
    initialState,
    reducers: {
        addToQueue: (state, action: PayloadAction<audioDataFromTTS>) => {
            // Directly mutate the state.audioQueue array
            state.audioQueue.push(action.payload);
            state.audioQueue.sort((a, b) => a.chunkNumber - b.chunkNumber);
            advancePastSkipped(state);
        },
        popFromQueue: (state) => {
            // Remove the first item from the audioQueue array
            state.prevChunkNumber = state.audioQueue[0].chunkNumber;
            state.audioQueue = state.audioQueue.slice(1);
            advancePastSkipped(state);
        },
        skipChunk: (state, action: PayloadAction<number>) => {
            const chunkNumber = action.payload;
            if (!state.skippedChunks.includes(chunkNumber)) {
                state.skippedChunks.push(chunkNumber);
            }
            advancePastSkipped(state);
        },
        clearQueue: (state) => {
            // Reset to initial state values
            state.audioQueue = [];
            state.prevChunkNumber = -1;
            state.playChunkFlag = false;
            state.skippedChunks = [];
        },
        setPrevChunkNumber: (state, action: PayloadAction<number>) => {
            // Directly set the prevChunkNumber
            state.prevChunkNumber = action.payload;
            advancePastSkipped(state);
        },
        setPlayChunkFlag: (state, action: PayloadAction<boolean>) => {
            // Directly set the playChunkFlag
            state.playChunkFlag = action.payload;
        }
    },
});

export const { addToQueue, popFromQueue, skipChunk, setPrevChunkNumber, clearQueue, setPlayChunkFlag } = audioQueueSlice.actions;
export default audioQueueSlice.reducer;
