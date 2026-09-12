import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
// Icons
import {
  LayoutDashboard,
  Briefcase,
  Users,
  UserCheck,
  CheckCircle2,
  XCircle,
  ClipboardList,
  Settings2,
  MonitorCog,
  UserCircle2,
  GraduationCap,
  ChevronDown
} from "lucide-react";
import "./sidebar.css";
// CONTEXT api
import { useUserData } from "../../context/AuthContext/AuthContext.jsx";

const SidebarSection = ({ title, items, defaultOpen = true }) => {
  const location = useLocation();

  // Check if any item in this section is currently active
  const isAnyChildActive = items.some((item) => {
    if (item.exact) {
      return location.pathname === item.to;
    }
    return location.pathname.startsWith(item.to);
  });

  const [isOpen, setIsOpen] = useState(defaultOpen || isAnyChildActive);

  useEffect(() => {
    if (isAnyChildActive) {
      setIsOpen(true);
    }
  }, [isAnyChildActive, location.pathname]);

  const linkClass = ({ isActive }) =>
    isActive ? "sidebar-link active-link" : "sidebar-link";

  return (
    <div className="mb-2">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="sidebar-section-header group flex w-full items-center justify-between px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 transition-all hover:text-indigo-600 hover:bg-slate-100/70 rounded-xl cursor-pointer"
      >
        <span className="flex items-center gap-1.5">
          {title}
          <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-slate-100 px-1 text-[10px] font-semibold text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600">
            {items.length}
          </span>
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 group-hover:text-indigo-600 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden flex flex-col gap-1 mt-1 pl-1"
          >
            {items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                className={linkClass}
              >
                <item.icon className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Sidebar = () => {
  const { role } = useUserData();

  const overviewItems = role !== "student" ? [
    { label: "Dashboard", icon: LayoutDashboard, to: "/home/dashboard", exact: true },
    { label: "Placement Drives", icon: Briefcase, to: "/home/dashboard/placements" },
    { label: "Students", icon: Users, to: "/home/dashboard/students" },
  ] : [
    { label: "Browse Jobs", icon: Briefcase, to: "/home/dashboard/placements" },
    { label: "My Applications", icon: ClipboardList, to: "/home/dashboard/applied-jobs" },
    { label: "My Profile", icon: UserCircle2, to: "/home/profile" },
  ];

  const recruitmentItems = [
    { label: "Applied", icon: ClipboardList, to: "/home/dashboard/manage-applications/applied-candidates" },
    { label: "Shortlisted", icon: UserCheck, to: "/home/dashboard/manage-applications/shortlisted-candidates" },
    { label: "Selected", icon: CheckCircle2, to: "/home/dashboard/manage-applications/selected-candidates" },
    { label: "Rejected", icon: XCircle, to: "/home/dashboard/manage-applications/rejected-candidates" },
  ];

  const managementItems = [
    { label: "Manage Users", icon: UserCircle2, to: "/home/dashboard/manage-users" },
    { label: "Interview Setup", icon: Settings2, to: "/home/dashboard/interview-setup" },
    { label: "Monitor System", icon: MonitorCog, to: "/home/dashboard/monitor-system" },
  ];

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

      <div className="flex-1 space-y-1">
        <SidebarSection title="Overview" items={overviewItems} defaultOpen={true} />

        {role !== "student" && (
          <>
            <SidebarSection title="Recruitment" items={recruitmentItems} defaultOpen={true} />
            <SidebarSection title="Management" items={managementItems} defaultOpen={true} />
          </>
        )}
      </div>
    </nav>
  );
};

export default Sidebar;
