import {
  MetricGrid,
  WorkQueue,
  UpcomingDeadlines,
  RecentApplications,
} from "../DashboardWidgets.jsx";
import SystemStatus from "../../System_Status/SystemStatus.jsx";

/**
 * Administrator dashboard: ecosystem-wide counts, approval and review queues,
 * and system health. Visible to admin and super_admin only (the API enforces
 * the role; this component is never rendered for students).
 */
function Admin_Dashboard({ summary }) {
  return (
    <div className="space-y-6">
      <MetricGrid metrics={summary?.metrics || []} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <WorkQueue queues={summary?.queues || []} />
        <UpcomingDeadlines items={summary?.upcoming || []} staff />
      </div>

      <RecentApplications items={summary?.recentApplications || []} staff />

      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-white/10 dark:bg-white/[0.04]">
        <h2 className="font-display text-base font-bold text-slate-900 dark:text-slate-100">System health</h2>
        <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
          Live uptime, memory and CPU for this API instance.
        </p>
        <div className="mt-4">
          <SystemStatus />
        </div>
      </section>
    </div>
  );
}

export default Admin_Dashboard;
