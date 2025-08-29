import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
// Shadcn UI
import { Label } from '../../Components/ui/label';
import { Input } from '../../Components/ui/input';
import { Button } from '../../Components/ui/button';
// Icons
import { UploadCloudIcon } from "lucide-react";
// Components
import CircleLoader from '../../Components/Loader/CircleLoader.jsx';
// Context
import { useUserData } from '../../context/AuthContext/AuthContext.jsx';
// Dialog Boxes
import ImageUploadDialog from '../Image_Upload_Dialog/ImageUploadDialog';
// Environment Variable
const API_URL = import.meta.env.VITE_API_URL;

function Missing_Details_Form_Dialog({ onCancel }) {
    console.count("MISSING_DETAILS_FORM_DIALOG render")
    const { accessToken, userInfo, handleResumeUpload } = useUserData();
    // const [numberOFProjects, setNumberOFProjects] = useState(null);
    const [resumeUploadDialog, setResumeUploadDialog] = useState(false);
    const [isResumeUploaded, setIsResumeUploaded] = useState(false);
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        phoneNumber: '',
        location: '',
        about: '',
        professional_skill: '',
        department: '',
        project: {
            title: '',
            description: '',
            link: '',
        },
    });
    useEffect(() => {
        if (userInfo?.user && userInfo?.student) {
            setFormData((prev) => ({
                ...prev,
                phoneNumber: userInfo?.user.phoneNumber,
                location: userInfo?.student.location,
                about: userInfo?.student.about,
                professional_skill: userInfo?.student.professional_skill,
                department: userInfo?.student.department,
            }))
        }
    }, [userInfo]);

    useEffect(() => {
        if (step === 1 && formData.phoneNumber !== "") {
            setStep(2);
        }
    }, [formData.phoneNumber, step]);

    useEffect(() => {
        if (step === 2 &&
            [formData.location, formData.about, formData.professional_skill, formData.department].some((field) => field?.trim() === '')
        ) {
            setStep(3);
        }
    }, []);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleProjectChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            project: {
                ...prev.project,
                [name]: value,
            },
        }));
    };

    const saveStepData = async () => {
        try {
            let payload = {};

            if (step === 1) {
                payload = {
                    phone: formData.phoneNumber
                }
                await fetch(`${API_URL}/api/v1/users/update-phoneNumber`, {
                    method: "PUT",
                    credentials: "include",
                    body: JSON.stringify(payload),
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`
                    },
                }).then(res => res.json()
                ).then(data => {
                    if (!data.success) toast.error(data.message);
                    else toast.success(data.message);
                }).catch(err => {
                    console.error(`Error while updating phone number: ${err}`)
                });
            } else if (step === 2) {
                let location_payload = { newLocation: formData.location };
                let about_payload = { newAbout: formData.about };
                let professional_skill_payload = { newProfessionalSkill: formData.professional_skill };
                let department_payload = { newDepartment: formData.department };

                await Promise.all([
                    fetch(`${API_URL}/api/v1/student/update-location`, {
                        method: "PUT",
                        credentials: "include",
                        body: JSON.stringify(location_payload),
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${accessToken}`
                        },
                    }),
                    fetch(`${API_URL}/api/v1/student/update-about`, {
                        method: "PUT",
                        credentials: "include",
                        body: JSON.stringify(about_payload),
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${accessToken}`
                        },
                    }),
                    fetch(`${API_URL}/api/v1/student/update-professional_skill`, {
                        method: "PUT",
                        credentials: "include",
                        body: JSON.stringify(professional_skill_payload),
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${accessToken}`
                        },
                    }),
                    fetch(`${API_URL}/api/v1/student/update-department`, {
                        method: "PUT",
                        credentials: "include",
                        body: JSON.stringify(department_payload),
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${accessToken}`
                        },
                    })
                ]).then((responses) => Promise.all(responses.map(res => res.json())))
                    .then((dataArray) => {
                        dataArray.forEach((data, i) => {
                            if (data.success) toast.success(data.message);
                        });
                    })
                    .catch(err => console.error("Step 2 Update Error:", err));

                location_payload = {};
                about_payload = {};
                professional_skill_payload = {};
                department_payload = {};
            } else if (step === 3) {
                payload = {
                    projects: [formData.project],
                };
                await fetch(`${API_URL}/api/v1/student/add-project/${userInfo.student.student_id}`, {
                    method: "POST",
                    credentials: "include",
                    body: JSON.stringify(payload),
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`
                    },
                }).then(res => res.json()
                ).then(data => {
                    if (!data.success) { toast.error(data.message); }
                    else { toast.success(data.message); }
                }).catch(err => {
                    console.error(`Error while adding new project: ${err}`)
                });
            }
            if (step < 3) {
                setStep(step + 1);
            } else {
                onCancel(false);
            }
        } catch (err) {
            toast.error("Failed to save data.");
            console.error(err);
        }
    };

    return (
        <div className="p-4 text-black-600 space-y-4 overflow-y-auto max-h-[70vh]">
            {step === 1 &&
                <>
                    <Label>Phone Number</Label>
                    <Input className="mt-2" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} />
                    <div className="flex justify-end gap-2 mt-4">
                        <Button onClick={saveStepData} className="cursor-pointer">Save & Continue</Button>
                    </div>
                </>
            }
            {
                step === 2 &&
                <>
                    <Label className="mt-2">Location</Label>
                    <Input name="location" value={formData.location} onChange={handleChange} />

                    <Label className="mt-2">About</Label>
                    <Input name="about" value={formData.about} onChange={handleChange} />

                    <Label className="mt-2">Professional Skill</Label>
                    <Input name="professional_skill" value={formData.professional_skill} onChange={handleChange} />

                    <Label className="mt-2">Department</Label>
                    <Input name="department" value={formData.department} onChange={handleChange} />

                    <div className="flex justify-end gap-2 mt-4">
                        {/* <Button variant="outline" className="cursor-pointer" onClick={() => setStep(step - 1)}>Back</Button> */}
                        <Button onClick={saveStepData} className="cursor-pointer">Save & Continue</Button>
                    </div>
                </>
            }

            {step === 3 &&
                <>
                    <div className='flex items-center justify-center gap-6'>
                        {
                            <Label className={`mt-2 text-xl ${isResumeUploaded && "text-green-500"}`}>{isResumeUploaded ? "Resume Uploaded" : "Resume"}</Label>
                            // : <CircleLoader />
                        }
                        <Button variant="outline" onClick={() => { setResumeUploadDialog(true) }} className="cursor-pointer w-8 h-8"><UploadCloudIcon className="w-5 h-5 cursor-pointer" /></Button>
                    </div>
                    <ImageUploadDialog isOpen={resumeUploadDialog} onClose={() => setResumeUploadDialog(false)}
                        onUpload={async (file) => {
                            try {
                                // setLoading(true);
                                const success = await handleResumeUpload(file);
                                setIsResumeUploaded(success);
                            } catch (error) {
                                console.error("Upload failed", error);
                                toast.error("Upload failed");
                            } finally {
                                // setLoading(false)
                            }
                        }} />
                    <Label className="mt-2">Projects</Label>
                    <Label className="mt-1">Title</Label>
                    <Input name="title" value={formData.project.title} onChange={handleProjectChange} />
                    <Label className="mt-1">Description</Label>
                    <Input name="description" value={formData.project.description} onChange={handleProjectChange} />
                    <Label className="mt-1">Link</Label>
                    <Input name="link" value={formData.project.link} onChange={handleProjectChange} />

                    <div className="flex justify-end gap-2 mt-4">
                        {/* <Button variant="outline" onClick={() => setStep(step - 1)}>Back</Button> */}
                        <Button onClick={saveStepData} className="cursor-pointer">Save</Button>
                    </div>
                </>
            }
        </div>
    );
}

export default Missing_Details_Form_Dialog;
