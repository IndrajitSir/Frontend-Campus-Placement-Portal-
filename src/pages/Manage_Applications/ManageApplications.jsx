import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify';
// Shadcn Components
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
// Components
import SelectedApplications from '../../pages/Applications/SelectedApplications/SelectedApplications.jsx';
import AppliedApplications from '../../pages/Applications/AppliedApplications/AppliedApplications.jsx';
import ShortlistedApplications from '../../pages/Applications/ShortlistedApplications/ShortlistedApplications.jsx';
import RejectedApplications from '../../pages/Applications/RejectedApplications/RejectedApplications.jsx';
// hooks
import useAllUsersNameAndEmail from '../../hooks/Users_Name_and_Email/useAllUsersNameAndEmail.js';
// Dialog Boxes
import SearchDialog from "../../Dialog/Search_Dialog/SearchDialog.jsx";
// Icons
import { ArrowLeftCircleIcon } from "lucide-react";
// CONTEXT api
import { useUserData } from "../../context/AuthContext/AuthContext.jsx";
// Environment variable
const API_URL = import.meta.env.VITE_API_URL;
function ManageApplications() {
    const [showSearchResult, setShowSearchResult] = useState(false);
    const [filterdUser, setFilteredUser] = useState({});
    const [filterApplication, setFilterApplication] = useState("");
    const [usersNameAndEmail, setUsersNameAndEmail] = useState([]);
    const { accessToken } = useUserData();
    const data = useAllUsersNameAndEmail();

    useEffect(() => {
        const users = data.filter((user) => user.role === "student")
        setUsersNameAndEmail(users);
    }, [data])
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
    return (
        <>
            <div className="p-6 space-y-4">
                <h2 className="text-2xl font-semibold">Manage Applications</h2>
                <div className="flex items-center gap-x-5 justify-betweeen border-b-2 border-gray-20">
                    <select className="w-1/9 h-10 border rounded mb-1 cursor-pointer" value={filterApplication} onChange={e => setFilterApplication(e.target.value)}>
                        <option value="" className='cursor-pointer'>All Applications</option>
                        <option value="selected" className='cursor-pointer'>Selected</option>
                        <option value="shortlisted" className='cursor-pointer'>Shortlisted</option>
                        <option value="applied" className='cursor-pointer'>Applied</option>
                        <option value="rejected" className='cursor-pointer'>Rejected</option>
                    </select>
                    <div className="flex items-center justify-end">
                        <SearchDialog data={usersNameAndEmail} onQuery={searchQueryFromChild}  placeholderValue={"Search student by name and email"}/>
                        {/* <SearchDialogUpdated data={usersNameAndEmail} searchCriteria={["name", "email"]} onQuery={searchQueryFromChild} placeholderValue={"Search user by name and email"} /> */}
                    </div>
                </div>
                {showSearchResult &&
                    <>
                        <Button onClick={() => { cleanSearchedData(); }} className="bg-black cursor-pointer rounded-[70px] hover:bg-gray-600"> <ArrowLeftCircleIcon /></Button>
                        <Card>
                            {
                                <>
                                    <h1>Name: {filterdUser?.student_id?.name}</h1>
                                    <h2>Email: {filterdUser?.student_id?.email}</h2>
                                    <p>Contact Number: {filterdUser?.phoneNumber || "N/A"}</p>
                                    <p>Department: {filterdUser?.department || "N/A"}</p>
                                    <p>Professional Skill: {filterdUser?.professional_skill || "N/A"}</p>
                                    <p>Location: {filterdUser?.location || "N/A"}</p>
                                    <p>About: {filterdUser?.about || "N/A"}</p>

                                </>
                            }
                        </Card>
                    </>
                }
                {
                    !showSearchResult && filterApplication === "" &&
                    <>
                        <AppliedApplications />
                        <SelectedApplications />
                        <ShortlistedApplications />
                        <RejectedApplications />
                    </>
                }
                {
                    !showSearchResult && filterApplication !== "" && filterApplication === "applied" &&
                    <AppliedApplications />
                }
                {
                    !showSearchResult && filterApplication !== "" && filterApplication === "selected" &&
                    <SelectedApplications />
                }
                {
                    !showSearchResult && filterApplication !== "" && filterApplication === "shortlisted" &&
                    <ShortlistedApplications />
                }
                {
                    !showSearchResult && filterApplication !== "" && filterApplication === "rejected" &&
                    <RejectedApplications />
                }
            </div >
        </>
    )
}

export default ManageApplications