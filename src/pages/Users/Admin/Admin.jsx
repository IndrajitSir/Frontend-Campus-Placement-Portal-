import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
// CONTEXT api
import { useUserData } from '../../../context/AuthContext/AuthContext.jsx';
// Shadcn Components
import { Card } from '../../../Components/ui/card.jsx';
import { Button } from "../../../Components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../../components/ui/tooltip.jsx";
// Icons
import { Trash, ShieldCheck, Mail, Phone, UserX } from "lucide-react";
// Components
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
  const [loading, setLoading] = useState(true);

  async function getDataV2() {
    try {
      setLoading(true);
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
    } catch (err) {
      console.error("Failed to fetch admins", err);
      toast.error("Failed to fetch admins");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getDataV2();
  }, [page])

  if (loading) {
    return (
      <div className="w-full space-y-5 pt-6">
        <div className="skeleton-shimmer h-9 w-52 rounded-xl" />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton-shimmer h-44 rounded-2xl border border-slate-200/80 dark:border-white/10" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-5 pt-6">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300">
          <ShieldCheck className="h-4 w-4" />
        </span>
        <h2 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">Admins</h2>
        <span className="rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-semibold text-violet-600 dark:bg-violet-500/10 dark:text-violet-300">
          {Array.isArray(admin) ? admin.length : 0}
        </span>
        <span className="ml-auto inline-flex items-center rounded-full bg-violet-50 px-2.5 py-0.5 text-[10px] font-semibold text-violet-600 dark:bg-violet-500/10 dark:text-violet-300">
          Admin
        </span>
      </div>

      {Array.isArray(admin) && admin.length === 0 && (
        <div className="flex flex-col items-center justify-center py-14 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-300 dark:bg-violet-500/10 dark:text-violet-400/60">
            <UserX className="h-7 w-7" />
          </span>
          <p className="mt-3 text-sm font-medium text-slate-400 dark:text-slate-500">No admins found.</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {(Array.isArray(admin) ? admin : []).map((user, i) => (
          <motion.div
            key={user?._id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (i % 9) * 0.04 }}
          >
            <Card className="card-elevate h-full rounded-2xl border-slate-200/80 p-5 dark:border-white/10 dark:bg-white/[0.04]">
              <div className="flex min-w-0 items-center gap-3">
                <img src={user?.avatar || DEFAULT_AVATAR} alt={user?.name} className="h-11 w-11 shrink-0 rounded-full object-cover ring-2 ring-violet-100 dark:ring-violet-500/20" />
                <div className="min-w-0">
                  <h3 className="truncate font-display text-sm font-semibold text-slate-900 dark:text-slate-100">{user?.name}</h3>
                  <p className="truncate text-xs text-slate-400 dark:text-slate-500">{user?.email}</p>
                </div>
              </div>
              <div className="mt-4 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-violet-500 dark:text-violet-400" /> {user?.phoneNumber || "N/A"}</p>
                <p className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-violet-500 dark:text-violet-400" /> {user?.email}</p>
              </div>
              <div className="mt-4 flex justify-end border-t border-slate-100 pt-3 dark:border-white/10">
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button size="sm" variant="destructive" className="cursor-pointer" onClick={() => { setUserID(user?._id); setdeleteUserDialog(true); }}>
                        <Trash className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top"><p>Delete admin</p></TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {
        version !== 1 &&
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button variant="outline" onClick={() => setPage(p => Math.max(p - 1, 1))} className="cursor-pointer dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-white/10">Previous</Button>
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">Page {page}</span>
          <Button onClick={() => setPage(p => p + 1)} className="cursor-pointer">Next</Button>
        </div>
      }
      <DeleteUserDialog deleteUserDialog={deleteUserDialog} setdeleteUserDialog={setdeleteUserDialog} userID={userID} />
    </div>
  )
}

export default Admin
