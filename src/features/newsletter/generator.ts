import { renderNewsletterHtml, renderNewsletterPlainText } from './email-template';
import type { NewsletterBrief, NewsletterCopy, NewsletterDraft, NewsletterResource } from './types';

function firstSentence(value: string, fallback: string) {
  const sentence = value.split(/[.!?]/)[0]?.trim();
  return sentence || fallback;
}

export function generateNewsletterDraft(brief: NewsletterBrief, copy?: NewsletterCopy, resources: NewsletterResource[] = []): NewsletterDraft {
  const topic = firstSentence(brief.topic, 'A clearer way forward');
  const audience = firstSentence(brief.audience, 'customers who want practical progress');
  const messages = brief.keyMessages.split(/[\n,]+/).map((message) => message.trim()).filter(Boolean);
  const offer = firstSentence(brief.offer, 'Explore the latest offer');
  const voice = brief.voice.trim() || 'clear, helpful, and confident';
  const sections = copy?.sections ?? [
    {
      heading: messages[0] || 'Why this matters now',
      body: `${topic} gives ${audience} a practical next step. Written in a ${voice} voice, this edition focuses on useful progress instead of empty promises.`,
    },
    {
      heading: messages[1] || 'Make the next step easier',
      body: messages[1] ? `${messages[1]} We have shaped this into a simple action you can use immediately, with less friction and more clarity.` : 'Start with one focused improvement, measure what changes, and build from there. Small, deliberate decisions compound into better outcomes.',
    },
  ];
  const draftWithoutOutput = {
    subjectLines: copy?.subjectLines ?? [
      `${topic}: a practical idea for this week`,
      `A clearer way to approach ${topic.toLowerCase()}`,
      `${brief.businessName || 'This week'}: one useful next step`,
    ],
    previewText: copy?.previewText ?? `${firstSentence(brief.keyMessages, `A useful idea from ${brief.businessName || 'our team'}`)} See what to do next.`,
    intro: copy?.intro ?? `Hi there,\n\nHere is a focused idea to help you make progress with ${topic.toLowerCase()}.`,
    sections,
    offerTitle: copy?.offerTitle ?? offer,
    offerBody: copy?.offerBody ?? `If you are ready to move from idea to action, ${offer.toLowerCase()} is a practical place to begin.`,
    socialProof: copy?.socialProof ?? (brief.socialProof.trim() || 'A clearer, more practical way to move forward.'),
    callToAction: copy?.callToAction ?? (brief.callToAction.trim() || 'Explore the offer'),
    callToActionUrl: copy?.callToActionUrl ?? (brief.offerUrl.trim() || 'https://example.com'),
    status: 'draft' as const,
    style: brief.style,
    tone: brief.tone,
    resources,
  };

  return {
    ...draftWithoutOutput,
    html: renderNewsletterHtml(brief, draftWithoutOutput),
    plainText: renderNewsletterPlainText(brief, draftWithoutOutput),
  };
}
