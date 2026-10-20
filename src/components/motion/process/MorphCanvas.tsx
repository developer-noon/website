'use client';

import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger, useScrollMotion } from '../gsap';

/* Scene units: the figure is drawn in a 400 x 500 box and scaled to the canvas. */
const SCENE_W = 400;
const SCENE_H = 500;
const FRAMES = 240;

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const ease = (value: number) => (value < 0.5 ? 2 * value * value : 1 - (-2 * value + 2) ** 2 / 2);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

type Point = { x: number; y: number };

/** Joint positions for a pose. `raise` (0 to 1) lifts the right arm into a wave as the rig is animated. */
function pose(raise: number) {
  const shoulder = { x: 200, y: 185 };
  const hip = { x: 200, y: 300 };
  const armAngle = lerp(1.25, -0.55, raise);
  const forearmAngle = armAngle - lerp(0.2, 1.1, raise);
  const elbow = { x: shoulder.x + Math.cos(armAngle) * 70, y: shoulder.y + Math.sin(armAngle) * 70 };
  const hand = { x: elbow.x + Math.cos(forearmAngle) * 62, y: elbow.y + Math.sin(forearmAngle) * 62 };
  return {
    head: { x: 200, y: 120 },
    neck: { x: 200, y: 160 },
    shoulder,
    hip,
    elbowR: elbow,
    handR: hand,
    elbowL: { x: 150, y: 245 },
    handL: { x: 135, y: 305 },
    kneeR: { x: 228, y: 380 },
    footR: { x: 240, y: 460 },
    kneeL: { x: 172, y: 380 },
    footL: { x: 158, y: 460 },
  };
}

function bones(p: ReturnType<typeof pose>): [Point, Point][] {
  return [
    [p.neck, p.hip],
    [p.shoulder, p.elbowR], [p.elbowR, p.handR],
    [p.shoulder, p.elbowL], [p.elbowL, p.handL],
    [p.hip, p.kneeR], [p.kneeR, p.footR],
    [p.hip, p.kneeL], [p.kneeL, p.footL],
  ];
}

/** Deterministic wobble so the "pencil" lines look hand-drawn but do not flicker between frames. */
const wobble = (seed: number) => Math.sin(seed * 12.9898) * 3.2;

function draw(canvas: HTMLCanvasElement, progress: number) {
  const context = canvas.getContext('2d');
  if (!context) return;
  const ratio = window.devicePixelRatio || 1;
  const { width, height } = canvas.getBoundingClientRect();
  if (canvas.width !== Math.round(width * ratio)) canvas.width = Math.round(width * ratio);
  if (canvas.height !== Math.round(height * ratio)) canvas.height = Math.round(height * ratio);

  context.setTransform(1, 0, 0, 1, 0, 0);
  context.clearRect(0, 0, canvas.width, canvas.height);
  const scale = Math.min(width / SCENE_W, height / SCENE_H);
  context.setTransform(ratio * scale, 0, 0, ratio * scale, ratio * (width - SCENE_W * scale) / 2, ratio * (height - SCENE_H * scale) / 2);

  const sketch = clamp01(progress / 0.34);
  const rig = clamp01((progress - 0.33) / 0.34);
  const render = clamp01((progress - 0.66) / 0.34);
  const p = pose(ease(rig));
  const segments = bones(p);
  context.lineCap = 'round';
  context.lineJoin = 'round';

  // Stage 1: storyboard frame and pencil strokes, drawn progressively.
  const sketchAlpha = 1 - render;
  if (sketchAlpha > 0) {
    context.globalAlpha = sketchAlpha;
    context.setLineDash([8, 8]);
    context.strokeStyle = '#454745';
    context.lineWidth = 2;
    context.strokeRect(20, 30, 360, 450);
    context.setLineDash([]);
    context.strokeStyle = '#C9D1C2';
    context.lineWidth = 2;
    const reveal = sketch * segments.length;
    segments.forEach(([from, to], index) => {
      const amount = clamp01(reveal - index);
      if (!amount) return;
      for (let pass = 0; pass < 2; pass += 1) {
        const seed = index * 3 + pass;
        context.beginPath();
        context.moveTo(from.x + wobble(seed), from.y + wobble(seed + 1));
        context.lineTo(lerp(from.x, to.x, amount) + wobble(seed + 2), lerp(from.y, to.y, amount) + wobble(seed + 3));
        context.stroke();
      }
    });
    context.beginPath();
    context.arc(p.head.x, p.head.y, 38 * sketch, 0, Math.PI * 2);
    context.stroke();
  }

  // Stage 2: rig bones and joint controls.
  const rigAlpha = rig * (1 - render * 0.85);
  if (rigAlpha > 0) {
    context.globalAlpha = rigAlpha;
    context.strokeStyle = '#9fe870';
    context.lineWidth = 4;
    segments.forEach(([from, to]) => {
      context.beginPath();
      context.moveTo(from.x, from.y);
      context.lineTo(to.x, to.y);
      context.stroke();
    });
    context.fillStyle = '#0E0F0C';
    Object.values(p).forEach((joint) => {
      context.beginPath();
      context.arc(joint.x, joint.y, 7, 0, Math.PI * 2);
      context.fill();
      context.stroke();
    });
    // IK handle on the waving hand.
    context.setLineDash([4, 6]);
    context.beginPath();
    context.arc(p.handR.x, p.handR.y, 20, 0, Math.PI * 2);
    context.stroke();
    context.setLineDash([]);
  }

  // Stage 3: shaded body with a cyan rim light.
  if (render > 0) {
    context.globalAlpha = render;
    context.shadowColor = 'rgba(159, 232, 112, 0.85)';
    context.shadowBlur = 28 * render;
    context.strokeStyle = '#F4F6F1';
    context.lineWidth = 34;
    segments.forEach(([from, to]) => {
      context.beginPath();
      context.moveTo(from.x, from.y);
      context.lineTo(to.x, to.y);
      context.stroke();
    });
    context.fillStyle = '#F4F6F1';
    context.beginPath();
    context.arc(p.head.x, p.head.y, 40, 0, Math.PI * 2);
    context.fill();
    context.shadowBlur = 0;
    // Visor and shading accents.
    context.fillStyle = '#163300';
    context.beginPath();
    context.roundRect(178, 108, 48, 18, 9);
    context.fill();
    context.fillStyle = '#9fe870';
    context.beginPath();
    context.roundRect(186, 113, 32, 8, 4);
    context.fill();
    context.fillStyle = '#163300';
    context.beginPath();
    context.ellipse(200, 474, 90 * render, 10, 0, 0, Math.PI * 2);
    context.fill();
  }

  // Frame counter, like a scrubbed image sequence.
  context.globalAlpha = 1;
  context.fillStyle = '#C9D1C2';
  context.font = '600 14px ui-monospace, SFMono-Regular, Consolas, monospace';
  const frame = String(Math.min(FRAMES, Math.floor(progress * (FRAMES - 1)) + 1)).padStart(3, '0');
  context.fillText(`FRAME ${frame} / ${FRAMES}`, 28, 22);
}

const captions = [
  { label: 'Storyboard', text: 'Loose pencil poses establish the shot and timing.' },
  { label: 'Rig', text: 'Bones and IK controls let the arm swing into its pose.' },
  { label: 'Render', text: 'Materials and rim light finish the frame.' },
];

/**
 * Asset 2 (canvas image sequence): scroll progress scrubs one figure from storyboard sketch,
 * to rig, to rendered shot. Frames are drawn procedurally, so no image sequence has to be downloaded.
 */
function setup(root: HTMLElement) {
  const canvas = root.querySelector('canvas');
  if (!canvas) return;
  const captionEls = gsap.utils.toArray<HTMLElement>('[data-caption]', root);
  let frame = 0;
  let progress = 0;
  const paint = () => {
    frame = 0;
    draw(canvas, progress);
    const active = Math.min(captions.length - 1, Math.floor(progress * captions.length));
    captionEls.forEach((caption, index) => caption.toggleAttribute('data-active', index === active));
  };
  const request = () => {
    if (!frame) frame = requestAnimationFrame(paint);
  };

  const trigger = ScrollTrigger.create({
    trigger: root.querySelector('[data-pin]'),
    start: 'top top',
    end: '+=250%',
    pin: true,
    scrub: true,
    onUpdate: (self) => {
      progress = self.progress;
      request();
    },
    onRefresh: request,
  });
  request();
  return () => {
    trigger.kill();
    if (frame) cancelAnimationFrame(frame);
  };
}

export default function MorphCanvas() {
  const scope = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useScrollMotion(scope, setup);

  // Static fallback (reduced motion): paint the finished frame once and on resize.
  useEffect(() => {
    const canvas = canvasRef.current;
    const root = scope.current;
    if (!canvas || !root) return;
    const paintFinal = () => {
      if (root.dataset.motion !== 'on') draw(canvas, 1);
    };
    paintFinal();
    const observer = new ResizeObserver(paintFinal);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={scope} className="group" aria-labelledby="morph-title">
      <div data-pin className="page-frame grid items-center gap-10 py-20 md:grid-cols-[1.1fr_1fr] group-data-[motion=on]:min-h-screen">
        <div className="panel relative aspect-[4/5] w-full overflow-hidden">
          <canvas
            ref={canvasRef}
            className="h-full w-full"
            role="img"
            aria-label="A character figure progressing from storyboard sketch to rig to final render"
          />
        </div>
        <div>
          <span className="eyebrow">Scrub the sequence</span>
          <h2 id="morph-title" className="mt-5">One shot, three passes</h2>
          <ol className="mt-8 grid gap-3">
            {captions.map((caption, index) => (
              <li
                key={caption.label}
                data-caption
                data-active={index === captions.length - 1 ? '' : undefined}
                className="rounded-2xl border border-[var(--color-border)] p-5 transition-all duration-300 data-[active]:border-[var(--color-primary)] data-[active]:bg-[var(--color-mint)] group-data-[motion=on]:[&:not([data-active])]:opacity-50"
              >
                <p className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-[var(--color-primary)]">0{index + 1} · {caption.label}</p>
                <p className="mt-2 text-[var(--color-text)]">{caption.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
