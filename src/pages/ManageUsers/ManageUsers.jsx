import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
// Shadcn Components
import { Card } from "../../Components/ui/card";
import { Button } from "../../Components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../Components/ui/dialog";
// Components
import Admin from "../../pages/Users/Admin/Admin.jsx";
import PlacementStaff from "../../pages/Users/Placement_Staff/PlacementStaff";
import Students from "../../pages/Users/Students/Students";
import RegisterUserForm from "./RegisterUserForm";
// Dialog Boxes
import SearchDialog from "../../Dialog/Search_Dialog/SearchDialog.jsx";
// CONTEXT api
import { useUserData } from "../../context/AuthContext/AuthContext.jsx";
// Icons
import { ArrowLeftCircleIcon, UserPlus, Search, Users } from "lucide-react";
// Environment variable
const API_URL = import.meta.env.VITE_API_URL;
const DEFAULT_AVATAR = "/defaultUserAvatar.jpeg";

const ROLE_TABS = [
  { value: "", label: "All" },
  { value: "student", label: "Students" },
  { value: "placement_staff", label: "Placement Staff" },
  { value: "admin", label: "Admins" },
];

function ManageUsers() {
  const { accessToken, role } = useUserData();
  const [filterRole, setFilterRole] = useState("");
  const [registerFormDialog, setRegisterFormDialog] = useState(false);
  const [showSearchResult, setShowSearchResult] = useState(false);
  const [usersNameAndEmail, setUsersNameAndEmail] = useState([]);
  const [filterdUser, setFilteredUser] = useState({});

  const fetchUsers = async () => {
    const res = await fetch(`${API_URL}/api/v1/users/all-users-nameAndEmail`, {
      method: "GET",
      credentials: "include",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
    });
    const response = await res.json();
    if (!response?.success) {
      toast.warning(response?.message)
    }
    setUsersNameAndEmail(response?.data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (role === "placement_staff") setFilterRole("student");
  }, [role]);

  const searchQueryFromChild = async (query) => {
    const res = await fetch(`${API_URL}/api/v1/users/one/${query?.name}`, {
      method: "GET",
      credentials: "include",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
    });
    const response = await res.json();
    if (!response?.success) {
      toast.warning(response?.message)
    }
    setFilteredUser(response?.data);
    setShowSearchResult(true);
  };

  const cleanSearchedData = () => {
    setFilteredUser({});
    setShowSearchResult(false);
  };

  if (!accessToken || !role) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-slate-400">
        Loading users for managing purpose!
      </div>
    );
  }

  const isStudent = filterdUser?.student_id?.role === "student" || filterdUser?.role === "student";
  const resultName = isStudent ? filterdUser?.student_id?.name : filterdUser?.name;
  const resultEmail = isStudent ? filterdUser?.student_id?.email : filterdUser?.email;

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900">
            {role === "placement_staff" ? "Manage Students" : "Manage Users"}
          </h2>
          <p className="mt-1 text-sm text-slate-400">Create accounts, search people and manage roles.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {role !== "placement_staff" && (
            <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
              {ROLE_TABS.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setFilterRole(tab.value)}
                  className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    filterRole === tab.value
                      ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-500/25"
                      : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}
          <Button
            onClick={() => setRegisterFormDialog(true)}
            className="cursor-pointer bg-gradient-to-r from-indigo-500 to-violet-500 shadow-md shadow-indigo-500/25"
          >
            <UserPlus className="h-4 w-4" /> Create New {role === "placement_staff" ? "Student" : "User"}
          </Button>
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500 shadow-sm">
            <Search className="h-3.5 w-3.5" />
            <SearchDialog data={usersNameAndEmail} onQuery={searchQueryFromChild} placeholderValue="Search user by name and email" />
          </div>
        </div>
      </div>

      {/* Search result */}
      {showSearchResult && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-slate-200/80 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={filterdUser?.avatar || filterdUser?.student_id?.avatar || DEFAULT_AVATAR}
                  alt={resultName || "User"}
                  className="h-12 w-12 rounded-full object-cover ring-2 ring-indigo-100"
                />
                <div>
                  <h3 className="font-display text-base font-bold text-slate-900">{resultName || "Unknown"}</h3>
                  <p className="text-sm text-slate-400">{resultEmail || "—"}</p>
                </div>
              </div>
              <Button onClick={cleanSearchedData} variant="outline" className="cursor-pointer">
                <ArrowLeftCircleIcon className="h-4 w-4" /> Back
              </Button>
            </div>
            <div className="mt-4 grid gap-3 border-t border-slate-100 pt-4 text-sm text-slate-600 sm:grid-cols-2">
              <p><span className="font-semibold text-slate-800">Contact:</span> {filterdUser?.phoneNumber || "N/A"}</p>
              <p><span className="font-semibold text-slate-800">Department:</span> {filterdUser?.department || "N/A"}</p>
              <p><span className="font-semibold text-slate-800">Professional skill:</span> {filterdUser?.professional_skill || "N/A"}</p>
              <p><span className="font-semibold text-slate-800">Location:</span> {filterdUser?.location || "N/A"}</p>
              <p className="sm:col-span-2"><span className="font-semibold text-slate-800">About:</span> {filterdUser?.about || "N/A"}</p>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Role sections */}
      {!showSearchResult && (
        <>
          {(filterRole === "" || filterRole === "student") && <Students />}
          {(filterRole === "" || filterRole === "placement_staff") && <PlacementStaff />}
          {(filterRole === "" || filterRole === "admin") && <Admin />}
        </>
      )}

      {/* Create user form Dialog */}
      <Dialog open={registerFormDialog} onOpenChange={setRegisterFormDialog}>
        <DialogContent>
          <DialogTitle>Create User</DialogTitle>
          <DialogHeader>Create a new user 👍</DialogHeader>
          <DialogDescription>
            <RegisterUserForm onCancel={setRegisterFormDialog} />
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ManageUsers
