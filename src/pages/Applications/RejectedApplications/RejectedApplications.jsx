import React, { useEffect, useState } from 'react'
// CONTEXT api
import { useUserData } from '../../../context/AuthContext/AuthContext.jsx';
// Shadcn Components
import { Card, CardContent } from '../../../components/ui/card.jsx';
import { Button } from '../../../components/ui/button.jsx';
// Icons
import { Eye } from 'lucide-react';
import { Trash } from 'lucide-react';
// Dialog Boxes
import DeleteStudentApplicationDialog from '../../../Dialog/Delete_Student_Application_Dialog/DeleteStudentApplicationDialog.jsx';
import Display_User_Details_Dialog from '../../../Dialog/Display_User_Details_Dialog/Display_User_Details_Dialog.jsx';
import { record } from '../../../constants/constants.js';
// Environment variable
const API_URL = import.meta.env.VITE_API_URL;

function RejectedApplications() {
  const [applications, setApplications] = useState([]);
  const [deleteStudentApplicationDialog, setDeleteStudentApplicationDialog] = useState(false);
  const [displayUserDetailsDialog, setDisplayUserDetailsDialog] = useState(false);
  const [dataForDisplay, setDataForDisplay] = useState(null);
  const [recordID, setRecordID] = useState(null);
  const { accessToken } = useUserData();
  useEffect(() => {
    setApplications(record);
  }, [])
  useEffect(() => {
    async function getData() {
      const res = await fetch(`${API_URL}/api/v1/applications/rejected-candidates`, {
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
      });

      const response = await res.json();
      if (response?.data.length > 0) {
        setApplications(response?.data);
      }
    }
    getData();
  }, [])
  return (
    <>
      < div className="p-6" >
        <h2 className="text-2xl font-bold mb-4">Rejected Applications</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-26">
          {applications.map(application => (
            <Card key={application._id}>
              <CardContent className="p-4 flex justify-between items-center">
                <div key={application._id} className=" p-4 rounded shadow-md bg-white">
                  <h3 className="text-xl font-semibold">{application.user_id.name} got rejected for this {application.placement_id.job_title} at {application.placement_id.company_name}</h3>
                  <p className="text-gray-600">{application?.description}</p>
                </div>
                <div className="flex gap-2">
                  <Button className="cursor-pointer hover:bg-gray-300" variant="outline" size="icon" onClick={() => { setDataForDisplay(application); setDisplayUserDetailsDialog(true) }}><Eye size={16} /></Button>
                  <Button className="cursor-pointer hover:bg-red-500" variant="destructive" size="icon" onClick={() => { setRecordID(application._id); setDeleteStudentApplicationDialog(true) }}><Trash size={16} /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Display_User_Details_Dialog displayUserDetailsDialog={displayUserDetailsDialog} setDisplayUserDetailsDialog={setDisplayUserDetailsDialog} data={dataForDisplay} />
        {/* Delete application record Confirmation Dialog */}
        <DeleteStudentApplicationDialog deleteUserApplication={deleteStudentApplicationDialog} setDeleteUserApplication={setDeleteStudentApplicationDialog} recordID={recordID} />
      </div>
    </>
  )
}

export default RejectedApplications