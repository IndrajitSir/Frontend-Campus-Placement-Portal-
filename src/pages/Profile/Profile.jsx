import { useState } from "react";
import { NavLink } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
// Shadcn Components
import { Button } from "../../Components/ui/button";
import { Card, CardContent } from "../../Components/ui/card";
import { Input } from "../../Components/ui/input";
import { Label } from "../../Components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogFooter } from "../../Components/ui/dialog";
// Icons
import { PlusCircleIcon } from "lucide-react";
import { UploadCloudIcon } from "lucide-react";
import { Trash2Icon } from "lucide-react";
import { BsPatchCheckFill } from 'react-icons/bs';
import { FaRegComments } from "react-icons/fa";
// Components
import ChatBox from "../../Components/PersonalChat/ChatBox.jsx";
// Dialog Boxes
import ImageUploadDialog from "../../Dialog/Image_Upload_Dialog/ImageUploadDialog.jsx";
import ResumeUpload from "../../Dialog/ResumeUpload/ResumeUpload";
import Logout_Dialog from "../../Dialog/Logout_dialog/Logout_Dialog";
// CONTEXT api
import { useUserData } from "../../context/AuthContext/AuthContext.jsx";
// Environment variable
const API_URL = import.meta.env.VITE_API_URL;

export default function ProfilePage() {
  const { userInfo, setUserInfo, role, accessToken } = useUserData();
  const [editedUser, setEditedUser] = useState(userInfo);
  const [showBadgeContent, setShowBadgeContent] = useState(false);
  const [showProfileImageContent, setShowProfileImageContent] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [logoutDialog, setLogoutDialog] = useState(false);
  const [avatarUploadDialog, setAvatarUploadDialog] = useState(false);
  const [resumeUploadDialog, setResumeUploadDialog] = useState(false);
  const [deleteResumeDialog, setDeleteResumeDialog] = useState(false);
  const [showFeaturesOfResume, setShowFeaturesOfResume] = useState(false);
  const [hoveringIcons, setHoveringIcons] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  const shouldShowIcons = showFeaturesOfResume || hoveringIcons;

  const handleEditChange = (e) => {
    setEditedUser({ ...editedUser, [e.target.name]: e.target.value });
  };

  const saveChanges = () => {
    setUserInfo(editedUser);
    setEditMode(false);
  };

  const handleAvatarUpload = async (file) => {
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const res = await axios.put(`${API_URL}/api/v1/student/upload-avatar`, formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${accessToken}`
        },
      });
      if (!res?.success) {
        toast.error(res?.message);
      } else {
        toast.success(res?.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleResumeUpload = async (file) => {
    try {
      const formData = new FormData();
      formData.append("resume", file);
      const res = await axios.put(`${API_URL}/api/v1/student/upload-resume`, formData, {
        credentials: "include",
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${accessToken}`
        },
      });
      if (!res?.success) {
        toast.error(res?.message);
      } else {
        toast.success(res?.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteResume = async () => {
    try {
      const res = await axios.delete(`${API_URL}/api/v1/student/delete-resume`, {
        credentials: "include",
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
      });
      if (!res?.success) {
        toast.error(res?.message);
      } else {
        toast.success(res?.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="relative p-6 w-full block">
      {/* Profile Header */}
      <Card className="bg-pink-300 p-6 rounded-lg relative text-center w-full max-w-7xl mx-auto">
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
          <div className="relative inline-block w-fit mx-auto">
            <img className="w-24 h-24 mx-auto border-4 border-white rounded-full" src={userInfo?.student?.avatar === "" ? "../../defaultUserAvatar.jpeg" : userInfo?.student?.avatar} />
            <PlusCircleIcon onMouseEnter={() => setShowProfileImageContent(true)} onMouseLeave={() => setShowProfileImageContent(false)} onClick={() => setAvatarUploadDialog(true)}
              className="w-5 h-5 absolute right-0 bottom-0 bg-white rounded-full cursor-pointer p-1 shadow-md hover:scale-110 transition" />
            <motion.h6 key="Profile Image" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4, ease: "easeInOut" }}
              className={`${showProfileImageContent ? "block" : "hidden"} absolute left-25 bottom-0 text-[13px] w-35`}
            >Upload Profile Image</motion.h6>
          </div>
          <div className="flex items-center justify-center">
            <h2 className="text-2xl font-bold mt-2">{userInfo?.user?.name}</h2>
            <span onMouseEnter={() => setShowBadgeContent(true)} onMouseLeave={() => setShowBadgeContent(false)}
              className={`${userInfo?.student?.approved ? "text-blue-500" : "text-gray-700"} text-xl ml-2 mt-2 cursor-pointer relative inline-block`}
            ><BsPatchCheckFill />
              <motion.h6 key="approval" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4, ease: "easeInOut" }}
                className={`${showBadgeContent ? "block" : "hidden"} absolute ${userInfo?.student?.approved ? "left-0 top-0" : "left-4 top-0"}  text-[13px] w-25`}
              >{userInfo?.student?.approved ? "Approved" : "Not Approved"}</motion.h6>
            </span>
          </div>
          <h6 className="mt-1 text-[14px]">{userInfo?.user?.email}</h6>
          <p>{userInfo?.student?.professional_skill}</p>
          <div className="flex items-center justify-center relative inline-block w-fit">
            {/* Resume Link */}
            <NavLink to={userInfo?.student?.resume} className="text-blue-600 hover:underline" onMouseEnter={() => setShowFeaturesOfResume(true)}
              onMouseLeave={() => setTimeout(() => setShowFeaturesOfResume(false), 300)}> Resume
            </NavLink>
            {/* Animate Presence for Smooth Enter/Exit */}
            <AnimatePresence>
              {shouldShowIcons && (
                <motion.div onMouseEnter={() => setHoveringIcons(true)} onMouseLeave={() => setHoveringIcons(false)}
                  initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="absolute left-16 top-2 flex flex-col gap-2 p-2 rounded-xl bg-white shadow-xl z-10"
                >
                  {/* Upload Icon */}
                  <motion.button title="Upload Resume" whileHover={{ scale: 1.2, backgroundColor: "#e0f2fe" }}
                    className="p-1 rounded-lg hover:text-blue-600 transition-colors" >
                    <UploadCloudIcon className="w-5 h-5 cursor-pointer" onClick={() => setResumeUploadDialog(true)} />
                  </motion.button>

                  {/* Trash Icon */}
                  <motion.button
                    whileHover={{ scale: 1.2, backgroundColor: "#fee2e2" }}
                    className="p-1 rounded-lg hover:text-red-600 transition-colors"
                    title="Delete Resume"
                  >
                    <Trash2Icon className="w-5 h-5 cursor-pointer" onClick={() => setDeleteResumeDialog(true)} />
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
        {
          role === "student" &&
          <>
            <Button className="absolute top-4 right-4 cursor-pointer" onClick={() => setLogoutDialog(true)}>Logout</Button>
            <Logout_Dialog logoutDialog={logoutDialog} setLogoutDialog={setLogoutDialog}></Logout_Dialog>
          </>
        }
        <ImageUploadDialog isOpen={avatarUploadDialog} onClose={() => setAvatarUploadDialog(false)} onUpload={handleAvatarUpload} />
        {/* <ImageUploadDialog isOpen={resumeUploadDialog} onClose={() => setResumeUploadDialog(false)} onUpload={handleResumeUpload} /> */}
        <ResumeUpload isOpen={resumeUploadDialog} onClose={() => setResumeUploadDialog(false)} onUpload={handleResumeUpload} />
      </Card>
      {/* Chat Icon */}
      {/* <div className="absolute top-4 right-4 cursor-pointer p-1 hover:bg-gray-200 transition rounded">
        <FaRegComments onClick={() => setChatOpen(true)} className="w-6 h-6 text-gray-700 cursor-pointer hover:text-black transition" />
      </div> */}
      {/* Slide-in Chat Panel */}
      {/* <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed top-0 right-0 w-80 h-full bg-white shadow-lg z-50 p-4"
          >
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-lg font-semibold">Messages</h3>
              <button onClick={() => setChatOpen(false)} className="text-sm text-gray-600 hover:text-red-600 cursor-pointer">Close</button>
            </div>
            <div className="mt-4">
              <ChatBox userName={userInfo.user.name} roomId={"123"}/>
            </div>
          </motion.div>
        )}
      </AnimatePresence> */}
      {/* About Section */}
      <Card className="mt-6 p-4">
        <h3 className="text-lg font-semibold flex justify-between ">
          About {role === "student" && <Button className="cursor-pointer" size="sm" onClick={() => setEditMode(true)}>✏️</Button>}
        </h3>
        {editMode ? (
          <div>
            <Label>Name</Label>
            <Input name="user.name" value={editedUser.user.name} onChange={handleEditChange} />
            <Label>Location</Label>
            <Input name="student.location" value={editedUser.student.location} onChange={handleEditChange} />
            <Label>Contact</Label>
            <Input name="user.phoneNumber" value={editedUser.user.phoneNumber} onChange={handleEditChange} />
            <Label>About</Label>
            <Input name="student.about" value={editedUser.student.about} onChange={handleEditChange} />
            <Button variant="outline" className="mt-2 cursor-pointer" onClick={() => setEditMode(false)}>Cancel</Button>
            <Button className="mt-2 ml-4 cursor-pointer" onClick={saveChanges}>Save</Button>
          </div>
        ) : (
          <CardContent>
            <p>{userInfo?.student?.about}</p>
            <p>Location: {userInfo?.student?.location}</p>
            <p>Contact: {userInfo?.user?.phoneNumber}</p>
            <p>Department: {userInfo?.student?.department}</p>
          </CardContent>
        )}
      </Card>

      {/* Projects Section */}
      <Card className="mt-6 p-4">
        <h3 className="text-lg font-semibold">Projects</h3>
        <div className="grid grid-cols-2 gap-4">
          {
            Array.isArray(userInfo?.student?.projects) && userInfo?.student?.projects?.length > 0 && userInfo?.student?.projects?.map((project) => {
              <Card className="w-20 p-4">
                <h3 className="text-lg font-semibold">{project?.title}</h3>
                <p>Description: {project?.description}</p>
                <NavLink to={project?.link} className="text-blue-600 hover:underline">Link</NavLink>
              </Card>
            })
          }
        </div>
      </Card>
      {/* Delete Resume Dialog */}
      <Dialog open={deleteResumeDialog} onOpenChange={setDeleteResumeDialog}>
        <DialogContent>
          <DialogHeader>Are you sure you want to delete resume?</DialogHeader>
          <DialogFooter>
            <Button className="cursor-pointer" variant="secondary" onClick={() => setDeleteResumeDialog(false)}>Cancel</Button>
            <Button className="cursor-pointer" variant="destructive" onClick={handleDeleteResume}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
