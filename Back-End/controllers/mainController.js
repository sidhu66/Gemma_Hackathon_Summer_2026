import dotenv from 'dotenv';
import db from "../dbConnection.js";
import { VertexAI } from '@google-cloud/vertexai';
import { createClient } from "@deepgram/sdk";
import { Ollama } from 'ollama';
dotenv.config();

const deepgram = createClient(process.env.DEEPGRAM_APIKEY);
const ollama = new Ollama({
  host: process.env.OLLAMA_HOST || 'http://127.0.0.1:11434'
});
const ollamaModel = process.env.OLLAMA_MODEL || 'gemma4:12b';

// Start Interview Function
const startInterview = async (req, res) => {
  const user = req.user;
  const intake = req.body?.intake;
  const typeofinterview = intake?.jobType ?? req.body?.typeofinterview;
  const institution = intake?.companyName ?? req.body?.company;

  if (
    !intake?.firstName ||
    !intake?.lastName ||
    !intake?.jobType ||
    !intake?.position ||
    !intake?.companyName ||
    !intake?.jobDescription
  ) {
    return res.status(400).json({ error: "Missing intake data." });
  }

  try {
    const { rows } = await db.query(
      "INSERT INTO interviews (user_id, typeofinterview, institution, interview_date, intake) VALUES ($1, $2, $3, $4, $5) RETURNING *", 
      [user.id, typeofinterview, institution, new Date(), JSON.stringify(intake)]
    );

    return res.status(201).json({ interviewId: rows[0].id });
  } catch (error) {
    console.error(error);
    return res.status(403).json({ error: "Could not insert into database." });
  }
};

// Text-to-Speech Deepgram Function
const textToSpeechDeepgram = async (req, res) => {
  const { text, chunkNumber, model } = req.body;

  if (!text || typeof text !== 'string' || text.trim() === '') {
    return res.status(400).send("Invalid text input");
  }

  try {
    const response = await deepgram.speak.request({ text }, { model });
    const stream = await response.getStream();

    let audioData = [];
    for await (const chunk of stream) {
      audioData.push(chunk);
    }

    const completeAudioBuffer = Buffer.concat(audioData);
    const audioBase64 = completeAudioBuffer.toString('base64');

    res.setHeader('Content-Type', 'application/json');
    return res.json({
      audio: audioBase64,
      chunkNumber: chunkNumber,
    });
  } catch (e) {
    console.error(e);
    if (e.status == 400) {
      return res.status(e.status).send("Text data could not be processed");
    }
    return res.status(500).send("Internal Server Error");
  }
};

const parseFeedbackJson = (raw) => {
  const trimmed = (raw || '').trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenced?.[1]) {
      return JSON.parse(fenced[1].trim());
    }
    const objectMatch = trimmed.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      return JSON.parse(objectMatch[0]);
    }
    throw new Error('Model did not return valid JSON feedback');
  }
};

// Function to evaluate interview
const evaluateInterview = async (userid, chatLog, interviewId) => {
  const model = ollamaModel;
  const intakeResult = await db.query(
        "SELECT intake FROM interviews WHERE id = $1 AND user_id = $2",
        [interviewId, userid]
      );
  try {
    const intakeData = intakeResult.rows[0]?.intake || {};
    const prompt = JSON.stringify({
      PROMPT: `You are an expert interview coach. Evaluate the candidate strictly using the STAR method: Situation, Task, Action, Result. Use the intake metadata to tailor your evaluation to the target role. Return concise, structured feedback. Score performance from 1 to 10 based primarily on STAR quality, clarity, relevance, ownership, and measurable impact. Return valid JSON only with keys: grade, summary, star, mockAnswer, suggestions.`,
      INTAKE: intakeData,
      Transcript: chatLog
    });

    console.log('[ollama] evaluateInterview:start', { model, interviewId });
    const feedbackResult = await ollama.generate({
      model,
      prompt,
      format: 'json',
      think: false,
      options: { temperature: 0.2 }
    });

    const detailedFeedback = feedbackResult.response;
    const parsed = parseFeedbackJson(detailedFeedback);

    return {
      score: parsed.grade,
      feedback: JSON.stringify(parsed),
    };
  } catch (error) {
    console.error("Error evaluating interview:", error);
    console.error("Error details:", error.message);
    return {
      error: `Failed to evaluate interview with Ollama model '${model}'.`,
      details: error.message
    };
  }
};

// End Interview Function
const endInterview = async (req, res) => {
  const { interviewId, chatLog } = req.body;

  if (!interviewId || !chatLog) {
    return res.status(400).json({ error: "Missing interview ID or chat log." });
  }

  try {
    const evaluation = await evaluateInterview(req.user?.id, chatLog, interviewId);

    if (evaluation.error) {
      return res.status(500).json({ error: "Failed to evaluate interview." });
    }

    const { score, feedback } = evaluation;

    const { rows } = await db.query(
      "INSERT INTO QAOfInterview (interview_id, chat, feedback) VALUES ($1, $2, $3) RETURNING *",
      [interviewId, JSON.stringify(chatLog), feedback]
    );

    await db.query(
      "UPDATE interviews SET score = $1 WHERE id = $2",
      [score, interviewId]
    );

    return res.status(201).json({
      record: rows[0],
      score: score,
      feedback: feedback,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error." });
  }
};

const getFeedback = async (req, res) => {
  const interviewId = req.params.id;

  try {
      // Query feedback from the database
      const { rows } = await db.query(
          "SELECT * FROM QAOfInterview WHERE interview_id = $1",
          [interviewId]
      );

      if (rows.length === 0) {
          return res.status(404).json({ error: "No data found for this interview." });
      }

      // Return the feedback and chat data
      return res.status(200).json(rows[0]);
  } catch (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Internal Server Error" });
  }
}

const getRecentInterview = async (req, res) => {
    try{
      const { rows: recentInterviews } = await db.query(
        'SELECT id, institution, typeofinterview, score, interview_date FROM interviews WHERE score IS NOT NULL ORDER BY interview_date DESC LIMIT 3'
      );

      const { rows: latestInterviewRows } = await db.query(
        'SELECT q.chat, q.feedback FROM QAOfInterview q JOIN interviews i ON i.id = q.interview_id ORDER BY i.interview_date DESC, i.id DESC LIMIT 1'
      );

      res.status(200).json({
        recentInterviews,
        latestInterview: latestInterviewRows[0] || null,
      });
    }catch(err){
      console.log("Database error: ", err);
      res.status(500).json({error: "Internal Server Error"})
    }
};


const searchInterviews = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || typeof q !== 'string' || q.trim().length === 0) {
            return res.status(200).json({ results: [] });
        }
        const { rows } = await db.query(
            `SELECT i.id, i.institution, i.typeofinterview, i.score, i.interview_date
             FROM interviews i
             WHERE i.user_id = $1 AND i.score IS NOT NULL AND i.institution ILIKE $2
             ORDER BY i.interview_date DESC
             LIMIT 10`,
            [req.user.id, `%${q.trim()}%`]
        );
        res.status(200).json({ results: rows });
    } catch (err) {
        console.log("Search error: ", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const getInterviewDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const { rows } = await db.query(
            `SELECT q.chat, q.feedback FROM QAOfInterview q WHERE q.interview_id = $1 LIMIT 1`,
            [id]
        );
        res.status(200).json({ interview: rows[0] || null });
    } catch (err) {
        console.log("Detail error: ", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export { startInterview, endInterview, textToSpeechDeepgram, getFeedback, getRecentInterview, searchInterviews, getInterviewDetail};
