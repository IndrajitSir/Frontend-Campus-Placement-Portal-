import React, { useState } from 'react'
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent } from "../../../Components/ui/card";
import { usePlacementsCreatedPerMonth } from '../../../hooks/Analytics/useAnalytics.js';
import CircleLoader from '../../../Components/Loader/CircleLoader.jsx';
import CardFilterHeader from '../CardFilterHeader.jsx';

function PlacementCreatedCard() {
    const [year, setYear] = useState('all');
    const [month, setMonth] = useState('all');
    const { data, loading, error } = usePlacementsCreatedPerMonth({ year, month });

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card className="w-full shadow-md">
                <CardContent>
                    <CardFilterHeader title="Placements per Month" year={year} setYear={setYear} month={month} setMonth={setMonth} />
                    <div className="h-[280px]">
                        {loading ? (
                            <div className="flex h-full items-center justify-center">
                                <CircleLoader />
                            </div>
                        ) : error ? (
                            <div className="flex h-full items-center justify-center text-center px-4">
                                <p className="text-sm text-red-500">Error fetching Placements Created Per Month analysis data!</p>
                            </div>
                        ) : !Array.isArray(data) || data.length === 0 ? (
                            <div className="flex h-full items-center justify-center">
                                <p className="text-sm text-slate-400">No data available.</p>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data}>
                                <XAxis dataKey="_id" tick={{ fontSize: 12 }} />
                                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                                <Tooltip />
                                <Bar dataKey="totalPlacements" fill="#ffc658" radius={[4, 4, 0, 0]} isAnimationActive={true} animationDuration={600} />
                            </BarChart>
                        </ResponsiveContainer>
                        )}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}

export default PlacementCreatedCard
