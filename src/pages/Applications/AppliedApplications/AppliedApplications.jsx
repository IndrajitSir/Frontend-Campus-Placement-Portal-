import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { fadeUp, staggerContainer, item, EASE, popSpring } from '../../../lib/motion.js';
// CONTEXT api
import { useUserData } from '../../../context/AuthContext/AuthContext.jsx';
// Shadcn Components
import { Card } from '../../../Components/ui/card.jsx';
import { Button } from '../../../Components/ui/button.jsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../Components/ui/dialog.jsx';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../../components/ui/tooltip.jsx';
// icons
import { Eye, Check, X, FileText, Briefcase, Building2, CalendarDays, Download, LoaderCircle } from 'lucide-react';
// Dialog Boxes
import Display_User_Details_Dialog from '../../../Dialog/Display_User_Details_Dialog/Display_User_Details_Dialog.jsx';
// Environment variable
const API_URL = import.meta.env.VITE_API_URL;
const version = import.meta.env.VITE_API_VERSION;
const EXPORT_ROLES = ["admin", "super_admin", "placement_staff"];

function AppliedApplications() {
  const { accessToken, role } = useUserData();
  const [applications, setApplications] = useState([]);
  const [selectionDialog, setSelectionDialog] = useState(false);
  const [rejectionDialog, setRejectionDialog] = useState(false);
  const [displayUserDetailsDialog, setDisplayUserDetailsDialog] = useState(false);
  const [dataForDisplay, setDataForDisplay] = useState(null);
  const [recordID, setRecordID] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [confirming, setConfirming] = useState("");
  const canExport = EXPORT_ROLES.includes(role);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await window.fetch(`${API_URL}/api/v3/applications/applied-candidates?page=${page}&limit=9`, {
          method: "GET",
          credentials: "include",
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
        });
        const response = await res.json();
        if (!response?.success) {
          throw new Error(response?.message);
        }
        if (response?.data?.candidates?.length > 0) {
          setApplications(response?.data?.candidates);
        }
      } catch (err) {
        console.error("Failed to fetch applied applications", err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [page, accessToken]);


  const updateStatus = async ({ newStatus, recordID }) => {
    const res = await fetch(`${API_URL}/api/v1/applications/update-status`, {
      method: "PUT",
      credentials: "include",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({ newStatus, recordID })
    });

    const response = await res.json();
    if (!response?.success) {
      toast.error(response?.message || "Something went wrong!");
      return false;
    }
    setApplications(response?.data);
    toast.success(`Candidate ${newStatus === "selected" ? "shortlisted" : "rejected"} successfully!`);
    return true;
  }

  const handleExportCSV = async () => {
    try {
      setExporting(true);
      const res = await fetch(`${API_URL}/api/v3/applications/export?status=applied`, {
        method: "GET",
        credentials: "include",
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
      });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "applied-applications.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("Applied applications exported as CSV");
    } catch (err) {
      console.error("Failed to export applied applications", err);
      toast.error("Failed to export CSV");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="w-full space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
            <FileText className="h-4 w-4" />
          </span>
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">Applied Applications</h2>
          <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
            {applications.length}
          </span>
        </div>
        {canExport && (
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-white/10"
            onClick={handleExportCSV}
            disabled={exporting}
          >
            {exporting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {exporting ? "Exporting…" : "Export CSV"}
          </Button>
        )}
      </div>

      {loading && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton-shimmer h-56 rounded-2xl border border-slate-200/80 dark:border-white/10" />
          ))}
        </div>
      )}

      {!loading && applications.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-300 dark:bg-blue-500/10 dark:text-blue-400/60">
            <FileText className="h-7 w-7" />
          </span>
          <p className="mt-3 text-sm font-medium text-slate-400 dark:text-slate-500">No applied candidates yet.</p>
        </div>
      )}

      {!loading && applications.length > 0 && (
        <motion.div
          variants={staggerContainer(0.06)}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3"
        >
          {applications.map((application) => (
            <motion.div key={application?._id} variants={item}>
              <Card className="card-elevate h-full rounded-2xl border-slate-200/80 p-5 transition-all duration-200 dark:border-white/10 dark:bg-white/[0.04]">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-600 ring-2 ring-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/20">
                      {application?.userInfo?.name?.charAt(0) || "?"}
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate font-display text-sm font-semibold text-slate-900 dark:text-slate-100">{application?.userInfo?.name}</h3>
                      <p className="truncate text-xs text-slate-400 dark:text-slate-500">{application?.userInfo?.email}</p>
                      <p className="truncate text-xs text-slate-400 dark:text-slate-500">{application?.userInfo?.phoneNumber}</p>
                    </div>
                  </div>
                  <span className="pill-applied inline-flex shrink-0 items-center text-[10px] font-semibold">
                    Applied
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 text-xs text-slate-500 dark:text-slate-400">
                  <p className="flex items-center gap-1.5">
                    <Building2 className="h-3 w-3 text-slate-400 dark:text-slate-500" />
                    <span className="truncate"><span className="font-semibold text-slate-700 dark:text-slate-300">Dept:</span> {application?.studentInfo?.department || "N/A"}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Briefcase className="h-3 w-3 text-slate-400 dark:text-slate-500" />
                    <span className="truncate"><span className="font-semibold text-slate-700 dark:text-slate-300">Job:</span> {application?.placementInfo?.job_title || "N/A"}</span>
                  </p>
                  <p className="col-span-2 truncate text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Company:</span> {application?.placementInfo?.company_name || "N/A"}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-white/10">
                  <a href={application?.studentInfo?.resume} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400">
                    View resume →
                  </a>
                  <span className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500">
                    <CalendarDays className="h-3 w-3" />
                    {new Date(application?.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="sm" className="cursor-pointer dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-white/10" onClick={() => { setDataForDisplay(application); setDisplayUserDetailsDialog(true) }}>
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top"><p>View candidate details</p></TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button size="sm" className="cursor-pointer bg-emerald-500 hover:bg-emerald-600" onClick={() => { setRecordID(application?._id); setSelectionDialog(true) }}>
                          <Check className="h-3.5 w-3.5" /> Shortlist
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top"><p>Shortlist this candidate</p></TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button size="sm" variant="destructive" className="cursor-pointer" onClick={() => { setRecordID(application?._id); setRejectionDialog(true) }}>
                          <X className="h-3.5 w-3.5" /> Reject
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top"><p>Reject this candidate</p></TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {version !== 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button variant="outline" onClick={() => setPage(p => Math.max(p - 1, 1))} className="cursor-pointer dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-white/10">Previous</Button>
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">Page {page}</span>
          <Button onClick={() => setPage(p => p + 1)} className="cursor-pointer">Next</Button>
        </div>
      )}

      <Display_User_Details_Dialog displayUserDetailsDialog={displayUserDetailsDialog} setDisplayUserDetailsDialog={setDisplayUserDetailsDialog} data={dataForDisplay} />

      {/* Selection Confirmation Dialog */}
      <Dialog open={selectionDialog} onOpenChange={setSelectionDialog}>
        <DialogContent className="rounded-2xl dark:border-white/10 dark:bg-slate-900">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={popSpring}
          >
            <div className="mb-3 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
                <Check className="h-5 w-5" />
              </span>
              <DialogTitle>Shortlist the Candidate</DialogTitle>
            </div>
            <DialogHeader>Are you sure you want to shortlist this candidate?</DialogHeader>
            <DialogFooter>
              <Button className="cursor-pointer" variant="secondary" onClick={() => setSelectionDialog(false)}>Cancel</Button>
              <Button
                className="cursor-pointer bg-emerald-500 hover:bg-emerald-600"
                disabled={confirming === "selected"}
                onClick={async () => {
                  setConfirming("selected");
                  const ok = await updateStatus({ newStatus: "selected", recordID });
                  setConfirming("");
                  if (ok) setSelectionDialog(false);
                }}
              >
                {confirming === "selected" ? <><LoaderCircle className="h-4 w-4 animate-spin" /> Shortlisting…</> : "Shortlist"}
              </Button>
            </DialogFooter>
          </motion.div>
        </DialogContent>
      </Dialog>

      {/* Rejection Confirmation Dialog */}
      <Dialog open={rejectionDialog} onOpenChange={setRejectionDialog}>
        <DialogContent className="rounded-2xl dark:border-white/10 dark:bg-slate-900">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={popSpring}
          >
            <div className="mb-3 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">
                <X className="h-5 w-5" />
              </span>
              <DialogTitle>Reject the Candidate</DialogTitle>
            </div>
            <DialogHeader>Are you sure you want to reject this candidate?</DialogHeader>
            <DialogFooter>
              <Button className="cursor-pointer" variant="secondary" onClick={() => setRejectionDialog(false)}>Cancel</Button>
              <Button
                className="cursor-pointer"
                variant="destructive"
                disabled={confirming === "rejected"}
                onClick={async () => {
                  setConfirming("rejected");
                  const ok = await updateStatus({ newStatus: "rejected", recordID });
                  setConfirming("");
                  if (ok) setRejectionDialog(false);
                }}
              >
                {confirming === "rejected" ? <><LoaderCircle className="h-4 w-4 animate-spin" /> Rejecting…</> : "Reject"}
              </Button>
            </DialogFooter>
          </motion.div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AppliedApplications
