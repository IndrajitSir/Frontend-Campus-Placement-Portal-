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

function Admin() {
  const [admin, setAdmin] = useState([]);
  const [deleteUserDialog, setdeleteUserDialog] = useState(false);
  const [userID, setUserID] = useState("");
  const { accessToken } = useUserData();
  async function getData() {
    const res = await fetch(`${API_URL}/api/v1/users/admin-all`, {
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
    console.log(response.data);

    setAdmin(response?.data);
  }
  useEffect(() => {
    getData();
  }, [])
  return (
    <>
      < div className="p-6" >
        <h2 className="text-2xl font-bold mb-4">All Admins</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-26">
          {admin.map(user => (
            <Card key={user._id}>
              <CardContent className="p-4 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium">{user.name}</h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <p className="text-sm text-muted-foreground">{user.phoneNumber}</p>
                </div>
                <div className="flex gap-2">
                  {/* <Button variant="outline" size="icon"><Eye size={16} /></Button> */}
                  <Button variant="outline" size="icon"><Pencil size={16} /></Button>
                  <Button variant="destructive" size="icon" onClick={() => { setUserID(user._id); setdeleteUserDialog(true); }}><Trash size={16} /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <DeleteUserDialog deleteUserDialog={deleteUserDialog} setdeleteUserDialog={setdeleteUserDialog} userID={userID} />
      </div>
    </>
  )
}

export default Admin