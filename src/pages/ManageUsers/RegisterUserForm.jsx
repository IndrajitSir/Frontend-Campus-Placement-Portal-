import React, { useState } from 'react'
import { toast } from 'react-toastify';
// CONTEXT api
import { useUserData } from '../../context/AuthContext/AuthContext.jsx';
// Shadcn Components
import { Button } from '../../Components/ui/button.jsx';
// Environment variable
const API_URL = import.meta.env.VITE_API_URL;

function RegisterUserForm({ onCancel }) {
    const [signupInfo, setSignupInfo] = useState({ name: "", email: "", password: "", role: "student" });
    const { role, accessToken } = useUserData();
    const handleRegister = async () => {
        try {
            let finalUrl = `${API_URL}/api/v1/admin/create-new-student`;
            if (signupInfo.role === "admin") {
                finalUrl = `${API_URL}/api/v1/admin/create-new-admin`
            }else if (signupInfo.role === "placement_staff") {
               finalUrl = `${API_URL}/api/v1/admin/create-new-placement_staff`
            } 
            const res = await fetch(finalUrl, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify(signupInfo)
            });

            const response = await res.json();
            if (!response.success) {
                toast.error(response.message || "Something went wrong!");
            }
            toast.success("Registration successful!");
        } catch (error) {
            console.error(error);
            toast.error("Registration failed");
        }
    };
    const handleChangeSignup = (e) => {
        setSignupInfo({ ...signupInfo, [e.target.name]: e.target.value });
    };
    const handleRolechange = (e) => {
        setSignupInfo({ ...signupInfo, role: e.target.value });
    }
    return (
        <div className="w-full max-w-sm">
            <input type="text" name="name" value={signupInfo.name} placeholder="Username" className="border p-2 mb-2 w-full" onChange={handleChangeSignup} required />
            <input type="email" name="email" value={signupInfo.email} placeholder="Email" className="border p-2 mb-2 w-full" onChange={handleChangeSignup} required />
            <input type="password" name="password" value={signupInfo.password} placeholder="Password" className="border p-2 mb-4 w-full" onChange={handleChangeSignup} required />
            <label htmlFor="student">Role:
                <input type="radio" name="role" id="student" value="student" className="ml-5 cursor-pointer" checked={signupInfo.role === "student"} onChange={handleRolechange} /><label htmlFor="student" className="ml-1 cursor-pointer">Student</label>
                <input type="radio" name="role" id="placement_staff" value="placement_staff" checked={signupInfo.role === "placement_staff"} className="ml-7 cursor-pointer" onChange={handleRolechange} /><label htmlFor="placement_staff" className="ml-1 cursor-pointer">Placement Staff</label>
                {
                    role === "super_admin" &&
                    <><input type="radio" name="role" id="admin" value="admin" checked={signupInfo.role === "admin"} className="ml-7 cursor-pointer" onChange={handleRolechange} /><label htmlFor="admin" className="ml-1 cursor-pointer">Admin</label></>
                }
            </label>
            <Button className="cursor-pointer mt-4" variant="outline" onClick={() => onCancel(false)}>Cancel</Button>
            <Button className="cursor-pointer mt-4 ml-3 gap-x-6" onClick={handleRegister}>Create</Button>
        </div>
    )
}

export default RegisterUserForm
