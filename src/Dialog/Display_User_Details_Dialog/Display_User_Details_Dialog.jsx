import React from 'react'
// Shadcn Components
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "../../components/ui/dialog";
import { Button } from '../../components/ui/button';

function Display_User_Details_Dialog({ displayUserDetailsDialog, setDisplayUserDetailsDialog, data }) {
    return (
        <>
            < Dialog open={displayUserDetailsDialog} onOpenChange={setDisplayUserDetailsDialog} >
                <DialogContent>
                    <DialogTitle>{data?.user_id?.name || data?.name || data?.student_id?.name || "Unknown"}</DialogTitle>
                    <DialogHeader>{data?.placement_id?.company_name || data?.email || data?.student_id?.email || "Not Given"}</DialogHeader>
                    <p>Contact Number: {data?.phoneNumber || "N/A"}</p>
                    {
                        data?.role === "student" || data?.student_id?.role === "student" || data?.user_id?.role === "student" &&
                        <>
                            <p>Department: {data?.department || "N/A"}</p>
                            <p>Professional Skill: {data?.professional_skill || "N/A"}</p>
                            <p>Location: {data?.location || "N/A"}</p>
                            <p>About: {data?.about || "N/A"}</p>
                        </>
                    }
                    <DialogFooter>
                        <Button className="cursor-pointer hover:bg-gray-300" variant="secondary" onClick={() => setDisplayUserDetailsDialog(false)}>Ok</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog >
        </>
    )
}

export default Display_User_Details_Dialog