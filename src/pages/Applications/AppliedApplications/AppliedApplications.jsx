import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
// CONTEXT api
import { useUserData } from '../../../context/AuthContext/AuthContext.jsx';
// Shadcn Components
import { Card } from '../../../Components/ui/card.jsx';
import { Button } from '../../../Components/ui/button.jsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../Components/ui/dialog.jsx';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../../components/ui/tooltip.jsx';
// icons
import { Eye, Check, X, FileText, Briefcase, Building2, CalendarDays, LoaderCircle } from 'lucide-react';
// Dialog Boxes
import Display_User_Details_Dialog from '../../../Dialog/Display_User_Details_Dialog/Display_User_Details_Dialog.jsx';
// Environment variable
const API_URL = import.meta.env.VITE_API_URL;
const version = import.meta.env.VITE_API_VERSION;

function AppliedApplications() {
  const { accessToken } = useUserData();
  const [applications, setApplications] = useState([]);
  const [selectionDialog, setSelectionDialog] = useState(false);
  const [rejectionDialog, setRejectionDialog] = useState(false);
  const [displayUserDetailsDialog, setDisplayUserDetailsDialog] = useState(false);
  const [dataForDisplay, setDataForDisplay] = useState(null);
  const [recordID, setRecordID] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

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
      return;
    }
    setApplications(response?.data);
    toast.success(`Candidate ${newStatus === "selected" ? "shortlisted" : "rejected"} successfully!`);
  }

  return (
    <div className="w-full space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          <FileText className="h-4 w-4" />
        </span>
        <h2 className="font-display text-lg font-bold text-slate-900">Applied Applications</h2>
        <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-600">
          {applications.length}
        </span>
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-400">
          <LoaderCircle className="h-4 w-4 animate-spin text-blue-500" /> Loading applications…
        </div>
      )}

      {!loading && applications.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-300">
            <FileText className="h-7 w-7" />
          </span>
          <p className="mt-3 text-sm font-medium text-slate-400">No applied candidates yet.</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {applications.map((application, i) => (
          <motion.div
            key={application?._id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (i % 9) * 0.04 }}
          >
            <Card className="card-elevate h-full border-slate-200/80 p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-600 ring-2 ring-blue-100">
                    {application?.userInfo?.name?.charAt(0) || "?"}
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate font-display text-sm font-semibold text-slate-900">{application?.userInfo?.name}</h3>
                    <p className="truncate text-xs text-slate-400">{application?.userInfo?.email}</p>
                    <p className="truncate text-xs text-slate-400">{application?.userInfo?.phoneNumber}</p>
                  </div>
                </div>
                <span className="inline-flex shrink-0 items-center rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600">
                  Applied
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 text-xs text-slate-500">
                <p className="flex items-center gap-1.5">
                  <Building2 className="h-3 w-3 text-slate-400" />
                  <span className="truncate"><span className="font-semibold text-slate-700">Dept:</span> {application?.studentInfo?.department || "N/A"}</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <Briefcase className="h-3 w-3 text-slate-400" />
                  <span className="truncate"><span className="font-semibold text-slate-700">Job:</span> {application?.placementInfo?.job_title || "N/A"}</span>
                </p>
                <p className="col-span-2 truncate text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">Company:</span> {application?.placementInfo?.company_name || "N/A"}
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                <a href={application?.studentInfo?.resume} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-indigo-600 hover:underline">
                  View resume →
                </a>
                <span className="flex items-center gap-1 text-[11px] text-slate-400">
                  <CalendarDays className="h-3 w-3" />
                  {new Date(application?.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" className="cursor-pointer" onClick={() => { setDataForDisplay(application); setDisplayUserDetailsDialog(true) }}>
                        <Eye className="h-3.5 w-3.5" /> View
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
      </div>

      {version !== 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button variant="outline" onClick={() => setPage(p => Math.max(p - 1, 1))} className="cursor-pointer">Previous</Button>
          <span className="text-xs font-semibold text-slate-400">Page {page}</span>
          <Button onClick={() => setPage(p => p + 1)} className="cursor-pointer">Next</Button>
        </div>
      )}

      <Display_User_Details_Dialog displayUserDetailsDialog={displayUserDetailsDialog} setDisplayUserDetailsDialog={setDisplayUserDetailsDialog} data={dataForDisplay} />

      {/* Selection Confirmation Dialog */}
      <Dialog open={selectionDialog} onOpenChange={setSelectionDialog}>
        <DialogContent>
          <DialogTitle>Shortlist the Candidate</DialogTitle>
          <DialogHeader>Are you sure you want to shortlist this candidate?</DialogHeader>
          <DialogFooter>
            <Button className="cursor-pointer" variant="secondary" onClick={() => setSelectionDialog(false)}>Cancel</Button>
            <Button className="cursor-pointer bg-emerald-500 hover:bg-emerald-600" onClick={() => { updateStatus({ newStatus: "selected", recordID }); setSelectionDialog(false); }}>Shortlist</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rejection Confirmation Dialog */}
      <Dialog open={rejectionDialog} onOpenChange={setRejectionDialog}>
        <DialogContent>
          <DialogTitle>Reject the Candidate</DialogTitle>
          <DialogHeader>Are you sure you want to reject this candidate?</DialogHeader>
          <DialogFooter>
            <Button className="cursor-pointer" variant="secondary" onClick={() => setRejectionDialog(false)}>Cancel</Button>
            <Button className="cursor-pointer" variant="destructive" onClick={() => { updateStatus({ newStatus: "rejected", recordID }); setRejectionDialog(false); }}>Reject</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AppliedApplications
