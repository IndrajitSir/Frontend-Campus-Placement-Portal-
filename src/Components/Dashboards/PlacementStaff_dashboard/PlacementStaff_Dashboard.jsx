import React from 'react'
import { useNavigate } from 'react-router-dom';
// Shadcn Components
import { Card, CardHeader, CardContent, CardTitle } from '../../ui/card'
import { Button } from '../../ui/button';
// Components
import SystemAnalysis from '../../../Components/System_Analysis/SystemAnalysis.jsx';
function PlacementStaff_Dashboard() {
  const navigate = useNavigate();
  const handleJoinInterview = ()=>{
    navigate("/home/dashboard/interview-setup");
  }
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Manage Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <Button className="mt-2 cursor-pointer" onClick={() => navigate("/home/placements")}>Manage Job Listing</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Candidate Shortlisting</CardTitle>
          </CardHeader>
          <CardContent>
            <Button className="mt-2 cursor-pointer" onClick={() => { navigate("/home/dashboard/manage-applications") }}>View Candidates</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Schedule Interviews</CardTitle>
          </CardHeader>
          <CardContent>
            <Button className="mt-2 cursor-pointer" onClick={handleJoinInterview}>Set Up Interviews</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Offer Job Positions</CardTitle>
          </CardHeader>
          <CardContent>
            <Button className="mt-2 cursor-pointer" onClick={() => { navigate("/home/dashboard/manage-applications/applied-candidates") }}>Send Offers</Button>
          </CardContent>
        </Card>
      </div>
      <div className="p-6 space-y-6">
        <h2 className="text-2xl font-semibold">System Overview</h2>
        <SystemAnalysis />
      </div>
    </>
  )
}

export default PlacementStaff_Dashboard
