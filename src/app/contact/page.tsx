import { ArrowUpRightIcon, EnvelopeIcon, PhoneIcon } from '@heroicons/react/24/outline';
import ImageCard from '../components/ImageCard';

export default function Contact() {
  return (
    <div className="page-frame mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-2xl text-center">
        <span className="eyebrow">Contact</span>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.07em] text-[#0B353B] sm:text-6xl">Let’s build something clear, useful, and ready to grow.</h1>
        <p className="mt-6 text-lg text-[#4A5C5F]">
          Whether you need a website, an automated funnel system, or better operational support, I can help map out the right solution.
        </p>
      </section>

      <section className="mt-14 grid gap-8 md:grid-cols-2">
        <ImageCard image="/images/Frame 22.svg" className="p-8 sm:p-10">
          <h2 className="text-2xl font-semibold tracking-[-0.05em] text-black">Contact details</h2>
          <p className="mt-4 text-sm text-black/70">Open for freelance projects, digital automation work, and technical collaborations.</p>

          <div className="mt-8 space-y-4 text-sm text-black/75">
            <p className="flex items-center gap-3"><EnvelopeIcon className="h-5 w-5 text-black" aria-hidden="true" /><span><strong className="font-semibold text-black">Email:</strong> hammadnoon777@gmail.com</span></p>
            <p className="flex items-center gap-3"><PhoneIcon className="h-5 w-5 text-black" aria-hidden="true" /><span><strong className="font-semibold text-black">Phone:</strong> +92 328 637 6910</span></p>
          </div>

          <div className="mt-10 flex flex-wrap gap-3 text-xs font-medium uppercase tracking-[0.14em] text-black/65">
            <a href="https://linkedin.com/in/hammad-younus" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-black">LinkedIn <ArrowUpRightIcon className="h-3.5 w-3.5" aria-hidden="true" /></a>
            <a href="https://upwork.com/freelancers/hammad859" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-black">Upwork <ArrowUpRightIcon className="h-3.5 w-3.5" aria-hidden="true" /></a>
            <a href="https://www.fiverr.com/developer_noon" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-black">Fiverr <ArrowUpRightIcon className="h-3.5 w-3.5" aria-hidden="true" /></a>
            <a href="https://www.instagram.com/needo.noon/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-black">Instagram <ArrowUpRightIcon className="h-3.5 w-3.5" aria-hidden="true" /></a>
          </div>
        </ImageCard>

        <ImageCard image="/images/Frame 23.svg" className="p-8 sm:p-10">
          <h2 className="text-2xl font-semibold tracking-[-0.05em] text-black">Work with me</h2>
          <div className="mt-6 space-y-4">
            <a href="https://upwork.com/freelancers/hammad859" target="_blank" rel="noreferrer" className="block rounded-none border border-black/10 bg-white/40 p-5 transition-colors hover:border-black/30">
              <h3 className="text-lg font-semibold text-black">Hire on Upwork</h3>
              <p className="mt-2 text-sm text-black/70">Contract work for development, UI design, and marketing operations.</p>
              <ArrowUpRightIcon className="mt-4 h-5 w-5 text-black" aria-hidden="true" />
            </a>
            <a href="https://www.fiverr.com/developer_noon" target="_blank" rel="noreferrer" className="block rounded-none border border-black/10 bg-white/40 p-5 transition-colors hover:border-black/30">
              <h3 className="text-lg font-semibold text-black">Order on Fiverr</h3>
              <p className="mt-2 text-sm text-black/70">Specific service packages for web development and funnel setups.</p>
              <ArrowUpRightIcon className="mt-4 h-5 w-5 text-black" aria-hidden="true" />
            </a>
          </div>
        </ImageCard>
      </section>

      <section className="mt-20" aria-labelledby="contact-process-heading">
        <div className="max-w-2xl">
          <span className="eyebrow">What happens next</span>
          <h2 id="contact-process-heading" className="mt-4 text-3xl font-semibold tracking-[-0.06em] text-[#0B353B] sm:text-5xl">A simple first conversation, with room for the useful details.</h2>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            ['01', 'Share the context', 'Tell me what you are trying to improve, what is getting in the way, and what already exists.'],
            ['02', 'Find the shape', 'We will identify the right scope, priorities, and practical route forward without overbuilding.'],
            ['03', 'Move with clarity', 'You leave with a sharper next step, whether that means a project together or a useful direction.'],
          ].map(([number, title, detail]) => (
            <div key={number} className="brand-card p-6">
              <span className="font-mono text-sm text-[#3C853C]">{number}</span>
              <h3 className="mt-8 text-xl font-semibold text-[#0B353B]">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-[#4A5C5F]">{detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-20 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]" aria-labelledby="contact-fit-heading">
        <div className="rounded-none bg-[#B9FF8F] p-8 text-[#0B353B] sm:p-10">
          <span className="text-xs font-bold uppercase tracking-[0.18em]">A good fit</span>
          <h2 id="contact-fit-heading" className="mt-6 max-w-xl text-3xl font-semibold tracking-[-0.06em] sm:text-4xl">You have a real problem, a growing idea, or a system that is ready to work better.</h2>
          <p className="mt-5 max-w-xl text-sm leading-7 text-[#0B353B]/75">Bring the messy version. That is usually where the most useful conversation starts.</p>
        </div>
        <div className="brand-card p-8 sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#4A5C5F]">Typical starting points</p>
          <ul className="mt-6 space-y-4 text-sm font-medium text-[#0B353B]">
            <li className="border-b border-[#0B353B]/10 pb-4">A website that no longer reflects the business</li>
            <li className="border-b border-[#0B353B]/10 pb-4">A funnel or CRM process that feels disconnected</li>
            <li>Operations that need less manual effort</li>
          </ul>
        </div>
      </section>

      <section className="mt-20 rounded-none bg-[#0B353B] p-8 text-center text-white sm:p-12" aria-labelledby="contact-final-heading">
        <h2 id="contact-final-heading" className="text-3xl font-semibold tracking-[-0.06em] sm:text-4xl">The first step is just a message.</h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/70">Email the outline, the question, or the part that is not working yet. I will respond with a practical way to continue.</p>
        <a href="mailto:hammadnoon777@gmail.com" className="cta-primary mt-8 bg-[#B9FF8F] text-[#0B353B] shadow-none hover:bg-[#9deb72]">Email Hammad <ArrowUpRightIcon className="h-4 w-4" aria-hidden="true" /></a>
      </section>

      <section className="mt-20" aria-labelledby="contact-questions-heading"><div className="max-w-2xl"><span className="eyebrow">Useful questions</span><h2 id="contact-questions-heading" className="mt-4 text-3xl font-semibold tracking-[-0.06em] text-[#0B353B] sm:text-5xl">A little context helps us find the right shape quickly.</h2></div><div className="mt-8 grid gap-4 md:grid-cols-3">{[['The situation','What is happening today?'],['The impact','Where does it cost time, trust, or momentum?'],['The ambition','What would a better version make possible?']].map(([title,detail])=><div key={title} className="brand-card p-6"><h3 className="text-xl font-semibold text-[#0B353B]">{title}</h3><p className="mt-3 text-sm leading-6 text-[#4A5C5F]">{detail}</p></div>)}</div></section>

      <section className="mt-20 rounded-none bg-[#E8F4E4] p-8 sm:p-12" aria-labelledby="contact-scope-heading"><div className="grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-end"><div><span className="eyebrow">Flexible scope</span><h2 id="contact-scope-heading" className="mt-5 text-3xl font-semibold tracking-[-0.06em] text-[#0B353B] sm:text-4xl">A focused fix or a connected system, depending on what the work needs.</h2></div><p className="text-sm leading-7 text-[#4A5C5F]">We can begin with a single page, workflow, or audit and expand only when the value is clear.</p></div></section>

      <section className="mt-20" aria-labelledby="contact-response-heading"><div className="brand-card p-8 sm:p-10"><div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]"><h2 id="contact-response-heading" className="text-3xl font-semibold tracking-[-0.06em] text-[#0B353B]">What you can expect from a reply.</h2><ul className="grid gap-4 text-sm leading-6 text-[#4A5C5F] sm:grid-cols-2"><li><strong className="text-[#0B353B]">A direct read</strong><br />What I understand from your context.</li><li><strong className="text-[#0B353B]">A practical route</strong><br />What I would suggest exploring first.</li><li><strong className="text-[#0B353B]">Clear boundaries</strong><br />What is in scope and what is not.</li><li><strong className="text-[#0B353B]">A next action</strong><br />The simplest way to continue.</li></ul></div></div></section>

      <section className="mt-20 text-center" aria-labelledby="contact-close-heading"><span className="eyebrow">Ready when you are</span><h2 id="contact-close-heading" className="mx-auto mt-5 max-w-2xl text-3xl font-semibold tracking-[-0.06em] text-[#0B353B] sm:text-5xl">Clarity starts before the project does.</h2><a href="mailto:hammadnoon777@gmail.com" className="cta-primary mt-8">Send the first note <ArrowUpRightIcon className="h-4 w-4" aria-hidden="true" /></a></section>
    </div>
  );
}