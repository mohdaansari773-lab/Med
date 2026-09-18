import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { STUDY_MODE_KEYS } from "./ai-study";

const schema = z.object({
  topic: z.string().min(1).max(200),
  context: z.string().max(8000).default(""),
  mode: z.enum(["simple", "hindi", "hinglish", "student", "detailed"]).default("simple"),
});

const MODE_INSTRUCTIONS: Record<string, string> = {
  simple: "Explain in very simple English, 3-5 short sentences, for a complete beginner.",
  hindi:
    "Explain in Hindi (Devanagari script), simple everyday language, 3-5 short sentences. Keep drug names in their usual English form.",
  hinglish: "Explain in Hinglish (Roman script, mixed Hindi-English), casual and clear.",
  student:
    "Explain for a pharmacy or medical student: mechanism, class, key clinical points. Use short bullet lines.",
  detailed:
    "Give a detailed reference-style explanation covering mechanism, pharmacokinetics and clinical relevance. Use short bullet lines.",
};

async function callAiAssistant(
  system: string,
  user: string,
): Promise<{ text?: string; ok: boolean; errorMessage?: string }> {
  const geminiKey = process.env["GEMINI_API_KEY"];
  const lovableKey = process.env["LOVABLE_API_KEY"];

  if (geminiKey) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: [{ role: "user", parts: [{ text: user }] }],
        }),
      });
      if (res.status === 429) {
        return {
          ok: false,
          errorMessage: "Too many requests just now. Please try again in a moment.",
        };
      }
      if (!res.ok) {
        return { ok: false, errorMessage: "The assistant is unavailable." };
      }
      const json = (await res.json()) as {
        candidates?: { content?: { parts?: { text?: string }[] } }[];
      };
      const text = json.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      return text
        ? { text, ok: true }
        : { ok: false, errorMessage: "No response could be generated." };
    } catch {
      return { ok: false, errorMessage: "The assistant could not be reached." };
    }
  }

  if (lovableKey) {
    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${lovableKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-3.5-flash",
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
        }),
      });
      if (res.status === 429) {
        return {
          ok: false,
          errorMessage: "Too many requests just now. Please try again in a moment.",
        };
      }
      if (!res.ok) {
        return { ok: false, errorMessage: "The assistant is unavailable." };
      }
      const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
      const text = json.choices?.[0]?.message?.content?.trim();
      return text
        ? { text, ok: true }
        : { ok: false, errorMessage: "No response could be generated." };
    } catch {
      return { ok: false, errorMessage: "The assistant could not be reached." };
    }
  }

  return { ok: false, errorMessage: "The assistant is not available right now." };
}

export const explainTopic = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => schema.parse(d))
  .handler(async ({ data }) => {
    const { checkAiRateLimit } = await import("./ai-rate-limit.server");
    const verdict = await checkAiRateLimit();
    if (!verdict.allowed) return { text: verdict.message, ok: false };

    const system = [
      "You are the explanation assistant inside MediVault India, an educational pharmacology reference app.",
      "Rules you must follow strictly:",
      "1. Explain only the reference data provided below plus well-established, textbook-level pharmacology.",
      "2. Never invent doses, brand compositions, drug interactions or contraindications. If the reference data does not contain it, say: 'Information could not be verified from the available reference data.'",
      "3. Never diagnose, never give individualised prescribing advice. For clinically consequential questions, advise consulting a qualified healthcare professional.",
      "4. Keep it educational and concise. No markdown headings, no tables.",
      MODE_INSTRUCTIONS[data.mode],
    ].join("\n");

    const user = data.context
      ? `Topic: ${data.topic}\n\nVerified reference data from the MediVault database:\n${data.context}`
      : `Topic: ${data.topic}\n\n(No database record was supplied; keep to general textbook pharmacology and say clearly when something cannot be verified.)`;

    const result = await callAiAssistant(system, user);
    if (!result.ok || !result.text) {
      return { text: result.errorMessage ?? "No explanation could be generated.", ok: false };
    }
    return { text: result.text, ok: true };
  });

/* ---------------------------------------------------------------------------
 * AI Study Mode — retrieval-grounded learning assistant.
 * The structured database record is fetched first, then the model is asked to
 * teach only from it. Same rate limit as Explain; no key ever leaves the server.
 * ------------------------------------------------------------------------ */

const studySchema = z.object({
  topic: z.string().min(1).max(200),
  mode: z.enum(STUDY_MODE_KEYS),
  extraContext: z.string().max(6000).default(""),
});

export const studyWithAi = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => studySchema.parse(d))
  .handler(async ({ data }) => {
    const { checkAiRateLimit } = await import("./ai-rate-limit.server");
    const verdict = await checkAiRateLimit();
    if (!verdict.allowed) return { text: verdict.message, ok: false };

    const { retrieveContext } = await import("./ai-retrieval.server");
    let retrieved = "";
    try {
      retrieved = await retrieveContext(data.topic);
    } catch {
      retrieved = "";
    }

    const modeInstruction: Record<string, string> = {
      explain:
        "Teach the topic step by step: 1) What is it 2) Examples 3) Mechanism 4) Uses 5) Adverse effects 6) Important precautions 7) Memory trick. Short numbered lines.",
      quiz: "Write 5 multiple-choice questions with options A-D, then an ANSWERS section with the correct option and a one-line explanation for each.",
      flashcard:
        "Write 6 flashcards in the form 'Front: ...' then 'Back: ...' on separate lines. Keep each side to one short sentence.",
      mnemonic:
        "Give 2-3 memory aids or mnemonics with a one-line explanation of each. State clearly that mnemonics are learning aids, not classification rules.",
      simplify:
        "Explain in very simple English for a complete beginner, 4-6 short sentences, no jargon.",
      compare:
        "Compare the items in the topic point by point: mechanism, uses, key differences, adverse effects, and when one is preferred. Short lines.",
      revise:
        "Give a high-yield revision recap: 8-10 crisp bullet lines a student can revise in one minute.",
    };

    const system = [
      "You are the AI Study Mode tutor inside MediVault India, an educational pharmacology reference app.",
      "Rules you must follow strictly:",
      "1. Teach from the retrieved database record below plus well-established textbook pharmacology only.",
      "2. Never invent doses, brand compositions, interactions or contraindications. If it is not in the retrieved data, say: 'Information could not be verified from the available reference data.'",
      "3. Never diagnose and never give individualised prescribing advice.",
      "4. Anything not present in the retrieved record must be presented as general textbook teaching, not as a verified MediVault fact.",
      "5. Plain text only. No markdown headings, no tables.",
      modeInstruction[data.mode] ?? modeInstruction["explain"]!,
    ].join("\n");

    const grounding = [retrieved, data.extraContext].filter(Boolean).join("\n");
    const user = grounding
      ? `Topic: ${data.topic}\n\nRetrieved MediVault database record:\n${grounding}`
      : `Topic: ${data.topic}\n\n(No database record matched; keep to general textbook pharmacology and say clearly when something cannot be verified.)`;

    const result = await callAiAssistant(system, user);
    if (!result.ok || !result.text) {
      return { text: result.errorMessage ?? "No study material could be generated.", ok: false };
    }
    return { text: result.text, ok: true, grounded: retrieved.length > 0 };
  });
