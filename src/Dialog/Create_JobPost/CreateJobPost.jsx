import React, { useState } from 'react'
import axios from 'axios';
import { toast } from 'react-toastify';
// Shadcn Components
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
// CONTEXT api
import { useUserData } from '../../context/AuthContext/AuthContext.jsx';
const API_URL = import.meta.env.VITE_API_URL;

function CreateJobPost({ onCancel }) {
    const { accessToken } = useUserData();
    const [newPost, setNewPost] = useState({ company_name: "", job_title: "", location: "", description: "", eligibility: "", last_date: "" });
    const handleEditChange = (e) => {
        setNewPost({ ...newPost, [e.target.name]: e.target.value });
    };
    const handleCreateJobPost = async () => {
        try {
            const res = await axios.post(`${API_URL}/api/v1/placements`, { newPost }, {
                credentials: "include",
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            console.log("response: ", res);
            if (!res.status < 400) {
                toast.error(res.response.data.message);
            }
            toast.success(res.response.data.message);
            onCancel(false)
        } catch (error) {
            console.error(error);
        }
    }
    return (
        <div>
            <Label>Company Name</Label>
            <Input className="mt-2" name="company_name" value={newPost.company_name} onChange={handleEditChange} />
            <Label className="mt-2">Job Title</Label>
            <Input className="mt-2" name="job_title" value={newPost.job_title} onChange={handleEditChange} />
            <Label className="mt-2">Location</Label>
            <Input className="mt-2" name="location" value={newPost.location || ""} onChange={handleEditChange} />
            <Label className="mt-2">Description</Label>
            <Input className="mt-2" name="description" value={newPost.description} onChange={handleEditChange} />
            <Label className="mt-2">Eligibility</Label>
            <Input className="mt-2" name="eligibility" value={newPost.eligibility} onChange={handleEditChange} />
            <Label className="mt-2">Last Date</Label>
            <Input className="mt-2" type="date" name="last_date" value={newPost.last_date} onChange={handleEditChange} />
            <Button varient="outline" className="mt-4 cursor-pointer bg-gray-600 hover:bg-gray-500" onClick={() => onCancel(false)}>Cancel </Button>
            <Button className="mt-4 cursor-pointer ml-4" onClick={handleCreateJobPost}>Create </Button>
        </div>
    )
}

export default CreateJobPost