import Link from 'next/link';
import { ArrowRightIcon, CodeBracketIcon, Cog6ToothIcon, PaintBrushIcon, WrenchScrewdriverIcon } from '@heroicons/react/24/outline';
import ImageCard from '../components/ImageCard';

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
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
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
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ABFFAE] text-[#0B353B]">
              <ServiceIcon className="h-6 w-6" aria-hidden="true" />
            </div>
            <h2 className="mt-6 text-2xl font-semibold tracking-[-0.05em] text-black">{service.title}</h2>
            <p className="mt-4 text-sm leading-7 text-black/70">{service.description}</p>
            <div className="mt-6 flex flex-wrap gap-2 pt-5">
              {service.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-white/55 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-black">
                  {tag}
                </span>
              ))}
            </div>
          </ImageCard>
          );
        })}
      </section>

      <section className="mt-16 rounded-[32px] bg-[#0B353B] p-8 text-white sm:p-12">
        <h3 className="text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">Need a custom technical setup?</h3>
        <p className="mt-4 max-w-2xl text-white/75">Let’s map out the right design and system approach for your current infrastructure, goals, and customer journey.</p>
        <Link href="/contact" className="cta-primary mt-8 bg-[#ABFFAE] text-[#0B353B] shadow-none hover:bg-[#8be593]">
          Get in touch
          <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
        </Link>
      </section>
    </div>
  );
}