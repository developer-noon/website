import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getMongoDatabase } from '@/lib/mongodb';
import { generateNewsletterDraft } from '@/features/newsletter/generator';
import type { NewsletterBrief, NewsletterResource, NewsletterSession } from '@/features/newsletter/types';
import { ObjectId } from 'mongodb';

type BrandDocument = { userId: string; brief: NewsletterBrief };
type SessionDocument = Omit<NewsletterSession, 'id'> & { _id: ObjectId; userId: string };

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  try {
    const input = await request.json() as Partial<NewsletterBrief> & { refreshSeed?: string; resources?: NewsletterResource[]; sessionId?: string };
    const user = session.user as typeof session.user & { id?: string };
    const userId = user.id || user.email || '';
    const database = await getMongoDatabase();
    const savedBrand = await database.collection<BrandDocument>('newsletter_brand_profiles').findOne({ userId });
    const savedSession = input.sessionId && ObjectId.isValid(input.sessionId)
      ? await database.collection<SessionDocument>('newsletter_sessions').findOne({ _id: new ObjectId(input.sessionId), userId })
      : null;
    const savedBrief = savedBrand?.brief;
    const brief: NewsletterBrief = {
      businessName: input.businessName?.trim() || savedBrief?.businessName || 'Your brand',
      audience: input.audience?.trim() || savedBrief?.audience || 'curious readers',
      voice: input.voice?.trim() || savedBrief?.voice || 'clear, helpful, and confident',
      tone: input.tone ?? savedBrief?.tone ?? 'professional',
      topic: input.topic?.trim() || savedSession?.topic || savedBrief?.topic || 'Useful ideas for this week',
      keyMessages: input.keyMessages?.trim() || savedBrief?.keyMessages || '',
      offer: input.offer?.trim() || savedBrief?.offer || '',
      offerUrl: input.offerUrl?.trim() || savedBrief?.offerUrl || '',
      socialProof: input.socialProof?.trim() || savedBrief?.socialProof || '',
      callToAction: input.callToAction?.trim() || savedBrief?.callToAction || 'Explore the offer',
      primaryColor: input.primaryColor ?? savedBrief?.primaryColor ?? '#0B353B',
      secondaryColor: input.secondaryColor ?? savedBrief?.secondaryColor ?? '#4A5C5F',
      accentColor: input.accentColor ?? savedBrief?.accentColor ?? '#ABFFAE',
      backgroundColor: input.backgroundColor ?? savedBrief?.backgroundColor ?? '#F3F7F6',
      surfaceColor: input.surfaceColor ?? savedBrief?.surfaceColor ?? '#FFFFFF',
      textColor: input.textColor ?? savedBrief?.textColor ?? '#0B353B',
      mutedColor: input.mutedColor ?? savedBrief?.mutedColor ?? '#4A5C5F',
      textOnPrimaryColor: input.textOnPrimaryColor ?? savedBrief?.textOnPrimaryColor ?? '#FFFFFF',
      textOnAccentColor: input.textOnAccentColor ?? savedBrief?.textOnAccentColor ?? '#0B353B',
      borderColor: input.borderColor ?? savedBrief?.borderColor ?? '#DCE7E5',
      logoUrl: input.logoUrl?.trim() || savedBrief?.logoUrl || '',
      websiteUrl: input.websiteUrl?.trim() || savedBrief?.websiteUrl || '',
      brandTagline: input.brandTagline?.trim() || savedBrief?.brandTagline || '',
      footerNote: input.footerNote?.trim() || savedBrief?.footerNote || '',
      fontFamily: input.fontFamily ?? savedBrief?.fontFamily ?? 'Arial, Helvetica, sans-serif',
      style: input.style ?? savedBrief?.style ?? 'minimal-editorial',
    };
    const resources = savedSession?.resources ?? input.resources ?? [];
    return NextResponse.json({ draft: generateNewsletterDraft(brief, undefined, resources), provider: 'deterministic' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to generate the newsletter draft.';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
