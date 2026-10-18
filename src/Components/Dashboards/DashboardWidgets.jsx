import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  CalendarClock,
  CheckCircle2,
  CircleAlert,
  ClipboardList,
  RefreshCw,
  SearchX,
} from "lucide-react";
import { Button } from "../ui/button.jsx";
import { staggerContainer, item } from "../../lib/motion.js";
import { statusPillClass } from "../../lib/status.js";

export function DashboardSkeleton() {
  return (
    <div className="space-y-6" aria-hidden="true">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="skeleton-shimmer h-28 rounded-2xl border border-slate-200/80 dark:border-white/10" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="skeleton-shimmer h-56 rounded-2xl border border-slate-200/80 dark:border-white/10" />
        ))}
      </div>
    </div>
  );
}

export function DashboardError({ message, onRetry }) {
  return (
    <div role="alert" className="flex flex-col items-center justify-center rounded-2xl border border-rose-200 bg-rose-50/70 px-6 py-10 text-center dark:border-rose-500/30 dark:bg-rose-500/10">
      <CircleAlert className="h-7 w-7 text-rose-500" />
      <p className="mt-2 text-sm font-semibold text-rose-700 dark:text-rose-300">{message}</p>
      <p className="mt-1 text-xs text-rose-500/80 dark:text-rose-300/70">
        Nothing was changed. Check your connection and try again.
      </p>
      <Button variant="outline" size="sm" className="mt-4 cursor-pointer" onClick={onRetry}>
        <RefreshCw className="h-3.5 w-3.5" /> Retry
      </Button>
    </div>
  );
}

export function MetricGrid({ metrics = [] }) {
  return (
    <motion.div
      variants={staggerContainer(0.06)}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 gap-4 lg:grid-cols-4"
    >
      {metrics.map((metric) => (
        <motion.div key={metric.key} variants={item}>
          <Link
            to={metric.to || "/home/dashboard"}
            className="card-elevate group flex h-full flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-white/10 dark:bg-white/[0.04]"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {metric.label}
              </p>
              <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-300 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-teal-500 dark:text-slate-600" />
            </div>
            <p className="mt-3 font-display text-3xl font-bold tabular-nums text-slate-900 dark:text-slate-100">
              {Number(metric.value) || 0}
            </p>
            {metric.hint ? (
              <p className="mt-1 truncate text-[11px] text-slate-400 dark:text-slate-500">{metric.hint}</p>
            ) : null}
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
}

export function WorkQueue({ queues = [] }) {
  const allClear = queues.every((q) => Number(q.count) === 0);
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-white/10 dark:bg-white/[0.04]">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-base font-bold text-slate-900 dark:text-slate-100">Needs your attention</h2>
        {allClear ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
            <CheckCircle2 className="h-3 w-3" /> All clear
          </span>
        ) : null}
      </div>
      <ul className="mt-3 divide-y divide-slate-100 dark:divide-white/10">
        {queues.map((q) => (
          <li key={q.key}>
            <Link to={q.to || "/home/dashboard"} className="group flex items-center justify-between gap-3 py-3">
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-slate-700 group-hover:text-teal-700 dark:text-slate-200 dark:group-hover:text-teal-300">
                  {q.label}
                </span>
                <span className="mt-0.5 block truncate text-xs text-slate-400 dark:text-slate-500">{q.description}</span>
              </span>
              <span className={`flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-xs font-bold tabular-nums ${
                Number(q.count) > 0
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                  : "bg-slate-100 text-slate-400 dark:bg-white/10 dark:text-slate-500"
              }`}>
                {Number(q.count) || 0}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function UpcomingDeadlines({ items = [], staff = false }) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-white/10 dark:bg-white/[0.04]">
      <h2 className="flex items-center gap-2 font-display text-base font-bold text-slate-900 dark:text-slate-100">
        <CalendarClock className="h-4 w-4 text-teal-500" />
        {staff ? "Drives closing soon" : "Closing soon — not applied"}
      </h2>
      {items.length === 0 ? (
        <div className="mt-4 flex flex-col items-center py-6 text-center">
          <SearchX className="h-6 w-6 text-slate-300 dark:text-slate-600" />
          <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
            {staff ? "No drives close in the next two weeks." : "You're up to date on every closing drive."}
          </p>
        </div>
      ) : (
        <ul className="mt-3 space-y-2">
          {items.map((drive) => (
            <li key={drive._id}>
              <Link
                to={drive.to || "/home/dashboard/placements"}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 px-3 py-2.5 transition-colors hover:border-teal-200 hover:bg-teal-50/40 dark:border-white/10 dark:hover:border-teal-500/30 dark:hover:bg-teal-500/5"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                    {drive.job_title || "Placement drive"}
                  </span>
                  <span className="block truncate text-xs text-slate-400 dark:text-slate-500">
                    {drive.company_name || "Company"}
                    {drive.location ? ` · ${drive.location}` : ""}
                  </span>
                </span>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                  drive.daysLeft <= 3
                    ? "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300"
                    : "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300"
                }`}>
                  {drive.daysLeft <= 0 ? "Closes today" : `${drive.daysLeft}d left`}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function RecentApplications({ items = [], staff = false }) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-white/10 dark:bg-white/[0.04]">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-display text-base font-bold text-slate-900 dark:text-slate-100">
          <ClipboardList className="h-4 w-4 text-teal-500" />
          Recent applications
        </h2>
        <Link
          to={staff ? "/home/dashboard/manage-applications/applied-candidates" : "/home/dashboard/applied-jobs"}
          className="text-xs font-semibold text-teal-700 hover:underline dark:text-teal-300"
        >
          View all
        </Link>
      </div>
      {items.length === 0 ? (
        <div className="mt-4 flex flex-col items-center py-6 text-center">
          <ClipboardList className="h-6 w-6 text-slate-300 dark:text-slate-600" />
          <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
            {staff ? "No applications have been submitted yet." : "Apply to a drive to start your pipeline."}
          </p>
        </div>
      ) : (
        <ul className="mt-3 divide-y divide-slate-100 dark:divide-white/10">
          {items.map((app) => {
            const placement = app.placement || app.placement_id;
            return (
              <li key={app._id} className="flex items-center justify-between gap-3 py-2.5">
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                    {placement?.job_title || "Placement drive"}
                  </span>
                  <span className="block truncate text-xs text-slate-400 dark:text-slate-500">
                    {staff ? app.student?.name || "Candidate" : placement?.company_name || "Company"}
                  </span>
                </span>
                <span className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${statusPillClass(app.status)}`}>
                  {app.status}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

