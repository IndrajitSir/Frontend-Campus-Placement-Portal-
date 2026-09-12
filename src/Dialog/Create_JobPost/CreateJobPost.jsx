import React, { useState } from 'react'
import { motion } from 'framer-motion';
import { LoaderCircle } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
// Shadcn Components
import { Label } from '../../Components/ui/label';
import { Input } from '../../Components/ui/input';
import { Button } from '../../Components/ui/button';
// CONTEXT api
import { useUserData } from '../../context/AuthContext/AuthContext.jsx';
// Motion presets
import { popSpring } from '../../lib/motion';
// Environment variables
const API_URL = import.meta.env.VITE_API_URL;

const fieldInputClass =
  "mt-2 cursor-text rounded-xl focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200";

function CreateJobPost({ onCancel }) {
    const { accessToken } = useUserData();
    const [submitting, setSubmitting] = useState(false);
    const [newPost, setNewPost] = useState({ company_name: "", job_title: "", location: "", description: "", eligibility: "", last_date: "" });
    const handleEditChange = (e) => {
        setNewPost({ ...newPost, [e.target.name]: e.target.value });
    };
    const handleCreateJobPost = async () => {
        if (submitting) return;
        try {
            setSubmitting(true);
            const res = await axios.post(`${API_URL}/api/v1/placements`, newPost, {
                credentials: "include",
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            if (res.status < 400) {
                toast.success(res.data?.message || "Post created successfully!");
                onCancel(false);
            }
        } catch (error) {
            const msg = error.response?.data?.message || "Failed to create post";
            toast.error(msg);
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    }
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={popSpring}
        >
            <Label>Company Name</Label>
            <Input className={fieldInputClass} name="company_name" value={newPost.company_name} onChange={handleEditChange} />
            <Label className="mt-3">Job Title</Label>
            <Input className={fieldInputClass} name="job_title" value={newPost.job_title} onChange={handleEditChange} />
            <Label className="mt-3">Location</Label>
            <Input className={fieldInputClass} name="location" value={newPost.location || ""} onChange={handleEditChange} />
            <Label className="mt-3">Description</Label>
            <Input className={fieldInputClass} name="description" value={newPost.description} onChange={handleEditChange} />
            <Label className="mt-3">Eligibility</Label>
            <Input className={fieldInputClass} name="eligibility" value={newPost.eligibility} onChange={handleEditChange} />
            <Label className="mt-3">Last Date</Label>
            <Input className={fieldInputClass} type="date" name="last_date" value={newPost.last_date} onChange={handleEditChange} />
            <div className="mt-5 flex items-center justify-end gap-3">
                <Button variant="outline" className="cursor-pointer dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-white/10" onClick={() => onCancel(false)} disabled={submitting}>Cancel</Button>
                <Button variant="gradient" className="cursor-pointer" onClick={handleCreateJobPost} disabled={submitting}>
                    {submitting && <LoaderCircle className="h-4 w-4 animate-spin" />}
                    {submitting ? "Creating…" : "Create"}
                </Button>
            </div>
        </motion.div>
    )
}

export default CreateJobPost
