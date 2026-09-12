import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
// Shadcn components
import { Button } from '../ui/button.jsx';
import { Dialog, DialogContent, DialogFooter, DialogTitle } from '../ui/dialog.jsx';
import { Input } from '../ui/input.jsx';
import { Label } from '../ui/label.jsx';
// CONTEXT api
import { useUserData } from '../../context/AuthContext/AuthContext.jsx';
import { useSocket } from '../../context/SocketContext/SocketContext.jsx';
// Extra
import { motion } from 'framer-motion';
import { fadeUp, staggerContainer, item, popSpring } from '../../lib/motion.js';
// Icons
import { Briefcase, Building2, FileText, Video } from 'lucide-react';
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
    socket.emit("join-room", { roomId: interviewID, role: role, name: userInfo?.user?.name }, (res) => {
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
        <div className="mb-6 flex items-center justify-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
            <Briefcase className="h-4.5 w-4.5" />
          </span>
          <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-slate-100">Your Applied Jobs</h2>
        </div>

        {loading ? (
          // Show card-shaped skeletons while loading
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="skeleton-shimmer h-40 rounded-2xl border border-slate-200/80 dark:border-white/10" />
            ))}
          </div>
        ) : appliedJobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-300 dark:bg-indigo-500/10 dark:text-indigo-400/60">
              <FileText className="h-7 w-7" />
            </span>
            <p className="mt-3 text-sm font-medium text-slate-400 dark:text-slate-500">No applications yet.</p>
          </div>
        ) : (
          <motion.div
            variants={staggerContainer(0.07)}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {appliedJobs.map((candidate) => (
              <motion.div key={candidate?.user_id?._id} variants={item}>
                <div className="card-elevate h-full rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-200 dark:border-white/10 dark:bg-white/[0.04]">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display text-base font-semibold text-slate-800 dark:text-slate-100">
                      {candidate?.status === "applied"
                        ? "You have applied for"
                      : `You got ${candidate?.status} for`}
                      {" "}
                      {candidate?.placement_id?.job_title} at {candidate?.placement_id?.company_name}
                    </h3>
                    <span className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${
                      candidate?.status === "applied"
                        ? "pill-applied"
                        : candidate?.status === "shortlisted"
                          ? "pill-shortlisted"
                          : candidate?.status === "selected"
                            ? "pill-selected"
                            : "pill-rejected"
                    }`}>
                      {candidate?.status}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                    <Building2 className="h-3.5 w-3.5 shrink-0 text-slate-400 dark:text-slate-500" />
                    <span className="truncate">{candidate?.placement_id?.company_name || "N/A"}</span>
                  </div>

                  {(candidate?.status === "shortlisted" || candidate?.status === "applied") && (
                    <Button variant="gradient" onClick={() => setJoinInterviewDialog(true)} className="mt-4 w-full cursor-pointer">
                      <Video className="h-4 w-4" /> Join Interview
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Join Interview Dialog */}
      <Dialog open={joinInterviewDialog} onOpenChange={setJoinInterviewDialog}>
        <DialogContent className="rounded-2xl dark:border-white/10 dark:bg-slate-900">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={popSpring}
            className="space-y-4"
          >
            <DialogTitle className="dark:text-slate-100">Join Interview</DialogTitle>
            <div className="space-y-1.5">
              <Label className="dark:text-slate-300">Interview Room ID</Label>
              <Input
                placeholder="Enter Interview Room ID"
                className="focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200"
                value={interviewID}
                onChange={(e) => setInterviewID(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" className="cursor-pointer dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-white/10" onClick={() => setJoinInterviewDialog(false)}>Cancel</Button>
              <Button variant="gradient" className="cursor-pointer" onClick={handleJoinInterview}>Join Now</Button>
            </DialogFooter>
          </motion.div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default AppliedForJobs
