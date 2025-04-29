import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
// Shadcn components
import { Button } from '../ui/button.jsx';
import { Dialog, DialogContent, DialogFooter } from '../ui/dialog.jsx';
import { Input } from '../ui/input.jsx';
// CONTEXT api
import { useUserData } from '../../context/AuthContext/AuthContext.jsx';
import { useSocket } from '../../context/SocketContext/SocketContext.jsx';
// Extra
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { motion } from 'framer-motion';
// Environment Variables
const API_URL = import.meta.env.VITE_API_URL;

function AppliedForJobs() {
  const { accessToken, role, userInfo } = useUserData();
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [joinInterviewDialog, setJoinInterviewDialog] = useState(false);
  const [interviewID, setInterviewID] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { socket } = useSocket();

  const applications = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/applications/applied-for-job`, {
        method: "GET",
        credentials: "include",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
      })
      const response = await res.json();
      if (!response.success) {
        toast.warning(response.message);
        return
      }
      setAppliedJobs(response?.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch applications");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    applications();
  }, []);

  const handleJoinInterview = () => {
    if (!interviewID.trim()) {
      toast.warning("Please enter a valid Interview ID!");
      return;
    }
    socket.emit("join-room", { roomId: interviewID, role, name: userInfo?.user?.name }, (res) => {
      if (!res?.success) {
        toast.error(res?.message || "Unable to join interview");
        return;
      }
      localStorage.setItem("roomId", interviewID);
      navigate("/home/dashboard/interview-setup");
    });
  };
  return (
    <>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-700">Your Applied Jobs</h2>

        {loading ? (
          // Show skeletons while loading
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} height={150} borderRadius={10} />
            ))}
          </div>
        ) : appliedJobs.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">
            <p>No applications yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {appliedJobs.map((candidate, index) => (
              <motion.div key={candidate?.user_id?._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
                className="border p-4 rounded-lg shadow-md bg-white hover:shadow-lg transition-all"
              >
                <h3 className="text-lg font-semibold mb-2 text-gray-800">
                  {candidate?.status === "applied"
                    ? "You have applied for"
                  : `You got ${candidate?.status} for`}
                  {" "}
                  {candidate?.placement_id?.job_title} at {candidate?.placement_id?.company_name}
                </h3>

                <div className="text-sm text-gray-600 mb-4">
                  Status: <span className="capitalize">{candidate?.status}</span>
                </div>

                {(candidate?.status === "shortlisted" || candidate?.status === "applied") && (
                  <Button onClick={() => setJoinInterviewDialog(true)} className="w-full mt-2 cursor-pointer">
                    Join Interview
                  </Button>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Join Interview Dialog */}
      <Dialog open={joinInterviewDialog} onOpenChange={setJoinInterviewDialog}>
        <DialogContent className="space-y-4">
          <Input
            placeholder="Enter Interview Room ID"
            value={interviewID}
            onChange={(e) => setInterviewID(e.target.value)}
          />
          <DialogFooter>
            <Button className="cursor-pointer" onClick={handleJoinInterview}>Join Now</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default AppliedForJobs