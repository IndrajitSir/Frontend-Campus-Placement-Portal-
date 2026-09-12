import React from 'react';
import { Calendar, Filter } from 'lucide-react';

const MONTHS = [
    { value: 'all', label: 'All Months' },
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
];

const YEARS = [
    { value: 'all', label: 'All Years' },
    { value: '2026', label: '2026' },
    { value: '2025', label: '2025' },
    { value: '2024', label: '2024' },
    { value: '2023', label: '2023' },
];

export default function CardFilterHeader({ title, year, setYear, month, setMonth }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4 border-b border-slate-100 pb-3">
            <h2 className="text-lg font-semibold text-slate-800 tracking-tight leading-tight">{title}</h2>
            <div className="flex flex-nowrap items-center gap-2 shrink-0">
                <div className="relative flex items-center">
                    <Calendar className="absolute left-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                    <select
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                        className="h-8 rounded-xl border border-slate-200 bg-slate-50/70 pl-8 pr-7 text-xs font-medium text-slate-700 shadow-sm transition hover:border-indigo-300 focus:border-indigo-500 focus:bg-white focus:outline-none cursor-pointer"
                    >
                        {MONTHS.map((m) => (
                            <option key={m.value} value={m.value}>
                                {m.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="relative flex items-center">
                    <Filter className="absolute left-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                    <select
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        className="h-8 rounded-xl border border-slate-200 bg-slate-50/70 pl-8 pr-7 text-xs font-medium text-slate-700 shadow-sm transition hover:border-indigo-300 focus:border-indigo-500 focus:bg-white focus:outline-none cursor-pointer"
                    >
                        {YEARS.map((y) => (
                            <option key={y.value} value={y.value}>
                                {y.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
}
