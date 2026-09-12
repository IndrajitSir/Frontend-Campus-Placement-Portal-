import React from 'react'
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, UserRound, ArrowRight } from 'lucide-react';
// Shared motion presets
import { fadeUp, staggerContainer, item, EASE } from '../../../lib/motion';
// Shadcn Components
import { Button } from '../../ui/button';

// Small inline count-up hook (rAF based) for animated numbers.
function useCountUp(target, duration = 900) {
    const [value, setValue] = React.useState(0);
    React.useEffect(() => {
        const n = Number(target) || 0;
        if (n === 0) { setValue(0); return; }
        let raf;
        const start = performance.now();
        const tick = (now) => {
            const t = Math.min((now - start) / duration, 1);
            // ease-out cubic
            setValue(Math.round(n * (1 - Math.pow(1 - t, 3))));
            if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [target, duration]);
    return value;
}

function StatCard({ label, value, accent, icon: Icon }) {
    const count = useCountUp(value);
    return (
        <motion.div
            variants={item}
            whileTap={{ scale: 0.97 }}
            className="card-elevate group rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-white/10 dark:bg-white/[0.04]"
        >
            <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</p>
                <span className={`flex h-9 w-9 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110 ${accent}`}>
                    <Icon className="h-4 w-4" />
                </span>
            </div>
            <p className="mt-3 font-display text-3xl font-bold text-slate-900 tabular-nums dark:text-slate-100">{count}</p>
        </motion.div>
    );
}

function Student_Dashboard({ stats }) { // un-used
    const navigate = useNavigate();
    const s = stats || { applied: 0, shortlisted: 0, selected: 0, rejected: 0 };

    const handleClick = () => {
        navigate("/home/dashboard/applied-jobs");
    }
    const handleProfile = () => {
        navigate("/home/dashboard/profile");
    }
    return (
        <motion.div
            variants={staggerContainer(0.08)}
            initial="hidden"
            animate="visible"
            className="space-y-8"
        >
            {/* Stat / summary cards */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatCard label="Applied" value={s.applied} icon={FileText} accent="bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300" />
                <StatCard label="Shortlisted" value={s.shortlisted} icon={FileText} accent="bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300" />
                <StatCard label="Selected" value={s.selected} icon={FileText} accent="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300" />
                <StatCard label="Rejected" value={s.rejected} icon={FileText} accent="bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-300" />
            </div>

            {/* Quick actions */}
            <motion.div
                variants={item}
                className="grid grid-cols-1 gap-6 md:grid-cols-2"
            >
                <motion.div
                    whileTap={{ scale: 0.97 }}
                    className="card-elevate group rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-white/10 dark:bg-white/[0.04]"
                >
                    <h3 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">Application Status</h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Track your job application progress here.</p>
                    <Button variant="gradient" className="group/btn mt-4 cursor-pointer" onClick={handleClick}>
                        View Applications
                        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
                    </Button>
                </motion.div>

                <motion.div
                    whileTap={{ scale: 0.97 }}
                    className="card-elevate group rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-white/10 dark:bg-white/[0.04]"
                >
                    <h3 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">Profile</h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Keep your details up to date.</p>
                    <Button variant="gradient" className="group/btn mt-4 cursor-pointer" onClick={handleProfile}>
                        Profile page
                        <UserRound className="h-4 w-4 transition-transform duration-200 group-hover/btn:scale-110" />
                    </Button>
                </motion.div>
            </motion.div>

            {/* Empty state for recent applications */}
            <motion.div
                variants={fadeUp}
                className="rounded-2xl border border-dashed border-slate-300/80 bg-slate-50/60 p-10 text-center dark:border-white/10 dark:bg-white/[0.02]"
            >
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/10 to-fuchsia-500/10 text-indigo-500 dark:text-indigo-300">
                    <FileText className="h-6 w-6" />
                </span>
                <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-200">No applications yet</p>
                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Your recent applications will appear here once you start applying.</p>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.4, ease: EASE }}
                    className="mt-4 text-xs text-slate-400 dark:text-slate-500"
                >
                    Tip: a complete profile increases your chances of getting shortlisted.
                </motion.p>
            </motion.div>
        </motion.div>
    );
}

export default Student_Dashboard
