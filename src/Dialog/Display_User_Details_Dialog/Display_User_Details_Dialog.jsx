import React from 'react'
// Shadcn Components
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "../../Components/ui/dialog";
import { Button } from '../../Components/ui/button';
import { Card } from '../../Components/ui/card';

function Display_User_Details_Dialog({ displayUserDetailsDialog, setDisplayUserDetailsDialog, data }) {
    console.log("user display data: ", data);
    return (
        <>
            <Dialog open={displayUserDetailsDialog} onOpenChange={setDisplayUserDetailsDialog} >
                <DialogTitle></DialogTitle>
                <DialogContent>
                    <Card className="shadow-md rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                            <div>
                                <h3 className="text-lg font-semibold">{data?.userInfo?.name || data?.student_id?.name}</h3>
                                <p className="text-sm text-gray-600">{data?.userInfo?.email || data?.student_id?.email}</p>
                                <p className="text-sm">{data?.userInfo?.phoneNumber || data?.student_id?.phoneNumber}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                            <div><strong>Department:</strong> {data?.studentInfo?.department || data?.department || "N/A"}</div>
                            <div><strong>Location:</strong> {data?.studentInfo?.location || data?.location || "N/A"}</div>
                            {
                                data?.placementInfo?.company_name &&
                                <div><strong>Company:</strong> {data?.placementInfo.company_name}</div>
                            }
                            {
                                data?.placementInfo?.job_title &&
                                <div><strong>Job Title:</strong> {data.placementInfo.job_title}</div>
                            }
                            <div><strong>Professional Skill:</strong> {data?.studentInfo?.professional_skill || data?.professional_skill || "N/A"}</div>
                            <div><strong>About:</strong> {data?.studentInfo?.about || data?.about || "N/A"}</div>
                        </div>

                        <div className="mt-4 flex justify-between items-center">
                            <a href={data?.studentInfo?.resume || data?.resume} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View Resume</a>
                            <span className="text-xs text-gray-500">{new Date(data?.createdAt).toLocaleDateString()}</span>
                        </div>
                    </Card>
                    <DialogFooter>
                        <Button className="cursor-pointer hover:bg-gray-300" variant="secondary" onClick={() => setDisplayUserDetailsDialog(false)}>Ok</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog >
        </>
    )
}

export default Display_User_Details_Dialog
