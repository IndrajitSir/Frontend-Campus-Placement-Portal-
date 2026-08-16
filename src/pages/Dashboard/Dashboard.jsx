import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, GraduationCap } from "lucide-react";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "../../functionality/ProtectedRoutes";
import Sidebar from "../../Components/Sidebar/Sidebar.jsx";

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex min-h-[calc(100vh-5.5rem)] w-full">
      {/* Desktop sidebar */}
      <aside className="sticky top-24 hidden h-[calc(100vh-7rem)] w-64 shrink-0 lg:block">
        <div className="glass h-full rounded-2xl">
          <Sidebar />
        </div>
      </aside>

      {/* Mobile sidebar drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl lg:hidden"
            >
              <button
                onClick={() => setSidebarOpen(false)}
                className="absolute right-3 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>
              <Sidebar />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="min-w-0 flex-1 lg:pl-6">
        <div className="mb-5 flex items-center justify-between lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm cursor-pointer"
          >
            <Menu className="h-4 w-4" />
            Menu
          </button>
          <span className="flex items-center gap-2 text-sm font-semibold text-slate-500">
            <GraduationCap className="h-4 w-4 text-indigo-500" /> CampusPlace
          </span>
        </div>

        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </ErrorBoundary>
      </main>
    </div>
  );
};

export default Dashboard;
