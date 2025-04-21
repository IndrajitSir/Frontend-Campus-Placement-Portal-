import React from 'react'
import { toast } from 'react-toastify';
// Shadcn Components
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog.jsx';
import { Button } from '../../components/ui/button.jsx';
// CONTEXT api
import { useUserData } from '../../context/AuthContext/AuthContext.jsx';
const API_URL = import.meta.env.VITE_API_URL;

function DeleteStudentApplicationDialog({ deleteUserApplication, setDeleteUserApplication, recordID }) {
    const { accessToken } = useUserData();
    const deleteRecord = async () => {
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
        }
        toast.success(response.message);
        setDeleteUserApplication(false);
    }
    return (
        <>
            {/* Delete User Application record Confirmation Dialog */}
            < Dialog open={deleteUserApplication} onOpenChange={setDeleteUserApplication} >
                <DialogContent>
                    <DialogTitle>Delete the Candidate's application record</DialogTitle>
                    <DialogHeader>Are you sure you want to Shortlist the candidate?</DialogHeader>
                    <DialogFooter>
                        <Button className="cursor-pointer" variant="secondary" onClick={() => setDeleteUserApplication(false)}>Cancel</Button>
                        <Button className="cursor-pointer" variant="destructive" onClick={deleteRecord}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog >
        </>
    )
}

export default DeleteStudentApplicationDialog