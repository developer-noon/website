import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { generateNewsletterDraft } from '@/features/newsletter/generator';
import { generateGeminiCopy } from '@/features/newsletter/gemini';
import type { NewsletterBrief } from '@/features/newsletter/types';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  try {
    const input = await request.json() as Partial<NewsletterBrief> & { refreshSeed?: string };
    const brief: NewsletterBrief = {
      businessName: input.businessName?.trim() ?? '',
      audience: input.audience?.trim() ?? '',
      voice: input.voice?.trim() ?? '',
      tone: input.tone ?? 'professional',
      topic: input.topic?.trim() ?? '',
      keyMessages: input.keyMessages?.trim() ?? '',
      offer: input.offer?.trim() ?? '',
      offerUrl: input.offerUrl?.trim() ?? '',
      socialProof: input.socialProof?.trim() ?? '',
      callToAction: input.callToAction?.trim() ?? '',
      primaryColor: input.primaryColor ?? '#0B353B',
      secondaryColor: input.secondaryColor ?? '#4A5C5F',
      accentColor: input.accentColor ?? '#ABFFAE',
      backgroundColor: input.backgroundColor ?? '#F3F7F6',
      surfaceColor: input.surfaceColor ?? '#FFFFFF',
      textColor: input.textColor ?? '#0B353B',
      mutedColor: input.mutedColor ?? '#4A5C5F',
      textOnPrimaryColor: input.textOnPrimaryColor ?? '#FFFFFF',
      textOnAccentColor: input.textOnAccentColor ?? '#0B353B',
      borderColor: input.borderColor ?? '#DCE7E5',
      logoUrl: input.logoUrl?.trim() ?? '',
      websiteUrl: input.websiteUrl?.trim() ?? '',
      brandTagline: input.brandTagline?.trim() ?? '',
      footerNote: input.footerNote?.trim() ?? '',
      fontFamily: input.fontFamily ?? 'Arial, Helvetica, sans-serif',
      style: input.style ?? 'minimal-editorial',
    };
    if (!brief.businessName?.trim() || !brief.topic?.trim() || !brief.audience?.trim()) {
      return NextResponse.json({ error: 'Business name, topic, and audience are required.' }, { status: 400 });
    }

    const copy = process.env.GEMINI_API_KEY ? await generateGeminiCopy(brief, input.refreshSeed) : undefined;
    return NextResponse.json({ draft: generateNewsletterDraft(brief, copy), provider: copy ? 'gemini' : 'fallback' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to generate the newsletter draft.';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
