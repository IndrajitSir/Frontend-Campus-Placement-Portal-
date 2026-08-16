import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
// CONTEXT api
import { useUserData } from '../../../context/AuthContext/AuthContext.jsx';
// Shadcn Components
import { Card } from '../../../Components/ui/card.jsx';
import { Button } from "../../../Components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../../Components/ui/dialog.jsx';
// Icons
import { Trash, Eye, GraduationCap, BadgeCheck } from "lucide-react";
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
  const [student_id, setStudent_id] = useState("");
  const [isApproved, setIsApproved] = useState(false);
  const [specificUserDetails, setSpecificUserDetails] = useState({});
  const [page, setPage] = useState(1);

  async function getDataV2() {
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

  return (
    <div className="w-full space-y-5">
      <div className="flex items-center gap-2 pt-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
          <GraduationCap className="h-4 w-4" />
        </span>
        <h2 className="font-display text-lg font-bold text-slate-900">Students</h2>
        <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-600">
          {Array.isArray(students) ? students.length : 0}
        </span>
      </div>

      {Array.isArray(students) && students.length === 0 && (
        <p className="py-10 text-center text-sm text-slate-400 italic">No students found.</p>
      )}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {(Array.isArray(students) ? students : []).map((user, i) => (
          <motion.div
            key={user?._id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (i % 9) * 0.04 }}
          >
            <Card className="card-elevate h-full border-slate-200/80 p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 items-center gap-3">
                  <img src={avatarOf(user)} alt={user?.student_id?.name} className="h-11 w-11 shrink-0 rounded-full object-cover ring-2 ring-indigo-100" />
                  <div className="min-w-0">
                    <h3 className="truncate font-display text-sm font-semibold text-slate-900">{user?.student_id?.name}</h3>
                    <p className="truncate text-xs text-slate-400">{user?.student_id?.email}</p>
                  </div>
                </div>
                <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  user?.approved ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                }`}>
                  <BadgeCheck className="h-3 w-3" />
                  {user?.approved ? "Approved" : "Pending"}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 text-xs text-slate-500">
                <p><span className="font-semibold text-slate-700">Department</span><br />{user?.department || "N/A"}</p>
                <p><span className="font-semibold text-slate-700">Location</span><br />{user?.location || "N/A"}</p>
                <p><span className="font-semibold text-slate-700">Skill</span><br />{user?.professional_skill || "N/A"}</p>
                <p><span className="font-semibold text-slate-700">Contact</span><br />{user?.student_id?.phoneNumber || "N/A"}</p>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                <a href={user?.resume} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-indigo-600 hover:underline">
                  View resume →
                </a>
                <span className="text-[11px] text-slate-400">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : ""}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Button size="sm" variant="outline" className="cursor-pointer" onClick={() => { setSpecificUserDetails(user); setUserDetailsDialog(true) }}>
                  <Eye className="h-3.5 w-3.5" /> Details
                </Button>
                {role !== "placement_staff" && (
                  <>
                    <Button
                      size="sm"
                      className={`cursor-pointer ${user?.approved ? "bg-amber-500 hover:bg-amber-600" : "bg-emerald-500 hover:bg-emerald-600"}`}
                      onClick={() => { setStudent_id(user?._id); setapprovalDialog(true); setIsApproved(user?.approved) }}
                    >
                      {user?.approved ? "Remove approval" : "Approve"}
                    </Button>
                    <Button size="sm" variant="destructive" className="cursor-pointer" onClick={() => { setStudent_id(user?._id); setdeleteUserDialog(true); }}>
                      <Trash className="h-3.5 w-3.5" /> Delete
                    </Button>
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
          <Button variant="outline" onClick={() => setPage(p => Math.max(p - 1, 1))} className="cursor-pointer">Previous</Button>
          <span className="text-xs font-semibold text-slate-400">Page {page}</span>
          <Button onClick={() => setPage(p => p + 1)} className="cursor-pointer">Next</Button>
        </div>
      }

      <Display_User_Details_Dialog displayUserDetailsDialog={userDetailsDialog} setDisplayUserDetailsDialog={setUserDetailsDialog} data={specificUserDetails} />
      <DeleteUserDialog deleteUserDialog={deleteUserDialog} setdeleteUserDialog={setdeleteUserDialog} userID={student_id} />
      <Dialog open={approvalDialog} onOpenChange={setapprovalDialog}>
        <DialogContent>
          <DialogTitle>Approve User</DialogTitle>
          <DialogHeader>Are you sure you want to {isApproved ? "remove approval of" : "approve"} the student?</DialogHeader>
          <DialogFooter>
            <Button className="cursor-pointer" variant="secondary" onClick={() => setapprovalDialog(false)}>Cancel</Button>
            <Button
              className="cursor-pointer"
              onClick={async () => {
                const success = await handleApproval(student_id);
                if (success) {
                  setapprovalDialog(false)
                } else {
                  toast.error("Try Again!")
                }
              }}
            >{isApproved ? "Remove" : "Approve"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Students
