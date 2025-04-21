import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify';
// CONTEXT api
import { useUserData } from '../../../context/AuthContext/AuthContext.jsx';
// Shadcn Components
import { Card, CardContent } from '../../../components/ui/card.jsx';
import { Button } from '../../../components/ui/button.jsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../components/ui/dialog.jsx';
// icons
import { Eye } from 'lucide-react';
import { Check } from 'lucide-react';
import { X } from 'lucide-react';
// Dialog Boxes
import Display_User_Details_Dialog from '../../../Dialog/Display_User_Details_Dialog/Display_User_Details_Dialog.jsx';
import { record } from '../../../constants/constants.js';
// Environment variable
const API_URL = import.meta.env.VITE_API_URL;

function AppliedApplications() {
  const [applications, setApplications] = useState([]);
  const [selectionDialog, setSelectionDialog] = useState(false);
  const [rejectionDialog, setRejectionDialog] = useState(false);
  const [displayUserDetailsDialog, setDisplayUserDetailsDialog] = useState(false);
  const [dataForDisplay, setDataForDisplay] = useState(null);
  const [recordID, setRecordID] = useState(null);
  useEffect(() => {
    setApplications(record);
  }, []);
  const { accessToken } = useUserData();
  async function getData() {
    const res = await fetch(`${API_URL}/api/v1/applications/applied-candidates`, {
      method: "GET",
      credentials: "include",
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
  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    setApplications(prevApplications =>
      prevApplications.filter(application =>
        application.role === "applied"
      )
    );
  }, [applications.role]);

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
    if (!response.success) {
      toast.error(response.message || "Something went wrong!");
    }
    console.log(response.data);
    setApplications(response?.data);
  }
  return (
    <>
      < div className="p-6" >
        <h2 className="text-2xl font-bold mb-4">Applied Applications</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-26">
          {applications.map(application => (
            <Card key={application._id}>
              <CardContent className="p-4 flex justify-between items-center">
                <div key={application._id} className=" p-4 rounded shadow-md bg-white">
                  <h3 className="text-xl font-semibold">{application?.user_id?.name} applied for {application?.placement_id?.job_title} at {application?.placement_id?.company_name}</h3>
                  <p className="text-gray-600">{application?.status}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" className="cursor-pointer" onClick={()=> { setDataForDisplay(application); setDisplayUserDetailsDialog(true)}}><Eye size={16} /></Button>
                  <Button variant="outline" size="icon" className="cursor-pointer" onClick={() => { setRecordID(application._id); setSelectionDialog(true) }}><Check size={16} /></Button>
                  <Button variant="destructive" size="icon" className="cursor-pointer" onClick={() => { setRecordID(application._id); setRejectionDialog(true) }}><X size={16} /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
          <Display_User_Details_Dialog displayUserDetailsDialog={displayUserDetailsDialog} setDisplayUserDetailsDialog={setDisplayUserDetailsDialog} data={dataForDisplay}/>
        {/* Selection Confirmation Dialog */}
        <Dialog open={selectionDialog} onOpenChange={setSelectionDialog}>
          <DialogContent>
            <DialogTitle>Shortlist the Candidate</DialogTitle>
            <DialogHeader>Are you sure you want to Shortlist the candidate?</DialogHeader>
            <DialogFooter>
              <Button className="cursor-pointer" variant="secondary" onClick={() => setSelectionDialog(false)}>Cancel</Button>
              <Button className="cursor-pointer bg-blue-600 hover:bg-blue-500" onClick={() => updateStatus("selected", recordID)}>Shortlist</Button>
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
              <Button className="cursor-pointer" variant="destructive" onClick={() => updateStatus("rejected", recordID)}>Reject</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  )
}

export default AppliedApplications

