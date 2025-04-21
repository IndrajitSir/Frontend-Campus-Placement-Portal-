import React from 'react'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
// Shadcn Components
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "../../components/ui/dialog";
import { Button } from '../../components/ui/button';
// CONTEXT api
import { useUserData } from '../../context/AuthContext/AuthContext.jsx';
const API_URL = import.meta.env.VITE_API_URL;

function Logout_Dialog({ logoutDialog, setLogoutDialog }) {
  const { setRole, setAccessToken, setRefreshToken, setUserInfo, accessToken } = useUserData();
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      const res = await axios.post(`${API_URL}/api/v1/users/logout`, {
        credentials: "include",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      // window.confirm(`${res.data.message}!`);
    } catch (error) {
      console.error(error);
      window.confirm("Logout failed!");
    }
    setRole("");
    setAccessToken("");
    setRefreshToken("");
    setUserInfo({});
    navigate("/", { replace: true });
  }
  return (
    <>
      <Dialog open={logoutDialog} onOpenChange={setLogoutDialog}>
        {/* <DialogTitle>LOGOUT</DialogTitle> */}
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