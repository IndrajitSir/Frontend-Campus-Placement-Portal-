import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify';
// CONTEXT api
import { useUserData } from '../../../context/AuthContext/AuthContext.jsx';
// Shadcn Components
import { Card, CardContent } from '../../../components/ui/card.jsx';
import { Button } from "../../../components/ui/button";
// Icons
import { Pencil, Trash, Eye } from "lucide-react";
// Dialog Boxes
import DeleteUserDialog from '../../../Dialog/DeleteUser_dialog/DeleteUserDialog.jsx';
// Environment variable
const API_URL = import.meta.env.VITE_API_URL;
const version = import.meta.env.VITE_API_VERSION;

function PlacementStaff() {
    const [placementStaff, setPlacementStaff] = useState([]);
    const [deleteUserDialog, setdeleteUserDialog] = useState(false);
    const [userID, setUserID] = useState("");
    const { accessToken } = useUserData();
    const [page, setPage] = useState(1);

    async function getDataV2() {
        const role = "placement_staff";
        const res = await fetch(`${API_URL}/api/v2/users/all-users/${role}?page=${page}&limit=9`, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
        });

        const response = await res.json();
        if (!response.success) {
            toast.error(response.message || "Something went wrong!");
        }
        console.log("version 2 response for placement staff: ", response?.data?.users);
        setPlacementStaff(response?.data?.users);
    }

    useEffect(() => {
        getDataV2();
    }, [page])
    return (
        <>
            < div className="p-6" >
                <div className='border-t-2 border-gray-20 pt-4 mt-8'>
                    <h2 className="text-2xl font-bold mb-4 px-2 py-1 rounded-full text-green-600 bg-green-100 text-center">Placement Staffs</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-26">
                    {placementStaff.map(user => (
                        <Card key={user._id}>
                            <CardContent className="p-4 flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-medium">{user.name}</h3>
                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                    <p className="text-sm text-muted-foreground">{user.phoneNumber}</p>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="icon" className="cursor-pointer"><Pencil size={16} /></Button>
                                    <Button variant="destructive" size="icon" className="cursor-pointer" onClick={() => { setUserID(user._id); setdeleteUserDialog(true); }}><Trash size={16} /></Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
                {
                    version !== 1 &&
                    <>
                        <div className="flex items-center justify-center gap-10 mt-5">
                            <Button variant="outline" onClick={() => setPage(p => Math.max(p - 1, 1))} className="cursor-pointer">Previous</Button>
                            <Button onClick={() => setPage(p => p + 1)} className="cursor-pointer">Next</Button>
                        </div>
                    </>
                }
                <DeleteUserDialog deleteUserDialog={deleteUserDialog} setdeleteUserDialog={setdeleteUserDialog} userID={userID} />
            </div>
        </>
    )
}

export default PlacementStaff