import ImageCard from '../components/ImageCard';

export default function About() {
  return (
    <div className="page-frame mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <section className="max-w-3xl">
        <span className="eyebrow">About</span>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.07em] text-[#0B353B] sm:text-6xl">I design digital experiences that are both useful and human.</h1>
        <p className="mt-6 text-lg leading-8 text-[#4A5C5F]">
          I am a web developer, UI/UX designer, and automation specialist with a BS in Computer Science. Over the past several years, I have worked at the intersection of design, development, marketing, and digital operations.
        </p>
      </section>

      <section className="mt-14 grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
        <ImageCard image="/images/Frame 24.svg" className="p-8 sm:p-10">
          <h2 className="text-2xl font-semibold tracking-[-0.05em] text-black">Professional journey</h2>
          <div className="mt-6 space-y-5 text-black/70">
            <p>
              My practical experience comes from working full-time at <strong className="text-black">THE BRANDEFY</strong>, where I grew from graphic and UX design into full-stack web development, digital marketing, and funnel automation work.
            </p>
            <p>
              That work taught me how business systems, lead management, and interface design all need to function together to be effective in the real world.
            </p>
          </div>
        </ImageCard>

        <ImageCard image="/images/Frame 25.svg" className="p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/65">Focus</p>
          <div className="mt-8 space-y-5 text-black/70">
            <div>
              <div className="text-3xl font-semibold tracking-[-0.05em] text-black">UX</div>
              <p className="mt-2 text-sm">Clear interfaces that reduce friction and help users act with confidence.</p>
            </div>
            <div>
              <div className="text-3xl font-semibold tracking-[-0.05em] text-black">Build</div>
              <p className="mt-2 text-sm">Responsive websites and product experiences engineered for practicality and performance.</p>
            </div>
          </div>
        </ImageCard>
      </section>

      <section className="mt-16">
        <h2 className="text-3xl font-semibold tracking-[-0.05em] text-[#0B353B]">My core philosophy</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <ImageCard image="/images/Frame 26.svg" className="p-6">
            <h3 className="text-xl font-semibold text-black">Clear over complex</h3>
            <p className="mt-3 text-sm leading-6 text-black/70">Interfaces and systems should be simple to navigate for customers and maintainable for business owners.</p>
          </ImageCard>
          <ImageCard image="/images/Frame 27.svg" className="p-6">
            <h3 className="text-xl font-semibold text-black">Connected operations</h3>
            <p className="mt-3 text-sm leading-6 text-black/70">A website should not exist in isolation. It should integrate smoothly with CRMs, forms, and marketing pipelines.</p>
          </ImageCard>
        </div>
      </section>

      <section className="mt-20" aria-labelledby="strengths-heading">
        <div className="max-w-2xl">
          <span className="eyebrow">What I bring</span>
          <h2 id="strengths-heading" className="mt-4 text-3xl font-semibold tracking-[-0.06em] text-[#0B353B] sm:text-5xl">A useful mix of creative thinking and technical follow-through.</h2>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            ['01', 'See the whole system', 'I look beyond the page to understand the people, tools, and decisions around it.'],
            ['02', 'Make complexity visible', 'Clear priorities and simple language help teams move from uncertainty to action.'],
            ['03', 'Build for the next step', 'Every deliverable is shaped to be useful now and ready for the next stage of growth.'],
          ].map(([number, title, detail]) => (
            <div key={number} className="brand-card p-6">
              <span className="font-mono text-sm text-[#3C853C]">{number}</span>
              <h3 className="mt-8 text-xl font-semibold tracking-[-0.04em] text-[#0B353B]">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-[#4A5C5F]">{detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-20 rounded-none bg-[#0B353B] p-8 text-white sm:p-12" aria-labelledby="about-next-heading">
        <span className="eyebrow eyebrow-on-dark">The next chapter</span>
        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-end">
          <h2 id="about-next-heading" className="text-3xl font-semibold tracking-[-0.06em] sm:text-5xl">Better digital work starts with a sharper understanding of the real problem.</h2>
          <p className="text-base leading-7 text-white/70">That is the space I enjoy most: making the path clearer, building the right pieces, and leaving the team with something they can confidently use.</p>
        </div>
      </section>

      <section className="mt-20" aria-labelledby="about-lens-heading"><div className="max-w-2xl"><span className="eyebrow">How I think</span><h2 id="about-lens-heading" className="mt-4 text-3xl font-semibold tracking-[-0.06em] text-[#0B353B] sm:text-5xl">Four lenses keep the work grounded.</h2></div><div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[['People','Who needs this, and what do they need to feel?'],['Purpose','What business outcome should this support?'],['Path','What is the clearest route from interest to action?'],['Proof','How will we know the improvement is working?']].map(([title,detail])=><div key={title} className="brand-card p-5"><h3 className="text-lg font-semibold text-[#0B353B]">{title}</h3><p className="mt-3 text-sm leading-6 text-[#4A5C5F]">{detail}</p></div>)}</div></section>

      <section className="mt-20 grid gap-6 lg:grid-cols-[1fr_1fr]" aria-labelledby="about-craft-heading"><div className="rounded-none bg-[#B9FF8F] p-8 text-[#0B353B] sm:p-10"><span className="text-xs font-bold uppercase tracking-[0.18em]">The craft</span><h2 id="about-craft-heading" className="mt-6 text-3xl font-semibold tracking-[-0.06em] sm:text-4xl">Details are where clarity becomes believable.</h2></div><div className="brand-card p-8 sm:p-10"><p className="text-base leading-7 text-[#4A5C5F]">A good interface is not only a strong first impression. It is the small choices that make the second click feel obvious, the form feel trustworthy, and the handoff feel complete.</p></div></section>

      <section className="mt-20" aria-labelledby="about-collaboration-heading"><div className="brand-card p-8 sm:p-10"><div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]"><h2 id="about-collaboration-heading" className="text-3xl font-semibold tracking-[-0.06em] text-[#0B353B]">Collaboration should create momentum, not more meetings.</h2><div className="grid gap-4 sm:grid-cols-2"><p className="text-sm leading-7 text-[#4A5C5F]">You get clear questions, visible decisions, and useful work at each stage.</p><p className="text-sm leading-7 text-[#4A5C5F]">The goal is a shared understanding strong enough to keep moving independently.</p></div></div></div></section>

      <section className="mt-20 rounded-none border border-[#0B353B]/10 bg-white/70 p-8 sm:p-12" aria-labelledby="about-invitation-heading"><span className="eyebrow">An open invitation</span><h2 id="about-invitation-heading" className="mt-5 max-w-3xl text-3xl font-semibold tracking-[-0.06em] text-[#0B353B] sm:text-5xl">Bring the complicated version. We can make it clearer together.</h2><p className="mt-5 max-w-2xl text-base leading-7 text-[#4A5C5F]">The first conversation does not need a perfect brief. It just needs an honest starting point.</p></section>
    </div>
  );
}