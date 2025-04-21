import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify';
// CONTEXT api
import { useUserData } from '../../../context/AuthContext/AuthContext.jsx';
// Shadcn Components
import { Card, CardContent } from '../../../components/ui/card.jsx';
import { Button } from "../../../components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../../components/ui/dialog.jsx';
// Icons
import { Pencil, Trash, Eye } from "lucide-react";
// Dialog Boxes
import DeleteUserDialog from '../../../Dialog/DeleteUser_dialog/DeleteUserDialog.jsx';
import Display_User_Details_Dialog from '../../../Dialog/Display_User_Details_Dialog/Display_User_Details_Dialog.jsx';
// Environment variable
const API_URL = import.meta.env.VITE_API_URL;

function Students() {
  const [students, setStudents] = useState([]);
  const { accessToken, role } = useUserData();
  const [deleteUserDialog, setdeleteUserDialog] = useState(false);
  const [userDetailsDialog, setUserDetailsDialog] = useState(false);
  const [approvalDialog, setapprovalDialog] = useState(false);
  const [student_id, setStudent_id] = useState("");
  const [isApproved, setIsApproved] = useState(false);
  const [specificUserDetails, setSpecificUserDetails] = useState({});
  async function getData() {
    const res = await fetch(`${API_URL}/api/v1/student/all`, {
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
    console.log("Response data: ", response.data);
    console.log("Role: ", role);

    setStudents(response?.data);
  }
  useEffect(() => {
    getData();
  }, [])

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
          student._id === student_id
            ? { ...student, approved: !student.approved }
            : student
        )
      );
      return true;
    }
  }
  return (
    <>
      < div className="p-6" >
        <h2 className="text-2xl font-bold mb-4">All Students</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-26">
          {students.map(user => (
            <Card key={user._id}>
              <CardContent className="p-4 flex justify-between items-center">
                <div>
                  <h1 className="text-lg font-medium">{user.student_id.name}</h1>
                  <h2 className="text-sm text-muted-foreground">Email: {user.student_id.email}</h2>
                  <p>Contact Number: {user?.student_id?.phoneNumber || "N/A"}</p>
                  <p>Department: {user?.department || "N/A"}</p>
                  <p>Professional Skill: {user?.professional_skill || "N/A"}</p>
                  <p>Location: {user?.location || "N/A"}</p>
                  <p>About: {user?.about || "N/A"}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-1 gap-y-4">
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" className="cursor-pointer hover:bg-gray-200" onClick={() => { setSpecificUserDetails(user); setUserDetailsDialog(true) }}><Eye size={16} /></Button>
                    {
                      role !== "placement_staff" &&
                      <>
                        <Button variant="outline" size="icon" className="cursor-pointer hover:bg-gray-200"><Pencil size={16} /></Button>
                        <Button variant="destructive" size="icon" className="cursor-pointer hover:bg-red-500" onClick={() => { setStudent_id(user._id); setdeleteUserDialog(true); }}><Trash size={16} /></Button>
                      </>
                    }
                  </div>
                  {
                    role !== "placement_staff" &&
                    <Button className="cursor-pointer" onClick={() => { setStudent_id(user._id); setapprovalDialog(true); setIsApproved(user.approved) }}>{user.approved ? "Remove approval" : "Approve"}</Button>
                  }
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
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