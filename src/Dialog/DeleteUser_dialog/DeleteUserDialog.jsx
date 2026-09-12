import React, { useState } from 'react'
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { popSpring } from '../../lib/motion.js';
// Shadcn Components
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "../../Components/ui/dialog";
import { Button } from '../../Components/ui/button';
// Icons
import { Trash2, LoaderCircle } from 'lucide-react';
// CONTEXT api
import { useUserData } from '../../context/AuthContext/AuthContext.jsx';
// Environment variable
const API_URL = import.meta.env.VITE_API_URL;

export default function DeleteUserDialog({ deleteUserDialog, setdeleteUserDialog, userID }) {
    const { accessToken } = useUserData();
    const [deleting, setDeleting] = useState(false);
    const handleDeleteUser = async () => {
        try {
            setDeleting(true);
            const res = await axios.post(`${API_URL}/api/v1/admin/delete-user`, { userID }, {
                credentials: "include",
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            console.log("response: ", res);
            if (!res.status < 400) {
                toast.error(res.response.data.message);
            }
            toast.success(res.response.data.message);
            setdeleteUserDialog(false)
        } catch (error) {
            console.error(error);
        } finally {
            setDeleting(false);
        }
    }
    return (
        <>
            <Dialog open={deleteUserDialog} onOpenChange={setdeleteUserDialog}>
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
                            <DialogTitle className="dark:text-slate-100">Delete User</DialogTitle>
                        </div>
                        <DialogHeader className="dark:text-slate-400">Are you sure you want to Delete? This action cannot be undone.</DialogHeader>
                        <DialogFooter>
                            <Button className="cursor-pointer dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-white/10" variant="secondary" onClick={() => setdeleteUserDialog(false)}>Cancel</Button>
                            <Button className="cursor-pointer" variant="destructive" onClick={handleDeleteUser} disabled={deleting}>
                                {deleting ? <><LoaderCircle className="h-4 w-4 animate-spin" /> Deleting…</> : "Delete"}
                            </Button>
                        </DialogFooter>
                    </motion.div>
                </DialogContent>
            </Dialog>
        </>
    )
}
