import { Link } from "react-router-dom";
import { Briefcase, ArrowRight } from "lucide-react";
import { Button } from "../../ui/button.jsx";
import {
  MetricGrid,
  WorkQueue,
  UpcomingDeadlines,
  RecentApplications,
} from "../DashboardWidgets.jsx";

/**
 * Student home dashboard.
 *
 * Every figure comes from `GET /api/v1/dashboard/me`, which scopes the query to
 * the caller. The empty state is real: it is shown when the student genuinely
 * has no applications, not as a placeholder.
 */
function Student_Dashboard({ summary }) {
  const metrics = summary?.metrics || [];
  const queues = (summary?.queues || []).filter((q) => q.key !== "closing_soon");
  const upcoming = summary?.upcoming || [];
  const recent = summary?.recentApplications || [];
  const hasApplications = recent.length > 0;

  return (
    <div className="space-y-6">
      <MetricGrid metrics={metrics} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <WorkQueue queues={queues} />
        <UpcomingDeadlines items={upcoming} />
      </div>

      {!hasApplications ? (
        <section className="rounded-2xl border border-dashed border-slate-300/80 bg-slate-50/60 p-8 text-center dark:border-white/10 dark:bg-white/[0.02]">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-300">
            <Briefcase className="h-6 w-6" />
          </span>
          <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-200">No applications yet</p>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
            Browse open drives and apply — your progress will appear here with a full status timeline.
          </p>
          <Button asChild variant="gradient" className="mt-4 cursor-pointer">
            <Link to="/home/dashboard/placements">
              Browse placement drives <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </section>
      ) : (
        <RecentApplications items={recent} />
      )}
    </div>
  );
}

export default Student_Dashboard;
