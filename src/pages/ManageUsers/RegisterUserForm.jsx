import React, { useState } from 'react'
import { toast } from 'react-toastify';
// CONTEXT api
import { useUserData } from '../../context/AuthContext/AuthContext.jsx';
// Shadcn Components
import { Button } from '../../Components/ui/button.jsx';
import { Input } from '../../Components/ui/input.jsx';
import { Label } from '../../Components/ui/label.jsx';
import { LoaderCircle } from 'lucide-react';
// Environment variable
const API_URL = import.meta.env.VITE_API_URL;

const ROLE_LABELS = {
  student: "Student",
  placement_staff: "Placement Staff",
  admin: "Admin",
};

function RegisterUserForm({ onCancel }) {
  const [signupInfo, setSignupInfo] = useState({ name: "", email: "", password: "", role: "student" });
  const [submitting, setSubmitting] = useState(false);
  const { role, accessToken } = useUserData();

  const endpointFor = (roleName) => {
    if (roleName === "admin") return `${API_URL}/api/v1/admin/create-new-admin`;
    if (roleName === "placement_staff") return `${API_URL}/api/v1/admin/create-new-placement_staff`;
    return `${API_URL}/api/v1/admin/create-new-student`;
  };

  const handleRegister = async () => {
    if (!signupInfo.name.trim() || !signupInfo.email.trim() || !signupInfo.password.trim()) {
      toast.warning("Please fill in name, email and password");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(endpointFor(signupInfo.role), {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(signupInfo)
      });
      const response = await res.json();
      if (!response?.success) {
        toast.error(response?.message || "Something went wrong!");
        return;
      }
      toast.success(response?.message || "User created successfully!");
      setSignupInfo({ name: "", email: "", password: "", role: "student" });
      onCancel(false);
    } catch (error) {
      console.error(error);
      toast.error("Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangeSignup = (e) => {
    setSignupInfo({ ...signupInfo, [e.target.name]: e.target.value });
  };

  const visibleRoles = role === "super_admin"
    ? ["student", "placement_staff", "admin"]
    : ["student", "placement_staff"];

  return (
    <div className="w-full space-y-4">
      <div className="space-y-1.5">
        <Label>Full name</Label>
        <Input type="text" name="name" value={signupInfo.name} placeholder="e.g. Priya Sharma" onChange={handleChangeSignup} />
      </div>
      <div className="space-y-1.5">
        <Label>Email</Label>
        <Input type="email" name="email" value={signupInfo.email} placeholder="name@example.com" onChange={handleChangeSignup} />
      </div>
      <div className="space-y-1.5">
        <Label>Password</Label>
        <Input type="password" name="password" value={signupInfo.password} placeholder="Min 6 characters" onChange={handleChangeSignup} />
      </div>
      <div className="space-y-1.5">
        <Label>Role</Label>
        <div className="flex flex-wrap gap-2">
          {visibleRoles.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setSignupInfo({ ...signupInfo, role: r })}
              className={`cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                signupInfo.role === r
                  ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-500/25"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-indigo-300"
              }`}
            >
              {ROLE_LABELS[r]}
            </button>
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="outline" className="cursor-pointer" onClick={() => onCancel(false)}>Cancel</Button>
        <Button
          className="cursor-pointer bg-gradient-to-r from-indigo-500 to-violet-500"
          onClick={handleRegister}
          disabled={submitting}
        >
          {submitting ? <><LoaderCircle className="h-4 w-4 animate-spin" /> Creating…</> : "Create User"}
        </Button>
      </div>
    </div>
  )
}

export default RegisterUserForm
