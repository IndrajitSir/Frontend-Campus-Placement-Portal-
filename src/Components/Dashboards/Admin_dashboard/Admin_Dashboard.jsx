import React from 'react'
import { useNavigate } from 'react-router-dom';
// Shadcn Components
import { Card, CardHeader, CardContent, CardTitle } from '../../ui/card'
import { Button } from '../../ui/button';
// Components
import SystemStatus from '../../../Components/System_Status/SystemStatus.jsx';

function Admin_Dashboard() {
    const navigate = useNavigate();
    console.log("Rendering Admin_Dashboard component");
    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
                <Card className="flex flex-col justify-between">
                    <CardHeader>
                        <CardTitle>User Management</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Button className="w-full mt-2 cursor-pointer" onClick={() => navigate("/home/dashboard/manage-users")}>
                            Manage Users
                        </Button>
                    </CardContent>
                </Card>

                <Card className="flex flex-col justify-between">
                    <CardHeader>
                        <CardTitle>System Monitoring</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Button className="w-full mt-2 cursor-pointer" onClick={() => navigate("/home/dashboard/monitor-system")}>
                            View Logs
                        </Button>
                    </CardContent>
                </Card>

                <Card className="flex flex-col justify-between">
                    <CardHeader>
                        <CardTitle>Placement Records</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Button className="w-full mt-2 cursor-pointer" onClick={() => navigate("/home/placements")}>
                            Check Records
                        </Button>
                    </CardContent>
                </Card>

                <Card className="flex flex-col justify-between">
                    <CardHeader>
                        <CardTitle>Applications Management</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Button className="w-full mt-2 cursor-pointer" onClick={() => navigate("/home/dashboard/manage-applications")}>
                            Manage Applications
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <div>
                <SystemStatus />
            </div>
        </>
    )
}

export default Admin_Dashboard
