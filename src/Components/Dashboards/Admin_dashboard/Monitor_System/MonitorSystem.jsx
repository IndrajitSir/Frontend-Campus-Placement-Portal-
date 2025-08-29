import { BarChart, Bar, PieChart, Pie, Tooltip, XAxis, YAxis } from "recharts";
// Components
import LogViewer from "./LogViewer";
import SystemAnalysis from "../../../../Components/System_Analysis/SystemAnalysis.jsx";
// Shadcn Components
import { Card, CardContent } from "../../../../Components/ui/card";

export default function MonitorSystem() {

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-semibold">System Overview</h2>
      <SystemAnalysis />
      {/* Graphs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium mb-2">User Growth</h3>
            <BarChart /> {/* Use dummy chart data */}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium mb-2">Application Distribution</h3>
            <PieChart />
          </CardContent>
        </Card>
      </div>
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-4">System Monitor</h2>

        <div className="bg-white rounded shadow p-4 mb-6">
          <h3 className="text-lg font-medium mb-2">Recent Activities</h3>
          {/* <ul className="space-y-1">
            {activityLogs.map((log, i) => (
              <li key={i} className="text-sm text-gray-700">
                {log.timestamp} – {log.message}
              </li>
            ))}
          </ul> */}
          <LogViewer />
        </div>
      </div>
    </div>
  );
}


