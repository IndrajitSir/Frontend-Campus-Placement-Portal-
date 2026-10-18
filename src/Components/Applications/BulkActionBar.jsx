import { useState } from "react";
import { motion } from "framer-motion";
import { CheckSquare2, LoaderCircle, X } from "lucide-react";
import { Button } from "../ui/button.jsx";
import { Input } from "../ui/input.jsx";
import { Label } from "../ui/label.jsx";

const TARGETS = [
  { value: "shortlisted", label: "Shortlist" },
  { value: "selected", label: "Select" },
  { value: "rejected", label: "Reject" },
];

/**
 * Sticky action bar shown when at least one candidate is selected.
 *
 * The server validates every transition and returns a per-record summary, so
 * this bar only collects intent; it never assumes which rows will succeed.
 */
function BulkActionBar({
  count,
  allSelected,
  onToggleAll,
  onApply,
  onClear,
  busy = false,
  noteRequiredTargets = [],
}) {
  const [target, setTarget] = useState("shortlisted");
  const [note, setNote] = useState("");

  if (count === 0) return null;

  // Some moves require a written reason (e.g. retracting an offer). The page
  // declares which targets that applies to for the records it is showing.
  const noteRequired = noteRequiredTargets.includes(target);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-20 z-20 rounded-2xl border border-teal-200 bg-teal-50/95 p-3 shadow-lg shadow-teal-900/5 backdrop-blur dark:border-teal-500/30 dark:bg-teal-500/10"
      role="region"
      aria-label="Bulk actions"
    >
      <div className="flex flex-wrap items-center gap-3">
        <span className="flex items-center gap-1.5 rounded-full bg-teal-600 px-3 py-1 text-xs font-bold text-white">
          <CheckSquare2 className="h-3.5 w-3.5" />
          {count} selected
        </span>

        <button
          type="button"
          onClick={onToggleAll}
          className="cursor-pointer rounded-lg border border-teal-300/70 bg-white/70 px-2.5 py-1 text-xs font-semibold text-teal-800 transition-colors hover:bg-white dark:border-teal-500/40 dark:bg-white/5 dark:text-teal-200 dark:hover:bg-white/10"
        >
          {allSelected ? "Clear page selection" : "Select all on page"}
        </button>

        <div className="flex items-center gap-1.5">
          <Label htmlFor="bulk-status" className="text-xs font-semibold text-teal-900 dark:text-teal-100">
            Move to
          </Label>
          <select
            id="bulk-status"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            disabled={busy}
            className="h-8 rounded-lg border border-teal-300/70 bg-white px-2 text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-teal-500/30 dark:border-teal-500/40 dark:bg-slate-900 dark:text-slate-100"
          >
            {TARGETS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-[12rem] flex-1">
          <Label htmlFor="bulk-note" className="sr-only">
            Note (optional)
          </Label>
          <Input
            id="bulk-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={busy}
            maxLength={500}
            placeholder={noteRequired ? "Reason (required)" : "Reason (optional, required for some moves)"}
            className="h-8 rounded-lg bg-white/80 text-xs dark:bg-white/5"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="cursor-pointer"
            disabled={busy || (noteRequired && !note.trim())}
            onClick={() => onApply(target, note.trim())}
          >
            {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
            {busy ? "Applying…" : "Apply"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="cursor-pointer"
            disabled={busy}
            onClick={onClear}
          >
            <X className="h-3.5 w-3.5" /> Clear
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export default BulkActionBar;
