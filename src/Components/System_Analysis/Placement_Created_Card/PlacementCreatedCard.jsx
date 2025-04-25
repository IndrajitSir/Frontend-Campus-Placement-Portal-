import React from 'react'
import { motion } from 'framer-motion';
// Chart
import { BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
// Shadcn Components
import { Card, CardContent } from "../../../components/ui/card";
// Hooks
import { usePlacementsCreatedPerMonth } from '../../../hooks/Analytics/useAnalytics.js';
// Components
import CircleLoader from '../../../components/Loader/CircleLoader.jsx';
function PlacementCreatedCard() {
    const { data, loading, error } = usePlacementsCreatedPerMonth();
    if (loading) return <CircleLoader />;
    if (error) return <p>Error fetching Placements Created Per Month analysis data!</p>;
    if (!Array.isArray(data)) return <p>No data available.</p>;
    return (
        <>
            {/* 4. Placements Created per Month */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <Card className="w-full max-w-xl mx-auto shadow-md">
                    <CardContent>
                        <h2 className="text-xl font-semibold mb-2">Placements per Month</h2>
                        <BarChart width={450} height={250} data={data}>
                            <XAxis dataKey="_id" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="totalPlacements" fill="#ffc658" radius={[4, 4, 0, 0]} isAnimationActive={true} animationDuration={600} />
                        </BarChart>
                    </CardContent>
                </Card>
            </motion.div>
        </>
    )
}

export default PlacementCreatedCard