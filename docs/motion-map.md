# UI architecture and motion map

This document describes the "Tech Noir" theme, the dashboard layout, and the scroll animations on the two studio pages. The code is the source of truth. Each section links to the files that implement it.

## 1. Theme and contrast

Tokens live in `src/app/globals.css` (`:root`). Every component reads colour through these variables.

| Token | Value | Use | Contrast on `--color-bg` |
| --- | --- | --- | --- |
| `--color-bg` | `#05070d` | Page background | — |
| `--color-surface` / `--color-surface-raised` | `#0d1320` / `#151d2e` | Cards, menus, table heads | — |
| `--color-ink` | `#f4f7fc` | Headings, active labels | ~18:1 |
| `--color-text` | `#e6edf7` | Body text | ~17:1 |
| `--color-text-muted` | `#a3b0c6` | Secondary text, inactive nav | ~9:1 |
| `--color-primary` | `#22d3ee` | Primary buttons, active markers, focus ring | ~11:1 |
| `--color-on-primary` | `#021318` | Text on primary | ~11:1 on primary |
| `--color-secondary` | `#67e8f9` | Accent text, text on `--color-mint` | ~13:1 |
| `--color-mint` | `#0b2833` | Selected and tinted backgrounds | — |

Pairing rules (these prevent the earlier black-on-black bug):

- Text on `--color-primary` is always `--color-on-primary`.
- Text on `--color-mint` is `--color-secondary` or `--color-ink`.
- `--color-ink` is a text colour only. Never use it as a background behind white text.
- `--color-white` and `--color-black` are defined in `:root`. Tailwind's `text-white` and `bg-black` compile to these variables, and they rendered as nothing before they were defined.

States:

- Navigation links: `--color-text-muted` at rest; `--color-ink` on hover; the active item gets a `--color-mint` background, a cyan icon, and a glowing cyan bar.
- Primary buttons get a cyan glow on hover. Secondary buttons swap their border and text to cyan.
- Focus: a 3px cyan outline on every focusable element.

## 2. Dashboard layout

The top tab strip is gone. The sidebar is the only navigation, and the breadcrumbs are derived from the same config, so the two can never disagree.

Implemented in `src/app/dashboard/components/DashboardShell.tsx` (`navGroups`).

```
DashboardShell
├── Sidebar (desktop fixed, mobile drawer)        ← single source of truth
│   ├── Overview      Dashboard
│   ├── Time          Daily log · Analytics
│   ├── Clients CRM   Clients · Projects · People
│   ├── Billing       Pay structure · Billing cycles · Client reports · Hours report PDF
│   ├── Workspace     Team workspace
│   ├── Settings      Account
│   └── Public site link
├── Header
│   ├── Breadcrumbs   Dashboard › {group} › {item}   (e.g. Dashboard › Clients CRM › Clients)
│   └── Profile menu  name and email, Account settings, Log out (closes on Escape or outside click)
└── <main> page content
```

Tracker sections still share `/dashboard/pay-structure` and are selected with `?tab=` (`hours`, `analytics`, `clients`, `projects`, `team`, `pay`, `income`, `reports`). Each one now has its own sidebar entry.

## 3. Public pages and scroll-animation map

Shared setup:

- **Lenis** smooth scrolling (`src/components/motion/SmoothScroll.tsx`) runs on GSAP's ticker, so ScrollTrigger and Lenis read the same scroll position every frame.
- **GSAP ScrollTrigger** through `useScrollMotion` (`src/components/motion/gsap.ts`). It runs inside `gsap.matchMedia`, adds `data-motion="on"` to the section, and reverts everything on unmount.
- **Static first.** Each section's default markup is a readable static layout. Tailwind `group-data-[motion=on]:` classes switch to the animated layout only while motion runs. Visitors who prefer reduced motion, visitors without JavaScript, and (for the horizontal gallery) phones get the static version.

### Page 1: `/process` — "Our Animation Process & Pipeline"

| # | Asset | File | Trigger | What happens as you scroll |
| --- | --- | --- | --- | --- |
| 1 | Pipeline rail | `motion/process/PipelineRail.tsx` | Pin `top top` → `+=300%`, `scrub: 0.6` | A cyan rail fills left to right across Storyboarding, Rigging, and Rendering. Each node pops in (`back.out`) as the rail reaches it, and the stage panels hand off with a fade-and-rise. |
| 2 | Morphing canvas sequence | `motion/process/MorphCanvas.tsx` | Pin `top top` → `+=250%`, `scrub: true`, `onUpdate` → `requestAnimationFrame` redraw | One figure is drawn procedurally across 240 "frames". 0–33%: pencil strokes draw in, limb by limb, inside a dashed storyboard frame. 33–66%: cyan bones and joint controls appear and the arm swings into a wave (IK handle shown). 66–100%: the sketch fades and a solid, rim-lit render takes over. Captions highlight the current stage and a frame counter ticks. |
| 3 | Exploded render passes | `motion/process/RenderPasses.tsx` | Pin `top top` → `+=260%`, `scrub: 0.8` | Five passes (Depth, Shadow, Diffuse, Specular, Beauty) start stacked as one picture. The stage tilts to an isometric angle (`rotationX 58°`, `rotationZ −30°`), and the layers separate on Z, 95px apart. A legend lights up pass by pass, then everything folds back flat, leaving only the Beauty pass. |

Content blueprint: hero ("From first sketch to final frame") → the three assets above → CTA to `/work`.

### Page 2: `/work` — "Case Studies & Creative Showcase"

| # | Asset | File | Trigger | What happens as you scroll |
| --- | --- | --- | --- | --- |
| 1 | Horizontal pin gallery | `motion/work/HorizontalShowcase.tsx` | Pin `top top` → `+=(track width − viewport)`, `scrub: 1`, `invalidateOnRefresh`; `min-width: 768px` only | Vertical scroll moves the project track sideways. Each cover's artwork has its own trigger on the horizontal tween (`containerAnimation`) and drifts −10% to +10% against the track for parallax depth. A thin bar shows progress. On phones it falls back to native swipe with snap points. |
| 2 | Raw-to-final scrub | `motion/work/RawToFinal.tsx` | Pin `top top` → `+=200%`, `scrub: 0.5` | The final render wipes over the blockout via `clip-path: inset(0 100% 0 0 → 0 0 0 0)`. A glowing divider with a handle follows the wipe, and a frame counter (001 to 240) mimics scrubbing an image sequence. The static version shows both frames side by side. |
| 3 | Stacked case cards | `motion/work/StackedCases.tsx` | Cards are `position: sticky`; each card scrubs from `top 70%` to `top top+=120` of the next card; counters fire once at `top 85%` | Each case study sticks while the next slides over it. The covered card scales to 92% and dims with `brightness()`, so it never shows through. Metrics count up from zero when they appear. |

Content blueprint: hero ("Work that moves the numbers") → the three assets above → contact CTA.

## 4. Before launch

- **Replace the sample case studies.** Every item in `src/components/motion/work/data.ts` is a placeholder with `sample: true`, which shows a visible badge. Put in real, verifiable projects and metrics, with client permission, then set `sample` to `false`.
- **Swap the generated artwork for real renders** (the SVG covers and the raw and final frames) when they are available. Keep the same element structure so the triggers still apply.
- **Lottie, Rive, and Three.js were not added.** They need production assets (JSON, `.riv`, models). The canvas sequence and the SVG layers deliver the same scroll-linked effects without large downloads. If real assets arrive, they can be dropped into the same pinned sections and driven by `self.progress`.

## 5. Site-wide motion layer

Every public page shares `src/components/motion/PageMotion.tsx` and Lenis smooth scrolling, both mounted once in `src/app/(marketing)/layout.tsx`. Pages opt in with attributes:

| Attribute | Effect |
| --- | --- |
| `<SplitWords>` (`data-fx="words"`) | Headline words rise in one after another |
| `data-fx="batch"` | Direct children enter in a staggered wave (`ScrollTrigger.batch`) |
| `data-fx="pop"` | Icons spring in with `back.out` |
| `data-fx="slide-left"` / `"slide-right"` | Panels enter from alternating sides (features page) |
| `data-fx="parallax"` + `data-speed` | Drifts against the scroll (home hero preview) |
| `data-fx="spin"` + `data-turns` | Rotates with scroll position (security rings, home steps) |
| `data-fx="scrub-x"` + `data-distance` | Slides sideways with scroll (home capability band) |
| `data-fx="progress"` | Reading-progress bar (privacy, terms) |

`Reveal` also uses GSAP now. Content is visible by default and only animates when reduced motion is not requested.

## 6. Report infographics

Chart components are in `src/components/charts/` and animate between values with GSAP (`useTweenedValues`), so they move when the data changes. Every chart sits in a `ChartCard` with a Chart / Table toggle, has hover states, and labels values in text colours.

- **Hours report** (`src/app/dashboard/hours-report/ReportInsights.tsx`): stat tiles (total, video, days worked, average per day), a video/admin donut, hours per day, and top tasks. They update live as rows are edited, removed, or dragged between sections.
- **Report history:** report count, total hours reported, and a bar chart of hours per report (last 12).
- **Tracker → Analytics:** total, billed, and unbilled tiles, plus a billed vs unbilled stacked bar per client.

Palette: blue `#3987e5` and orange `#d95926` for the two categories, cyan `#22d3ee` for single-series charts. Checked with the dataviz palette validator on the `#0d1320` surface: all checks pass (CVD ΔE 26.8, contrast ≥ 3:1).
