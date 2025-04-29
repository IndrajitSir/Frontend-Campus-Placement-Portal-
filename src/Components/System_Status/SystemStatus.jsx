import { useEffect, useState } from "react";
import axios from "axios";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Card } from "../ui/card";
// Environment variables
const API_URL = import.meta.env.VITE_API_URL;

const SystemStatus = () => {
    const [systemData, setSystemData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/v1/system/status`);
                const { uptime, memory, cpuLoad } = res.data;
                const timestamp = new Date().toLocaleTimeString();
                const newData = {
                    name: timestamp,
                    uptime: parseFloat((uptime / 60).toFixed(2)), // in minutes
                    cpuLoad: parseFloat(cpuLoad[0].toFixed(2)),
                    freeMemory: Math.round(memory.free / (1024 * 1024)),
                    totalMemory: Math.round(memory.total / (1024 * 1024)),
                };
                setSystemData(prev => [...prev.slice(-9), newData]); // keep last 10 records
            } catch (error) {
                console.error("Failed to fetch system data", error);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 10000); // fetch every 10s
        return () => clearInterval(interval);
    }, []);

    return (
        <Card className="p-6 bg-white rounded-xl shadow-md w-full mt-4">
            <h2 className="text-xl font-bold mb-4">System Monitoring</h2>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 w-full">
                <Card className="w-full h-64">
                    <h3 className="text-md font-semibold mb-2 ml-3">CPU Load (%)</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={systemData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis domain={[0, 100]} />
                            <Tooltip />
                            <Line type="monotone" dataKey="cpuLoad" stroke="#8884d8" />
                        </LineChart>
                    </ResponsiveContainer>
                </Card>

                <Card className="w-full h-64">
                    <h3 className="text-md font-semibold mb-2 ml-3">Uptime (minutes)</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={systemData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="uptime" fill="#82ca9d" />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>

                <Card className="w-full h-64">
                    <h3 className="text-md font-semibold mb-2 ml-3">Free Memory (MB)</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={systemData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="freeMemory" stroke="#ff7300" />
                        </LineChart>
                    </ResponsiveContainer>
                </Card>

                <Card className="w-full h-64">
                    <h3 className="text-md font-semibold mb-2 ml-3">Total Memory (MB)</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={systemData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="totalMemory" stroke="#00c49f" />
                        </LineChart>
                    </ResponsiveContainer>
                </Card>
            </div>
        </Card>
    );
};

export default SystemStatus;
