import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, Menu, X, LogIn, ArrowRight, LayoutDashboard, Briefcase, FileText, User, MessageCircle } from "lucide-react";
// CONTEXT api
import { useUserData } from "../../context/AuthContext/AuthContext.jsx";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { accessToken, role } = useUserData();
  const [mobileOpen, setMobileOpen] = useState(false);
  const onLanding = location.pathname === "/";

  const go = (path) => {
    setMobileOpen(false);
    navigate(path);
  };

  const scrollTo = (id) => {
    setMobileOpen(false);
    if (!onLanding) {
      navigate("/");
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 250);
      return;
    }
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const appLinks = [
    ...(role === "student"
      ? [
          { label: "Jobs", icon: Briefcase, action: () => go("/home") },
          { label: "Applications", icon: FileText, action: () => go("/home/dashboard/applied-jobs") },
          { label: "Profile", icon: User, action: () => go("/home/profile") },
        ]
      : []),
    ...(role && role !== "student"
      ? [{ label: "Dashboard", icon: LayoutDashboard, action: () => go("/home/dashboard") }]
      : []),
    { label: "Chat", icon: MessageCircle, action: () => go("/home/message") },
  ];

  const landingLinks = [
    { label: "Platform", action: () => scrollTo("platform") },
    { label: "How it works", action: () => scrollTo("flow") },
    { label: "Companies", action: () => scrollTo("companies") },
    { label: "Success stories", action: () => scrollTo("stories") },
  ];

  const links = onLanding ? landingLinks : appLinks;

  return (
    <motion.header
      initial={{ y: -70, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-50 w-full"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="glass-dark flex w-full items-center justify-between rounded-2xl px-4 py-2.5 sm:px-5">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5" onClick={() => setMobileOpen(false)}>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 shadow-md shadow-indigo-500/30">
              <GraduationCap className="h-5 w-5 text-white" />
            </span>
            <span className="font-display text-lg font-bold tracking-tight text-white">
              Campus<span className="text-gradient-light">Place</span>
            </span>
          </Link>

          {/* Desktop links */}
          <nav className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <button
                key={l.label}
                onClick={l.action}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white cursor-pointer"
              >
                {l.icon ? <l.icon className="h-4 w-4" /> : null}
                {l.label}
              </button>
            ))}
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden items-center gap-2 md:flex">
            {accessToken ? (
              <Link
                to={role === "student" ? "/home" : "/home/dashboard"}
                className="group flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-500/30 transition-all hover:brightness-110"
              >
                <LayoutDashboard className="h-4 w-4" />
                {role === "student" ? "My Jobs" : "Dashboard"}
              </Link>
            ) : (
              <>
                <button
                  onClick={() => go("/login")}
                  className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:text-white cursor-pointer"
                >
                  <LogIn className="h-4 w-4" /> Log in
                </button>
                <button
                  onClick={() => go("/register")}
                  className="group flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-500/30 transition-all hover:shadow-lg hover:shadow-indigo-500/40 hover:brightness-110 cursor-pointer"
                >
                  Get started
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </button>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-200 transition-colors hover:bg-white/10 md:hidden cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="mx-4 md:hidden"
          >
            <div className="glass-dark rounded-2xl p-3">
              <nav className="flex flex-col">
                {links.map((l) => (
                  <button
                    key={l.label}
                    onClick={l.action}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-200 transition-colors hover:bg-white/5 cursor-pointer"
                  >
                    {l.icon ? <l.icon className="h-4 w-4 text-indigo-300" /> : null}
                    {l.label}
                  </button>
                ))}
              </nav>
              <div className="mt-2 border-t border-white/10 pt-3">
                {accessToken ? (
                  <button
                    onClick={() => go(role === "student" ? "/home" : "/home/dashboard")}
                    className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-2.5 text-sm font-semibold text-white cursor-pointer"
                  >
                    Open dashboard
                  </button>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => go("/login")}
                      className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-medium text-slate-200 cursor-pointer"
                    >
                      Log in
                    </button>
                    <button
                      onClick={() => go("/register")}
                      className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-2.5 text-sm font-semibold text-white cursor-pointer"
                    >
                      Get started
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Navbar;
