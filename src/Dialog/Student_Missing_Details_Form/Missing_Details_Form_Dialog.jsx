import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
// Shadcn UI
import { Label } from '../../Components/ui/label';
import { Input } from '../../Components/ui/input';
import { Button } from '../../Components/ui/button';
// Shared motion presets
import { fadeUp, EASE } from '../../lib/motion';
// Icons
import { UploadCloudIcon, CheckCircle2, Phone, MapPin, Briefcase, Loader2 } from "lucide-react";
// Components
import CircleLoader from '../../Components/Loader/CircleLoader.jsx';
// Context
import { useUserData } from '../../context/AuthContext/AuthContext.jsx';
// Dialog Boxes
import ImageUploadDialog from '../Image_Upload_Dialog/ImageUploadDialog';
// Environment Variable
const API_URL = import.meta.env.VITE_API_URL;

const STEPS = [
    { n: 1, label: "Contact", icon: Phone },
    { n: 2, label: "Details", icon: MapPin },
    { n: 3, label: "Resume & Projects", icon: Briefcase },
];

function Missing_Details_Form_Dialog({ onCancel }) {
    console.count("MISSING_DETAILS_FORM_DIALOG render")
    const { accessToken, userInfo, handleResumeUpload } = useUserData();
    // const [numberOFProjects, setNumberOFProjects] = useState(null);
    const [resumeUploadDialog, setResumeUploadDialog] = useState(false);
    const [isResumeUploaded, setIsResumeUploaded] = useState(false);
    const [saving, setSaving] = useState(false);
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
                phoneNumber: userInfo?.user?.phoneNumber,
                location: userInfo?.student?.location,
                about: userInfo?.student?.about,
                professional_skill: userInfo?.student?.professional_skill,
                department: userInfo?.student?.department,
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
        setSaving(true);
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
                if (!userInfo?.student?.student_id) {
                    toast.error("Student profile not found. Please refresh and try again.");
                    return;
                }
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
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-4 text-slate-800 space-y-4 overflow-y-auto max-h-[70vh] dark:text-slate-200">
            {/* Step indicator */}
            <div className="flex items-center justify-center gap-2 pb-1">
                {STEPS.map(({ n, label }) => (
                    <React.Fragment key={n}>
                        <div className="flex items-center gap-1.5">
                            <span
                                className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold transition-colors ${
                                    step > n
                                        ? "bg-emerald-500 text-white dark:bg-emerald-500/90"
                                        : step === n
                                            ? "bg-gradient-to-br from-indigo-500 to-violet-500 text-white"
                                            : "bg-slate-100 text-slate-400 dark:bg-white/10 dark:text-slate-500"
                                }`}
                            >
                                {step > n ? <CheckCircle2 className="h-3.5 w-3.5" /> : n}
                            </span>
                            <span className={`hidden text-xs font-medium sm:inline ${step === n ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-slate-500"}`}>
                                {label}
                            </span>
                        </div>
                        {n < STEPS.length && <span className="h-px w-4 bg-slate-200 dark:bg-white/10 sm:w-8" />}
                    </React.Fragment>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {step === 1 &&
                    <motion.div
                        key="step-1"
                        variants={fadeUp}
                        initial="hidden"
                        animate="visible"
                        exit={{ opacity: 0, y: -10, transition: { duration: 0.2, ease: EASE } }}
                    >
                        <Label>Phone Number</Label>
                        <Input className="mt-2" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} />
                        <div className="flex justify-end gap-2 mt-4">
                            <Button variant="gradient" onClick={saveStepData} disabled={saving} className="cursor-pointer">
                                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                                {saving ? "Saving…" : "Save & Continue"}
                            </Button>
                        </div>
                    </motion.div>
                }
                {step === 2 &&
                    <motion.div
                        key="step-2"
                        variants={fadeUp}
                        initial="hidden"
                        animate="visible"
                        exit={{ opacity: 0, y: -10, transition: { duration: 0.2, ease: EASE } }}
                    >
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
                            <Button variant="gradient" onClick={saveStepData} disabled={saving} className="cursor-pointer">
                                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                                {saving ? "Saving…" : "Save & Continue"}
                            </Button>
                        </div>
                    </motion.div>
                }

                {step === 3 &&
                    <motion.div
                        key="step-3"
                        variants={fadeUp}
                        initial="hidden"
                        animate="visible"
                        exit={{ opacity: 0, y: -10, transition: { duration: 0.2, ease: EASE } }}
                    >
                        <div className='flex items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 p-4 dark:border-white/10 dark:bg-white/[0.03]'>
                            {
                                <Label className={`mt-2 text-xl ${isResumeUploaded ? "text-emerald-500 dark:text-emerald-400" : "text-slate-700 dark:text-slate-200"}`}>{isResumeUploaded ? "Resume Uploaded" : "Resume"}</Label>
                                // : <CircleLoader />
                            }
                            {isResumeUploaded && <CheckCircle2 className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />}
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
                        <Label className="mt-4">Projects</Label>
                        <div className="mt-1 space-y-3 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                            <div className="space-y-1">
                                <Label>Title</Label>
                                <Input name="title" value={formData.project.title} onChange={handleProjectChange} />
                            </div>
                            <div className="space-y-1">
                                <Label>Description</Label>
                                <Input name="description" value={formData.project.description} onChange={handleProjectChange} />
                            </div>
                            <div className="space-y-1">
                                <Label>Link</Label>
                                <Input name="link" value={formData.project.link} onChange={handleProjectChange} />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 mt-4">
                            {/* <Button variant="outline" onClick={() => setStep(step - 1)}>Back</Button> */}
                            <Button variant="gradient" onClick={saveStepData} disabled={saving} className="cursor-pointer">
                                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                                {saving ? "Saving…" : "Save"}
                            </Button>
                        </div>
                    </motion.div>
                }
            </AnimatePresence>
        </div>
    );
}

export default Missing_Details_Form_Dialog;
