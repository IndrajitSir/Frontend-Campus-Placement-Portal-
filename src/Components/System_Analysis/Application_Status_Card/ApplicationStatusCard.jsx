import React from 'react'
import { motion } from 'framer-motion';
// Chart
import { Tooltip, PieChart, Pie, Cell, Legend } from "recharts";
// Shadcn Components
import { Card, CardContent } from "../../../components/ui/card";
// Hooks
import { useApplicationStatusSummary } from '../../../hooks/Analytics/useAnalytics.js';
// Components
import CircleLoader from '../../../components/Loader/CircleLoader.jsx';
// Constants
import { COLORS } from '../../../constants/constants.js';
function ApplicationStatusCard() {
    const { data, loading, error } = useApplicationStatusSummary();

    if (loading) return <CircleLoader />;
    if (error) return <p>Error fetching Application Status Summary analysis data!</p>;
    if (!Array.isArray(data)) return <p>No data available.</p>;
    return (
        <>
            {/* 5. Application Status Summary - working fine */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <Card className="w-full max-w-xl mx-auto shadow-md">
                    <CardContent>
                        <h2 className="text-xl font-semibold mb-2">Application Status Summary</h2>
                        <PieChart width={450} height={250}>
                            <Pie data={data} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={80} fill="#a4de6c" label isAnimationActive={true} animationDuration={600}>
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

export default ApplicationStatusCard