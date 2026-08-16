import { motion } from "framer-motion";
import { ShieldCheck, Sparkles, School, HeartHandshake, FileCheck2, LineChart } from "lucide-react";

const highlights = [
  {
    icon: ShieldCheck,
    title: "Why choose us?",
    text: "An intuitive platform that simplifies job applications and ensures secure, efficient placement management.",
  },
  {
    icon: Sparkles,
    title: "Key features",
    text: "A dynamic dashboard, real-time notifications and transparent tracking for a seamless hiring experience.",
  },
  {
    icon: School,
    title: "For institutions",
    text: "Colleges monitor applications, manage recruitment drives and track placement records efficiently.",
  },
];

const points = [
  { icon: HeartHandshake, text: "A smooth hiring process that gives students access to genuine, verified opportunities." },
  { icon: FileCheck2, text: "Employer–student connections backed by documentation and sophisticated institutional insights." },
  { icon: LineChart, text: "A system built for placement needs and live tracking of placement statistics." },
  { icon: Sparkles, text: "Streamlined selection with verified applicants for institutions and recruiters." },
];

const AboutSection = () => {
  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50/70 via-white to-white py-24">
        <div className="absolute inset-0 bg-grid-light" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-2xl text-center"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest text-indigo-600">
              <ShieldCheck className="h-3.5 w-3.5" />
              About CampusPlace
            </span>
            <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Built to bridge students and companies
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-slate-600">
              Our placement portal bridges the gap between students and top companies — streamlining recruitment,
              simplifying applications and delivering real-time insights across the entire placement journey.
            </p>
          </motion.div>

          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
            {highlights.map((h, i) => (
              <motion.div
                key={h.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="card-elevate rounded-2xl border border-slate-200/80 bg-white p-7"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/25">
                  <h.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 font-display text-lg font-semibold text-slate-900">{h.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{h.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#0a0e1f] py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {points.map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="glass-dark card-elevate rounded-2xl p-6"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-indigo-300">
                  <p.icon className="h-5 w-5" />
                </span>
                <p className="mt-4 text-sm leading-relaxed text-slate-300">{p.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default AboutSection;
