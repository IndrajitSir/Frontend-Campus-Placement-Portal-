import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
// Icons
import { Users, MonitorCog, Briefcase, ClipboardList, UserCog, Settings2, LogOut, LayoutDashboard } from "lucide-react";
// Components
import Student_Dashboard from "../../Components/Dashboards/Student_dashboard/Student_Dashboard.jsx";
import Admin_Dashboard from "../../Components/Dashboards/Admin_dashboard/Admin_Dashboard.jsx";
import PlacementStaff_Dashboard from "../../Components/Dashboards/PlacementStaff_dashboard/PlacementStaff_Dashboard.jsx";
// Dialog
import Logout_Dialog from "../../Dialog/Logout_dialog/Logout_Dialog.jsx";
// CONTEXT api
import { useUserData } from "../../context/AuthContext/AuthContext.jsx";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "../../functionality/ProtectedRoutes";

const roleLabels = {
  super_admin: "Super Admin",
  admin: "Administrator",
  placement_staff: "Placement Officer",
  student: "Student",
};

function DashBoardContent() {
  const { loading, role, userInfo } = useUserData();
  const [logoutDialog, setLogoutDialog] = useState(false);
  const navigate = useNavigate();

  if (loading || !role) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-64 animate-pulse rounded-lg bg-slate-200" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-200/70" />
          ))}
        </div>
      </div>
    );
  }

  const quickActions =
    role !== "student"
      ? [
          { icon: Users, label: "Students", desc: "View & manage students", to: "/home/dashboard/students" },
          { icon: ClipboardList, label: "Applications", desc: "Review candidates", to: "/home/dashboard/manage-applications/applied-candidates" },
          { icon: Briefcase, label: "Placement Drives", desc: "Create & manage jobs", to: "/home/placements" },
          { icon: MonitorCog, label: "System Status", desc: "Monitor the platform", to: "/home/dashboard/monitor-system" },
        ]
      : [
          { icon: Briefcase, label: "Browse Jobs", desc: "Explore open drives", to: "/home" },
          { icon: ClipboardList, label: "My Applications", desc: "Track your progress", to: "/home/dashboard/applied-jobs" },
          { icon: UserCog, label: "My Profile", desc: "Resume, skills & more", to: "/home/profile" },
          { icon: Settings2, label: "Interview Setup", desc: "Prepare for rounds", to: "/home/dashboard/interview-setup" },
        ];

  const name = userInfo?.name || userInfo?.user?.name || "";

  return (
    <div>
      {/* Page header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-6 sm:p-8">
        <div className="absolute inset-0 bg-grid-dark opacity-30" aria-hidden="true" />
        <div aria-hidden="true" className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-indigo-200">
              <LayoutDashboard className="h-3.5 w-3.5" /> Dashboard
            </p>
            <h1 className="mt-1.5 font-display text-2xl font-bold text-white sm:text-3xl">
              {name ? <>Welcome back, {name.split(" ")[0]}</> : "Welcome back"}
            </h1>
            <p className="mt-1 text-sm text-indigo-100/90">
              {roleLabels[role] || role} — here's what's happening with campus placements today.
            </p>
          </div>
          <button
            onClick={() => setLogoutDialog(true)}
            className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur transition-all hover:bg-white/20 cursor-pointer"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickActions.map((a, i) => (
          <motion.button
            key={a.label}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
            onClick={() => navigate(a.to)}
            className="card-elevate group flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 text-left cursor-pointer"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/10 to-fuchsia-500/10 text-indigo-600 ring-1 ring-indigo-100 transition-all duration-300 group-hover:from-indigo-500 group-hover:to-violet-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-indigo-500/30">
              <a.icon className="h-5 w-5" />
            </span>
            <span>
              <span className="block font-display text-sm font-semibold text-slate-900">{a.label}</span>
              <span className="mt-0.5 block text-xs text-slate-500">{a.desc}</span>
            </span>
          </motion.button>
        ))}
      </div>

      {/* Role-specific dashboards */}
      <div className="mt-8">
        {role === "placement_staff" && (
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <PlacementStaff_Dashboard />
          </ErrorBoundary>
        )}
        {(role === "admin" || role === "super_admin") && (
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <Admin_Dashboard />
          </ErrorBoundary>
        )}
        {role === "student" && (
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <Student_Dashboard />
          </ErrorBoundary>
        )}
      </div>

      <Logout_Dialog logoutDialog={logoutDialog} setLogoutDialog={setLogoutDialog} />
    </div>
  );
}

export default DashBoardContent;
