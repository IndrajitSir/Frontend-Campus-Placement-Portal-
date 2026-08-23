import React from 'react'
import { motion } from 'framer-motion';
// Chart
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
// Shadcn Components
import { Card, CardContent } from "../../../Components/ui/card";
// Hooks
import { usePlacementsCreatedPerMonth } from '../../../hooks/Analytics/useAnalytics.js';
// Components
import CircleLoader from '../../../Components/Loader/CircleLoader.jsx';
function PlacementCreatedCard() {
    const { data, loading, error } = usePlacementsCreatedPerMonth();
    if (loading) return <CircleLoader />;
    if (error) return <p className="text-sm text-red-500">Error fetching Placements Created Per Month analysis data!</p>;
    if (!Array.isArray(data)) return <p className="text-sm text-slate-400">No data available.</p>;
    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card className="w-full shadow-md">
                <CardContent>
                    <h2 className="text-xl font-semibold mb-2">Placements per Month</h2>
                    <div className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data}>
                                <XAxis dataKey="_id" tick={{ fontSize: 12 }} />
                                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                                <Tooltip />
                                <Bar dataKey="totalPlacements" fill="#ffc658" radius={[4, 4, 0, 0]} isAnimationActive={true} animationDuration={600} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}

export default PlacementCreatedCard
