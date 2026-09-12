import React, { useState } from 'react'
import { motion } from 'framer-motion';
// Chart
import { Tooltip, PieChart, Pie, Cell, Legend, ResponsiveContainer } from "recharts";
// Shadcn Components
import { Card, CardContent } from "../../../Components/ui/card";
// Hooks
import { useStudentsPerDepartment } from '../../../hooks/Analytics/useAnalytics.js';
// Components
import CircleLoader from '../../../Components/Loader/CircleLoader.jsx';
import CardFilterHeader from '../CardFilterHeader.jsx';
// Constants
import { COLORS } from '../../../constants/constants.js';

function StudentsPerDepartmentCard() {
    const [year, setYear] = useState('all');
    const [month, setMonth] = useState('all');
    const { data, loading, error } = useStudentsPerDepartment({ year, month });

    if (loading) return <CircleLoader />;
    if (error) return <p className="text-sm text-red-500">Error fetching Students Per Department analysis data!</p>;
    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card className="w-full shadow-md">
                <CardContent>
                    <CardFilterHeader title="Students per Department" year={year} setYear={setYear} month={month} setMonth={setMonth} />
                    <div className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={data} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={80} fill="#82ca9d" label isAnimationActive={true} animationDuration={600}>
                                    {Array.isArray(data) && data?.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}

export default StudentsPerDepartmentCard
