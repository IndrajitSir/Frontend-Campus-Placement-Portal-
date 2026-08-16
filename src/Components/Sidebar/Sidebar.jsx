import { NavLink } from "react-router-dom";
import "./sidebar.css";
// Icons
import { LayoutDashboard, Briefcase, Users, UserCheck, CheckCircle2, XCircle, ClipboardList, Settings2, MonitorCog, UserCircle2, GraduationCap } from "lucide-react";
// CONTEXT api
import { useUserData } from "../../context/AuthContext/AuthContext.jsx";

const Sidebar = () => {
  const { role } = useUserData();

  const linkClass = ({ isActive }) => (isActive ? "sidebar-link active-link" : "sidebar-link");

  return (
    <nav className="flex h-full flex-col overflow-y-auto px-3 py-5" aria-label="Dashboard navigation">
      <NavLink to="/home/dashboard" className="mb-6 flex items-center gap-2.5 px-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 shadow-md shadow-indigo-500/30">
          <GraduationCap className="h-5 w-5 text-white" />
        </span>
        <span className="font-display text-base font-bold tracking-tight text-slate-900">
          Campus<span className="text-gradient">Place</span>
        </span>
      </NavLink>

      {role !== "student" && (
        <>
          <p className="sidebar-section-title">Overview</p>
          <NavLink to="/home/dashboard" end className={linkClass}>
            <LayoutDashboard className="h-4 w-4" /> Dashboard
          </NavLink>
          <NavLink to="/home/placements" className={linkClass}>
            <Briefcase className="h-4 w-4" /> Placement Drives
          </NavLink>
          <NavLink to="/home/dashboard/students" className={linkClass}>
            <Users className="h-4 w-4" /> Students
          </NavLink>

          <p className="sidebar-section-title">Recruitment</p>
          <NavLink to="/home/dashboard/manage-applications/applied-candidates" className={linkClass}>
            <ClipboardList className="h-4 w-4" /> Applied
          </NavLink>
          <NavLink to="/home/dashboard/manage-applications/shortlisted-candidates" className={linkClass}>
            <UserCheck className="h-4 w-4" /> Shortlisted
          </NavLink>
          <NavLink to="/home/dashboard/manage-applications/selected-candidates" className={linkClass}>
            <CheckCircle2 className="h-4 w-4" /> Selected
          </NavLink>
          <NavLink to="/home/dashboard/manage-applications/rejected-candidates" className={linkClass}>
            <XCircle className="h-4 w-4" /> Rejected
          </NavLink>

          <p className="sidebar-section-title">Management</p>
          <NavLink to="/home/dashboard/manage-users" className={linkClass}>
            <UserCircle2 className="h-4 w-4" /> Manage Users
          </NavLink>
          <NavLink to="/home/dashboard/interview-setup" className={linkClass}>
            <Settings2 className="h-4 w-4" /> Interview Setup
          </NavLink>
          <NavLink to="/home/dashboard/monitor-system" className={linkClass}>
            <MonitorCog className="h-4 w-4" /> Monitor System
          </NavLink>
        </>
      )}

      {role === "student" && (
        <>
          <p className="sidebar-section-title">Overview</p>
          <NavLink to="/home" className={linkClass}>
            <Briefcase className="h-4 w-4" /> Browse Jobs
          </NavLink>
          <NavLink to="/home/dashboard/applied-jobs" className={linkClass}>
            <ClipboardList className="h-4 w-4" /> My Applications
          </NavLink>
          <NavLink to="/home/profile" className={linkClass}>
            <UserCircle2 className="h-4 w-4" /> My Profile
          </NavLink>
        </>
      )}
    </nav>
  );
};

export default Sidebar;
