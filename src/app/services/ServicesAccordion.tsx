'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRightIcon, MinusIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

type ServiceDetail = {
  title: string;
  description: string;
  points: string[];
  image: string;
};

const serviceDetails: ServiceDetail[] = [
  {
    title: 'Custom Software Development',
    description: 'Develop secure, scalable custom software and web applications according to your business needs.',
    points: ['MVP development', 'Application modernization', 'Enterprise software development', 'Software project management'],
    image: '/images/Frame 18.svg',
  },
  {
    title: 'Strategy & Consultation',
    description: 'Turn complex goals into a clear digital roadmap with practical priorities, systems, and next steps.',
    points: ['Digital product strategy', 'Technical discovery', 'UX and workflow audits', 'Growth planning'],
    image: '/images/Frame 19.svg',
  },
  {
    title: 'Cloud & DevOps',
    description: 'Create dependable infrastructure that is easier to deploy, monitor, maintain, and scale.',
    points: ['Cloud architecture', 'Deployment automation', 'Performance monitoring', 'Security and reliability'],
    image: '/images/Frame 20.svg',
  },
  {
    title: 'Digital Operations',
    description: 'Connect the tools and routines behind your business so everyday work moves with less friction.',
    points: ['CRM and automation', 'Process improvement', 'Data integrations', 'Ongoing technical support'],
    image: '/images/Frame 21.svg',
  },
];

export default function ServicesAccordion() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="mt-20 border-y border-[#0B353B]/15" aria-labelledby="service-areas-heading">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">How I can help</p>
          <h2 id="service-areas-heading" className="mt-4 max-w-2xl text-3xl font-semibold tracking-[-0.06em] text-[#0B353B] sm:text-5xl">
            Focused expertise for the next stage of your work.
          </h2>
        </div>
        <p className="max-w-sm text-sm leading-6 text-[#4A5C5F]">Open a service to see the ways we can shape a useful, durable solution together.</p>
      </div>

      <div>
        {serviceDetails.map((service, index) => {
          const isOpen = openIndex === index;

          return (
            <article key={service.title} className="border-t border-[#0B353B]/15 first:border-t-0">
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`service-panel-${index}`}
                onClick={() => setOpenIndex(isOpen ? -1 : index)}
                className="group grid w-full grid-cols-[56px_minmax(0,1fr)_48px] items-center gap-4 py-7 text-left sm:grid-cols-[88px_minmax(0,1fr)_64px] sm:gap-6 sm:py-9"
              >
                <span className="font-mono text-sm tracking-[-0.04em] text-[#6B7778] sm:text-base">{'//'}{String(index + 1).padStart(2, '0')}</span>
                <span className="text-2xl font-semibold tracking-[-0.06em] text-[#0B353B] transition-colors group-hover:text-[#3C853C] sm:text-4xl">{service.title}</span>
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#173D29] text-[#ABFFAE] sm:h-14 sm:w-14">
                  {isOpen ? <MinusIcon className="h-5 w-5" aria-hidden="true" /> : <PlusIcon className="h-5 w-5" aria-hidden="true" />}
                </span>
              </button>

              {isOpen ? (
                <div id={`service-panel-${index}`} className="grid gap-8 pb-9 pl-0 sm:grid-cols-[240px_minmax(0,1fr)] sm:gap-10 sm:pl-[88px] lg:grid-cols-[300px_minmax(0,1fr)]">
                  <div className="relative h-48 overflow-hidden rounded-2xl sm:h-52">
                    <Image src={service.image} alt="" fill sizes="(min-width: 1024px) 300px, 100vw" className="object-cover" />
                  </div>
                  <div className="max-w-3xl">
                    <p className="max-w-2xl text-base leading-7 text-[#4A5C5F] sm:text-lg">{service.description}</p>
                    <ul className="mt-6 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                      {service.points.map((point) => (
                        <li key={point} className="flex items-center gap-3 text-sm font-semibold capitalize text-[#0B353B] sm:text-base">
                          <span className="h-2 w-2 shrink-0 rounded-full bg-[#73DF42]" aria-hidden="true" />
                          {point}
                        </li>
                      ))}
                    </ul>
                    <Link href="/contact" className="mt-7 inline-flex items-center gap-2 font-semibold text-[#4D9A35] underline decoration-1 underline-offset-4 hover:text-[#0B353B]">
                      Learn more <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
