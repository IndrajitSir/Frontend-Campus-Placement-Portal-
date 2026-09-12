import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { fadeUp, staggerContainer, item, EASE, popSpring } from '../../../lib/motion.js';
// Shadcn Components
import { Card } from '../../../Components/ui/card.jsx';
import { Button } from '../../../Components/ui/button.jsx';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../../components/ui/tooltip.jsx';
// Icons
import { Eye, Trash, XCircle, Briefcase, Building2, CalendarDays, Download, LoaderCircle } from 'lucide-react';
// Dialog Boxes
import DeleteStudentApplicationDialog from '../../../Dialog/Delete_Student_Application_Dialog/DeleteStudentApplicationDialog.jsx';
import Display_User_Details_Dialog from '../../../Dialog/Display_User_Details_Dialog/Display_User_Details_Dialog.jsx';
// CONTEXT api
import { useUserData } from '../../../context/AuthContext/AuthContext.jsx';
// Environment variable
const API_URL = import.meta.env.VITE_API_URL;
const version = import.meta.env.VITE_API_VERSION;
const EXPORT_ROLES = ["admin", "super_admin", "placement_staff"];

function RejectedApplications() {
  const [applications, setApplications] = useState([]);
  const [deleteStudentApplicationDialog, setDeleteStudentApplicationDialog] = useState(false);
  const [displayUserDetailsDialog, setDisplayUserDetailsDialog] = useState(false);
  const [dataForDisplay, setDataForDisplay] = useState(null);
  const [recordID, setRecordID] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const { accessToken, role } = useUserData();
  const canExport = EXPORT_ROLES.includes(role);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await window.fetch(`${API_URL}/api/v3/applications/rejected-candidates?page=${page}&limit=9`, {
          method: "GET",
          credentials: "include",
          headers: {
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
        console.error("Failed to fetch rejected applications", err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [page, accessToken]);

  const handleExportCSV = async () => {
    try {
      setExporting(true);
      const res = await fetch(`${API_URL}/api/v3/applications/export?status=rejected`, {
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
      a.download = "rejected-applications.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("Rejected applications exported as CSV");
    } catch (err) {
      console.error("Failed to export rejected applications", err);
      toast.error("Failed to export CSV");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="w-full space-y-6 p-6 pt-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-300">
            <XCircle className="h-4 w-4" />
          </span>
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">Rejected Applications</h2>
          <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-600 dark:bg-red-500/10 dark:text-red-300">
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
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-300 dark:bg-red-500/10 dark:text-red-400/60">
            <XCircle className="h-7 w-7" />
          </span>
          <p className="mt-3 text-sm font-medium text-slate-400 dark:text-slate-500">No rejected candidates yet.</p>
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
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 text-sm font-bold text-red-600 ring-2 ring-red-100 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-500/20">
                      {application?.userInfo?.name?.charAt(0) || "?"}
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate font-display text-sm font-semibold text-slate-900 dark:text-slate-100">{application?.userInfo?.name}</h3>
                      <p className="truncate text-xs text-slate-400 dark:text-slate-500">{application?.userInfo?.email}</p>
                      <p className="truncate text-xs text-slate-400 dark:text-slate-500">{application?.userInfo?.phoneNumber}</p>
                    </div>
                  </div>
                  <span className="pill-rejected inline-flex shrink-0 items-center text-[10px] font-semibold">
                    Rejected
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
                        <Button size="sm" variant="destructive" className="cursor-pointer" onClick={() => { setRecordID(application?._id); setDeleteStudentApplicationDialog(true) }}>
                          <Trash className="h-3.5 w-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top"><p>Remove from rejected</p></TooltipContent>
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
      <DeleteStudentApplicationDialog deleteUserApplication={deleteStudentApplicationDialog} setDeleteUserApplication={setDeleteStudentApplicationDialog} recordID={recordID} />
    </div>
  )
}

export default RejectedApplications
