import React from 'react'
import { motion } from 'framer-motion';
// Chart
import { Tooltip, PieChart, Pie, Cell, Legend, ResponsiveContainer } from "recharts";
// Shadcn Components
import { Card, CardContent } from "../../../Components/ui/card";
// Hooks
import { useStudentApprovalStats } from '../../../hooks/Analytics/useAnalytics.js';
// Components
import CircleLoader from '../../../Components/Loader/CircleLoader.jsx';
// Constants
import { COLORS } from '../../../constants/constants.js';
function StudentApprovalStats() {
    const { data, loading, error } = useStudentApprovalStats();

    if (loading) return <CircleLoader />;
    if (error) return <p className="text-sm text-red-500">Error fetching Student Approval Stats data!</p>;
    if (!Array.isArray(data)) return <p className="text-sm text-slate-400">No data available.</p>;
    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card className="w-full shadow-md">
                <CardContent>
                    <h2 className="text-xl font-semibold mb-2">Approval Stats</h2>
                    <div className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={data} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={80} fill="#ff7300" label isAnimationActive={true} animationDuration={600}>
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

export default StudentApprovalStats
