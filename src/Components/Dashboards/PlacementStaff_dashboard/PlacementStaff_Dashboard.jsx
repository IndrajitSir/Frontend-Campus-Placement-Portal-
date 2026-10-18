import {
  MetricGrid,
  WorkQueue,
  UpcomingDeadlines,
  RecentApplications,
} from "../DashboardWidgets.jsx";
import SystemAnalysis from "../../System_Analysis/SystemAnalysis.jsx";

/**
 * Placement officer dashboard: the review pipeline, student approvals, drives
 * closing soon, and the latest applications — all from real queries.
 */
function PlacementStaff_Dashboard({ summary }) {
  return (
    <div className="space-y-6">
      <MetricGrid metrics={summary?.metrics || []} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <WorkQueue queues={summary?.queues || []} />
        <UpcomingDeadlines items={summary?.upcoming || []} staff />
      </div>

      <RecentApplications items={summary?.recentApplications || []} staff />

      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-white/10 dark:bg-white/[0.04]">
        <h2 className="font-display text-base font-bold text-slate-900 dark:text-slate-100">Placement analytics</h2>
        <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
          Live aggregates across applications, departments and drives.
        </p>
        <div className="mt-4">
          <SystemAnalysis />
        </div>
      </section>
    </div>
  );
}

export default PlacementStaff_Dashboard;
