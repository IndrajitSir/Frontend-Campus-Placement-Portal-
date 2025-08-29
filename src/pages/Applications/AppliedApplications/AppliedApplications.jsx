import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify';
// CONTEXT api
import { useUserData } from '../../../context/AuthContext/AuthContext.jsx';
// Shadcn Components
import { Card } from '../../../Components/ui/card.jsx';
import { Button } from '../../../Components/ui/button.jsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../Components/ui/dialog.jsx';
// icons
import { Eye } from 'lucide-react';
import { Check } from 'lucide-react';
import { X } from 'lucide-react';
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

  useEffect(() => {
    const fetch = async () => {
        const res = await window.fetch(`${API_URL}/api/v3/applications/applied-candidates?page=${page}&limit=9`, {
          method: "GET",
          credentials: "include",
          headers: {
            'Content-Type': 'application/json',
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


  const updateStatus = async ({ newStatus, recordID }) => {
    const res = await fetch(`${API_URL}/api/v1/applications/update-status`, {
      method: "PUT",
      credentials: "include",
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({ newStatus, recordID })
    });

    const response = await res.json();
    if (!response.success) {
      toast.error(response.message || "Something went wrong!");
    }
    console.log(response.data);
    setApplications(response?.data);
  }
  return (
    <>
      < div className="p-6" >
        <h2 className="text-2xl font-bold mb-4 px-2 py-1 rounded-full text-blue-600 bg-blue-100 text-center">Applied Applications</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-26">
          {applications.map(application => (
            <Card key={application._id} className="shadow-md rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h3 className="text-lg font-semibold">{application?.userInfo?.name}</h3>
                  <p className="text-sm text-gray-600">{application?.userInfo?.email}</p>
                  <p className="text-sm">{application?.userInfo?.phoneNumber}</p>
                </div>
                <span className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full">Applied</span>
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
                <Button variant="outline" size="icon" className="cursor-pointer" onClick={() => { setRecordID(application._id); setSelectionDialog(true) }}><Check size={16} /></Button>
                <Button variant="destructive" size="icon" className="cursor-pointer" onClick={() => { setRecordID(application._id); setRejectionDialog(true) }}><X size={16} /></Button>
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
        {/* Selection Confirmation Dialog */}
        <Dialog open={selectionDialog} onOpenChange={setSelectionDialog}>
          <DialogContent>
            <DialogTitle>Shortlist the Candidate</DialogTitle>
            <DialogHeader>Are you sure you want to Shortlist the candidate?</DialogHeader>
            <DialogFooter>
              <Button className="cursor-pointer" variant="secondary" onClick={() => setSelectionDialog(false)}>Cancel</Button>
              <Button className="cursor-pointer bg-blue-600 hover:bg-blue-500" onClick={() => updateStatus({ newStatus: "selected", recordID })}>Shortlist</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {/* Rejection Confirmation Dialog */}
        <Dialog open={rejectionDialog} onOpenChange={setRejectionDialog}>
          <DialogContent>
            <DialogTitle>Reject the Candidate</DialogTitle>
            <DialogHeader>Are you sure you want to Reject the candidate?</DialogHeader>
            <DialogFooter>
              <Button className="cursor-pointer" variant="secondary" onClick={() => setRejectionDialog(false)}>Cancel</Button>
              <Button className="cursor-pointer" variant="destructive" onClick={() => updateStatus({ newStatus: "rejected", recordID })}>Reject</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  )
}

export default AppliedApplications
