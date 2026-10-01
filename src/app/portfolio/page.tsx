'use client';

import { ArrowUpRightIcon, ChartBarIcon, CodeBracketIcon, Squares2X2Icon } from '@heroicons/react/24/outline';
import ImageCard from '../components/ImageCard';
import Link from 'next/link';
import { useState } from 'react';

const projects = [
  // ... your existing 3 projects ...
  {
    title: 'Digital Systems & Operations Workflow',
    category: 'Funnel & CRM Setup',
    description: 'End-to-end integration connecting custom landing forms directly to CRM pipelines for automated lead routing and client notifications.',
    tech: ['CRM Automation', 'Form Integrations', 'Webhooks'],
  },
  {
    title: 'High-Converting Landing Pages',
    category: 'UI/UX & Web Development',
    description: 'Designed and built cleaner page structures using Tailwind CSS and Next.js to increase clarity and improve mobile responsiveness.',
    tech: ['Next.js', 'Tailwind CSS', 'Figma'],
  },
  {
    title: 'WordPress Business Platform',
    category: 'WordPress Development',
    description: 'Custom Elementor-based website configuration with structured content systems, polished styling, and a clearer user journey.',
    tech: ['WordPress', 'Elementor', 'JavaScript'],
  },
];

export default function Portfolio() {
  const [activeCategory, setActiveCategory] = useState('All');
  const categories = ['All', 'Automation', 'Web development', 'WordPress', 'Landing page'];
  const visibleProjects = activeCategory === 'All'
    ? projects
    : projects.filter((project) => project.category.toLowerCase().includes(activeCategory.toLowerCase()));

  return (
    <div className="page-frame mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <section className="max-w-3xl">
        <span className="eyebrow">Portfolio</span>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.07em] text-[#0B353B] sm:text-6xl">Selected work that balances business goals with a better digital experience.</h1>
        <p className="mt-6 text-lg text-[#4A5C5F]">A selection of interfaces, web experiences, and workflow systems created to help businesses communicate clearly and operate more efficiently.</p>
      </section>

      <section className="mt-10 flex flex-wrap items-center gap-2" aria-label="Filter portfolio projects">
        {categories.map((category) => (
          <button key={category} type="button" onClick={() => setActiveCategory(category)} className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition ${activeCategory === category ? 'border-[#0B353B] bg-[#0B353B] text-white' : 'border-[#0B353B]/15 bg-white/60 text-[#4A5C5F] hover:border-[#0B353B]/40 hover:text-[#0B353B]'}`}>
            {category}
          </button>
        ))}
      </section>

      <section className="mt-14 grid gap-6 md:grid-cols-3">
        {visibleProjects.map((project) => {
          const index = projects.indexOf(project);
          const ProjectIcon = [ChartBarIcon, Squares2X2Icon, CodeBracketIcon][index];

          return (
          <ImageCard as="article" key={project.title} image={`/images/Frame ${18 + index}.svg`} className="flex h-full flex-col p-6">
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#ABFFAE] text-[#0B353B]">
              <ProjectIcon className="h-5 w-5" aria-hidden="true" />
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-black">{project.category}</span>
            <h2 className="mt-5 text-2xl font-semibold tracking-[-0.05em] text-black">{project.title}</h2>
            <p className="mt-4 text-sm leading-7 text-black/70">{project.description}</p>
            <div className="mt-6 flex flex-wrap gap-2 pt-5">
              {project.tech.map((tech) => (
                <span key={tech} className="rounded-full bg-white/55 px-2.5 py-1 text-[11px] font-medium text-black">
                  {tech}
                </span>
              ))}
            </div>
            
            <div className="mt-auto pt-6 text-right text-black">
              <ArrowUpRightIcon className="ml-auto h-5 w-5" aria-hidden="true" />
            </div>
          </ImageCard>
          );
        })}
      </section>

      <section className="mt-20 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]" aria-labelledby="portfolio-approach-heading">
        <div className="rounded-[28px] bg-[#0B353B] p-8 text-white sm:p-10">
          <span className="eyebrow eyebrow-on-dark">Behind the work</span>
          <h2 id="portfolio-approach-heading" className="mt-6 text-3xl font-semibold tracking-[-0.06em] sm:text-4xl">The best projects connect the visible and invisible.</h2>
          <p className="mt-5 text-sm leading-7 text-white/70">A polished interface matters, but so does what happens after the click. The work here is shaped around both sides of that experience.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            ['Clarity', 'A stronger hierarchy helps people understand what matters and what to do next.'],
            ['Momentum', 'Thoughtful flows reduce drop-off and give teams a cleaner way to keep work moving.'],
            ['Connection', 'Websites, forms, CRMs, and content should support one consistent customer journey.'],
            ['Durability', 'The build should be practical to maintain, extend, and hand over when the work evolves.'],
          ].map(([title, detail]) => (
            <div key={title} className="brand-card p-6">
              <h3 className="text-xl font-semibold tracking-[-0.04em] text-[#0B353B]">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-[#4A5C5F]">{detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-20 text-center" aria-labelledby="portfolio-cta-heading">
        <span className="eyebrow">Have a project in mind?</span>
        <h2 id="portfolio-cta-heading" className="mx-auto mt-4 max-w-2xl text-3xl font-semibold tracking-[-0.06em] text-[#0B353B] sm:text-5xl">Let&apos;s turn the rough idea into a clear next step.</h2>
        <Link href="/contact" className="cta-primary mt-8">Start a conversation <ArrowUpRightIcon className="h-4 w-4" aria-hidden="true" /></Link>
      </section>

      <section className="mt-20" aria-labelledby="portfolio-results-heading"><div className="max-w-2xl"><span className="eyebrow">What the work is for</span><h2 id="portfolio-results-heading" className="mt-4 text-3xl font-semibold tracking-[-0.06em] text-[#0B353B] sm:text-5xl">Every project starts with a desired change.</h2></div><div className="mt-8 grid gap-4 md:grid-cols-3">{[['Be understood','Make the offer, product, or story easier to grasp.'],['Be chosen','Create trust and momentum at the moment it matters.'],['Keep moving','Give the team a structure that supports the next action.']].map(([title,detail])=><div key={title} className="brand-card p-6"><h3 className="text-xl font-semibold text-[#0B353B]">{title}</h3><p className="mt-3 text-sm leading-6 text-[#4A5C5F]">{detail}</p></div>)}</div></section>

      <section className="mt-20 rounded-[32px] bg-[#E8F4E4] p-8 sm:p-12" aria-labelledby="portfolio-detail-heading"><div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end"><h2 id="portfolio-detail-heading" className="text-3xl font-semibold tracking-[-0.06em] text-[#0B353B] sm:text-4xl">Small details, considered together.</h2><p className="text-base leading-7 text-[#4A5C5F]">From the first line of copy to the final form state, the goal is a cohesive experience that feels deliberate instead of assembled.</p></div></section>

      <section className="mt-20" aria-labelledby="portfolio-collab-heading"><div className="brand-card p-8 sm:p-10"><span className="eyebrow">How we collaborate</span><div className="mt-6 grid gap-4 sm:grid-cols-3"><div><h3 className="font-semibold text-[#0B353B]">Share</h3><p className="mt-2 text-sm leading-6 text-[#4A5C5F]">Context, constraints, and the outcome you want.</p></div><div><h3 className="font-semibold text-[#0B353B]">Shape</h3><p className="mt-2 text-sm leading-6 text-[#4A5C5F]">A clear direction with visible priorities.</p></div><div><h3 className="font-semibold text-[#0B353B]">Ship</h3><p className="mt-2 text-sm leading-6 text-[#4A5C5F]">A useful release and a sensible next step.</p></div></div></div></section>

      <section className="mt-20 rounded-[32px] bg-[#0B353B] p-8 text-white sm:p-12" aria-labelledby="portfolio-open-heading"><span className="eyebrow eyebrow-on-dark">Open brief</span><h2 id="portfolio-open-heading" className="mt-5 max-w-3xl text-3xl font-semibold tracking-[-0.06em] sm:text-5xl">The next case study could start with your unfinished idea.</h2><Link href="/contact" className="cta-primary mt-8 bg-[#B9FF8F] text-[#0B353B] shadow-none hover:bg-[#9deb72]">Start the brief <ArrowUpRightIcon className="h-4 w-4" aria-hidden="true" /></Link></section>
    </div>
  );
}