import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
// CONTEXT api
import { useUserData } from '../../../context/AuthContext/AuthContext.jsx';
// Shadcn Components
import { Card } from '../../../Components/ui/card.jsx';
import { Button } from "../../../Components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../../Components/ui/dialog.jsx';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../../components/ui/tooltip.jsx";
// Icons
import { Trash, Eye, GraduationCap, BadgeCheck, UserX } from "lucide-react";
// Components
// Dialog Boxes
import DeleteUserDialog from '../../../Dialog/DeleteUser_dialog/DeleteUserDialog.jsx';
import Display_User_Details_Dialog from '../../../Dialog/Display_User_Details_Dialog/Display_User_Details_Dialog.jsx';
// Environment variable
const API_URL = import.meta.env.VITE_API_URL;
const version = import.meta.env.VITE_API_VERSION;
const DEFAULT_AVATAR = "/defaultUserAvatar.jpeg";

function Students() {
  const [students, setStudents] = useState([]);
  const { accessToken, role } = useUserData();
  const [deleteUserDialog, setdeleteUserDialog] = useState(false);
  const [userDetailsDialog, setUserDetailsDialog] = useState(false);
  const [approvalDialog, setapprovalDialog] = useState(false);
  const [approving, setApproving] = useState(false);
  const [student_id, setStudent_id] = useState("");
  const [isApproved, setIsApproved] = useState(false);
  const [specificUserDetails, setSpecificUserDetails] = useState({});
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  async function getDataV2() {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/v2/student/all?page=${page}&limit=9`, {
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
      });

      const response = await res.json();
      if (!response.success) {
        toast.error(response.message || "Something went wrong!");
      }
      setStudents(response?.data?.students);
    } catch (err) {
      console.error("Failed to fetch students", err);
      toast.error("Failed to fetch students");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getDataV2();
  }, [page])

  const handleApproval = async (student_id) => {
    const res = await fetch(`${API_URL}/api/v1/admin/change-student-approval`, {
      method: "PUT",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ student_id })
    });

    const response = await res.json();
    if (!response.success) {
      toast.error(response.message || "Something went wrong!");
      return false;
    }
    setStudents(prevStudents =>
      (Array.isArray(prevStudents) ? prevStudents : []).map(student =>
        student?._id === student_id
          ? { ...student, approved: !student?.approved }
          : student
      )
    );
    return true;
  }

  const avatarOf = (u) => u?.student_id?.avatar || u?.avatar || DEFAULT_AVATAR;

  if (loading) {
    return (
      <div className="w-full space-y-5">
        <div className="skeleton-shimmer mt-2 h-9 w-52 rounded-xl" />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton-shimmer h-52 rounded-2xl border border-slate-200/80 dark:border-white/10" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-5">
      <div className="flex items-center gap-2 pt-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
          <GraduationCap className="h-4 w-4" />
        </span>
        <h2 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">Students</h2>
        <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
          {Array.isArray(students) ? students.length : 0}
        </span>
      </div>

      {Array.isArray(students) && students.length === 0 && (
        <div className="flex flex-col items-center justify-center py-14 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-300 dark:bg-indigo-500/10 dark:text-indigo-400/60">
            <UserX className="h-7 w-7" />
          </span>
          <p className="mt-3 text-sm font-medium text-slate-400 dark:text-slate-500">No students found.</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {(Array.isArray(students) ? students : []).map((user, i) => (
          <motion.div
            key={user?._id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (i % 9) * 0.04 }}
          >
            <Card className="card-elevate h-full rounded-2xl border-slate-200/80 p-5 dark:border-white/10 dark:bg-white/[0.04]">
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 items-center gap-3">
                  <img src={avatarOf(user)} alt={user?.student_id?.name} className="h-11 w-11 shrink-0 rounded-full object-cover ring-2 ring-indigo-100 dark:ring-indigo-500/20" />
                  <div className="min-w-0">
                    <h3 className="truncate font-display text-sm font-semibold text-slate-900 dark:text-slate-100">{user?.student_id?.name}</h3>
                    <p className="truncate text-xs text-slate-400 dark:text-slate-500">{user?.student_id?.email}</p>
                  </div>
                </div>
                <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${user?.approved ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300" : "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300"
                  }`}>
                  <BadgeCheck className="h-3 w-3" />
                  {user?.approved ? "Approved" : "Pending"}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 text-xs text-slate-500 dark:text-slate-400">
                <p><span className="font-semibold text-slate-700 dark:text-slate-300">Department</span><br />{user?.department || "N/A"}</p>
                <p><span className="font-semibold text-slate-700 dark:text-slate-300">Location</span><br />{user?.location || "N/A"}</p>
                <p><span className="font-semibold text-slate-700 dark:text-slate-300">Skill</span><br />{user?.professional_skill || "N/A"}</p>
                <p><span className="font-semibold text-slate-700 dark:text-slate-300">Contact</span><br />{user?.student_id?.phoneNumber || "N/A"}</p>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-white/10">
                <a href={user?.resume} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400">
                  View resume →
                </a>
                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : ""}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button size="sm" variant="outline" className="cursor-pointer dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-white/10" onClick={() => { setSpecificUserDetails(user); setUserDetailsDialog(true) }}>
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top"><p>View details</p></TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                {role !== "placement_staff" && (
                  <>
                    <TooltipProvider delayDuration={200}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <motion.button
                            layout
                            animate={{
                              backgroundColor: user?.approved ? "#f59e0b" : "#10b981",
                            }}
                            whileHover={{
                              backgroundColor: user?.approved ? "#d97706" : "#059669",
                              scale: 1.03
                            }}
                            whileTap={{ scale: 0.97 }}
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md px-3 text-xs font-medium text-white shadow-sm cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            onClick={() => { setStudent_id(user?._id); setapprovalDialog(true); setIsApproved(user?.approved) }}
                          >
                            <motion.div
                              key={user?.approved ? "approved" : "unapproved"}
                              initial={{ opacity: 0, scale: 0.8, rotate: -15 }}
                              animate={{ opacity: 1, scale: 1, rotate: 0 }}
                              exit={{ opacity: 0, scale: 0.8, rotate: 15 }}
                              transition={{ duration: 0.15 }}
                              className="flex items-center gap-1.5"
                            >
                              {user?.approved ? (
                                <><UserX className="h-3.5 w-3.5" /><span>Remove</span></>
                              ) : (
                                <><BadgeCheck className="h-3.5 w-3.5" /><span>Approve</span></>
                              )}
                            </motion.div>
                          </motion.button>
                        </TooltipTrigger>
                        <TooltipContent side="top"><p>{user?.approved ? "Remove approval" : "Approve student"}</p></TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider delayDuration={200}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button size="sm" variant="destructive" className="cursor-pointer" onClick={() => { setStudent_id(user?._id); setdeleteUserDialog(true); }}>
                            <Trash className="h-3.5 w-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top"><p>Delete student</p></TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {
        version !== 1 &&
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button variant="outline" onClick={() => setPage(p => Math.max(p - 1, 1))} className="cursor-pointer dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-white/10">Previous</Button>
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">Page {page}</span>
          <Button onClick={() => setPage(p => p + 1)} className="cursor-pointer">Next</Button>
        </div>
      }

      <Display_User_Details_Dialog displayUserDetailsDialog={userDetailsDialog} setDisplayUserDetailsDialog={setUserDetailsDialog} data={specificUserDetails} />
      <DeleteUserDialog deleteUserDialog={deleteUserDialog} setdeleteUserDialog={setdeleteUserDialog} userID={student_id} />
      <Dialog open={approvalDialog} onOpenChange={setapprovalDialog}>
        <DialogContent className="rounded-2xl dark:border-white/10 dark:bg-slate-900">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
          >
            <DialogTitle className="dark:text-slate-100">{isApproved ? "Remove Approval" : "Approve User"}</DialogTitle>
            <DialogHeader className="dark:text-slate-400">Are you sure you want to {isApproved ? "remove approval of" : "approve"} the student?</DialogHeader>
            <DialogFooter>
              <Button className="cursor-pointer" variant="secondary" onClick={() => setapprovalDialog(false)}>Cancel</Button>
              <Button
                className={`cursor-pointer ${isApproved ? "" : "bg-emerald-500 hover:bg-emerald-600"}`}
                disabled={approving}
                onClick={async () => {
                  setApproving(true);
                  const success = await handleApproval(student_id);
                  setApproving(false);
                  if (success) {
                    setapprovalDialog(false)
                  } else {
                    toast.error("Try Again!")
                  }
                }}
              >{approving ? "Working…" : (isApproved ? "Remove" : "Approve")}</Button>
            </DialogFooter>
          </motion.div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Students
