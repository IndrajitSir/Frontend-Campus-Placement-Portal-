import { BarChart, Bar, PieChart, Pie, Cell, Tooltip, XAxis, YAxis, ResponsiveContainer, Legend } from "recharts";
import { LoaderCircle, Activity, BarChart3, PieChart as PieIcon, ScrollText } from "lucide-react";
// Components
import LogViewer from "./LogViewer";
import SystemAnalysis from "../../../../Components/System_Analysis/SystemAnalysis.jsx";
// Shadcn Components
import { Card } from "../../../../Components/ui/card";
// Hooks
import { usePlacementsCreatedPerMonth, useApplicationStatusSummary } from "../../../../hooks/Analytics/useAnalytics.js";

const PIE_COLORS = ["#6366f1", "#8b5cf6", "#d946ef", "#10b981", "#f59e0b", "#0ea5e9"];

const statusLabel = (s) => {
  const labels = { applied: "Applied", shortlisted: "Shortlisted", selected: "Selected", rejected: "Rejected" };
  return labels[s] || s;
};

export default function MonitorSystem() {
  const { data: placementsByMonth, loading: loadingPlacements } = usePlacementsCreatedPerMonth();
  const { data: statusSummary, loading: loadingStatus } = useApplicationStatusSummary();

  const barData = (Array.isArray(placementsByMonth) ? placementsByMonth : [])
    .map((d) => ({ name: d?._id || "—", placements: d?.totalPlacements || 0 }));

  const pieData = (Array.isArray(statusSummary) ? statusSummary : [])
    .map((d) => ({ name: statusLabel(d?._id), value: d?.count || 0 }))
    .filter((d) => d.value > 0);

  const loading = loadingPlacements || loadingStatus;

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div>
        <h2 className="flex items-center gap-2 font-display text-2xl font-bold text-slate-900">
          <Activity className="h-5 w-5 text-indigo-600" /> System Overview
        </h2>
        <p className="mt-1 text-sm text-slate-400">Live platform statistics, analytics and activity logs.</p>
      </div>

      <SystemAnalysis />

      {/* Charts */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card className="border-slate-200/80 p-5">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <BarChart3 className="h-4 w-4" />
            </span>
            <h3 className="font-display text-sm font-bold text-slate-900">Placements Created per Month</h3>
          </div>
          <div className="mt-4 h-64">
            {loading ? (
              <div className="flex h-full items-center justify-center gap-2 text-sm text-slate-400">
                <LoaderCircle className="h-4 w-4 animate-spin text-indigo-500" /> Loading…
              </div>
            ) : barData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-400 italic">No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 10, right: 10, left: -18, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={{ stroke: "#e2e8f0" }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: "rgba(99,102,241,0.06)" }} contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }} />
                  <Bar dataKey="placements" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card className="border-slate-200/80 p-5">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-fuchsia-50 text-fuchsia-600">
              <PieIcon className="h-4 w-4" />
            </span>
            <h3 className="font-display text-sm font-bold text-slate-900">Application Status Distribution</h3>
          </div>
          <div className="mt-4 h-64">
            {loading ? (
              <div className="flex h-full items-center justify-center gap-2 text-sm text-slate-400">
                <LoaderCircle className="h-4 w-4 animate-spin text-indigo-500" /> Loading…
              </div>
            ) : pieData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-400 italic">No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3}>
                    {pieData.map((entry, i) => (
                      <Cell key={`cell-${i}`} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

      {/* Recent activities */}
      <Card className="border-slate-200/80 p-5">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <ScrollText className="h-4 w-4" />
          </span>
          <h3 className="font-display text-sm font-bold text-slate-900">Recent Activities</h3>
        </div>
        <div className="mt-4">
          <LogViewer />
        </div>
      </Card>
    </div>
  );
}
