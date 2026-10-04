import type { NewsletterBrief, NewsletterDraft } from './types';

type DraftContent = Omit<NewsletterDraft, 'html' | 'plainText'>;

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function paragraphs(value: string) {
  return value
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `<p style="margin:0 0 16px">${escapeHtml(line)}</p>`)
    .join('');
}

export function renderNewsletterHtml(brief: NewsletterBrief, draft: DraftContent) {
  const sections = draft.sections
    .map((section) => `<section style="margin:32px 0"><h2 style="color:${brief.primaryColor};font-size:22px;margin:0 0 10px">${escapeHtml(section.heading)}</h2><p style="margin:0;line-height:1.7">${escapeHtml(section.body)}</p></section>`)
    .join('');
  const resources = (draft.resources ?? []).map((resource) => `<li style="margin:0 0 10px"><a href="${escapeHtml(resource.url)}" style="color:${brief.primaryColor}">${escapeHtml(resource.title)}</a></li>`).join('');
  const logo = brief.logoUrl ? `<img src="${escapeHtml(brief.logoUrl)}" alt="${escapeHtml(brief.businessName)}" style="max-height:42px;max-width:180px;margin-bottom:20px" />` : '';
  const header = brief.showHeader === false ? '' : `<header style="border-bottom:1px solid ${brief.borderColor};padding-bottom:24px">${logo}<p style="color:${brief.mutedColor};font-size:13px;margin:0">${escapeHtml(brief.brandTagline || brief.businessName)}</p></header>`;
  const footer = brief.showFooter === false ? '' : `<footer style="border-top:1px solid ${brief.borderColor};color:${brief.mutedColor};font-size:12px;margin-top:40px;padding-top:20px">${escapeHtml(brief.footerNote || brief.businessName)}</footer>`;

  return `<!doctype html><html><body style="background:${brief.backgroundColor};color:${brief.textColor};font-family:${escapeHtml(brief.fontFamily)},Arial,sans-serif;margin:0;padding:24px"><main style="background:${brief.surfaceColor};border:1px solid ${brief.borderColor};max-width:640px;margin:0 auto;padding:40px;border-radius: 0">${header}<p style="color:${brief.mutedColor};font-size:13px;margin:24px 0 8px">${escapeHtml(draft.previewText)}</p><h1 style="color:${brief.primaryColor};font-size:32px;line-height:1.15;margin:0 0 24px">${escapeHtml(draft.subjectLines[0] || brief.topic)}</h1>${paragraphs(draft.intro)}${sections}<aside style="background:${brief.accentColor};border-radius: 0;padding:24px;margin-top:32px"><h2 style="margin:0 0 8px;color:${brief.textOnAccentColor}">${escapeHtml(draft.offerTitle)}</h2><p style="color:${brief.textOnAccentColor};margin:0 0 18px;line-height:1.6">${escapeHtml(draft.offerBody)}</p><a href="${escapeHtml(draft.callToActionUrl)}" style="background:${brief.primaryColor};color:${brief.textOnPrimaryColor};display:inline-block;padding:12px 18px;border-radius: 0;text-decoration:none;font-weight:700">${escapeHtml(draft.callToAction)}</a></aside>${resources ? `<h2 style="color:${brief.primaryColor};font-size:18px;margin-top:36px">Further reading</h2><ul style="padding-left:20px">${resources}</ul>` : ''}<p style="color:${brief.mutedColor};font-style:italic;margin-top:32px">${escapeHtml(draft.socialProof)}</p>${footer}</main></body></html>`;
}

export function renderNewsletterPlainText(brief: NewsletterBrief, draft: DraftContent) {
  const sections = draft.sections.map((section) => `${section.heading}\n${section.body}`).join('\n\n');
  const resources = (draft.resources ?? []).map((resource) => `- ${resource.title}: ${resource.url}`).join('\n');
  return [
    draft.subjectLines[0] || brief.topic,
    draft.previewText,
    draft.intro,
    sections,
    `${draft.offerTitle}\n${draft.offerBody}\n${draft.callToAction}: ${draft.callToActionUrl}`,
    resources ? `Further reading\n${resources}` : '',
    draft.socialProof,
    brief.footerNote,
  ].filter(Boolean).join('\n\n');
}
