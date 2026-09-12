import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { fadeUp, popSpring } from '../../lib/motion.js';
// Shadcn Components
import { Card } from "../../Components/ui/card";
import { Button } from "../../Components/ui/button";
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
import { ArrowLeftCircleIcon, Download, LoaderCircle, FileSpreadsheet } from "lucide-react";
// CONTEXT api
import { useUserData } from "../../context/AuthContext/AuthContext.jsx";
// Environment variable
const API_URL = import.meta.env.VITE_API_URL;
const EXPORT_ROLES = ["admin", "super_admin", "placement_staff"];

function ManageApplications() {
    const [showSearchResult, setShowSearchResult] = useState(false);
    const [filterdUser, setFilteredUser] = useState({});
    const [filterApplication, setFilterApplication] = useState("");
    const [usersNameAndEmail, setUsersNameAndEmail] = useState([]);
    const { accessToken, role } = useUserData();
    const [exporting, setExporting] = useState(false);
    const data = useAllUsersNameAndEmail();
    const canExport = EXPORT_ROLES.includes(role);

    useEffect(() => {
        const users = (Array.isArray(data) ? data : []).filter((user) => user?.role === "student")
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
        if (!response?.success) {
            toast.warning(response?.message)
        }
        console.log("Specific users data:", response?.data);
        setFilteredUser(response?.data);
        setShowSearchResult(true);
    }

    const cleanSearchedData = () => {
        setFilteredUser({});
        setShowSearchResult(false);
    }

    const handleExportCSV = async () => {
        try {
            setExporting(true);
            const res = await fetch(`${API_URL}/api/v3/applications/export`, {
                method: "GET",
                credentials: "include",
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                },
            });
            if (!res.ok) throw new Error("Export failed");
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "all-applications.csv";
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
            toast.success("All applications exported as CSV");
        } catch (err) {
            console.error("Failed to export applications", err);
            toast.error("Failed to export CSV");
        } finally {
            setExporting(false);
        }
    };

    return (
        <>
            <div className="p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
                            <FileSpreadsheet className="h-4.5 w-4.5" />
                        </span>
                        <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-slate-100">Manage Applications</h2>
                    </div>
                    {canExport && (
                        <Button
                            variant="gradient"
                            className="cursor-pointer"
                            onClick={handleExportCSV}
                            disabled={exporting}
                        >
                            {exporting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                            {exporting ? "Exporting…" : "Export CSV"}
                        </Button>
                    )}
                </div>
                <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-2 border-b border-slate-200/80 pb-3 dark:border-white/10">
                    <select
                        className="h-10 cursor-pointer rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm transition-all outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200"
                        value={filterApplication}
                        onChange={e => setFilterApplication(e.target.value)}
                    >
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
                        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={popSpring}>
                            <Button onClick={() => { cleanSearchedData(); }} variant="outline" className="cursor-pointer dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-white/10"> <ArrowLeftCircleIcon className="h-4 w-4" /> Back</Button>
                            <Card className="card-elevate mt-3 rounded-2xl border-slate-200/80 p-6 dark:border-white/10 dark:bg-white/[0.04]">
                                {
                                    <>
                                        <div className="space-y-1.5 text-sm text-slate-600 dark:text-slate-300">
                                            <h1 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">Name: {filterdUser?.student_id?.name}</h1>
                                            <h2>Email: {filterdUser?.student_id?.email}</h2>
                                            <p>Contact Number: {filterdUser?.phoneNumber || "N/A"}</p>
                                            <p>Department: {filterdUser?.department || "N/A"}</p>
                                            <p>Professional Skill: {filterdUser?.professional_skill || "N/A"}</p>
                                            <p>Location: {filterdUser?.location || "N/A"}</p>
                                            <p>About: {filterdUser?.about || "N/A"}</p>
                                        </div>
                                    </>
                                }
                            </Card>
                        </motion.div>
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
