import React from 'react'
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
// Shadcn Components
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "../../components/ui/dialog";
import { Button } from '../../components/ui/button';
// CONTEXT api
import { useUserData } from '../../context/AuthContext/AuthContext.jsx';
// Environment variables
const API_URL = import.meta.env.VITE_API_URL;

function Logout_Dialog({ logoutDialog, setLogoutDialog }) {
  const { setRole, setAccessToken, setRefreshToken, setUserInfo, accessToken } = useUserData();
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