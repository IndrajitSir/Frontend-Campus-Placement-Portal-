import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion';
// Shadcn Components
import { Card, CardContent } from "../../Components/ui/card";
// Card Components
import ActiveStudentsCard from './Active_Students_Card/ActiveStudentsCard';
import ApplicationStatusCard from './Application_Status_Card/ApplicationStatusCard';
import PlacementCreatedCard from './Placement_Created_Card/PlacementCreatedCard';
import ResumeUploadStatsCard from './Resume_Upload_Stats_Card/ResumeUploadStatsCard';
import SelectedStudentsCard from './Selected_Students_Card/SelectedStudentsCard';
import StudentApprovalStats from './Student_Approval_Stats_Card/StudentApprovalStats';
import StudentByLocationCard from './Student_By_Location_Card/StudentByLocationCard';
import StudentsPerDepartmentCard from './Students_Per_Department_Card/StudentsPerDepartmentCard';
import UserCountCard from './User_Count_Card/UserCountCard';
// Hooks
import { useTotalStudents, useTotalPlacements, useTotalApplications } from '../../hooks/Analytics/useAnalytics.js';
// Components
import CircleLoader from '../../Components/Loader/CircleLoader.jsx';

function SystemAnalysis() {
    const [stats, setStats] = useState([
        { title: "Total Users", value: 0 },
        { title: "Total Applications", value: 0 },
        { title: "Placements Created", value: 0 },
    ]);
    const { data: totalStudents, loading: TotalStudentsLoading, error: TotalStudentsError } = useTotalStudents();
    const { data: totalPlacements, loading: TotalPlacementsLoading, error: TotalPlacementsError } = useTotalPlacements();
    const { data: totalApplications, loading: TotalApplicationsLoading, error: TotalApplicationsError } = useTotalApplications();
    useEffect(() => {
        if (totalStudents && totalPlacements && totalApplications) {
            setStats([
                { title: "Total Users", value: totalStudents?.[0]?.count },
                { title: "Total Applications", value: totalApplications?.[0]?.count },
                { title: "Placements Created", value: totalPlacements?.[0]?.count },
            ]);
        }
    }, [totalStudents, totalPlacements, totalApplications]);

    if (TotalStudentsLoading || TotalPlacementsLoading || TotalApplicationsLoading)
        return <CircleLoader />;

    if (TotalStudentsError || TotalPlacementsError || TotalApplicationsError)
        return <p>Error fetching stats!</p>;
    return (
        <>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {stats.map(stat => (
                    <Card key={stat.title} className="w-110">
                        <CardContent className="p-4">
                            <h3 className="text-lg font-medium">{stat.title}</h3>
                            <p className="text-2xl font-bold">{stat.value}</p>
                        </CardContent>
                    </Card>
                ))}
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
                <UserCountCard />
                <StudentsPerDepartmentCard />
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className='col-span-1 md:col-span-2'>
                    <SelectedStudentsCard />
                </motion.div>
                <PlacementCreatedCard />
                <ApplicationStatusCard />
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className='col-span-1 md:col-span-2'>
                    <StudentByLocationCard />
                </motion.div>
                <StudentApprovalStats />
                <ResumeUploadStatsCard />
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className='col-span-1 md:col-span-2'>
                    <ActiveStudentsCard />
                </motion.div>
            </motion.div>
        </>
    )
}

export default SystemAnalysis;
