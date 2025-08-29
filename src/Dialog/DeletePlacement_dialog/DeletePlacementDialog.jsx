import React from 'react'
import { toast } from 'react-toastify';
// Shadcn Components
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "../../Components/ui/dialog";
import { Button } from '../../Components/ui/button';
// CONTEXT api
import { useUserData } from '../../context/AuthContext/AuthContext.jsx';
// Circle Loader
import CircleLoader from '../../Components/Loader/CircleLoader';
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
                <DialogContent>
                    <DialogTitle>Delete Placement</DialogTitle>
                    <DialogHeader>Are you sure you want to Delete?</DialogHeader>
                    <DialogFooter>
                        <Button className="cursor-pointer" variant="secondary" onClick={() => { setLoading(false); setDeletePlacementPostDialog(false) }}>Cancel</Button>
                        <Button className="cursor-pointer" variant="destructive" onClick={handlePlacementPostDelete}>{loading ? <CircleLoader /> : "Delete"}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
