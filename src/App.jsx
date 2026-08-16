import { Link } from "react-router-dom";
import { motion } from "framer-motion";
// Components
import Navbar from "./Components/Navbar/Navbar.jsx";
import PlacementStats from "./Components/PlacementStats/PlacementStats.jsx";
import CompaniesSection from "./Components/Companies/CompaniesSection.jsx";
import AboutSection from "./Components/AboutSection/AboutSection.jsx";
import Testimonials from "./Components/Testimonials/Testimonials.jsx";
import Footer from "./Components/Footer/Footer.jsx";
import NetworkVisualization from "./AnimatedComponents/NetworkVisualization.jsx";
// Icons
import {
  GraduationCap,
  Building2,
  Briefcase,
  FileText,
  TrendingUp,
  ScrollText,
  ClipboardCheck,
  LayoutDashboard,
  ArrowRight,
  Sparkles,
  UserRound,
  Send,
  Filter,
  BadgeCheck,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

const SectionHeading = ({ eyebrow, title, subtitle, light = false }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-80px" }}
    transition={{ duration: 0.6 }}
    className="mx-auto mb-14 max-w-2xl text-center"
  >
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest ${light ? "bg-white/10 text-indigo-300" : "bg-indigo-50 text-indigo-600"}`}>
      <Sparkles className="h-3.5 w-3.5" />
      {eyebrow}
    </span>
    <h2 className={`mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl ${light ? "text-white" : "text-slate-900"}`}>{title}</h2>
    {subtitle && <p className={`mt-4 text-base leading-relaxed ${light ? "text-slate-400" : "text-slate-500"}`}>{subtitle}</p>}
  </motion.div>
);

/* ---------------- Hero ---------------- */
const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-[#0a0e1f] pb-24 pt-16 sm:pt-24">
      <div className="absolute inset-0 bg-spotlight" aria-hidden="true" />
      <div className="absolute inset-0 bg-grid-dark opacity-50" aria-hidden="true" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-40 top-10 h-[28rem] w-[28rem] rounded-full bg-indigo-600/25 blur-[120px] animate-float-slow" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-32 top-1/3 h-96 w-96 rounded-full bg-fuchsia-600/20 blur-[110px] animate-float-slower" />

      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-14 px-6 lg:grid-cols-[1.1fr_1fr]">
        {/* Copy */}
        <div>
          <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            <span className="text-xs font-medium text-slate-300">Campus placement &amp; recruitment platform</span>
          </motion.div>

          <motion.h1 custom={1} initial="hidden" animate="visible" variants={fadeUp} className="mt-7 font-display text-5xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl">
            Connect talent
            <br />
            with <span className="text-gradient-light">opportunity.</span>
          </motion.h1>

          <motion.p custom={2} initial="hidden" animate="visible" variants={fadeUp} className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300">
            The all-in-one campus placement platform. Students apply to placement drives,
            companies hire verified candidates, and placement offices track everything —
            from application to offer letter.
          </motion.p>

          <motion.div custom={3} initial="hidden" animate="visible" variants={fadeUp} className="mt-9 flex flex-wrap items-center gap-4">
            <Link
              to="/register"
              className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-6 py-3.5 text-sm font-semibold text-white shadow-xl shadow-indigo-500/30 transition-all hover:shadow-2xl hover:shadow-indigo-500/40 hover:brightness-110"
            >
              Get started free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/login"
              className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur transition-all hover:bg-white/10"
            >
              Explore placements
            </Link>
          </motion.div>

          <motion.dl custom={4} initial="hidden" animate="visible" variants={fadeUp} className="mt-12 grid max-w-md grid-cols-3 gap-6">
            {[
              { k: "100%", v: "Placement tracking" },
              { k: "300+", v: "Companies onboard" },
              { k: "10k+", v: "Students placed" },
            ].map((s) => (
              <div key={s.v} className="border-l border-white/10 pl-4">
                <dt className="font-display text-2xl font-bold text-white">{s.k}</dt>
                <dd className="mt-1 text-xs leading-snug text-slate-400">{s.v}</dd>
              </div>
            ))}
          </motion.dl>
        </div>

        {/* Visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <div className="glass-dark relative h-[26rem] overflow-hidden rounded-3xl sm:h-[30rem]">
            <NetworkVisualization className="h-full w-full" />
            {/* Floating legend chips */}
            <div className="absolute left-5 top-5 flex items-center gap-4 rounded-xl border border-white/10 bg-[#0a0e1f]/70 px-4 py-2.5 backdrop-blur">
              <span className="flex items-center gap-2 text-xs text-slate-300"><span className="h-2.5 w-2.5 rounded-full bg-indigo-400 shadow-[0_0_10px_2px_rgba(129,140,248,0.6)]" /> Students</span>
              <span className="flex items-center gap-2 text-xs text-slate-300"><span className="h-2.5 w-2.5 rounded-full bg-sky-400 shadow-[0_0_10px_2px_rgba(56,189,248,0.6)]" /> Companies</span>
            </div>
            <div className="absolute bottom-5 left-5 right-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/10 bg-[#0a0e1f]/70 p-4 backdrop-blur">
                <p className="text-xs text-slate-400">Active drives</p>
                <p className="mt-1 font-display text-xl font-bold text-white">120+</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#0a0e1f]/70 p-4 backdrop-blur">
                <p className="text-xs text-slate-400">Offers made</p>
                <p className="mt-1 font-display text-xl font-bold text-white">2,400+</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

/* ---------------- Platform overview ---------------- */
const platformFeatures = [
  { icon: UserRound, title: "Student Management", desc: "Complete student profiles, resumes, skills and placement readiness in one place." },
  { icon: Building2, title: "Company Recruitment", desc: "Companies build profiles and reach verified, eligible candidates directly." },
  { icon: Briefcase, title: "Job & Drive Management", desc: "Create and manage placement drives with eligibility, salary and deadlines." },
  { icon: Send, title: "Applications", desc: "One-click applications with full status tracking from applied to placed." },
  { icon: TrendingUp, title: "Placement Tracking", desc: "Live visibility into every stage of the hiring pipeline." },
  { icon: ScrollText, title: "Resume Management", desc: "Secure resume uploads, versioning and instant access for recruiters." },
  { icon: ClipboardCheck, title: "Candidate Evaluation", desc: "Shortlist, interview and evaluate candidates across every drive." },
  { icon: LayoutDashboard, title: "Admin Dashboard", desc: "Placement statistics, reports and ecosystem-wide management tools." },
];

const PlatformOverview = () => (
  <section id="platform" className="bg-white py-24">
    <div className="mx-auto max-w-7xl px-6">
      <SectionHeading
        eyebrow="Platform"
        title="Everything your placement cell needs"
        subtitle="One cohesive platform for students, recruiters and placement officers — built around the real campus placement workflow."
      />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {platformFeatures.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: (i % 4) * 0.08 }}
            className="card-elevate group rounded-2xl border border-slate-200/80 bg-white p-6"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/10 to-fuchsia-500/10 text-indigo-600 ring-1 ring-indigo-100 transition-all duration-300 group-hover:from-indigo-500 group-hover:to-violet-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-indigo-500/30">
              <f.icon className="h-5 w-5" />
            </span>
            <h3 className="mt-5 font-display text-base font-semibold text-slate-900">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

/* ---------------- Flow ---------------- */
const flowSteps = [
  { icon: UserRound, title: "Student", desc: "Register & complete your profile" },
  { icon: Send, title: "Application", desc: "Apply to eligible drives" },
  { icon: Building2, title: "Company", desc: "Recruiters review applicants" },
  { icon: Filter, title: "Selection", desc: "Shortlist, interview & evaluate" },
  { icon: BadgeCheck, title: "Placement", desc: "Offers made, careers launched" },
];

const FlowSection = () => (
  <section id="flow" className="relative overflow-hidden bg-[#0a0e1f] py-24">
    <div className="absolute inset-0 bg-spotlight" aria-hidden="true" />
    <div className="absolute inset-0 bg-grid-dark opacity-40" aria-hidden="true" />
    <div className="relative z-10 mx-auto max-w-7xl px-6">
      <SectionHeading
        light
        eyebrow="How it works"
        title="From campus to career"
        subtitle="A transparent placement journey — every stage visible to students, companies and the placement office."
      />
      <div className="relative grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5 lg:gap-6">
        {/* connector line (desktop) */}
        <div className="absolute left-[10%] right-[10%] top-7 hidden h-px bg-gradient-to-r from-indigo-500/0 via-indigo-400/40 to-fuchsia-500/0 lg:block" aria-hidden="true" />
        {flowSteps.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55, delay: i * 0.12 }}
            className="relative flex flex-col items-center text-center"
          >
            <div className="relative">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-white/5 text-indigo-300 backdrop-blur transition-all duration-300 hover:bg-indigo-500/20">
                <s.icon className="h-6 w-6" />
              </span>
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-[9px] font-bold text-white">
                {i + 1}
              </span>
              <span className="absolute -right-2 -top-2 h-6 w-6 animate-ping rounded-full bg-indigo-500/30" aria-hidden="true" />
            </div>
            <h3 className="mt-4 font-display text-sm font-semibold text-white">{s.title}</h3>
            <p className="mt-1.5 max-w-[13rem] text-xs leading-relaxed text-slate-400">{s.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

/* ---------------- Landing page ---------------- */
function App() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <PlatformOverview />
      <FlowSection />
      <PlacementStats />
      <CompaniesSection />
      <AboutSection />
      <Testimonials />
      <Footer />
    </div>
  );
}

export default App;
