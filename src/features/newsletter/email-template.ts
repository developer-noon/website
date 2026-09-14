import type { NewsletterDraft, NewsletterBrief, NewsletterStyle } from './types';

function escapeHtml(value: string) {
  return value.replace(/[&<>\"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character] ?? character);
}

function safeUrl(value: string, fallback = '#') {
  return /^https?:\/\//i.test(value) ? escapeHtml(value) : fallback;
}

export function renderNewsletterHtml(brief: NewsletterBrief, draft: Omit<NewsletterDraft, 'html' | 'plainText'>) {
  const preset = getStylePreset(draft.style, brief);
  const offerUrl = safeUrl(draft.callToActionUrl || brief.offerUrl);
  const radius = preset.radius;
  const font = preset.font;
  const content = renderLayout(draft, offerUrl, preset);

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>@media screen and (max-width:620px){.newsletter-column{display:block!important;width:100%!important;padding-left:0!important;padding-right:0!important}.newsletter-column + .newsletter-column{padding-top:20px!important}}</style>
<title>${escapeHtml(draft.subjectLines[0])}</title>
</head>
<body style="margin:0;padding:0;background:${preset.background};color:${preset.text};font-family:${font};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(draft.previewText)}</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:${preset.background};">
<tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:620px;background:${preset.surface};border:1px solid ${preset.borderColor};border-radius:${radius};overflow:hidden;">
<tr><td style="padding:32px;background:${preset.hero};color:${preset.heroText};">
${preset.logoUrl ? `<img src="${preset.logoUrl}" alt="${escapeHtml(brief.businessName)}" width="160" style="display:block;max-width:160px;height:auto;margin:0 0 18px;">` : ''}
<p style="margin:0;font-size:13px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;">${escapeHtml(brief.businessName)}</p>
${brief.brandTagline ? `<p style="margin:8px 0 0;font-size:14px;line-height:1.5;">${escapeHtml(brief.brandTagline)}</p>` : ''}
<h1 style="margin:18px 0 0;font-size:34px;line-height:1.12;letter-spacing:-1px;">${escapeHtml(draft.subjectLines[0])}</h1>
</td></tr>
<tr><td style="padding:32px;">${content}</td></tr>
<tr><td style="padding:22px 32px;background:${preset.footer};color:${preset.footerText};font-size:12px;line-height:1.5;">${escapeHtml(brief.footerNote || `You are receiving this email because you opted in to hear from ${brief.businessName}.`)}${safeUrl(brief.websiteUrl, '') ? ` <a href="${safeUrl(brief.websiteUrl, '')}" style="color:${preset.footerText};">Visit website</a>` : ''}</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

type StylePreset = { primary: string; secondary: string; accent: string; background: string; surface: string; text: string; muted: string; textOnPrimary: string; textOnAccent: string; borderColor: string; hero: string; heroText: string; footer: string; footerText: string; radius: string; font: string; logoUrl: string };

function safeColor(value: string, fallback: string) {
  return /^#[0-9A-Fa-f]{6}$/.test(value) ? value : fallback;
}

function getStylePreset(style: NewsletterStyle, brief: NewsletterBrief): StylePreset {
  const brand = {
    primary: safeColor(brief.primaryColor, '#0B353B'),
    secondary: safeColor(brief.secondaryColor, '#4A5C5F'),
    accent: safeColor(brief.accentColor, '#ABFFAE'),
    background: safeColor(brief.backgroundColor, '#F3F7F6'),
    surface: safeColor(brief.surfaceColor, '#FFFFFF'),
    text: safeColor(brief.textColor, '#0B353B'),
    muted: safeColor(brief.mutedColor, '#4A5C5F'),
    textOnPrimary: safeColor(brief.textOnPrimaryColor, '#FFFFFF'),
    textOnAccent: safeColor(brief.textOnAccentColor, '#0B353B'),
    borderColor: safeColor(brief.borderColor, '#DCE7E5'),
  };
  const allowedFonts = new Set(['Arial, Helvetica, sans-serif', 'Georgia, Times New Roman, serif', 'Verdana, Geneva, sans-serif', 'Trebuchet MS, Arial, sans-serif', 'Courier New, Courier, monospace']);
  const font = allowedFonts.has(brief.fontFamily) ? brief.fontFamily : 'Arial, Helvetica, sans-serif';
  const logoUrl = safeUrl(brief.logoUrl, '');
  const presets: Record<NewsletterStyle, StylePreset> = {
    'minimal-editorial': { ...brand, hero: brand.primary, heroText: brand.textOnPrimary, footer: brand.primary, footerText: brand.textOnPrimary, radius: '0', font, logoUrl },
    'neo-brutalism': { ...brand, hero: brand.accent, heroText: brand.textOnAccent, footer: brand.primary, footerText: brand.textOnPrimary, radius: '0', font, logoUrl },
    'dark-cyberpunk': { ...brand, hero: brand.secondary, heroText: brand.textOnPrimary, footer: brand.primary, footerText: brand.textOnPrimary, radius: '8px', font, logoUrl },
    'swiss-bauhaus': { ...brand, hero: brand.surface, heroText: brand.text, footer: brand.primary, footerText: brand.textOnPrimary, radius: '0', font, logoUrl },
    kinetic: { ...brand, hero: brand.primary, heroText: brand.textOnPrimary, footer: brand.secondary, footerText: brand.textOnPrimary, radius: '28px', font, logoUrl },
    'frosted-glass': { ...brand, hero: brand.secondary, heroText: brand.textOnPrimary, footer: brand.primary, footerText: brand.textOnPrimary, radius: '24px', font, logoUrl },
    'retro-y2k': { ...brand, hero: brand.accent, heroText: brand.textOnAccent, footer: brand.primary, footerText: brand.textOnPrimary, radius: '16px', font, logoUrl },
    'organic-earthy': { ...brand, hero: brand.primary, heroText: brand.textOnPrimary, footer: brand.secondary, footerText: brand.textOnPrimary, radius: '20px', font, logoUrl },
  };
  return presets[style] ?? presets['minimal-editorial'];
}

function renderLayout(draft: Omit<NewsletterDraft, 'html' | 'plainText'>, offerUrl: string, preset: StylePreset) {
  const intro = `<p style="margin:0;font-size:18px;line-height:1.6;color:${preset.text};">${escapeHtml(draft.intro)}</p>`;
  const sections = draft.sections.map((section) => `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:28px;"><tr><td style="border-left:4px solid ${preset.accent};padding-left:16px;"><h2 style="margin:0 0 8px;font-size:21px;line-height:1.25;color:${preset.text};">${escapeHtml(section.heading)}</h2><p style="margin:0;font-size:16px;line-height:1.65;color:${preset.muted};">${escapeHtml(section.body)}</p></td></tr></table>`).join('');
  const offer = `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:32px;background:${preset.accent};"><tr><td style="padding:24px;"><h2 style="margin:0 0 8px;font-size:22px;color:${preset.textOnAccent};">${escapeHtml(draft.offerTitle)}</h2><p style="margin:0 0 18px;font-size:16px;line-height:1.6;color:${preset.textOnAccent};">${escapeHtml(draft.offerBody)}</p><a href="${offerUrl}" style="display:inline-block;background:${preset.primary};color:${preset.textOnPrimary};text-decoration:none;padding:13px 20px;font-weight:bold;">${escapeHtml(draft.callToAction)}</a></td></tr></table>`;
  const resources = draft.resources?.length ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:32px;border-top:1px solid ${preset.borderColor};"><tr><td style="padding-top:24px;"><h2 style="margin:0 0 14px;font-size:21px;color:${preset.text};">Worth your time</h2>${draft.resources.map((resource) => `<p style="margin:0 0 14px;font-size:15px;line-height:1.55;"><a href="${safeUrl(resource.url)}" style="color:${preset.primary};font-weight:bold;">${escapeHtml(resource.title)}</a><br><span style="color:${preset.muted};">${escapeHtml(resource.description)}</span></p>`).join('')}</td></tr></table>` : '';
  const proof = `<p style="margin:30px 0 0;padding-top:24px;border-top:1px solid ${preset.borderColor};font-size:15px;line-height:1.6;color:${preset.muted};"><strong style="color:${preset.text};">What customers are saying:</strong><br>${escapeHtml(draft.socialProof)}</p>`;
  return `${intro}${sections}${resources}${offer}${proof}`;
}

export function renderNewsletterPlainText(brief: NewsletterBrief, draft: Omit<NewsletterDraft, 'html' | 'plainText'>) {
  return [
    brief.businessName,
    draft.subjectLines[0],
    '',
    draft.intro,
    ...draft.sections.flatMap((section) => [`${section.heading}:`, section.body, '']),
    draft.offerTitle,
    draft.offerBody,
    `${draft.callToAction}: ${draft.callToActionUrl || brief.offerUrl}`,
    '',
    ...(draft.resources?.length ? ['', 'Worth your time:', ...draft.resources.flatMap((resource) => [`${resource.title} - ${resource.description}`, resource.url, ''])] : []),
    `What customers are saying: ${draft.socialProof}`,
  ].join('\n');
}
