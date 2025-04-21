import React from 'react'
import axios from 'axios';
import { toast } from 'react-toastify';
// Shadcn Components
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "../../components/ui/dialog";
import { Button } from '../../components/ui/button';
// CONTEXT api
import { useUserData } from '../../context/AuthContext/AuthContext.jsx';
const API_URL = import.meta.env.VITE_API_URL;

export default function DeleteUserDialog({ deleteUserDialog, setdeleteUserDialog, userID }) {
    const { accessToken } = useUserData();
    const handleDeleteUser = async () => {
        try {
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
        }
    }
    return (
        <>
            <Dialog open={deleteUserDialog} onOpenChange={setdeleteUserDialog}>
                <DialogContent>
                    <DialogTitle>Delete User</DialogTitle>
                    <DialogHeader>Are you sure you want to Delete?</DialogHeader>
                    <DialogFooter>
                        <Button className="cursor-pointer" variant="secondary" onClick={() => setdeleteUserDialog(false)}>Cancel</Button>
                        <Button className="cursor-pointer" variant="destructive" onClick={handleDeleteUser}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
