import { Check } from "lucide-react";
import { Reveal } from "./reveal";
import { GetStartedSteps } from "./get-started-steps";

const faqs = [
  {
    q: "How is one college's data kept separate?",
    a: "Each college's data is fully isolated and enforced on the server for every request. No college can see, detect, or reach another's — anything outside your own college simply isn't there.",
  },
  {
    q: "How fast can a college get running?",
    a: "Minutes. An admin registers, verifies their email, then invites teachers and students. Once they accept, everyone is working right away.",
  },
  {
    q: "Who manages teachers and students?",
    a: "The first person to register a college becomes its admin and invites or deactivates its own users. There's no cross-college administration.",
  },
  {
    q: "What if someone hits an endpoint they shouldn't?",
    a: "Authorization is checked on the server for every action. A student hitting a teacher-only route is rejected; another user's record by ID returns 404.",
  },
  {
    q: "Who owns the data?",
    a: "Each college owns its own data. It stays isolated to that organization — nothing is shared or pooled across tenants.",
  },
  {
    q: "Does it work on mobile?",
    a: "Yes. Students are mobile-first, so the whole app is fully responsive, with touch-friendly targets throughout.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="border-t border-line bg-surface">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[1fr_minmax(300px,360px)] lg:gap-16">
        {/* FAQ */}
        <div>
          <Reveal className="max-w-2xl">
            <span className="inline-flex items-center rounded-full bg-ink px-3 py-1 text-[12px] font-medium text-white">
              FAQ
            </span>
            <h2 className="mt-5 font-display text-[clamp(2rem,4.5vw,3rem)] font-extrabold leading-[1.04] tracking-[-0.03em] text-balance">
              Questions, answered plainly.
            </h2>
            <p className="mt-4 text-body-lg text-body text-pretty">
              Everything worth knowing before you bring your college online.
            </p>
          </Reveal>

          <div className="mt-12 grid grid-cols-1 gap-x-8 gap-y-9 sm:grid-cols-2">
            {faqs.map((f, i) => (
              <Reveal key={f.q} delay={i * 90} className="group flex gap-3">
                <Check
                  className="mt-0.5 size-[18px] shrink-0 text-ink transition-all duration-300 ease-out-expo group-hover:scale-110 group-hover:text-vermillion"
                  strokeWidth={2.5}
                />
                <div className="transition-transform duration-300 ease-out-expo group-hover:translate-x-1">
                  <h3 className="text-[15px] font-semibold text-ink transition-colors duration-300 group-hover:text-vermillion-ink">
                    {f.q}
                  </h3>
                  <p className="mt-1.5 text-[14px] leading-relaxed text-body text-pretty">
                    {f.a}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Get started steps */}
        <GetStartedSteps />
      </div>
    </section>
  );
}
