import { useState } from "react";
import { NavLink } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
// Shadcn Components
import { Button } from "../../Components/ui/button";
import { Card } from "../../Components/ui/card";
import { Input } from "../../Components/ui/input";
import { Label } from "../../Components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogFooter } from "../../Components/ui/dialog";
// Icons
import {
  PlusCircleIcon,
  UploadCloudIcon,
  Trash2Icon,
  Pencil,
  Mail,
  Phone,
  MapPin,
  Building2,
  GraduationCap,
  FileText,
  LogOut,
  Briefcase,
  Sparkles,
  UserRound,
} from "lucide-react";
import { BsPatchCheckFill } from "react-icons/bs";
// Dialog Boxes
import ImageUploadDialog from "../../Dialog/Image_Upload_Dialog/ImageUploadDialog.jsx";
import ResumeUpload from "../../Dialog/ResumeUpload/ResumeUpload";
import Logout_Dialog from "../../Dialog/Logout_dialog/Logout_Dialog";
// CONTEXT api
import { useUserData } from "../../context/AuthContext/AuthContext.jsx";
// Environment variable
const API_URL = import.meta.env.VITE_API_URL;
const DEFAULT_AVATAR = "/defaultUserAvatar.jpeg";

export default function ProfilePage() {
  const { userInfo, setUserInfo, role, accessToken } = useUserData();
  const user = userInfo?.user || {};
  const student = userInfo?.student || {};
  const [editedUser, setEditedUser] = useState(userInfo || { user: {}, student: {} });
  const [showBadgeContent, setShowBadgeContent] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [logoutDialog, setLogoutDialog] = useState(false);
  const [avatarUploadDialog, setAvatarUploadDialog] = useState(false);
  const [resumeUploadDialog, setResumeUploadDialog] = useState(false);
  const [deleteResumeDialog, setDeleteResumeDialog] = useState(false);

  const authHeaders = { Authorization: `Bearer ${accessToken}` };

  // Handles "user.name" / "student.location" style names by writing into the
  // correct nested section instead of creating flat "user.name" keys.
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    const [section, field] = name.split(".");
    if (!field) {
      setEditedUser((prev) => ({ ...prev, [section]: value }));
      return;
    }
    setEditedUser((prev) => ({
      ...prev,
      [section]: { ...(prev?.[section] || {}), [field]: value },
    }));
  };

  const saveChanges = async () => {
    setSaving(true);
    const updates = [];
    if ((editedUser?.user?.phoneNumber ?? "") !== (user.phoneNumber ?? "")) {
      updates.push(
        axios.put(`${API_URL}/api/v1/users/update-phoneNumber`, { phone: editedUser?.user?.phoneNumber }, { withCredentials: true, headers: authHeaders })
      );
    }
    if ((editedUser?.student?.location ?? "") !== (student.location ?? "")) {
      updates.push(
        axios.put(`${API_URL}/api/v1/student/update-location`, { newLocation: editedUser?.student?.location }, { withCredentials: true, headers: authHeaders })
      );
    }
    if ((editedUser?.student?.about ?? "") !== (student.about ?? "")) {
      updates.push(
        axios.put(`${API_URL}/api/v1/student/update-about`, { newAbout: editedUser?.student?.about }, { withCredentials: true, headers: authHeaders })
      );
    }
    if ((editedUser?.student?.professional_skill ?? "") !== (student.professional_skill ?? "")) {
      updates.push(
        axios.put(`${API_URL}/api/v1/student/update-professional_skill`, { newProfessionalSkill: editedUser?.student?.professional_skill }, { withCredentials: true, headers: authHeaders })
      );
    }
    if ((editedUser?.student?.department ?? "") !== (student.department ?? "")) {
      updates.push(
        axios.put(`${API_URL}/api/v1/student/update-department`, { newDepartment: editedUser?.student?.department }, { withCredentials: true, headers: authHeaders })
      );
    }
    try {
      if (updates.length > 0) {
        await Promise.all(updates);
        toast.success("Profile updated");
      }
      setUserInfo(editedUser);
    } catch (error) {
      console.error(error);
      toast.error("Couldn't save all changes");
    } finally {
      setSaving(false);
      setEditMode(false);
    }
  };

  const handleAvatarUpload = async (file) => {
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const res = await axios.put(`${API_URL}/api/v1/student/upload-avatar`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data", ...authHeaders },
      });
      if (!res?.data?.success) {
        toast.error(res?.data?.message || "Avatar upload failed");
      } else {
        toast.success(res?.data?.message || "Avatar updated");
      }
    } catch (error) {
      console.error(error);
      toast.error("Avatar upload failed");
    }
  };

  const handleResumeUpload = async (file) => {
    try {
      const formData = new FormData();
      formData.append("resume", file);
      const res = await axios.put(`${API_URL}/api/v1/student/upload-resume`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data", ...authHeaders },
      });
      if (!res?.data?.success) {
        toast.error(res?.data?.message || "Resume upload failed");
      } else {
        toast.success(res?.data?.message || "Resume uploaded");
      }
    } catch (error) {
      console.error(error);
      toast.error("Resume upload failed");
    }
  };

  const handleDeleteResume = async () => {
    try {
      const res = await axios.delete(`${API_URL}/api/v1/student/delete-resume`, {
        withCredentials: true,
        headers: authHeaders,
      });
      if (!res?.data?.success) {
        toast.error(res?.data?.message || "Couldn't delete resume");
      } else {
        toast.success(res?.data?.message || "Resume deleted");
      }
    } catch (error) {
      console.error(error);
      toast.error("Couldn't delete resume");
    }
  };

  const projects = Array.isArray(student.projects) ? student.projects : [];

  return (
    <div className="w-full space-y-6">
      {/* ---------------- Profile hero ---------------- */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0a0e1f] px-6 py-10 sm:px-10"
      >
        <div className="absolute inset-0 bg-spotlight" aria-hidden="true" />
        <div className="absolute inset-0 bg-grid-dark opacity-40" aria-hidden="true" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-indigo-600/25 blur-[100px]" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-fuchsia-600/20 blur-[100px]" />

        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Avatar */}
          <div className="relative">
            <div className="rounded-full bg-gradient-to-br from-indigo-400 via-violet-400 to-fuchsia-400 p-1">
              <img
                src={student.avatar || DEFAULT_AVATAR}
                alt={user.name || "Profile"}
                className="h-28 w-28 rounded-full border-4 border-[#0a0e1f] object-cover"
              />
            </div>
            <button
              onClick={() => setAvatarUploadDialog(true)}
              title="Upload profile image"
              className="absolute -bottom-1 -right-1 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white shadow-lg shadow-indigo-500/40 ring-4 ring-[#0a0e1f] transition hover:scale-110"
            >
              <PlusCircleIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Name + approval badge */}
          <div className="mt-5 flex items-center justify-center gap-2">
            <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">{user.name || "—"}</h1>
            <span
              onMouseEnter={() => setShowBadgeContent(true)}
              onMouseLeave={() => setShowBadgeContent(false)}
              className={`relative inline-flex cursor-pointer ${student.approved ? "text-indigo-400" : "text-slate-500"}`}
            >
              <BsPatchCheckFill className="h-5 w-5" />
              {showBadgeContent && (
                <span className="absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-800 shadow-lg">
                  {student.approved ? "Verified & approved" : "Pending approval"}
                </span>
              )}
            </span>
          </div>
          <p className="mt-1.5 flex items-center gap-1.5 text-sm text-slate-400">
            <Mail className="h-4 w-4" />
            {user.email || "—"}
          </p>

          {student.professional_skill && (
            <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-indigo-400/30 bg-indigo-500/15 px-3.5 py-1.5 text-xs font-semibold text-indigo-200">
              <Sparkles className="h-3.5 w-3.5" />
              {student.professional_skill}
            </span>
          )}

          {/* Resume actions */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {student.resume ? (
              <NavLink
                to={student.resume}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-500/30 transition hover:brightness-110"
              >
                <FileText className="h-4 w-4" /> View resume
              </NavLink>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300">
                No resume uploaded
              </span>
            )}
            <button
              onClick={() => setResumeUploadDialog(true)}
              title="Upload resume"
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10"
            >
              <UploadCloudIcon className="h-4 w-4" /> Upload
            </button>
            {student.resume && (
              <button
                onClick={() => setDeleteResumeDialog(true)}
                title="Delete resume"
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-red-400/25 bg-red-500/10 px-3.5 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/20"
              >
                <Trash2Icon className="h-4 w-4" /> Delete
              </button>
            )}
          </div>
        </div>

        {/* Logout */}
        {role === "student" && (
          <Button
            onClick={() => setLogoutDialog(true)}
            variant="outline"
            className="absolute right-4 top-4 z-10 cursor-pointer border-white/15 bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-4 w-4" /> Logout
          </Button>
        )}
      </motion.div>

      {/* ---------------- About + details ---------------- */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* About */}
        <Card className="card-elevate border-slate-200/80 p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-bold text-slate-900">About</h3>
            {!editMode && role === "student" && (
              <Button size="sm" variant="outline" className="cursor-pointer" onClick={() => setEditMode(true)}>
                <Pencil className="h-3.5 w-3.5" /> Edit
              </Button>
            )}
          </div>

          {editMode ? (
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Name</Label>
                <Input name="user.name" value={editedUser?.user?.name || ""} onChange={handleEditChange} />
              </div>
              <div className="space-y-1.5">
                <Label>Contact</Label>
                <Input name="user.phoneNumber" value={editedUser?.user?.phoneNumber || ""} onChange={handleEditChange} />
              </div>
              <div className="space-y-1.5">
                <Label>Location</Label>
                <Input name="student.location" value={editedUser?.student?.location || ""} onChange={handleEditChange} />
              </div>
              <div className="space-y-1.5">
                <Label>Department</Label>
                <Input name="student.department" value={editedUser?.student?.department || ""} onChange={handleEditChange} />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Professional skill</Label>
                <Input name="student.professional_skill" value={editedUser?.student?.professional_skill || ""} onChange={handleEditChange} />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>About</Label>
                <Input name="student.about" value={editedUser?.student?.about || ""} onChange={handleEditChange} />
              </div>
              <div className="flex gap-3 sm:col-span-2">
                <Button variant="outline" className="cursor-pointer" onClick={() => { setEditMode(false); setEditedUser(userInfo || { user: {}, student: {} }); }}>Cancel</Button>
                <Button className="cursor-pointer" onClick={saveChanges} disabled={saving}>
                  {saving ? "Saving…" : "Save"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              <p className="text-sm leading-relaxed text-slate-600">{student.about || "No about info added yet."}</p>
            </div>
          )}
        </Card>

        {/* Details */}
        <Card className="card-elevate border-slate-200/80 p-6">
          <h3 className="font-display text-lg font-bold text-slate-900">Details</h3>
          <ul className="mt-4 space-y-3">
            <li className="flex items-center gap-3 text-sm text-slate-600">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <Phone className="h-4 w-4" />
              </span>
              {user.phoneNumber || "Not added"}
            </li>
            <li className="flex items-center gap-3 text-sm text-slate-600">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                <MapPin className="h-4 w-4" />
              </span>
              {student.location || "Not added"}
            </li>
            <li className="flex items-center gap-3 text-sm text-slate-600">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-fuchsia-50 text-fuchsia-600">
                <Building2 className="h-4 w-4" />
              </span>
              {student.department || "Not added"}
            </li>
            <li className="flex items-center gap-3 text-sm text-slate-600">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
                <GraduationCap className="h-4 w-4" />
              </span>
              {student.professional_skill || "Not added"}
            </li>
            <li className="flex items-center gap-3 text-sm text-slate-600">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <UserRound className="h-4 w-4" />
              </span>
              {student.approved ? "Approved" : "Pending approval"}
            </li>
          </ul>
        </Card>
      </div>

      {/* ---------------- Projects ---------------- */}
      <Card className="card-elevate border-slate-200/80 p-6">
        <h3 className="font-display text-lg font-bold text-slate-900">Projects</h3>
        {projects.length > 0 ? (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, i) => (
              <motion.div
                key={project?._id || i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card-elevate group rounded-2xl border border-slate-200/80 bg-white p-5"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/10 to-fuchsia-500/10 text-indigo-600 ring-1 ring-indigo-100 transition group-hover:from-indigo-500 group-hover:to-fuchsia-500 group-hover:text-white">
                  <Briefcase className="h-5 w-5" />
                </span>
                <h4 className="mt-3 font-display text-sm font-semibold text-slate-900">{project?.title || "Untitled project"}</h4>
                {project?.description && (
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{project.description}</p>
                )}
                {project?.link && (
                  <NavLink
                    to={project.link}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2.5 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline"
                  >
                    View project →
                  </NavLink>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-slate-400 italic">No projects added yet.</p>
        )}
      </Card>

      {/* ---------------- Dialogs ---------------- */}
      <Logout_Dialog logoutDialog={logoutDialog} setLogoutDialog={setLogoutDialog} />
      <ImageUploadDialog isOpen={avatarUploadDialog} onClose={() => setAvatarUploadDialog(false)} onUpload={handleAvatarUpload} />
      <ResumeUpload isOpen={resumeUploadDialog} onClose={() => setResumeUploadDialog(false)} onUpload={handleResumeUpload} />

      <Dialog open={deleteResumeDialog} onOpenChange={setDeleteResumeDialog}>
        <DialogContent>
          <DialogHeader>Are you sure you want to delete your resume?</DialogHeader>
          <DialogFooter>
            <Button className="cursor-pointer" variant="secondary" onClick={() => setDeleteResumeDialog(false)}>Cancel</Button>
            <Button className="cursor-pointer" variant="destructive" onClick={handleDeleteResume}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
