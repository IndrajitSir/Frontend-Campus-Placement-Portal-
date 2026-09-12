import { useMemo, useState } from "react";
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../components/ui/tooltip';
// Shared motion presets
import { staggerContainer, item, EASE, tapScale, viewportOnce } from "../../lib/motion";
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
  CheckCircle2,
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

// Circular profile-completeness ring (indigo -> fuchsia gradient stroke).
function CompletenessRing({ percent, complete, total }) {
  const R = 52;
  const CIRC = 2 * Math.PI * R;
  const offset = CIRC * (1 - percent / 100);
  return (
    <div className="relative flex h-32 w-32 items-center justify-center">
      <svg viewBox="0 0 120 120" className="h-32 w-32 -rotate-90">
        <defs>
          <linearGradient id="profileRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#d946ef" />
          </linearGradient>
        </defs>
        <circle
          cx="60" cy="60" r={R}
          className="stroke-slate-200 dark:stroke-white/10"
          strokeWidth="9"
          fill="none"
        />
        <motion.circle
          cx="60" cy="60" r={R}
          stroke="url(#profileRingGradient)"
          strokeWidth="9"
          strokeLinecap="round"
          fill="none"
          strokeDasharray={CIRC}
          initial={{ strokeDashoffset: CIRC }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.1, ease: EASE }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.4, ease: EASE }}
          className="font-display text-2xl font-bold text-slate-900 dark:text-slate-100"
        >
          {percent}%
        </motion.span>
        <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
          {complete} of {total}
        </span>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { userInfo, setUserInfo, role, accessToken } = useUserData();
  const user = userInfo?.user || {};
  const student = userInfo?.student || {};
  const [editedUser, setEditedUser] = useState(userInfo || { user: {}, student: {} });
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [logoutDialog, setLogoutDialog] = useState(false);
  const [avatarUploadDialog, setAvatarUploadDialog] = useState(false);
  const [resumeUploadDialog, setResumeUploadDialog] = useState(false);
  const [deleteResumeDialog, setDeleteResumeDialog] = useState(false);

  const authHeaders = { Authorization: `Bearer ${accessToken}` };

  const projects = Array.isArray(student.projects) ? student.projects : [];

  // --- Profile completeness (7 equally weighted sections) ---
  const completeness = useMemo(() => {
    const sections = [
      { key: "Department", done: Boolean(student.department && String(student.department).trim()) },
      { key: "Location", done: Boolean(student.location && String(student.location).trim()) },
      { key: "About", done: Boolean(student.about && String(student.about).trim()) },
      { key: "Skills", done: Boolean(student.professional_skill && String(student.professional_skill).trim()) },
      { key: "Resume", done: Boolean(student.resume) },
      { key: "Projects", done: projects.length > 0 },
      { key: "CGPA", done: student.cgpa !== undefined && student.cgpa !== null && student.cgpa !== "" },
    ];
    const complete = sections.filter((s) => s.done).length;
    return { sections, complete, percent: Math.round((complete / sections.length) * 100) };
  }, [student, projects.length]);

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

  return (
    <TooltipProvider>
    <div className="w-full space-y-6">
      {/* ---------------- Profile hero ---------------- */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0a0e1f] px-6 py-10 sm:px-10"
      >
        <div className="absolute inset-0 bg-spotlight" aria-hidden="true" />
        <div className="absolute inset-0 bg-grid-dark opacity-40" aria-hidden="true" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-indigo-600/25 blur-[100px]" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-fuchsia-600/20 blur-[100px]" />

        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Avatar */}
          <motion.div
            className="relative"
            {...tapScale}
          >
            <div className="rounded-full bg-gradient-to-br from-indigo-400 via-violet-400 to-fuchsia-400 p-1">
              <img
                src={student.avatar || DEFAULT_AVATAR}
                alt={user.name || "Profile"}
                className="h-28 w-28 rounded-full border-4 border-[#0a0e1f] object-cover"
              />
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setAvatarUploadDialog(true)}
                  className="absolute -bottom-1 -right-1 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white shadow-lg shadow-indigo-500/40 ring-4 ring-[#0a0e1f] transition hover:scale-110"
                >
                  <PlusCircleIcon className="h-5 w-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Upload profile image</p>
              </TooltipContent>
            </Tooltip>
          </motion.div>

          {/* Name + approval badge */}
          <div className="mt-5 flex items-center justify-center gap-2">
            <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">{user.name || "—"}</h1>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className={`relative inline-flex cursor-pointer ${student.approved ? "text-indigo-400" : "text-slate-500"}`}>
                  <BsPatchCheckFill className="h-5 w-5" />
                </span>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>{student.approved ? "Verified & approved" : "Pending approval"}</p>
              </TooltipContent>
            </Tooltip>
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
              <Tooltip>
                <TooltipTrigger asChild>
                  <NavLink
                    to={student.resume}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-500/30 transition hover:brightness-110 active:scale-[0.97]"
                  >
                    <FileText className="h-4 w-4" /> View resume
                  </NavLink>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>Opens in new tab</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300">
                No resume uploaded
              </span>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setResumeUploadDialog(true)}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10 active:scale-[0.97]"
                >
                  <UploadCloudIcon className="h-4 w-4" /> Upload
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Upload a new resume</p>
              </TooltipContent>
            </Tooltip>
            {student.resume && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setDeleteResumeDialog(true)}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-red-400/25 bg-red-500/10 px-3.5 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/20 active:scale-[0.97]"
                  >
                    <Trash2Icon className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>Remove your resume</p>
                </TooltipContent>
              </Tooltip>
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

      {/* ---------------- Completeness + About + details ---------------- */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: EASE }}
        className="grid gap-6 lg:grid-cols-3"
      >
        {/* Profile completeness */}
        <Card className="card-elevate border-slate-200/80 bg-white p-6 dark:border-white/10 dark:bg-white/[0.04]">
          <h3 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">Profile strength</h3>
          <div className="mt-4 flex items-center gap-5">
            <CompletenessRing percent={completeness.percent} complete={completeness.complete} total={completeness.sections.length} />
            <ul className="flex-1 space-y-1.5">
              {completeness.sections.map((section, i) => (
                <motion.li
                  key={section.key}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.04, duration: 0.3, ease: EASE }}
                  className={`flex items-center gap-2 text-xs font-medium ${
                    section.done
                      ? "text-slate-700 dark:text-slate-200"
                      : "text-slate-400 dark:text-slate-500"
                  }`}
                >
                  {section.done ? (
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500 dark:text-emerald-400" />
                  ) : (
                    <span className="h-3.5 w-3.5 shrink-0 rounded-full border border-slate-300 dark:border-white/20" />
                  )}
                  {section.key}
                </motion.li>
              ))}
            </ul>
          </div>
          <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">
            {completeness.complete} of {completeness.sections.length} sections complete — a complete profile stands out to recruiters.
          </p>
        </Card>

        {/* About */}
        <Card className="card-elevate border-slate-200/80 bg-white p-6 lg:col-span-2 dark:border-white/10 dark:bg-white/[0.04]">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">About</h3>
            {!editMode && role === "student" && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="sm" variant="outline" className="cursor-pointer" onClick={() => setEditMode(true)}>
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>Edit your profile</p>
                </TooltipContent>
              </Tooltip>
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
                <Button variant="gradient" className="cursor-pointer" onClick={saveChanges} disabled={saving}>
                  {saving ? "Saving…" : "Save"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{student.about || "No about info added yet."}</p>
            </div>
          )}
        </Card>
      </motion.div>

      {/* ---------------- Details ---------------- */}
      <Card className="card-elevate border-slate-200/80 bg-white p-6 dark:border-white/10 dark:bg-white/[0.04]">
        <h3 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">Details</h3>
        <motion.ul
          variants={staggerContainer(0.05)}
          initial="hidden"
          animate="visible"
          className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
        >
          {[
            { icon: Phone, color: "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300", text: user.phoneNumber || "Not added" },
            { icon: MapPin, color: "bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300", text: student.location || "Not added" },
            { icon: Building2, color: "bg-fuchsia-50 text-fuchsia-600 dark:bg-fuchsia-500/15 dark:text-fuchsia-300", text: student.department || "Not added" },
            { icon: GraduationCap, color: "bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300", text: student.professional_skill || "Not added" },
            { icon: UserRound, color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300", text: student.approved ? "Approved" : "Pending approval" },
          ].map(({ icon: Icon, color, text }, i) => (
            <motion.li
              key={i}
              variants={item}
              className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3 text-sm text-slate-600 transition-colors hover:border-slate-200 dark:border-white/5 dark:bg-white/[0.03] dark:text-slate-300 dark:hover:border-white/10"
            >
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${color}`}>
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0 break-words">{text}</span>
            </motion.li>
          ))}
        </motion.ul>
      </Card>

      {/* ---------------- Projects ---------------- */}
      <Card className="card-elevate border-slate-200/80 bg-white p-6 dark:border-white/10 dark:bg-white/[0.04]">
        <h3 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">Projects</h3>
        {projects.length > 0 ? (
          <motion.div
            variants={staggerContainer(0.06)}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {projects.map((project, i) => (
              <motion.div
                key={project?._id || i}
                variants={item}
                {...tapScale}
                className="card-elevate group rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-white/10 dark:bg-white/[0.04]"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/10 to-fuchsia-500/10 text-indigo-600 ring-1 ring-indigo-100 transition group-hover:from-indigo-500 group-hover:to-fuchsia-500 group-hover:text-white dark:ring-indigo-500/20 dark:text-indigo-300">
                  <Briefcase className="h-5 w-5" />
                </span>
                <h4 className="mt-3 font-display text-sm font-semibold text-slate-900 dark:text-slate-100">{project?.title || "Untitled project"}</h4>
                {project?.description && (
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{project.description}</p>
                )}
                {project?.link && (
                  <NavLink
                    to={project.link}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2.5 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                  >
                    View project →
                  </NavLink>
                )}
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="mt-5 rounded-2xl border border-dashed border-slate-300/80 bg-slate-50/60 p-8 text-center dark:border-white/10 dark:bg-white/[0.02]">
            <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/10 to-fuchsia-500/10 text-indigo-500 dark:text-indigo-300">
              <Briefcase className="h-5 w-5" />
            </span>
            <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-200">No projects added yet</p>
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Showcase your best work to boost your profile strength.</p>
          </div>
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
    </TooltipProvider>
  );
}
