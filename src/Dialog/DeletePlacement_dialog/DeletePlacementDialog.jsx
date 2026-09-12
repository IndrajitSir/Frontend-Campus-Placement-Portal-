import React from 'react'
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { LoaderCircle, Trash2 } from 'lucide-react';
// Shadcn Components
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "../../Components/ui/dialog";
import { Button } from '../../Components/ui/button';
// CONTEXT api
import { useUserData } from '../../context/AuthContext/AuthContext.jsx';
// Motion presets
import { popSpring } from '../../lib/motion';
// Environment variable
const API_URL = import.meta.env.VITE_API_URL;

export default function DeletePlacementPostDialog({
    deletePlacementPostDialog, setDeletePlacementPostDialog,
    placementPostID, onPostDelete, loading, setLoading
}) {
    const { accessToken } = useUserData();
    const handlePlacementPostDelete = async () => {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/v1/placements/${placementPostID}`, {
            method: "DELETE",
            credentials: "include",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
        });
        const response = await res.json();
        console.log("response delete post: ", response);
        if (!response.success) {
            toast.warning(response.message)
        }
        toast.success(response.message);
        onPostDelete(response.data._id);
    }
    return (
        <>
            <Dialog open={deletePlacementPostDialog} onOpenChange={setDeletePlacementPostDialog}>
                <DialogContent className="rounded-2xl dark:border-white/10 dark:bg-slate-900 dark:text-slate-200">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={popSpring}
                    >
                        <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-500 ring-1 ring-red-200/70 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20">
                            <Trash2 className="h-5 w-5" />
                        </div>
                        <DialogTitle className="text-slate-900 dark:text-slate-100">Delete Placement</DialogTitle>
                        <DialogHeader className="text-slate-500 dark:text-slate-400">Are you sure you want to Delete?</DialogHeader>
                        <DialogFooter>
                            <Button className="cursor-pointer" variant="secondary" onClick={() => { setLoading(false); setDeletePlacementPostDialog(false) }} disabled={loading}>Cancel</Button>
                            <Button
                                className="cursor-pointer"
                                variant="destructive"
                                onClick={handlePlacementPostDelete}
                                disabled={loading}
                            >
                                {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                {loading ? "Deleting…" : "Delete"}
                            </Button>
                        </DialogFooter>
                    </motion.div>
                </DialogContent>
            </Dialog>
        </>
    )
}
