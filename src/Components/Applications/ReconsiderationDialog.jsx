import { useEffect, useState } from "react";
import { Loader2, RotateCcw } from "lucide-react";
import { toast } from "react-toastify";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog.jsx";
import { Button } from "../ui/button.jsx";
import { Label } from "../ui/label.jsx";

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Ask the placement office to re-review a rejection. The status does not change
 * here — staff make an explicit, reasoned decision — and the request is visible
 * in the application timeline.
 */
function ReconsiderationDialog({ open, onOpenChange, application, accessToken, onSubmitted }) {
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setNote("");
      setError("");
    }
  }, [open]);

  const submit = async () => {
    if (!application?._id) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/v1/applications/${application._id}/reconsider`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ note: note.trim() }),
      });
      const response = await res.json();
      if (!res.ok || !response?.success) {
        throw new Error(response?.message || "Could not send the request");
      }
      toast.success(response.message || "Reconsideration request sent");
      onSubmitted?.(application._id, response.data);
      onOpenChange(false);
    } catch (err) {
      setError(err?.message || "Could not send the request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl dark:border-white/10 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300">
            <RotateCcw className="h-5 w-5" />
          </span>
          <DialogTitle className="dark:text-slate-100">Request reconsideration</DialogTitle>
        </div>
        <DialogHeader className="text-sm text-slate-500 dark:text-slate-400">
          {application?.placement_id?.company_name || "This company"} ·{" "}
          {application?.placement_id?.job_title || "this role"}. The placement office will review
          your request — this does not change your status by itself.
        </DialogHeader>

        <div>
          <Label htmlFor="reconsideration-note" className="text-sm dark:text-slate-300">
            Anything new they should know? (optional)
          </Label>
          <textarea
            id="reconsideration-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={500}
            rows={3}
            placeholder="Updated resume, new certification, changed availability…"
            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition-all focus:border-teal-400 focus:ring-4 focus:ring-teal-500/15 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100"
          />
        </div>

        {error ? (
          <p role="alert" className="text-sm text-rose-600 dark:text-rose-400">
            {error}
          </p>
        ) : null}

        <DialogFooter>
          <Button variant="outline" className="cursor-pointer" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button className="cursor-pointer" disabled={submitting} onClick={submit}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Send request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ReconsiderationDialog;
