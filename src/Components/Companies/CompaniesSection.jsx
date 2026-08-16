import { motion } from "framer-motion";
import { Building2 } from "lucide-react";

const companies = [
  "amazon.jpg",
  "capgemini.jpg",
  "google.png",
  "hyundai.jpg",
  "microsoft.png",
  "samsung.png",
  "tcs.png",
  "wipro.png",
  "infosys.png",
  "airtel.png",
  "deloitte.png",
  "hdfc_bank.jpg",
];

function CompaniesSection() {
  return (
    <section id="companies" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest text-indigo-600">
            <Building2 className="h-3.5 w-3.5" />
            Recruiters
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Trusted by <span className="text-gradient">100+ companies</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-slate-500">
            From tech giants to industry leaders — recruiters hire campus talent through our platform.
          </p>
        </motion.div>

        <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {companies.map((logo, i) => (
            <motion.div
              key={logo}
              initial={{ opacity: 0, scale: 0.92 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: (i % 6) * 0.06 }}
              className="card-elevate flex h-24 items-center justify-center rounded-2xl border border-slate-200/80 bg-white p-4"
            >
              <img
                src={`company_logo/${logo}`}
                alt={logo.replace(/\.(jpg|png|jpeg)$/, "")}
                loading="lazy"
                className="max-h-full max-w-full object-contain opacity-80 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default CompaniesSection;
