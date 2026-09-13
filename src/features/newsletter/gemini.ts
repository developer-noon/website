import type { NewsletterBrief, NewsletterCopy } from './types';

const model = 'gemini-2.5-flash';

function text(value: unknown, fallback = '') {
  return typeof value === 'string' ? value.trim() : fallback;
}

function parseJson(value: string) {
  const cleaned = value.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  return JSON.parse(cleaned) as Record<string, unknown>;
}

function normalizeCopy(value: Record<string, unknown>, brief: NewsletterBrief): NewsletterCopy {
  const sections = Array.isArray(value.sections)
    ? value.sections
      .filter((section): section is Record<string, unknown> => typeof section === 'object' && section !== null)
      .map((section) => ({ heading: text(section.heading), body: text(section.body) }))
      .filter((section) => section.heading && section.body)
      .slice(0, 3)
    : [];
  const subjectLines = Array.isArray(value.subjectLines)
    ? value.subjectLines.filter((subject): subject is string => typeof subject === 'string').map((subject) => subject.trim()).filter(Boolean).slice(0, 5)
    : [];

  if (!subjectLines.length || !sections.length) throw new Error('Gemini returned incomplete newsletter copy.');

  return {
    subjectLines,
    previewText: text(value.previewText, `A useful idea from ${brief.businessName}`),
    intro: text(value.intro, `Here is a focused idea to help you make progress with ${brief.topic}.`),
    sections,
    offerTitle: text(value.offerTitle, brief.offer || 'Explore the latest offer'),
    offerBody: text(value.offerBody, 'Take the next practical step with this offer.'),
    socialProof: text(value.socialProof, brief.socialProof || 'A clearer, more practical way to move forward.'),
    callToAction: text(value.callToAction, brief.callToAction || 'Explore the offer'),
    callToActionUrl: text(value.callToActionUrl, brief.offerUrl || 'https://example.com'),
  };
}

export async function generateGeminiCopy(brief: NewsletterBrief, refreshSeed = ''): Promise<NewsletterCopy> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not configured.');
  const prompt = `You are a skilled human newsletter editor. Write original, natural copy that sounds like a thoughtful person, not an AI. Use the requested tone without generic marketing language. Never invent facts, testimonials, prices, results, or capabilities. This is a refresh, so choose a meaningfully different angle, phrasing, opening, and subject lines from earlier versions while staying faithful to the brief. Return valid JSON only with exactly these keys: subjectLines (array of 3 to 5 strings), previewText, intro, sections (array of 2 or 3 objects with heading and body), offerTitle, offerBody, socialProof, callToAction, callToActionUrl.

Tone: ${brief.tone}
Brand voice: ${brief.voice || 'clear, helpful, and confident'}
Business: ${brief.businessName}
Audience: ${brief.audience}
Topic: ${brief.topic}
Key messages: ${brief.keyMessages || 'Use the topic as the central message.'}
Offer: ${brief.offer || 'No specific offer provided.'}
Offer URL: ${brief.offerUrl || 'https://example.com'}
Social proof: ${brief.socialProof || 'No specific proof provided; use a neutral statement instead.'}
Call to action: ${brief.callToAction || 'Explore the offer'}
Variation token: ${refreshSeed || 'initial-draft'}`;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.85, responseMimeType: 'application/json' } }),
  });
  if (!response.ok) throw new Error(`Gemini request failed (${response.status}).`);
  const payload = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
  const output = payload.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('').trim();
  if (!output) throw new Error('Gemini returned an empty response.');
  return normalizeCopy(parseJson(output), brief);
}