import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { TrendingUp, Award, Handshake, Users } from "lucide-react";

const stats = [
  { icon: TrendingUp, value: 100, suffix: "%", label: "Placement tracking" },
  { icon: Award, value: 98, suffix: "%", label: "Success rate" },
  { icon: Handshake, value: 300, suffix: "+", label: "Companies onboard" },
  { icon: Users, value: 10000, suffix: "+", label: "Students placed" },
];

const CountUp = ({ value, suffix }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 1400;
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(eased * value));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value]);

  return (
    <span ref={ref} className="font-display text-3xl font-bold text-slate-900 sm:text-4xl">
      {display.toLocaleString("en-IN")}
      <span className="text-gradient">{suffix}</span>
    </span>
  );
};

const PlacementStats = () => {
  return (
    <section className="bg-slate-50/80 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="card-elevate flex items-center gap-5 rounded-2xl border border-slate-200/80 bg-white p-6"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/25">
                <s.icon className="h-5 w-5" />
              </span>
              <div>
                <CountUp value={s.value} suffix={s.suffix} />
                <p className="mt-1 text-xs font-medium text-slate-500">{s.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PlacementStats;
