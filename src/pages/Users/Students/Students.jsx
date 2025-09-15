import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify';
// CONTEXT api
import { useUserData } from '../../../context/AuthContext/AuthContext.jsx';
// Shadcn Components
import { Card } from '../../../Components/ui/card.jsx';
import { Button } from "../../../Components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../../Components/ui/dialog.jsx';
// Icons
import { Pencil, Trash, Eye } from "lucide-react";
// Dialog Boxes
import DeleteUserDialog from '../../../Dialog/DeleteUser_dialog/DeleteUserDialog.jsx';
import Display_User_Details_Dialog from '../../../Dialog/Display_User_Details_Dialog/Display_User_Details_Dialog.jsx';
// Environment variable
const API_URL = import.meta.env.VITE_API_URL;
const version = import.meta.env.VITE_API_VERSION;

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
    console.log("version 2 response for students: ", response?.data?.students);
    console.log("Role: ", role);

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
    } else {
      if (!Array.isArray(students)) {
        toast.error("Students is not an array:", students);
        return false;
      }

      setStudents(prevStudents =>
        prevStudents.map(student =>
          student?._id === student_id
            ? { ...student, approved: !student?.approved }
            : student
        )
      );
      return true;
    }
  }
  return (
    <>
      < div className="p-6" >
        <h2 className="text-2xl font-bold mb-4 px-2 py-1 rounded-full text-blue-600 bg-blue-100 text-center">Students</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-26">
          {students.map(user => (
            <Card key={user?._id} className="shadow-md rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h3 className="text-lg font-semibold">{user?.student_id?.name}</h3>
                  <p className="text-sm text-gray-600">{user?.student_id?.email}</p>
                  <p className="text-sm">{user?.student_id?.phoneNumber || "N/A"}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                <div><strong>Department:</strong> {user?.department || "N/A"}</div>
                <div><strong>Location:</strong> {user?.location || "N/A"}</div>
                <div><strong>About:</strong> {user?.about || "N/A"}</div>
                <div><strong>Professional Skill:</strong> {user?.professional_skill || "N/A"}</div>
              </div>

              <div className="mt-4 flex justify-between items-center">
                <a href={user?.resume} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View Resume</a>
                <span className="text-xs text-gray-500">{new Date(user?.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-1 gap-y-4">
                <div className="flex justify-around items-center">
                  <Button variant="outline" size="icon" className="cursor-pointer bg-yellow-400 hover:bg-yellow-500" onClick={() => { setSpecificUserDetails(user); setUserDetailsDialog(true) }}><Eye size={12} /></Button>
                  {
                    role !== "placement_staff" &&
                    <>
                      <Button variant="outline" size="icon" className="cursor-pointer bg-blue-400 hover:bg-blue-500"><Pencil size={12} /></Button>
                      <Button variant="destructive" size="icon" className="cursor-pointer hover:bg-red-500" onClick={() => { setStudent_id(user?._id); setdeleteUserDialog(true); }}><Trash size={12} /></Button>
                    </>
                  }
                </div>
                {
                  role !== "placement_staff" &&
                  <Button className={`cursor-pointer ${user?.approved ? "bg-red-500 hover:bg-red-600": "bg-green-500 hover:bg-green-600"} ?`} onClick={() => { setStudent_id(user?._id); setapprovalDialog(true); setIsApproved(user?.approved) }}>{user?.approved ? "Remove approval" : "Approve"}</Button>
                }
              </div>
            </Card>
          ))}
        </div>
        {
          version !== 1 &&
          <>
            <div className="flex items-center justify-center gap-10 mt-5">
              <Button variant="outline" onClick={() => setPage(p => Math.max(p - 1, 1))} className="cursor-pointer">Previous</Button>
              <Button onClick={() => setPage(p => p + 1)} className="cursor-pointer">Next</Button>
            </div>
          </>
        }
        <Display_User_Details_Dialog displayUserDetailsDialog={userDetailsDialog} setDisplayUserDetailsDialog={setUserDetailsDialog} data={specificUserDetails} />
        {/* Delete user Dialog */}
        <DeleteUserDialog deleteUserDialog={deleteUserDialog} setdeleteUserDialog={setdeleteUserDialog} userID={student_id} />
        {/*Approve Student Dialog */}
        <Dialog open={approvalDialog} onOpenChange={setapprovalDialog}>
          <DialogContent>
            <DialogTitle>Approve User</DialogTitle>
            <DialogHeader>Are you sure you want to {isApproved ? "remove approval of" : "approve"} the student?</DialogHeader>
            <DialogFooter>
              <Button className="cursor-pointer" variant="secondary" onClick={() => setapprovalDialog(false)}>Cancel</Button>
              <Button className="cursor-pointer"
                onClick={() => {
                  const success = handleApproval(student_id);
                  if (success) {
                    setapprovalDialog(false)
                  } else {
                    toast.error("Try Again!")
                  }
                }}>{isApproved ? "Remove" : "Approve"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  )
}

export default Students
