import { GoogleGenAI, Type } from '@google/genai';
import { Request, Response } from 'express';
import { Language } from '../shared/types';

const TEXT_MODEL_CHAIN = ['gemini-4-hydrogen', 'gemini-3.1-flash-lite'] as const;

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      apiVersion: 'v1beta',
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function getLangInstruction(lang: Language): string {
  if (lang === 'ru') return 'Russian (Русский)';
  if (lang === 'en') return 'English';
  return "Uzbek (O'zbek tili, Latin script)";
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractRawErrorDetails(err: unknown): { code?: number; message: string } {
  const raw = err instanceof Error ? err.message : String(err ?? 'Unknown AI error');
  try {
    const parsed = JSON.parse(raw) as {
      error?: { code?: number; message?: string; status?: string };
    };
    if (parsed?.error) {
      return {
        code: typeof parsed.error.code === 'number' ? parsed.error.code : undefined,
        message: parsed.error.message || raw,
      };
    }
  } catch {
    // Not raw JSON
  }
  const statusObj = err as { status?: number; code?: number };
  return {
    code:
      typeof statusObj?.status === 'number'
        ? statusObj.status
        : typeof statusObj?.code === 'number'
          ? statusObj.code
          : undefined,
    message: raw,
  };
}

function isTransientOverload(err: unknown): boolean {
  const { code, message } = extractRawErrorDetails(err);
  if (code === 503 || code === 429 || code === 500) return true;
  const lower = message.toLowerCase();
  return (
    lower.includes('503') ||
    lower.includes('unavailable') ||
    lower.includes('high demand') ||
    lower.includes('overloaded') ||
    lower.includes('resource_exhausted') ||
    lower.includes('429')
  );
}

function formatCleanAiError(err: unknown, lang: Language): { statusCode: number; message: string } {
  const { code, message } = extractRawErrorDetails(err);
  if (isTransientOverload(err)) {
    const statusCode = code === 429 ? 429 : 503;
    if (lang === 'ru') {
      return {
        statusCode,
        message: 'AI-сервер сейчас перегружен. Пожалуйста, нажмите «Повторить» через пару секунд.',
      };
    }
    if (lang === 'en') {
      return {
        statusCode,
        message: 'AI tutor is temporarily busy due to high demand. Please retry in a few seconds.',
      };
    }
    return {
      statusCode,
      message: "AI ustoz serveri hozirda band. Iltimos, bir necha soniyadan so'ng «Qayta urinish» ni bosing.",
    };
  }
  return {
    statusCode: code && code >= 400 && code < 600 ? code : 500,
    message,
  };
}

async function generateWithFallback(
  ai: GoogleGenAI,
  buildRequest: (model: string) => Parameters<GoogleGenAI['models']['generateContent']>[0]
) {
  let lastError: unknown;
  for (let mIdx = 0; mIdx < TEXT_MODEL_CHAIN.length; mIdx++) {
    const model = TEXT_MODEL_CHAIN[mIdx];
    const maxAttempts = 2;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await ai.models.generateContent(buildRequest(model));
      } catch (err) {
        lastError = err;
        if (!isTransientOverload(err)) {
          throw err;
        }
        const delayMs = attempt === 1 ? 450 : 950;
        await sleep(delayMs);
      }
    }
  }
  throw lastError;
}

interface IncomingAttempt {
  question: string;
  yourAnswer: string;
  correctAnswer: string;
  correct: boolean;
}

export async function handleExplainMistakes(req: Request, res: Response): Promise<void> {
  const ai = getAiClient();
  const body = (req.body ?? {}) as {
    playerName?: string;
    subjectName?: string;
    language?: Language;
    correctCount?: number;
    wrongCount?: number;
    attempts?: IncomingAttempt[];
  };
  const lang: Language = body.language === 'ru' || body.language === 'en' ? body.language : 'uz';

  if (!ai) {
    res.status(503).json({
      error: 'GEMINI_API_KEY is not configured on the server.',
    });
    return;
  }

  try {
    const langName = getLangInstruction(lang);
    const playerName = String(body.playerName || 'Student').slice(0, 40);
    const subjectName = String(body.subjectName || 'General').slice(0, 40);
    const correctCount = Number(body.correctCount) || 0;
    const wrongCount = Number(body.wrongCount) || 0;
    const attempts = Array.isArray(body.attempts) ? body.attempts : [];
    const wrongAttempts = attempts.filter((a) => !a.correct).slice(0, 6);

    const prompt =
      wrongAttempts.length > 0
        ? `You are an encouraging, crystal-clear personal AI tutor for "${playerName}" in "${subjectName}".
Reply ONLY in ${langName}.
Match summary: ${correctCount} correct, ${wrongCount} wrong.
Below are the questions the student answered WRONG:
${wrongAttempts
  .map(
    (m, i) =>
      `${i + 1}. Question: ${m.question}\n   Student chose: ${m.yourAnswer}\n   Correct answer: ${m.correctAnswer}`
  )
  .join('\n')}

Tasks:
1. "greeting": Warm 1-2 sentence greeting mentioning ${playerName}, ${correctCount} correct and ${wrongCount} wrong answers.
2. "overallSummary": 2 concise sentences summarizing their performance and encouraging improvement.
3. "spokenScript": Natural spoken script (3-5 clear sentences, plain text without markdown/emojis) explaining the main mistake(s) warmly as a voice tutor speaking aloud.
4. "mistakes": For EACH wrong question above, provide:
   - question, yourAnswer, correctAnswer
   - explanation: Clear step-by-step written explanation (2-4 sentences) showing WHY their choice was wrong and HOW to solve it properly.
   - ruleTip: 1 crisp memorable formula or rule.
   - diagram: Visual drawing blueprint so our whiteboard draws it step by step:
     * Choose type="comparison_bars" if numeric values can be compared (populate wrongValue & correctValue numbers), type="equation_steps" for step-by-step calculations, or type="concept_diagram" for conceptual/factual subjects.
     * Include a concise "title", optional "formula", 3 to 4 ordered "nodes" ({ label, sublabel, status: "step" | "wrong" | "correct" | "neutral" }), and a crisp "conclusion".`
        : `You are an encouraging AI tutor for "${playerName}" in "${subjectName}".
Reply ONLY in ${langName}.
Match summary: ${correctCount} correct, 0 wrong answers!
Recent answered questions:
${attempts
  .slice(0, 3)
  .map((a, i) => `${i + 1}. ${a.question} -> ${a.correctAnswer}`)
  .join('\n')}

Tasks:
1. Celebrate their zero-mistake accuracy (${correctCount} correct, 0 wrong) in "greeting" and "overallSummary".
2. Write a short cheerful "spokenScript" (2-3 plain text sentences for TTS voice synthesis).
3. Return "mistakes" as an empty array [] (or 0 items).`;

    const response = await generateWithFallback(ai, (model) => ({
      model,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            greeting: { type: Type.STRING },
            overallSummary: { type: Type.STRING },
            spokenScript: { type: Type.STRING },
            mistakes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  yourAnswer: { type: Type.STRING },
                  correctAnswer: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                  ruleTip: { type: Type.STRING },
                  diagram: {
                    type: Type.OBJECT,
                    properties: {
                      type: { type: Type.STRING },
                      title: { type: Type.STRING },
                      formula: { type: Type.STRING },
                      wrongLabel: { type: Type.STRING },
                      wrongValue: { type: Type.NUMBER },
                      correctLabel: { type: Type.STRING },
                      correctValue: { type: Type.NUMBER },
                      conclusion: { type: Type.STRING },
                      nodes: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            label: { type: Type.STRING },
                            sublabel: { type: Type.STRING },
                            status: { type: Type.STRING },
                          },
                          required: ['label', 'status'],
                        },
                      },
                    },
                    required: ['type', 'title', 'nodes', 'conclusion'],
                  },
                },
                required: [
                  'question',
                  'yourAnswer',
                  'correctAnswer',
                  'explanation',
                  'ruleTip',
                  'diagram',
                ],
              },
            },
          },
          required: ['greeting', 'overallSummary', 'spokenScript', 'mistakes'],
        },
      },
    }));

    const parsed = JSON.parse(response.text || '{}');
    res.json({
      correctCount,
      wrongCount,
      greeting: parsed.greeting || '',
      overallSummary: parsed.overallSummary || '',
      spokenScript: parsed.spokenScript || '',
      mistakes: Array.isArray(parsed.mistakes) ? parsed.mistakes : [],
    });
  } catch (err) {
    console.error('AI explain-mistakes failed:', err);
    const cleaned = formatCleanAiError(err, lang);
    res.status(cleaned.statusCode).json({ error: cleaned.message });
  }
}

export async function handleAiSpeak(req: Request, res: Response): Promise<void> {
  const ai = getAiClient();
  const body = (req.body ?? {}) as { text?: string; language?: Language };
  const lang = body.language === 'ru' || body.language === 'en' ? body.language : 'uz';

  if (!ai) {
    res.status(503).json({
      error: 'GEMINI_API_KEY is not configured on the server.',
    });
    return;
  }

  try {
    const text = String(body.text ?? '').trim().slice(0, 1200);
    if (!text) {
      res.status(400).json({ error: 'Text is required for speech generation.' });
      return;
    }

    const ttsPrompt =
      lang === 'ru'
        ? `Прочитай тёплым и понятным голосом учителя: ${text}`
        : lang === 'en'
          ? `Read aloud in a warm, clear tutor voice: ${text}`
          : `Samimiy va tushunarli ustoz ovozi bilan o'qib ber: ${text}`;

    const runTts = async (withVoiceConfig: boolean) => {
      return ai.models.generateContent({
        model: 'gemini-3.8-flash-lite-tts',
        contents: [
          {
            role: 'user',
            parts: [{ text: ttsPrompt }],
          },
        ],
        config: withVoiceConfig
          ? {
              responseModalities: ['AUDIO'],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: 'Kore' },
                },
              },
            }
          : {
              responseModalities: ['AUDIO'],
            },
      });
    };

    let response;
    try {
      response = await runTts(true);
    } catch (firstErr) {
      const msg = firstErr instanceof Error ? firstErr.message : '';
      if (msg.includes('speechConfig') || msg.includes('generation_config')) {
        response = await runTts(false);
      } else if (isTransientOverload(firstErr)) {
        await sleep(600);
        response = await runTts(true);
      } else {
        throw firstErr;
      }
    }

    const audioBase64 =
      response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!audioBase64) {
      res.status(502).json({ error: 'TTS model returned empty audio data.' });
      return;
    }

    res.json({
      mimeType: 'audio/wav',
      audioBase64,
    });
  } catch (err) {
    console.error('AI speak failed:', err);
    const cleaned = formatCleanAiError(err, lang);
    res.status(cleaned.statusCode).json({ error: cleaned.message });
  }
}

export async function handleAiChat(req: Request, res: Response): Promise<void> {
  const ai = getAiClient();
  const body = (req.body ?? {}) as {
    message?: string;
    subjectName?: string;
    language?: Language;
    contextMistakes?: Array<{ question: string; yourAnswer: string; correctAnswer: string }>;
    history?: Array<{ role: 'user' | 'assistant'; text: string }>;
  };
  const lang: Language = body.language === 'ru' || body.language === 'en' ? body.language : 'uz';

  if (!ai) {
    res.status(503).json({
      error: 'GEMINI_API_KEY is not configured on the server.',
    });
    return;
  }

  try {
    const userMsg = String(body.message ?? '').trim().slice(0, 500);
    if (!userMsg) {
      res.status(400).json({ error: 'Message is required.' });
      return;
    }

    const langName = getLangInstruction(lang);
    const subjectName = String(body.subjectName || 'General').slice(0, 40);
    const mistakesText = (body.contextMistakes ?? [])
      .slice(0, 5)
      .map((m, i) => `${i + 1}. Q: ${m.question} | Student: ${m.yourAnswer} | Right: ${m.correctAnswer}`)
      .join('\n');
    const historyText = (body.history ?? [])
      .slice(-6)
      .map((h) => `${h.role === 'user' ? 'Student' : 'Tutor'}: ${h.text}`)
      .join('\n');

    const prompt = `You are a helpful AI tutor for ${subjectName}. Reply ONLY in ${langName}.
Match mistakes context:
${mistakesText || 'No mistakes recorded.'}

Conversation so far:
${historyText || 'None'}

Student asks: "${userMsg}"

Return JSON with:
- "reply": Clear, friendly written explanation (2-5 sentences).
- "spokenReply": Shorter conversational version suitable to read aloud (1-3 plain text sentences, no markdown).
- "diagram": Optional visual drawing blueprint (title, formula, type: "equation_steps"|"comparison_bars"|"concept_diagram", 3 nodes, conclusion) ONLY if a visual sketch helps answer the follow-up.`;

    const response = await generateWithFallback(ai, (model) => ({
      model,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: { type: Type.STRING },
            spokenReply: { type: Type.STRING },
            diagram: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING },
                title: { type: Type.STRING },
                formula: { type: Type.STRING },
                conclusion: { type: Type.STRING },
                nodes: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      label: { type: Type.STRING },
                      sublabel: { type: Type.STRING },
                      status: { type: Type.STRING },
                    },
                    required: ['label', 'status'],
                  },
                },
              },
              required: ['type', 'title', 'nodes', 'conclusion'],
            },
          },
          required: ['reply', 'spokenReply'],
        },
      },
    }));

    const parsed = JSON.parse(response.text || '{}');
    res.json({
      reply: parsed.reply || '',
      spokenReply: parsed.spokenReply || parsed.reply || '',
      diagram: parsed.diagram || undefined,
    });
  } catch (err) {
    console.error('AI chat failed:', err);
    const cleaned = formatCleanAiError(err, lang);
    res.status(cleaned.statusCode).json({ error: cleaned.message });
  }
}
