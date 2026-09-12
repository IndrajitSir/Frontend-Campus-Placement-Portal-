import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion';
// Shadcn Components
import { Card } from '../../../Components/ui/card.jsx';
import { Button } from '../../../Components/ui/button.jsx';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../../components/ui/tooltip.jsx';
// Icons
import { Eye, Trash, CheckCircle, Briefcase, Building2, CalendarDays, LoaderCircle } from 'lucide-react';
// Dialog Boxes
import DeleteStudentApplicationDialog from '../../../Dialog/Delete_Student_Application_Dialog/DeleteStudentApplicationDialog.jsx';
import Display_User_Details_Dialog from '../../../Dialog/Display_User_Details_Dialog/Display_User_Details_Dialog.jsx';
// CONTEXT api
import { useUserData } from '../../../context/AuthContext/AuthContext.jsx';
// Environment variable
const API_URL = import.meta.env.VITE_API_URL;
const version = import.meta.env.VITE_API_VERSION;

function SelectedApplications() {
  const [applications, setApplications] = useState([]);
  const [recordID, setRecordID] = useState(null);
  const [deleteStudentApplicationDialog, setDeleteStudentApplicationDialog] = useState(false);
  const [displayUserDetailsDialog, setDisplayUserDetailsDialog] = useState(false);
  const [dataForDisplay, setDataForDisplay] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const { accessToken } = useUserData();

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await window.fetch(`${API_URL}/api/v3/applications/selected-candidates?page=${page}&limit=9`, {
          method: "GET",
          credentials: "include",
          headers: {
            'Authorization': `Bearer ${accessToken}`
          },
        });
        const response = await res.json();
        if (!response.success) {
          throw new Error(response.message);
        }
        if (response?.data?.candidates?.length > 0) {
          setApplications(response.data.candidates);
        }
      } catch (err) {
        console.error("Failed to fetch selected applications", err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [page, accessToken]);

  return (
    <div className="w-full space-y-6 p-6 pt-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
          <CheckCircle className="h-4 w-4" />
        </span>
        <h2 className="font-display text-lg font-bold text-slate-900">Selected Applications</h2>
        <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-600">
          {applications.length}
        </span>
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-400">
          <LoaderCircle className="h-4 w-4 animate-spin text-emerald-500" /> Loading applications…
        </div>
      )}

      {!loading && applications.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-300">
            <CheckCircle className="h-7 w-7" />
          </span>
          <p className="mt-3 text-sm font-medium text-slate-400">No selected candidates yet.</p>
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
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-sm font-bold text-emerald-600 ring-2 ring-emerald-100">
                    {application?.userInfo?.name?.charAt(0) || "?"}
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate font-display text-sm font-semibold text-slate-900">{application?.userInfo?.name}</h3>
                    <p className="truncate text-xs text-slate-400">{application?.userInfo?.email}</p>
                    <p className="truncate text-xs text-slate-400">{application?.userInfo?.phoneNumber}</p>
                  </div>
                </div>
                <span className="inline-flex shrink-0 items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
                  Selected
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
                    <TooltipContent side="top"><p>Remove from selected</p></TooltipContent>
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
      <DeleteStudentApplicationDialog deleteUserApplication={deleteStudentApplicationDialog} setDeleteUserApplication={setDeleteStudentApplicationDialog} recordID={recordID} />
    </div>
  )
}

export default SelectedApplications
