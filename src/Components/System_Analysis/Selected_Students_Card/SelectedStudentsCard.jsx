import React from 'react'
import { motion } from 'framer-motion';
// Chart
import { BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
// Shadcn Components
import { Card, CardContent } from "../../../components/ui/card";
// Hooks
import { useSelectedStudentsPerDepartment } from '../../../hooks/Analytics/useAnalytics.js';
// Components
import CircleLoader from '../../../components/Loader/CircleLoader.jsx';
function SelectedStudentsCard() {
    const { data, loading, error } = useSelectedStudentsPerDepartment();

    if (loading) return <CircleLoader />;
    if (error) return <p>Error fetching Selected Students Per Department analysis data!</p>;
    if (!Array.isArray(data)) return <p>No data available.</p>;
    return (
        <>
            {/* 3. Selected Students by Department */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <Card className="w-full shadow-md">
                    <CardContent>
                        <h2 className="text-xl font-semibold mb-2">Selected Students per Department</h2>
                        <BarChart width={1300} height={250} data={data}>
                            <XAxis dataKey="_id" />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Bar dataKey="selected" fill="#ff7300" radius={[4, 4, 0, 0]} isAnimationActive={true} animationDuration={600} />
                            <Bar dataKey="applied" fill="#ff7300" radius={[4, 4, 0, 0]} isAnimationActive={true} animationDuration={600} />
                            <Bar dataKey="shortlisted" fill="#ff7300" radius={[4, 4, 0, 0]} isAnimationActive={true} animationDuration={600} />
                            <Bar dataKey="rejected" fill="#ff7300" radius={[4, 4, 0, 0]} isAnimationActive={true} animationDuration={600} />
                        </BarChart>
                    </CardContent>
                </Card>
            </motion.div>
        </>
    )
}

export default SelectedStudentsCard