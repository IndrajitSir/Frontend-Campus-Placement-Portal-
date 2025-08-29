import React, { useEffect, useState } from 'react'
// Shadcn Components
import { Card } from '../../../Components/ui/card.jsx';
import { Button } from '../../../Components/ui/button.jsx';
// Icons
import { Eye } from 'lucide-react';
import { Trash } from 'lucide-react';
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
  const { accessToken } = useUserData();

  useEffect(() => {
    const fetch = async () => {
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
    };
    fetch();
  }, [page, accessToken]);
  return (
    <>
      < div className="p-6" >
        <div className='border-t-2 border-gray-20 pt-4 mt-8'>
          <h2 className="text-2xl font-bold mb-4 px-2 py-1 rounded-full text-green-600 bg-green-100 text-center">Selected Applications</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-26">
          {applications.map(application => (
            <Card key={application._id} className="shadow-md rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h3 className="text-lg font-semibold">{application?.userInfo?.name}</h3>
                  <p className="text-sm text-gray-600">{application?.userInfo?.email}</p>
                  <p className="text-sm">{application?.userInfo?.phoneNumber}</p>
                </div>
                <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full">Selected</span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                <div><strong>Department:</strong> {application?.studentInfo?.department}</div>
                <div><strong>Location:</strong> {application?.studentInfo?.location}</div>
                <div><strong>Company:</strong> {application?.placementInfo?.company_name}</div>
                <div><strong>Job Title:</strong> {application?.placementInfo?.job_title}</div>
              </div>

              <div className="mt-4 flex justify-between items-center">
                <a href={application?.studentInfo?.resume} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View Resume</a>
                <span className="text-xs text-gray-500">{new Date(application?.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" className="cursor-pointer" onClick={() => { setDataForDisplay(application); setDisplayUserDetailsDialog(true) }}><Eye size={16} /></Button>
                <Button variant="destructive" size="icon" className="cursor-pointer" onClick={() => { setRecordID(application._id); setDeleteStudentApplicationDialog(true) }}><Trash size={16} /></Button>
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
        <Display_User_Details_Dialog displayUserDetailsDialog={displayUserDetailsDialog} setDisplayUserDetailsDialog={setDisplayUserDetailsDialog} data={dataForDisplay} />
        {/* Delete application record Confirmation Dialog */}
        <DeleteStudentApplicationDialog deleteUserApplication={deleteStudentApplicationDialog} setDeleteUserApplication={setDeleteStudentApplicationDialog} recordID={recordID} />
      </div>
    </>
  )
}

export default SelectedApplications
