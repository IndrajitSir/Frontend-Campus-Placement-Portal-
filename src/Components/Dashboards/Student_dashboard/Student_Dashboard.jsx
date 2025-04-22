import React from 'react'
import { useNavigate } from 'react-router-dom';
// Shadcn Components
import { Card, CardHeader, CardContent, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';

function Student_Dashboard() { // un-used
    const navigate = useNavigate();
    const handleClick = () => {
        navigate("/home/dashboard/applied-jobs");
    }
    const handleProfile = () => {
        navigate("/home/dashboard/profile");
    }
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <Card>
                <CardHeader>
                    <CardTitle>Application Status</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Track your job application progress here.</p>
                    <Button className="mt-2 cursor-pointer hover:bg-black-200" onClick={handleClick}>View Applications</Button>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Profile</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Go to the Profile page..</p>
                    <Button className="mt-2 cursor-pointer hover:bg-black-200" onClick={handleProfile}>Profile page</Button>
                </CardContent>
            </Card>
        </div>

    )
}

export default Student_Dashboard