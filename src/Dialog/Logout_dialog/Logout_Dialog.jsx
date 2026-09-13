import React from 'react'
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
// Shadcn Components
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "../../Components/ui/dialog";
import { Button } from '../../Components/ui/button';
// CONTEXT api
import { useUserData } from '../../context/AuthContext/AuthContext.jsx';
// E2EE keys (user-scoped)
import { clearUserKeys, getKeepKeyOnLogout } from '../../lib/crypto.js';
// Environment variables
const API_URL = import.meta.env.VITE_API_URL;

function Logout_Dialog({ logoutDialog, setLogoutDialog }) {
  const { setRole, setAccessToken, setRefreshToken, setUserInfo, accessToken, userInfo } = useUserData();
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      const resonse = await fetch(`${API_URL}/api/v1/users/logout`, {
        method: "POST",
        credentials: "include",
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}` },
      });
      const res = await resonse.json();
      console.log(`Logout response: `, res);
      if(res.success){
        setRole("");
        setAccessToken("");
        setRefreshToken("");
        setUserInfo({});

        // Privacy toggle (Settings → End-to-end encryption): when the user
        // chose "OFF", scrub this browser's E2EE key so no history can be
        // read after re-login. Local-only — other devices keep their keys.
        const userId = userInfo?.user?._id;
        if (userId && !getKeepKeyOnLogout(userId)) {
          clearUserKeys(userId);
        }

        toast.success("Logout successfully!");
        navigate("/", { replace: true });
      }
    } catch (error) {
      console.error(error);
      toast.error("Logout failed!");
    }
  }
  return (
    <>
      <Dialog open={logoutDialog} onOpenChange={setLogoutDialog}>
        <DialogTitle></DialogTitle>
        <DialogContent>
          <DialogHeader>Are you sure you want to logout?</DialogHeader>
          <DialogFooter>
            <Button className="cursor-pointer" variant="secondary" onClick={() => setLogoutDialog(false)}>Cancel</Button>
            <Button className="cursor-pointer" variant="destructive" onClick={handleLogout}>Logout</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default Logout_Dialog
