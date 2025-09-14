import React, { useState } from 'react'
// Shadcn Components
import { Button } from "../../Components/ui/button.jsx";
// Dialog Boxes
import Logout_Dialog from "../../Dialog/Logout_dialog/Logout_Dialog.jsx";
// Components
import Student_Dashboard from "../../Components/Dashboards/Student_dashboard/Student_Dashboard.jsx";
import Admin_Dashboard from "../../Components/Dashboards/Admin_dashboard/Admin_Dashboard.jsx";
import PlacementStaff_Dashboard from "../../Components/Dashboards/PlacementStaff_dashboard/PlacementStaff_Dashboard.jsx";
// CONTEXT api
import { useUserData } from "../../context/AuthContext/AuthContext.jsx";
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from '../../functionality/ProtectedRoutes';

function DashBoardContent() {
    const { loading, role } = useUserData();
    const [logoutDialog, setLogoutDialog] = useState(false);
    if (loading || !role) {
        return <div>Loading dashboard...</div>;
    }
    return (
        <>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-3xl font-bold">Dashboard</h1>
                {
                    role !== "student" &&
                    <Button className="absolute top-28 right-24 cursor-pointer" onClick={() => setLogoutDialog(true)}>Logout</Button>
                }
            </div>
            <div className='w-full'>
                {role === "placement_staff" && (
                    <ErrorBoundary FallbackComponent={ErrorFallback}>
                        <PlacementStaff_Dashboard />
                    </ErrorBoundary>
                )}
                {role === "admin" || role === "super_admin" && (
                    <ErrorBoundary FallbackComponent={ErrorFallback}>
                        <Admin_Dashboard />
                    </ErrorBoundary>
                )}
            </div>
            <Logout_Dialog logoutDialog={logoutDialog} setLogoutDialog={setLogoutDialog}></Logout_Dialog>
        </>
    )
}

export default DashBoardContent
