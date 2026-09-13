import { ArrowUpRightIcon, ChartBarIcon, CodeBracketIcon, Squares2X2Icon } from '@heroicons/react/24/outline';
import ImageCard from '../components/ImageCard';

const projects = [
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
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <section className="max-w-3xl">
        <span className="eyebrow">Portfolio</span>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.07em] text-[#0B353B] sm:text-6xl">Selected work that balances business goals with a better digital experience.</h1>
        <p className="mt-6 text-lg text-[#4A5C5F]">A selection of interfaces, web experiences, and workflow systems created to help businesses communicate clearly and operate more efficiently.</p>
      </section>

      <section className="mt-14 grid gap-6 md:grid-cols-3">
        {projects.map((project, index) => {
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
    </div>
  );
}