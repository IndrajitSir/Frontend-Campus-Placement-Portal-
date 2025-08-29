import React from 'react'
import { motion } from 'framer-motion';
// Chart
import { Tooltip, PieChart, Pie, Cell, Legend } from "recharts";
// Shadcn Components
import { Card, CardContent } from "../../../Components/ui/card";
// Hooks
import { useStudentsPerDepartment } from '../../../hooks/Analytics/useAnalytics.js';
// Components
import CircleLoader from '../../../Components/Loader/CircleLoader.jsx';
// Constants
import { COLORS } from '../../../constants/constants.js';

function StudentsPerDepartmentCard() {
    const { data, loading, error } = useStudentsPerDepartment();

    if (loading) return <CircleLoader />;
    if (error) return <p>Error fetching Students Per Department analysis data!</p>;
    return (
        <>
            {/* 2. Students per Department -- working fine */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <Card className="w-full max-w-xl mx-auto shadow-md">
                    <CardContent>
                        <h2 className="text-xl font-semibold mb-2">Students per Department</h2>
                        <PieChart width={460} height={290}>
                            <Pie data={data} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={80} fill="#82ca9d" label isAnimationActive={true} animationDuration={600}>
                                {Array.isArray(data) && data?.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </CardContent>
                </Card>
            </motion.div>
        </>
    )
}

export default StudentsPerDepartmentCard
