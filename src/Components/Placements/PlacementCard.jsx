import { motion } from "framer-motion";
import { Building2, MapPin, CalendarDays, IndianRupee, GraduationCap, ArrowRight, Pencil, Trash2, Bookmark } from "lucide-react";
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

// Deadline state for the top-right badge.
// Returns { label, className } or null when no valid date.
const getDeadlineState = (date) => {
  if (!date) return null;
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;
  const diffMs = d.getTime() - Date.now();
  if (diffMs < 0) {
    return {
      label: "Closed",
      className:
        "bg-slate-100 text-slate-500 ring-slate-200/70 dark:bg-white/[0.06] dark:text-slate-400 dark:ring-white/10",
    };
  }
  const days = Math.ceil(diffMs / 86400000);
  if (days <= 2) {
    return {
      label: `Closes in ${days}d`,
      className:
        "bg-rose-50 text-rose-600 ring-rose-200/70 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/20",
    };
  }
  if (days <= 7) {
    return {
      label: `Closes in ${days}d`,
      className:
        "bg-amber-50 text-amber-600 ring-amber-200/70 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/20",
    };
  }
  return {
    label: "Open",
    className:
      "bg-emerald-50 text-emerald-600 ring-emerald-200/70 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20",
  };
};

const PlacementCard = ({
  placement,
  role,
  onApply,
  onUpdate,
  onDelete,
  removing = false,
  bookmarked = false,
  onToggleBookmark,
}) => {
  const deadline = getDeadlineState(placement?.last_date);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: removing ? 0 : 1, y: removing ? -8 : 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
      className={`card-elevate group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white transition-colors duration-200 hover:border-indigo-200/80 hover:shadow-xl hover:shadow-indigo-500/10 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:border-indigo-400/30 dark:hover:shadow-indigo-500/10 ${removing ? "pointer-events-none" : ""}`}
    >
      {/* Accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500" />

      {/* Deadline + bookmark badges (top-right) */}
      <div className="absolute right-4 top-5 z-10 flex items-center gap-2">
        {deadline && (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${deadline.className}`}
          >
            {deadline.label}
          </span>
        )}
        {onToggleBookmark && (
          <motion.button
            type="button"
            whileTap={{ scale: 0.9 }}
            onClick={() => onToggleBookmark(placement)}
            aria-pressed={bookmarked}
            aria-label={bookmarked ? "Remove bookmark" : "Save placement"}
            title={bookmarked ? "Remove bookmark" : "Save placement"}
            className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-full ring-1 transition-colors ${
              bookmarked
                ? "bg-indigo-50 text-indigo-600 ring-indigo-200 dark:bg-indigo-500/15 dark:text-indigo-300 dark:ring-indigo-500/30"
                : "bg-white/80 text-slate-400 ring-slate-200/80 hover:text-indigo-500 hover:ring-indigo-200 dark:bg-white/[0.06] dark:text-slate-400 dark:ring-white/10 dark:hover:text-indigo-300"
            }`}
          >
            <Bookmark className={`h-4 w-4 ${bookmarked ? "fill-current text-indigo-600 dark:text-indigo-400" : ""}`} />
          </motion.button>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6">
        {/* Company + title */}
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/10 to-fuchsia-500/10 text-indigo-600 ring-1 ring-indigo-100 dark:text-indigo-300 dark:ring-indigo-500/20">
            <Building2 className="h-6 w-6" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-300">
              {placement?.company_name || "Company"}
            </p>
            <h3 className="mt-0.5 truncate font-display text-lg font-semibold text-slate-900 dark:text-slate-100">
              {placement?.job_title || "Untitled role"}
            </h3>
          </div>
        </div>

        {/* Meta */}
        <div className="mt-5 space-y-2.5 text-sm text-slate-600 dark:text-slate-300">
          <p className="flex items-center gap-2.5">
            <MapPin className="h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500" />
            {placement?.location || "Location not mentioned"}
          </p>
          <p className="flex items-center gap-2.5">
            <CalendarDays className="h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500" />
            <span className="text-slate-500 dark:text-slate-400">
              Apply by <span className="font-medium text-slate-700 dark:text-slate-200">{formatDate(placement?.last_date)}</span>
            </span>
          </p>
          {placement?.salary ? (
            <p className="flex items-center gap-2.5">
              <IndianRupee className="h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500" />
              <span className="font-medium text-slate-700 dark:text-slate-200">
                {Number(placement.salary).toLocaleString("en-IN")} / year
              </span>
            </p>
          ) : null}
          {placement?.eligibility ? (
            <p className="flex items-start gap-2.5">
              <GraduationCap className="mt-0.5 h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500" />
              <span className="line-clamp-2 text-slate-500 dark:text-slate-400">{placement.eligibility}</span>
            </p>
          ) : null}
        </div>

        {placement?.description ? (
          <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            {placement.description}
          </p>
        ) : null}

        {/* Actions */}
        <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-5 dark:border-white/10">
          {role === "student" ? (
            <Button
              onClick={onApply}
              variant="gradient"
              className="group/btn flex-1 cursor-pointer"
            >
              Apply now
              <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
            </Button>
          ) : (
            <>
              <Button
                onClick={onUpdate}
                variant="gradient"
                className="flex-1 cursor-pointer"
              >
                <Pencil className="h-4 w-4" /> Update
              </Button>
              <Button
                onClick={onDelete}
                variant="outline"
                className="cursor-pointer border-red-200 text-red-600 hover:bg-red-50 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10"
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
