import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { BookOpenCheck, Building2, ClipboardList, TrendingUp } from "lucide-react";

/** Live, unauthenticated counts from `/api/v1/analytics/public-stats`. */
const buildCards = (stats) => [
  { icon: ClipboardList, value: stats?.totalPlacements ?? null, label: "Placement drives" },
  { icon: Building2, value: stats?.totalCompanies ?? null, label: "Companies onboard" },
  { icon: BookOpenCheck, value: stats?.totalApplications ?? null, label: "Applications submitted" },
  { icon: TrendingUp, value: stats?.offersMade ?? null, label: "Offers made" },
];

const CountUp = ({ value }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [display, setDisplay] = useState(0);
  const target = Number(value);
  const available = value !== null && value !== undefined && Number.isFinite(target);

  useEffect(() => {
    if (!inView || !available) return;
    const duration = 1400;
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(eased * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, available, target]);

  return (
    <span ref={ref} className="font-display text-3xl font-bold tabular-nums text-slate-900 sm:text-4xl">
      {available ? display.toLocaleString("en-IN") : "—"}
    </span>
  );
};

const PlacementStats = ({ stats }) => {
  const cards = buildCards(stats);

  return (
    <section className="bg-slate-50/80 py-24" aria-labelledby="platform-stats">
      <div className="mx-auto max-w-7xl px-6">
        <h2 id="platform-stats" className="sr-only">
          Platform statistics
        </h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="card-elevate flex items-center gap-5 rounded-2xl border border-slate-200/80 bg-white p-6"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-teal-500 text-white shadow-lg shadow-indigo-500/25">
                <s.icon className="h-5 w-5" />
              </span>
              <div>
                <CountUp value={s.value} />
                <p className="mt-1 text-xs font-medium text-slate-500">{s.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
        <p className="mt-4 text-center text-xs text-slate-400">
          Counts are live from the placement database. A dash means the figure is currently unavailable.
        </p>
      </div>
    </section>
  );
};

export default PlacementStats;
