export default function About() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <section className="max-w-3xl">
        <span className="eyebrow">About</span>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.07em] text-[#0B353B] sm:text-6xl">I design digital experiences that are both useful and human.</h1>
        <p className="mt-6 text-lg leading-8 text-[#4A5C5F]">
          I am a web developer, UI/UX designer, and automation specialist with a BS in Computer Science. Over the past several years, I have worked at the intersection of design, development, marketing, and digital operations.
        </p>
      </section>

      <section className="mt-14 grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="brand-card p-8 sm:p-10">
          <h2 className="text-2xl font-semibold tracking-[-0.05em] text-[#0B353B]">Professional journey</h2>
          <div className="mt-6 space-y-5 text-[#4A5C5F]">
            <p>
              My practical experience comes from working full-time at <strong className="text-[#0B353B]">THE BRANDEFY</strong>, where I grew from graphic and UX design into full-stack web development, digital marketing, and funnel automation work.
            </p>
            <p>
              That work taught me how business systems, lead management, and interface design all need to function together to be effective in the real world.
            </p>
          </div>
        </div>

        <div className="rounded-[28px] bg-[#0B353B] p-8 text-white shadow-[0_20px_40px_rgba(11,53,59,0.18)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/65">Focus</p>
          <div className="mt-8 space-y-5 text-white/80">
            <div>
              <div className="text-3xl font-semibold tracking-[-0.05em]">UX</div>
              <p className="mt-2 text-sm">Clear interfaces that reduce friction and help users act with confidence.</p>
            </div>
            <div>
              <div className="text-3xl font-semibold tracking-[-0.05em]">Build</div>
              <p className="mt-2 text-sm">Responsive websites and product experiences engineered for practicality and performance.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-3xl font-semibold tracking-[-0.05em] text-[#0B353B]">My core philosophy</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="brand-card p-6">
            <h3 className="text-xl font-semibold text-[#0B353B]">Clear over complex</h3>
            <p className="mt-3 text-sm leading-6 text-[#4A5C5F]">Interfaces and systems should be simple to navigate for customers and maintainable for business owners.</p>
          </div>
          <div className="brand-card p-6">
            <h3 className="text-xl font-semibold text-[#0B353B]">Connected operations</h3>
            <p className="mt-3 text-sm leading-6 text-[#4A5C5F]">A website should not exist in isolation. It should integrate smoothly with CRMs, forms, and marketing pipelines.</p>
          </div>
        </div>
      </section>
    </div>
  );
}