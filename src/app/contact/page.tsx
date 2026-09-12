import { ArrowUpRightIcon, EnvelopeIcon, PhoneIcon } from '@heroicons/react/24/outline';

export default function Contact() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-2xl text-center">
        <span className="eyebrow">Contact</span>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.07em] text-[#0B353B] sm:text-6xl">Let’s build something clear, useful, and ready to grow.</h1>
        <p className="mt-6 text-lg text-[#4A5C5F]">
          Whether you need a website, an automated funnel system, or better operational support, I can help map out the right solution.
        </p>
      </section>

      <section className="mt-14 grid gap-8 md:grid-cols-2">
        <div className="rounded-[28px] bg-[#0B353B] p-8 text-white sm:p-10">
          <h2 className="text-2xl font-semibold tracking-[-0.05em]">Contact details</h2>
          <p className="mt-4 text-sm text-white/75">Open for freelance projects, digital automation work, and technical collaborations.</p>

          <div className="mt-8 space-y-4 text-sm text-white/85">
            <p className="flex items-center gap-3"><EnvelopeIcon className="h-5 w-5 text-[#ABFFAE]" aria-hidden="true" /><span><strong className="font-semibold text-white">Email:</strong> hammadnoon777@gmail.com</span></p>
            <p className="flex items-center gap-3"><PhoneIcon className="h-5 w-5 text-[#ABFFAE]" aria-hidden="true" /><span><strong className="font-semibold text-white">Phone:</strong> +92 328 637 6910</span></p>
          </div>

          <div className="mt-10 flex flex-wrap gap-3 text-xs font-medium uppercase tracking-[0.14em] text-white/65">
            <a href="https://linkedin.com/in/hammad-younus" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-white">LinkedIn <ArrowUpRightIcon className="h-3.5 w-3.5" aria-hidden="true" /></a>
            <a href="https://upwork.com/freelancers/hammad859" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-white">Upwork <ArrowUpRightIcon className="h-3.5 w-3.5" aria-hidden="true" /></a>
            <a href="https://www.fiverr.com/developer_noon" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-white">Fiverr <ArrowUpRightIcon className="h-3.5 w-3.5" aria-hidden="true" /></a>
            <a href="https://www.instagram.com/needo.noon/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-white">Instagram <ArrowUpRightIcon className="h-3.5 w-3.5" aria-hidden="true" /></a>
          </div>
        </div>

        <div className="brand-card p-8 sm:p-10">
          <h2 className="text-2xl font-semibold tracking-[-0.05em] text-[#0B353B]">Work with me</h2>
          <div className="mt-6 space-y-4">
            <a href="https://upwork.com/freelancers/hammad859" target="_blank" rel="noreferrer" className="block rounded-[20px] border border-[#0B353B]/10 bg-[#FAFAF9] p-5 transition-colors hover:border-[#0B353B]/30">
              <h3 className="text-lg font-semibold text-[#0B353B]">Hire on Upwork</h3>
              <p className="mt-2 text-sm text-[#4A5C5F]">Contract work for development, UI design, and marketing operations.</p>
              <ArrowUpRightIcon className="mt-4 h-5 w-5 text-[#0B353B]" aria-hidden="true" />
            </a>
            <a href="https://www.fiverr.com/developer_noon" target="_blank" rel="noreferrer" className="block rounded-[20px] border border-[#0B353B]/10 bg-[#FAFAF9] p-5 transition-colors hover:border-[#0B353B]/30">
              <h3 className="text-lg font-semibold text-[#0B353B]">Order on Fiverr</h3>
              <p className="mt-2 text-sm text-[#4A5C5F]">Specific service packages for web development and funnel setups.</p>
              <ArrowUpRightIcon className="mt-4 h-5 w-5 text-[#0B353B]" aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}