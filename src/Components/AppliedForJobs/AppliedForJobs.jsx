import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify';
import { useUserData } from '../../context/AuthContext/AuthContext.jsx';
const API_URL = import.meta.env.VITE_API_URL;

function AppliedForJobs() {
  const { accessToken } = useUserData();
  const [appliedJobs, setAppliedJobs] = useState([]);
  const applications = async () => {
    const res = await fetch(`${API_URL}/api/v1/applications/applied-for-job`, {
      method: "GET",
      credentials: "include",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
    })
    const response = await res.json();
    if (!response.success) {
      toast.warning(response.message)
    }
    console.log(response);

    setAppliedJobs(response?.data);
  }
  useEffect(() => {
    applications();
  }, []);
  return (
    <>
      < div className="p-6" >
        <h2 className="text-2xl font-bold mb-4">Applications</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {appliedJobs.map((candidate) => (
            <div key={candidate?.user_id._id} className="border p-4 rounded shadow-md bg-white">
              <h3 className="text-xl font-semibold">You {candidate?.status === "applied" ? candidate?.status : <span>got {candidate?.status}</span>} for {candidate?.placement_id?.job_title} at {candidate?.placement_id?.company_name}</h3>
              <p className="text-gray-600">{candidate?.status}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default AppliedForJobs