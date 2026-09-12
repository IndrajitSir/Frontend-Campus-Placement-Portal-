import React, { useState } from 'react'
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { popSpring } from '../../lib/motion.js';
// Shadcn Components
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../Components/ui/dialog.jsx';
import { Button } from '../../Components/ui/button.jsx';
// Icons
import { Trash2, LoaderCircle } from 'lucide-react';
// CONTEXT api
import { useUserData } from '../../context/AuthContext/AuthContext.jsx';
// Environment variables
const API_URL = import.meta.env.VITE_API_URL;

function DeleteStudentApplicationDialog({ deleteUserApplication, setDeleteUserApplication, recordID }) {
    const { accessToken } = useUserData();
    const [deleting, setDeleting] = useState(false);
    const deleteRecord = async () => {
        try {
            setDeleting(true);
            const res = await fetch(`${API_URL}/api/v1/applications/delete`, {
                method: "DELETE",
                credentials: "include",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({ recordID })
            });

            const response = await res.json();
            if (!response.success) {
                toast.error(response.message || "Something went wrong!");
                return;
            }
            toast.success(response.message);
            setDeleteUserApplication(false);
        } catch (err) {
            console.error("Failed to delete application record", err);
            toast.error("Failed to delete application record");
        } finally {
            setDeleting(false);
        }
    }
    return (
        <>
            {/* Delete User Application record Confirmation Dialog */}
            <Dialog open={deleteUserApplication} onOpenChange={setDeleteUserApplication}>
                <DialogContent className="rounded-2xl dark:border-white/10 dark:bg-slate-900">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={popSpring}
                    >
                        <div className="mb-3 flex items-center gap-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">
                                <Trash2 className="h-5 w-5" />
                            </span>
                            <DialogTitle className="dark:text-slate-100">Delete the Candidate's application record</DialogTitle>
                        </div>
                        <DialogHeader className="dark:text-slate-400">Are you sure you want to delete this application record? This action cannot be undone.</DialogHeader>
                        <DialogFooter>
                            <Button className="cursor-pointer dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-white/10" variant="secondary" onClick={() => setDeleteUserApplication(false)}>Cancel</Button>
                            <Button className="cursor-pointer" variant="destructive" onClick={deleteRecord} disabled={deleting}>
                                {deleting ? <><LoaderCircle className="h-4 w-4 animate-spin" /> Deleting…</> : "Delete"}
                            </Button>
                        </DialogFooter>
                    </motion.div>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default DeleteStudentApplicationDialog
