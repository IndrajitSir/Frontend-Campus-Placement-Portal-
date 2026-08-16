import { motion } from "framer-motion";
import { Building2, MapPin, CalendarDays, IndianRupee, GraduationCap, ArrowRight, Pencil, Trash2 } from "lucide-react";
import { Button } from "../ui/button";

const formatDate = (date) => {
  if (!date) return "Not mentioned";
  try {
    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "Not mentioned";
  }
};

const PlacementCard = ({ placement, role, onApply, onUpdate, onDelete, removing = false }) => {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: removing ? 0 : 1, y: removing ? -8 : 0 }}
      transition={{ duration: 0.3 }}
      className={`card-elevate group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white ${removing ? "pointer-events-none" : ""}`}
    >
      {/* Accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500" />

      <div className="flex flex-1 flex-col p-6">
        {/* Company + title */}
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/10 to-fuchsia-500/10 text-indigo-600 ring-1 ring-indigo-100">
            <Building2 className="h-6 w-6" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">{placement?.company_name || "Company"}</p>
            <h3 className="mt-0.5 truncate font-display text-lg font-semibold text-slate-900">
              {placement?.job_title || "Untitled role"}
            </h3>
          </div>
        </div>

        {/* Meta */}
        <div className="mt-5 space-y-2.5 text-sm text-slate-600">
          <p className="flex items-center gap-2.5">
            <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
            {placement?.location || "Location not mentioned"}
          </p>
          <p className="flex items-center gap-2.5">
            <CalendarDays className="h-4 w-4 shrink-0 text-slate-400" />
            <span className="text-slate-500">
              Apply by <span className="font-medium text-slate-700">{formatDate(placement?.last_date)}</span>
            </span>
          </p>
          {placement?.salary ? (
            <p className="flex items-center gap-2.5">
              <IndianRupee className="h-4 w-4 shrink-0 text-slate-400" />
              <span className="font-medium text-slate-700">{Number(placement.salary).toLocaleString("en-IN")} / year</span>
            </p>
          ) : null}
          {placement?.eligibility ? (
            <p className="flex items-start gap-2.5">
              <GraduationCap className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              <span className="line-clamp-2 text-slate-500">{placement.eligibility}</span>
            </p>
          ) : null}
        </div>

        {placement?.description ? (
          <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-slate-500">{placement.description}</p>
        ) : null}

        {/* Actions */}
        <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-5">
          {role === "student" ? (
            <Button
              onClick={onApply}
              className="group/btn flex-1 cursor-pointer bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600"
            >
              Apply now
              <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
            </Button>
          ) : (
            <>
              <Button
                onClick={onUpdate}
                className="flex-1 cursor-pointer bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600"
              >
                <Pencil className="h-4 w-4" /> Update
              </Button>
              <Button
                onClick={onDelete}
                variant="outline"
                className="cursor-pointer border-red-200 text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </motion.article>
  );
};

export default PlacementCard;
