import { useEffect, useState } from "react";
import { Loader2, Star } from "lucide-react";
import { toast } from "react-toastify";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog.jsx";
import { Button } from "../ui/button.jsx";
import { Label } from "../ui/label.jsx";

const API_URL = import.meta.env.VITE_API_URL;

const starLabel = (value) => `${value} star${value === 1 ? "" : "s"}`;

/**
 * Rate a placement drive. Students can rate only drives they applied to; the
 * server enforces that and returns an updated aggregate after saving.
 */
function PlacementFeedbackDialog({ open, onOpenChange, placement, accessToken, onSubmitted }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !placement?._id || !accessToken) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${API_URL}/api/v1/feedback/placement/${placement._id}`, {
          credentials: "include",
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const response = await res.json();
        if (!res.ok || !response?.success) {
          throw new Error(response?.message || "Unable to load feedback");
        }
        if (cancelled) return;
        setDetail(response.data);
        setRating(response.data?.myFeedback?.rating || 0);
        setText(response.data?.myFeedback?.text || "");
      } catch (err) {
        if (!cancelled) setError(err?.message || "Unable to load feedback");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, placement?._id, accessToken]);

  const submit = async () => {
    if (rating < 1) {
      setError("Pick a rating from 1 to 5 stars");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/v1/feedback`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          placementId: placement._id,
          rating,
          feedbackText: text.trim() || `${rating}-star rating`,
        }),
      });
      const response = await res.json();
      if (!res.ok || !response?.success) {
        throw new Error(response?.message || "Could not save your rating");
      }
      toast.success(response.message || "Thanks for rating this drive");
      onSubmitted?.(placement._id);
      onOpenChange(false);
    } catch (err) {
      setError(err?.message || "Could not save your rating");
    } finally {
      setSubmitting(false);
    }
  };

  const distribution = detail?.distribution || {};
  // The server knows whether this viewer applied (students) or is staff; until
  // the detail loads we keep the form hidden rather than offering a control
  // that a 403 would reject.
  const canRate = detail ? detail.canRate !== false : false;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-2xl dark:border-white/10 dark:bg-slate-900">
        <DialogTitle className="dark:text-slate-100">
          {canRate ? "Rate" : "Reviews for"}{" "}
          {detail?.placement?.job_title || placement?.job_title || "this drive"}
        </DialogTitle>
        <DialogHeader className="text-sm text-slate-500 dark:text-slate-400">
          {canRate
            ? `${detail?.placement?.company_name || placement?.company_name || ""} — feedback is visible to other applicants as your first name only.`
            : "Ratings come from students who applied to this drive. Apply to share your own experience."}
        </DialogHeader>

        {loading ? (
          <p className="flex items-center gap-2 py-6 text-sm text-slate-500 dark:text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading feedback…
          </p>
        ) : (
          <div className="space-y-4">
            {canRate && (
              <div className="flex items-center gap-2" role="group" aria-label="Your rating">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  aria-label={`Rate ${starLabel(value)}`}
                  aria-pressed={rating === value}
                  className="cursor-pointer rounded-lg p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-7 w-7 ${
                      value <= rating
                        ? "fill-amber-400 text-amber-400"
                        : "text-slate-300 dark:text-slate-600"
                    }`}
                  />
                </button>
              ))}
                <span className="ml-1 text-sm font-semibold text-slate-700 dark:text-slate-200">
                  {rating ? starLabel(rating) : "Not rated yet"}
                </span>
              </div>
            )}

            {canRate && (
              <div>
                <Label htmlFor="feedback-text" className="text-sm dark:text-slate-300">
                  What should other students know? (optional)
                </Label>
                <textarea
                  id="feedback-text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  maxLength={2000}
                  rows={3}
                  placeholder="Interview process, eligibility clarity, work culture…"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition-all focus:border-teal-400 focus:ring-4 focus:ring-teal-500/15 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100"
                />
              </div>
            )}

            {detail?.count > 0 ? (
              <div className="rounded-xl border border-slate-200/80 p-3 dark:border-white/10">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {detail.average} ★ average · {detail.count} rating{detail.count === 1 ? "" : "s"}
                </p>
                <div className="mt-2 space-y-1">
                  {[5, 4, 3, 2, 1].map((value) => {
                    const count = distribution[value] || 0;
                    const percent = detail.count ? Math.round((count / detail.count) * 100) : 0;
                    return (
                      <div key={value} className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                        <span className="w-6 tabular-nums">{value}★</span>
                        <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                          <span className="block h-full rounded-full bg-amber-400" style={{ width: `${percent}%` }} />
                        </span>
                        <span className="w-6 text-right tabular-nums">{count}</span>
                      </div>
                    );
                  })}
                </div>
                {detail.recent?.length ? (
                  <ul className="mt-3 space-y-2 border-t border-slate-100 pt-3 dark:border-white/10">
                    {detail.recent.slice(0, 3).map((item) => (
                      <li key={item._id} className="text-xs text-slate-500 dark:text-slate-400">
                        <span className="font-semibold text-slate-700 dark:text-slate-200">
                          {item.author?.name || "Student"} · {item.rating}★
                        </span>
                        {item.text ? <span className="mt-0.5 block">{item.text}</span> : null}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : (
              <p className="text-xs text-slate-400 dark:text-slate-500">
                {canRate ? "No ratings yet — yours will be the first." : "No reviews yet."}
              </p>
            )}

            {error ? (
              <p role="alert" className="text-sm text-rose-600 dark:text-rose-400">
                {error}
              </p>
            ) : null}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" className="cursor-pointer" onClick={() => onOpenChange(false)}>
            {canRate ? "Cancel" : "Close"}
          </Button>
          {canRate && (
            <Button className="cursor-pointer" disabled={submitting || loading} onClick={submit}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {detail?.myFeedback ? "Update rating" : "Submit rating"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default PlacementFeedbackDialog;
