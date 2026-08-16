import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
// CONTEXT api
import { useUserData } from '../../../context/AuthContext/AuthContext.jsx';
// Shadcn Components
import { Card } from '../../../Components/ui/card.jsx';
import { Button } from "../../../Components/ui/button";
// Icons
import { Trash, ShieldCheck, Mail, Phone } from "lucide-react";
// Dialog Boxes
import DeleteUserDialog from '../../../Dialog/DeleteUser_dialog/DeleteUserDialog.jsx';
// Environment variable
const API_URL = import.meta.env.VITE_API_URL;
const version = import.meta.env.VITE_API_VERSION;
const DEFAULT_AVATAR = "/defaultUserAvatar.jpeg";

function Admin() {
  const [admin, setAdmin] = useState([]);
  const [deleteUserDialog, setdeleteUserDialog] = useState(false);
  const [userID, setUserID] = useState("");
  const { accessToken } = useUserData();
  const [page, setPage] = useState(1);

  async function getDataV2() {
    const role = "admin";
    const res = await fetch(`${API_URL}/api/v2/users/all-users/${role}?page=${page}&limit=9`, {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
    });

    const response = await res.json();
    if (!response?.success) {
      toast.error(response?.message || "Something went wrong!");
    }
    setAdmin(response?.data?.users);
  }

  useEffect(() => {
    getDataV2();
  }, [page])

  return (
    <div className="w-full space-y-5 pt-6">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
          <ShieldCheck className="h-4 w-4" />
        </span>
        <h2 className="font-display text-lg font-bold text-slate-900">Admins</h2>
        <span className="rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-semibold text-violet-600">
          {Array.isArray(admin) ? admin.length : 0}
        </span>
      </div>

      {Array.isArray(admin) && admin.length === 0 && (
        <p className="py-10 text-center text-sm text-slate-400 italic">No admins found.</p>
      )}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {(Array.isArray(admin) ? admin : []).map((user, i) => (
          <motion.div
            key={user?._id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (i % 9) * 0.04 }}
          >
            <Card className="card-elevate h-full border-slate-200/80 p-5">
              <div className="flex min-w-0 items-center gap-3">
                <img src={user?.avatar || DEFAULT_AVATAR} alt={user?.name} className="h-11 w-11 shrink-0 rounded-full object-cover ring-2 ring-violet-100" />
                <div className="min-w-0">
                  <h3 className="truncate font-display text-sm font-semibold text-slate-900">{user?.name}</h3>
                  <p className="truncate text-xs text-slate-400">{user?.email}</p>
                </div>
              </div>
              <div className="mt-4 space-y-1.5 text-xs text-slate-500">
                <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-violet-500" /> {user?.phoneNumber || "N/A"}</p>
                <p className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-violet-500" /> {user?.email}</p>
              </div>
              <div className="mt-4 flex justify-end border-t border-slate-100 pt-3">
                <Button size="sm" variant="destructive" className="cursor-pointer" onClick={() => { setUserID(user?._id); setdeleteUserDialog(true); }}>
                  <Trash className="h-3.5 w-3.5" /> Delete
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {
        version !== 1 &&
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button variant="outline" onClick={() => setPage(p => Math.max(p - 1, 1))} className="cursor-pointer">Previous</Button>
          <span className="text-xs font-semibold text-slate-400">Page {page}</span>
          <Button onClick={() => setPage(p => p + 1)} className="cursor-pointer">Next</Button>
        </div>
      }
      <DeleteUserDialog deleteUserDialog={deleteUserDialog} setdeleteUserDialog={setdeleteUserDialog} userID={userID} />
    </div>
  )
}

export default Admin
