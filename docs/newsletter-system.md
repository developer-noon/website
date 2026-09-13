# Automated Newsletter System

## Product boundary

The newsletter system is a private authenticated tool under `/dashboard/newsletter`. Public visitors never see its navigation or workspace. The current MVP is designed for 5-10 pilot clients with human review before export.

## Recommended stack

- **Web app:** Next.js App Router, React, TypeScript, Tailwind CSS.
- **Auth and tenancy:** Auth.js with MongoDB-backed users. Add `workspaceId` to every newsletter document before onboarding multiple businesses.
- **Database:** MongoDB for briefs, brand profiles, drafts, approvals, and delivery records.
- **AI provider:** Gemini server adapter with a deterministic fallback. Keep API keys server-only.
- **Email delivery:** Resend or Postmark for transactional verification and campaign delivery; customer ESP APIs for direct publishing.
- **Scheduling:** Vercel Cron for pilot volume, then Trigger.dev or BullMQ with Redis for retries and per-workspace schedules.
- **Observability:** Structured server logs, Sentry for errors, and provider request IDs attached to every generation and delivery job.

## Architecture

```text
Authenticated dashboard
        |
        v
Weekly brief + brand profile -----> Newsletter API
                                      |
                         +------------+------------+
                         |                         |
                  Context builder              AI adapter
                  website / examples           outline -> copy -> QA
                         |                         |
                         +------------+------------+
                                      v
                              Draft normalizer
                                      |
                    +-----------------+------------------+
                    |                                    |
             HTML email renderer                    Plain text renderer
                    |                                    |
       preview / edit / approve / export       copy / download / ESP push
                                      |
                              feedback + analytics
```

## Current module layout

```text
src/
  app/
    dashboard/
      components/DashboardShell.tsx
      newsletter/page.tsx
    api/newsletter/generate/route.ts
  features/newsletter/
    NewsletterStudio.tsx
    email-template.ts
    gemini.ts
    generator.ts
    types.ts
```

The UI, generation contract, and email renderer are deliberately separate. The current generator is a deterministic pilot fallback; an LLM adapter can replace it without changing the editor or export surface.

## Visual direction system

The studio keeps content structure separate from visual direction. A client can switch between eight presets without rewriting the brief:

- High-End Minimal & Editorial: `Go Premium & Clean`
- Brutalism & Neo-Brutalism: `Make It Loud & Edgy`
- Dark Mode & Cyberpunk: `Switch to Dark Tech`
- Swiss Design / Bauhaus: `Keep It Bold & Structured`
- Kinetic & Interactive Style: `Add Modern Motion`
- Glassmorphism / Frosted Neo-Glass: `Add Soft Depth`
- Retro-Futurism / Y2K Minimal: `Bring Back the Future`
- Organic / Earthy Minimal: `Warm It Up`

The deterministic email renderer uses one stable editorial structure; refresh changes the copy and angle, not the email template. The renderer owns the email-client-safe table markup. All colors, contrast colors, logo, font, tagline, website, and footer content come from the workspace brand kit.

## Database schema outline

```text
workspaces
  _id, name, ownerUserId, createdAt, settings

brand_profiles
  _id, workspaceId, voice, audience, colors, logoUrl, typography,
  styleRules, approvedExamples[], updatedAt

newsletter_briefs
  _id, workspaceId, topic, keyMessages[], offer, offerUrl,
  socialProof, callToAction, scheduledFor, createdBy, createdAt

newsletter_drafts
  _id, workspaceId, briefId, version, subjects[], previewText,
  sections[], html, plainText, status, model, promptVersion,
  createdBy, approvedBy, createdAt, updatedAt

newsletter_deliveries
  _id, workspaceId, draftId, provider, providerMessageId,
  audienceId, status, sentAt, metrics
```

Every query must filter by `workspaceId`; never trust a workspace identifier sent by the browser.

## AI generation chain

1. **Context enrichment:** normalize the brief, brand profile, approved examples, offer facts, and audience constraints.
2. **Research:** optionally collect only approved website or CRM facts; attach source URLs to the context.
3. **Outline:** return a fixed JSON shape for intro, value sections, offer, proof, CTA, and objections.
4. **Copy:** write the sections using the requested voice and a selected framework such as AIDA or PAS.
5. **Variants:** produce 3-5 subject lines and two preview text options with length checks.
6. **Voice rewrite:** compare against approved examples and rewrite only where the voice score is weak.
7. **QA:** validate links, claims, forbidden content, HTML length, accessibility labels, and required CTA.
8. **Render:** pass only normalized structured content to the deterministic HTML renderer.

### Prompt contract

```text
SYSTEM
You are a conversion-focused newsletter editor. Return valid JSON only.
Never invent customer results, product capabilities, prices, or claims.
Use the brand voice and approved examples as constraints, not as facts.

INPUT
Brand profile: {{brandProfile}}
Audience: {{audience}}
Weekly brief: {{brief}}
Approved examples: {{examples}}
Framework: {{framework}}

OUTPUT SCHEMA
{
  "subjectLines": ["...", "...", "..."],
  "previewText": "...",
  "intro": "...",
  "sections": [{"heading": "...", "body": "..."}],
  "offerTitle": "...",
  "offerBody": "...",
  "socialProof": "...",
  "callToAction": "...",
  "callToActionUrl": "...",
  "claimsToVerify": [],
  "voiceNotes": []
}
```

## Email HTML approach

Use a hybrid deterministic renderer, not pure AI HTML. AI produces structured copy; the renderer owns table layout, inline styles, safe escaping, responsive width, preheader text, color contrast, and plain-text parity. Add Litmus or Email on Acid snapshots before enabling automatic sends. Support unsubscribe and preference URLs before production delivery.

## Key integrations

- Website crawl: Firecrawl or a constrained internal fetcher with robots and allow-list controls.
- AI: OpenAI or Anthropic through a server-only adapter.
- Delivery: Resend/Postmark for platform email; Mailchimp, HubSpot, ActiveCampaign, Klaviyo, Brevo, or ConvertKit APIs for customer ESP publishing.
- Analytics: provider webhooks for delivered, opened, clicked, bounced, and unsubscribed events.
- Media: Unsplash/Pexels search or an approved image library; image generation only after brand and rights review.

## Delivery plan

### Phase 1: pilot MVP

- Finish persistent workspace and brand profile models.
- Add LLM adapter behind the existing generation contract.
- Store draft versions, approval events, and exports in MongoDB.
- Add unsubscribe-safe export fields and manual ESP copy/paste workflow.
- Onboard 5-10 clients with human review on every send.

### Phase 2: automation

- Add weekly schedules, retryable jobs, ESP OAuth connections, and send approvals.
- Add website context refresh, example selection from best-performing emails, and campaign analytics webhooks.
- Add email rendering snapshots for desktop/mobile and link/claim QA gates.

### Phase 3: scale

- Move jobs to a durable queue with idempotency keys.
- Add workspace-level quotas, model routing, prompt versioning, audit logs, and encrypted provider tokens.
- Add retrieval over brand examples and performance-informed subject/CTA recommendations.

## Security and cost

- Keep model, SMTP, database, and ESP credentials server-side only.
- Enforce workspace ownership on every server query and API mutation.
- Sanitize imported HTML and never render untrusted HTML outside a sandboxed preview.
- Rate-limit generation and webhook endpoints; add idempotency to send operations.
- Log metadata and request IDs, not raw customer lists or secrets.
- Estimate AI cost per draft before generation and cap tokens by workspace plan.
- Cache brand context and approved examples; do not send the full history to every model request.
- Require human approval until claim validation, unsubscribe handling, and delivery monitoring are proven.
