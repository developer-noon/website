import { randomUUID } from 'crypto';
import type { NewsletterResource } from './types';

function clean(value: string | undefined, fallback: string) {
  return value?.replace(/\s+/g, ' ').trim() || fallback;
}

function sourceFromUrl(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return 'Web source';
  }
}

function stripHtml(value: string) {
  return value.replace(/<!\[CDATA\[|\]\]>/g, '').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim();
}

export function resourceFromUrl(input: { title?: string; url: string; description?: string; addedBy?: 'ai' | 'manual' }): NewsletterResource {
  const url = new URL(input.url).toString();
  return {
    id: randomUUID(),
    title: clean(input.title, sourceFromUrl(url)),
    url,
    description: clean(input.description, 'A useful source selected for this newsletter session.'),
    source: sourceFromUrl(url),
    addedBy: input.addedBy ?? 'manual',
  };
}

export async function describeResource(url: string, title?: string) {
  const response = await fetch(url, { headers: { 'User-Agent': 'NewsletterStudio/1.0 resource preview' }, signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error(`Could not read that link (${response.status}).`);
  const html = await response.text();
  const description = html.match(/<meta[^>]+(?:name|property)=["'](?:description|og:description)["'][^>]+content=["']([^"']*)["']/i)?.[1]
    ?? html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+(?:name|property)=["'](?:description|og:description)["']/i)?.[1];
  const pageTitle = html.match(/<title[^>]*>(.*?)<\/title>/i)?.[1];
  return resourceFromUrl({ url, title: title || stripHtml(pageTitle || ''), description: stripHtml(description || ''), addedBy: 'manual' });
}

export async function discoverResources(topic: string, audience: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is required to find relevant articles.');
  const prompt = `Find 6 current, real, publicly accessible articles, news items, or educational resources for a newsletter. Search the web before answering. Return JSON only as an array with title, url, and description. Do not invent URLs. Topic: ${topic}. Audience: ${audience || 'a general professional audience'}.`;
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.2, responseMimeType: 'application/json' } }),
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error(`Article research failed (${response.status}).`);
  const payload = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
  const output = payload.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('').replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim();
  if (!output) throw new Error('Article research returned no results.');
  const articles = JSON.parse(output) as Array<{ title?: string; url?: string; description?: string }>;
  return articles.map((article) => {
    if (!article.url || !/^https?:\/\//i.test(article.url)) return null;
    return resourceFromUrl({ url: article.url, title: article.title, description: article.description, addedBy: 'ai' });
  }).filter((resource): resource is NewsletterResource => Boolean(resource)).slice(0, 8);
}