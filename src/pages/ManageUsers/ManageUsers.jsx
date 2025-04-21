import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
// Shadcn Components
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../components/ui/dialog";
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
import { ArrowLeftCircleIcon } from "lucide-react";
// Environment variable
const API_URL = import.meta.env.VITE_API_URL;

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
        if (!response.success) {
            toast.warning(response.message)
        }
        setUsersNameAndEmail(response.data);
    }
    useEffect(() => {
        fetchUsers();
    }, []);
    const searchQueryFromChild = async (query) => {
        const res = await fetch(`${API_URL}/api/v1/users/one/${query?.name}`, {
            method: "GET",
            credentials: "include",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
        });
        if (!res.ok) {
            console.log(res);
        }
        const response = await res.json();
        if (!response.success) {
            toast.warning(response.message)
        }
        console.log("Specific users data:", response.data);
        setFilteredUser(response.data);
        setShowSearchResult(true);
    }

    const cleanSearchedData = () => {
        setFilteredUser({});
        setShowSearchResult(false);
    }

    useEffect(()=>{
        if(role === "placement_staff") setFilterRole("student");
    }, [role])

    return (
        <div className="p-6 space-y-4">
            <h2 className="text-2xl font-semibold">{role === "placement_staff" ? "Manage Students" : "Manage Users"}</h2>
            <div className="flex gap-x-248 justify-betweeen">
                { role !== "placement_staff" &&
                    <>
                        <select className="p-2 border rounded mb-4" value={filterRole} onChange={e => setFilterRole(e.target.value)}>
                            <option value="">All Roles</option>
                            <option value="admin">Admin</option>
                            <option value="student">Student</option>
                            <option value="placement_staff">Placement Staff</option>
                        </select>
                    </>
                }
                <div className="flex items-center justify-end">
                    <Button className="cursor-pointer" onClick={() => setRegisterFormDialog(true)}>Create New {role === "placement_staff" ? "Student" : "User"}</Button>
                    <SearchDialog data={usersNameAndEmail} onQuery={searchQueryFromChild} placeholderValue={"Search user by name and email"} />
                    {/* <SearchDialogUpdated data={usersNameAndEmail} searchCriteria={["name", "email"]} onQuery={searchQueryFromChild} placeholderValue={"Search user by name and email"} /> */}
                </div>
            </div>
            {showSearchResult &&
                <>
                    <Button onClick={() => { cleanSearchedData(); }} className="bg-black cursor-pointer rounded-[70px] hover:bg-gray-600"> <ArrowLeftCircleIcon /></Button>
                    <Card>
                        {
                            filterdUser?.student_id?.role === "student" ?
                                <>
                                    <h1>Name: {filterdUser?.student_id?.name}</h1>
                                    <h2>Email: {filterdUser?.student_id?.email}</h2>
                                    <p>Contact Number: {filterdUser?.phoneNumber || "N/A"}</p>
                                    <p>Department: {filterdUser?.department || "N/A"}</p>
                                    <p>Professional Skill: {filterdUser?.professional_skill || "N/A"}</p>
                                    <p>Location: {filterdUser?.location || "N/A"}</p>
                                    <p>About: {filterdUser?.about || "N/A"}</p>

                                </>
                                :
                                <>
                                    <h1>Name: {filterdUser?.name}</h1>
                                    <h2>Email: {filterdUser?.email}</h2>
                                </>
                        }
                    </Card>
                </>
            }
            {
                !showSearchResult && filterRole === "" &&
                <>
                    <Students />
                    <PlacementStaff />
                    <Admin />
                </>
            }
            {
                !showSearchResult && filterRole !== "" && filterRole === "student" &&
                <Students />
            }
            {
                !showSearchResult && filterRole !== "" && filterRole === "placement_staff" &&
                <PlacementStaff />
            }
            {
                !showSearchResult && filterRole !== "" && filterRole === "admin" &&
                <Admin />
            }
            {/* Create user form Dialog */}
            <Dialog open={registerFormDialog} onOpenChange={setRegisterFormDialog}>
                <DialogContent>
                    <DialogTitle>Create User</DialogTitle>
                    <DialogHeader>Create a new user👍!</DialogHeader>
                    <DialogDescription><RegisterUserForm onCancel={setRegisterFormDialog} /></DialogDescription>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default ManageUsers