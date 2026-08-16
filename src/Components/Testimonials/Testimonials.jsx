import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";

const testimonials = [
  {
    name: "Ananya Sharma",
    role: "Placed at Google · CSE 2025",
    text: "This platform helped me secure my dream job! Applying to drives, tracking my application and getting updates was effortless.",
  },
  {
    name: "Alice Smith",
    role: "Placed at Microsoft · IT 2025",
    text: "I got hired in a top company through this portal. The shortlisting and interview process was transparent from start to finish.",
  },
];

const Testimonials = () => {
  return (
    <section id="stories" className="bg-slate-50/80 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest text-indigo-600">
            <Quote className="h-3.5 w-3.5" />
            Success stories
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Careers <span className="text-gradient">launched</span> here
          </h2>
        </motion.div>

        <div className="mx-auto mt-14 grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
          {testimonials.map((t, i) => (
            <motion.figure
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="card-elevate relative rounded-2xl border border-slate-200/80 bg-white p-7"
            >
              <Quote className="absolute right-6 top-6 h-8 w-8 text-indigo-100" />
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star key={s} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <blockquote className="mt-4 text-sm leading-relaxed text-slate-600">“{t.text}”</blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-sm font-bold text-white">
                  {t.name.charAt(0)}
                </span>
                <div>
                  <p className="font-display text-sm font-semibold text-slate-900">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.role}</p>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
