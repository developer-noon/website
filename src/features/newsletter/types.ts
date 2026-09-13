export type NewsletterStyle =
  | 'minimal-editorial'
  | 'neo-brutalism'
  | 'dark-cyberpunk'
  | 'swiss-bauhaus'
  | 'kinetic'
  | 'frosted-glass'
  | 'retro-y2k'
  | 'organic-earthy';

export type NewsletterTone = 'professional' | 'friendly' | 'conversational' | 'bold' | 'warm' | 'concise';

export type NewsletterBrief = {
  businessName: string;
  audience: string;
  voice: string;
  tone: NewsletterTone;
  topic: string;
  keyMessages: string;
  offer: string;
  offerUrl: string;
  socialProof: string;
  callToAction: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  mutedColor: string;
  textOnPrimaryColor: string;
  textOnAccentColor: string;
  borderColor: string;
  logoUrl: string;
  websiteUrl: string;
  brandTagline: string;
  footerNote: string;
  fontFamily: string;
  style: NewsletterStyle;
};

export type NewsletterSection = {
  heading: string;
  body: string;
};

export type NewsletterCopy = {
  subjectLines: string[];
  previewText: string;
  intro: string;
  sections: NewsletterSection[];
  offerTitle: string;
  offerBody: string;
  socialProof: string;
  callToAction: string;
  callToActionUrl: string;
};

export type NewsletterDraft = {
  subjectLines: string[];
  previewText: string;
  intro: string;
  sections: NewsletterSection[];
  offerTitle: string;
  offerBody: string;
  socialProof: string;
  callToAction: string;
  callToActionUrl: string;
  html: string;
  plainText: string;
  status: 'draft' | 'approved';
  style: NewsletterStyle;
  tone: NewsletterTone;
};
