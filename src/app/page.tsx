import Link from 'next/link';
import { ArrowRightIcon, ChartBarIcon, CodeBracketIcon, Cog6ToothIcon, EnvelopeIcon, PaintBrushIcon } from '@heroicons/react/24/outline';
import ImageCard from './components/ImageCard';

const capabilities = [
  { title: 'Design & UI/UX', detail: 'Figma, landing page strategy, visual systems, and customer-focused interface design.', image: '/images/Frame 18.svg' },
  { title: 'Development', detail: 'Responsive sites, WordPress builds, React and Next.js experiences, and clean front-end code.', image: '/images/Frame 19.svg' },
  { title: 'Automation', detail: 'CRM flows, lead routing, form integrations, and platform workflows that reduce manual work.', image: '/images/Frame 20.svg' },
  { title: 'Digital Operations', detail: 'Website upkeep, content edits, marketing support, and the behind-the-scenes systems that keep businesses moving.', image: '/images/Frame 21.svg' },
];

const proofPoints = [
  { value: '5+', label: 'Years of cross-functional work' },
  { value: '100%', label: 'Focus on practical business outcomes' },
  { value: '24/7', label: 'Mindset for ongoing optimization' },
];

export default function Home() {
  return (
    <div className="brand-shell pb-20">
      <section className="mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6 lg:px-8 lg:pb-24 lg:pt-16">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="max-w-xl">
            <span className="eyebrow">Web Developer · UI/UX Designer · Automation Specialist</span>
            <h1 className="mt-6 text-5xl font-semibold tracking-[-0.07em] text-[#0B353B] sm:text-6xl lg:text-7xl">
              Building digital systems that feel clear, useful, and ready to grow.
            </h1>
            <p className="mt-6 text-lg text-[#4A5C5F] sm:text-xl">
              I help businesses turn websites, funnels, and operational workflows into polished experiences that drive real results.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href="/portfolio" className="cta-primary">
                View work
                <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link href="/contact" className="cta-secondary">
                Get in touch
                <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-[#4A5C5F]">
              <span>WordPress</span>
              <span>Next.js</span>
              <span>CRM flows</span>
              <span>Marketing systems</span>
            </div>
          </div>

          <ImageCard image="/images/Frame 22.svg" className="p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-black/65">Performance</span>
              <span className="rounded-full bg-black px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white">Live</span>
            </div>
            <h2 className="mt-8 text-3xl font-semibold tracking-[-0.06em] text-black">Clarity that compounds.</h2>
            <p className="mt-3 max-w-sm text-sm leading-6 text-black/70">A connected digital system gives your team a clearer path from first click to finished work.</p>
            <div className="mt-8 space-y-4">
              <div>
                <p className="text-4xl font-semibold tracking-[-0.08em] text-black">+40%</p>
                <p className="mt-2 text-sm text-black/65">Increase in digital clarity and lead flow through cleaner systems.</p>
              </div>
              <div className="h-2 rounded-full bg-black/10">
                <div className="h-full w-[72%] rounded-full bg-black" />
              </div>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-4 text-sm text-black/70">
              <div className="rounded-2xl border border-black/10 bg-white/35 p-4">
                <div className="text-xl font-semibold text-black">UX</div>
                <div className="mt-2">Conversion-first design</div>
              </div>
              <div className="rounded-2xl border border-black/10 bg-white/35 p-4">
                <div className="text-xl font-semibold text-black">Ops</div>
                <div className="mt-2">Automation setup</div>
              </div>
            </div>
          </ImageCard>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {proofPoints.map((item) => (
            <ImageCard key={item.label} image={`/images/Frame ${23 + proofPoints.indexOf(item)}.svg`} className="p-6 text-left">
              <h3 className="text-3xl font-semibold tracking-[-0.06em] text-black">{item.value}</h3>
              <p className="mt-2 text-sm text-black/70">{item.label}</p>
            </ImageCard>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-2xl">
          <span className="eyebrow">What I do</span>
          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.06em] text-[#0B353B] sm:text-5xl">Design, development, and operations built around real business needs.</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {capabilities.map((capability, index) => {
            const CapabilityIcon = [PaintBrushIcon, CodeBracketIcon, Cog6ToothIcon, ChartBarIcon][index];

            return (
            <ImageCard key={capability.title} image={capability.image} className="p-6">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ABFFAE] text-[#0B353B]">
                <CapabilityIcon className="h-6 w-6" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-semibold tracking-[-0.04em] text-black">{capability.title}</h3>
              <p className="mt-3 text-sm leading-6 text-black/70">{capability.detail}</p>
            </ImageCard>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-[32px] bg-[#0B353B] p-8 text-white sm:p-12 lg:p-16">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
            <div>
              <span className="eyebrow eyebrow-on-dark">How I work</span>
              <h2 className="mt-5 text-4xl font-semibold tracking-[-0.06em] text-white sm:text-5xl">Clear systems, thoughtful design, and practical execution.</h2>
            </div>
            <div className="space-y-5 text-base text-white/75">
              <p>
                I start by understanding the actual problem behind the website or workflow — whether it is conversion, clarity, marketing efficiency, or day-to-day operations.
              </p>
              <p>
                From there I design the experience, build the pages and tools, and connect the moving pieces so everything works together with less friction and more confidence.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-2xl">
          <span className="eyebrow">Experience</span>
          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.06em] text-[#0B353B] sm:text-5xl">From design thinking to technical delivery.</h2>
        </div>

        <div className="brand-card p-8 sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="rounded-[24px] bg-[#FAFAF9] p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#4A5C5F]">Background</p>
              <p className="mt-5 text-2xl font-semibold tracking-[-0.05em] text-[#0B353B]">BS in Computer Science</p>
            </div>
            <div className="space-y-4 text-[#4A5C5F]">
              <p>
                I have worked across design, development, marketing, and digital operations, giving me a grounded understanding of how websites, customer journeys, and internal systems need to support each other.
              </p>
              <p>
                My work spans WordPress builds, funnel pages, user interfaces, UI/UX thinking, automation, and business process support for growing organizations.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-[32px] bg-[#ABFFAE] p-8 text-center text-[#0B353B] sm:p-12">
          <h2 className="text-3xl font-semibold tracking-[-0.05em] sm:text-5xl">Let’s build something that works beautifully.</h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-[#0B353B]/80 sm:text-lg">
            Whether you need a website, a landing page, or a more efficient digital workflow, I can help you turn the idea into a polished system.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a href="mailto:hammadnoon777@gmail.com" className="cta-primary bg-[#0B353B] text-white shadow-none hover:bg-[#031F23]">
              <EnvelopeIcon className="h-4 w-4" aria-hidden="true" />
              hammadnoon777@gmail.com
            </a>
            <Link href="/contact" className="cta-secondary border-[#0B353B]/20 bg-white/70 text-[#0B353B]">
              Contact me
              <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}