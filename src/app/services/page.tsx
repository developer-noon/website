import Link from 'next/link';
import { ArrowRightIcon, CodeBracketIcon, Cog6ToothIcon, PaintBrushIcon, WrenchScrewdriverIcon } from '@heroicons/react/24/outline';
import ImageCard from '../components/ImageCard';
import ServicesAccordion from './ServicesAccordion';

const servicesList = [
  {
    title: 'Web Design & Development',
    description: 'Custom React and Next.js experiences paired with responsive WordPress and Elementor builds designed for clarity and maintainability.',
    tags: ['React', 'Next.js', 'Tailwind CSS', 'WordPress'],
  },
  {
    title: 'Sales Funnels & Landing Pages',
    description: 'High-converting landing pages and lead-generation flows built to capture attention, improve flow, and support business goals.',
    tags: ['UI/UX', 'Conversion', 'Lead capture'],
  },
  {
    title: 'CRM & Marketing Automation',
    description: 'Organized workflows that connect forms, CRMs, and marketing systems to reduce manual effort and keep leads moving smoothly.',
    tags: ['CRM setup', 'Automation', 'Workflow design'],
  },
  {
    title: 'Digital Operations & Support',
    description: 'Ongoing support for website upkeep, content changes, process refinement, and the technical work that keeps platforms functioning.',
    tags: ['Maintenance', 'Operations', 'Support'],
  },
];

export default function Services() {
  return (
    <div className="page-frame mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <section className="max-w-3xl">
        <span className="eyebrow">Services</span>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.07em] text-[#0B353B] sm:text-6xl">Practical digital systems for businesses that want to grow with less friction.</h1>
        <p className="mt-6 text-lg text-[#4A5C5F]">
          I build clean interfaces, efficient workflows, and dependable digital experiences designed around real-world business needs.
        </p>
      </section>

      <section className="mt-14 grid gap-6 md:grid-cols-2">
        {servicesList.map((service, index) => {
          const ServiceIcon = [CodeBracketIcon, PaintBrushIcon, Cog6ToothIcon, WrenchScrewdriverIcon][index];

          return (
          <ImageCard key={service.title} image={`/images/Frame ${18 + index}.svg`} className="flex h-full flex-col p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-none bg-[#ABFFAE] text-[#0B353B]">
              <ServiceIcon className="h-6 w-6" aria-hidden="true" />
            </div>
            <h2 className="mt-6 text-2xl font-semibold tracking-[-0.05em] text-black">{service.title}</h2>
            <p className="mt-4 text-sm leading-7 text-black/70">{service.description}</p>
            <div className="mt-6 flex flex-wrap gap-2 pt-5">
              {service.tags.map((tag) => (
                <span key={tag} className="rounded-none bg-white/55 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-black">
                  {tag}
                </span>
              ))}
            </div>
          </ImageCard>
          );
        })}
      </section>

      <ServicesAccordion />

      <section className="mt-20" aria-labelledby="process-heading">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <span className="eyebrow">The working rhythm</span>
            <h2 id="process-heading" className="mt-4 text-3xl font-semibold tracking-[-0.06em] text-[#0B353B] sm:text-5xl">A calm process for complicated digital work.</h2>
          </div>
          <p className="max-w-sm text-sm leading-6 text-[#4A5C5F]">Each phase creates a useful decision point, so the work stays focused from first conversation to launch.</p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {[
            ['01', 'Discover', 'Understand the audience, constraints, tools, and outcome that matter most.'],
            ['02', 'Shape', 'Turn findings into a clear structure, visual direction, and practical plan.'],
            ['03', 'Build', 'Create the experience, connect the systems, and test the details that affect trust.'],
            ['04', 'Improve', 'Launch with a useful baseline and a roadmap for the next measurable improvement.'],
          ].map(([number, title, detail]) => (
            <div key={number} className="brand-card p-5">
              <span className="font-mono text-sm text-[#3C853C]">{number}</span>
              <h3 className="mt-7 text-lg font-semibold text-[#0B353B]">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#4A5C5F]">{detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16 rounded-none bg-[#0B353B] p-8 text-white sm:p-12">
        <h3 className="text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">Need a custom technical setup?</h3>
        <p className="mt-4 max-w-2xl text-white/75">Let’s map out the right design and system approach for your current infrastructure, goals, and customer journey.</p>
        <Link href="/contact" className="cta-primary mt-8 bg-[#ABFFAE] text-[#0B353B] shadow-none hover:bg-[#8be593]">
          Get in touch
          <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
        </Link>
      </section>

      <section className="mt-20" aria-labelledby="services-outcomes-heading"><div className="max-w-2xl"><span className="eyebrow">What changes</span><h2 id="services-outcomes-heading" className="mt-4 text-3xl font-semibold tracking-[-0.06em] text-[#0B353B] sm:text-5xl">The output is more than a deliverable.</h2></div><div className="mt-8 grid gap-4 md:grid-cols-3">{[['For customers','A clearer path, faster understanding, and more confidence to act.'],['For teams','Fewer loose ends, cleaner handoffs, and tools that support the work.'],['For leaders','A practical system that makes progress easier to see and improve.']].map(([title,detail])=><div key={title} className="brand-card p-6"><h3 className="text-xl font-semibold text-[#0B353B]">{title}</h3><p className="mt-3 text-sm leading-6 text-[#4A5C5F]">{detail}</p></div>)}</div></section>

      <section className="mt-20 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]" aria-labelledby="services-fit-heading"><div className="rounded-none bg-[#E8F4E4] p-8 sm:p-10"><span className="eyebrow">Choose your starting point</span><h2 id="services-fit-heading" className="mt-5 text-3xl font-semibold tracking-[-0.06em] text-[#0B353B] sm:text-4xl">Start where the friction is most visible.</h2><p className="mt-5 max-w-xl text-sm leading-7 text-[#4A5C5F]">A focused first project can create the clarity needed for the larger system around it.</p></div><div className="brand-card p-8 sm:p-10"><ul className="space-y-5 text-sm font-semibold text-[#0B353B]"><li className="border-b border-[#0B353B]/10 pb-5">The website needs a clearer story</li><li className="border-b border-[#0B353B]/10 pb-5">The funnel loses people between steps</li><li>The team repeats work that should be connected</li></ul></div></section>

      <section className="mt-20" aria-labelledby="services-maintain-heading"><div className="brand-card p-8 sm:p-10"><div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:items-center"><h2 id="services-maintain-heading" className="text-3xl font-semibold tracking-[-0.06em] text-[#0B353B]">Built to be understood after launch.</h2><p className="text-base leading-7 text-[#4A5C5F]">Documentation, sensible structure, and maintainable decisions matter just as much as the launch moment. The work should keep making sense when the project becomes part of everyday operations.</p></div></div></section>

      <section className="mt-20 rounded-none bg-[#B9FF8F] p-8 text-[#0B353B] sm:p-12" aria-labelledby="services-question-heading"><span className="text-xs font-bold uppercase tracking-[0.18em]">A useful question</span><h2 id="services-question-heading" className="mt-5 max-w-3xl text-3xl font-semibold tracking-[-0.06em] sm:text-5xl">What is the one part of the system that should feel easier first?</h2><Link href="/contact" className="cta-primary mt-8 bg-[#0B353B] text-white shadow-none hover:bg-[#031F23]">Talk it through <ArrowRightIcon className="h-4 w-4" aria-hidden="true" /></Link></section>
    </div>
  );
}