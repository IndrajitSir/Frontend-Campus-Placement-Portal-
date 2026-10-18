import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Briefcase,
  Building2,
  CalendarClock,
  CircleAlert,
  ClipboardList,
  Loader2,
  Search,
  SearchX,
  Users,
} from "lucide-react";
import { useUserData } from "../../context/AuthContext/AuthContext.jsx";
import { statusPillClass } from "../../lib/status.js";

const API_URL = import.meta.env.VITE_API_URL;

const TYPE_META = {
  placements: { label: "Drives", icon: Briefcase },
  students: { label: "Students", icon: Users },
  applications: { label: "Applications", icon: ClipboardList },
  users: { label: "Users", icon: Users },
};

const audienceTypes = (role) => {
  if (role === "student") return ["placements"];
  if (role === "admin" || role === "super_admin") {
    return ["placements", "students", "applications", "users"];
  }
  return ["placements", "students", "applications"];
};

function SearchPage() {
  const { accessToken, role } = useUserData();
  const [searchParams, setSearchParams] = useSearchParams();
  const [input, setInput] = useState(searchParams.get("q") || "");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const abortRef = useRef(null);

  const availableTypes = useMemo(() => audienceTypes(role), [role]);
  const selectedTypes = useMemo(() => {
    const raw = (searchParams.get("types") || "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const allowed = raw.filter((t) => availableTypes.includes(t));
    return allowed.length ? allowed : availableTypes;
  }, [searchParams, availableTypes]);
  const query = (searchParams.get("q") || "").trim();

  useEffect(() => {
    setInput(searchParams.get("q") || "");
  }, [searchParams]);

  useEffect(() => {
    if (!accessToken || query.length < 2) {
      setData(null);
      setError("");
      setLoading(false);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError("");

    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ q: query, types: selectedTypes.join(",") });
        const res = await fetch(`${API_URL}/api/v1/search?${params}`, {
          credentials: "include",
          signal: controller.signal,
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const response = await res.json();
        if (!res.ok || !response?.success) {
          throw new Error(response?.message || "Search failed");
        }
        setData(response.data);
      } catch (err) {
        if (err?.name === "AbortError") return;
        console.error("Search failed", err);
        setError(err?.message || "Search failed");
        setData(null);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 280);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, selectedTypes, accessToken]);

  const submit = (event) => {
    event.preventDefault();
    const next = new URLSearchParams(searchParams);
    const trimmed = input.trim();
    if (trimmed) next.set("q", trimmed);
    else next.delete("q");
    setSearchParams(next, { replace: true });
  };

  const toggleType = (type) => {
    const next = new URLSearchParams(searchParams);
    const current = new Set(selectedTypes);
    if (current.has(type)) current.delete(type);
    else current.add(type);
    if (current.size === 0) return; // keep at least one result group
    next.set("types", [...current].join(","));
    setSearchParams(next, { replace: true });
  };

  const results = data?.results || {};
  const total = data?.counts ? Object.values(data.counts).reduce((a, b) => a + b, 0) : 0;

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-300">
          <Search className="h-5 w-5" />
        </span>
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Search</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Find placement drives{role !== "student" ? ", students and applications" : ""} across CPRS.
          </p>
        </div>
      </div>

      <form onSubmit={submit} role="search" className="mt-6">
        <label htmlFor="global-search" className="sr-only">
          Search placements{role !== "student" ? ", students and applications" : ""}
        </label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            id="global-search"
            type="search"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search by company, role, candidate name or email…"
            autoFocus
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-24 text-sm text-slate-900 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-teal-400 focus:ring-4 focus:ring-teal-500/15 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-700 cursor-pointer dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
          >
            Search
          </button>
        </div>
      </form>

      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filter result types">
        {availableTypes.map((type) => {
          const active = selectedTypes.includes(type);
          const Icon = TYPE_META[type].icon;
          return (
            <button
              key={type}
              type="button"
              aria-pressed={active}
              onClick={() => toggleType(type)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                active
                  ? "border-teal-600 bg-teal-600 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-teal-300 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {TYPE_META[type].label}
            </button>
          );
        })}
      </div>

      <div aria-live="polite" className="mt-6">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin" /> Searching…
          </div>
        ) : error ? (
          <div role="alert" className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
            <CircleAlert className="h-4 w-4" /> {error}
          </div>
        ) : !query || query.length < 2 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300/80 px-6 py-14 text-center dark:border-white/10">
            <SearchX className="h-7 w-7 text-slate-300 dark:text-slate-600" />
            <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
              Start typing to search
            </p>
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Enter at least 2 characters.</p>
          </div>
        ) : total === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300/80 px-6 py-14 text-center dark:border-white/10">
            <SearchX className="h-7 w-7 text-slate-300 dark:text-slate-600" />
            <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
              No matches for “{query}”
            </p>
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
              Try a company name, job title or a shorter phrase.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
              {total} result{total === 1 ? "" : "s"} for “{query}”
            </p>

            {results.placements?.length > 0 && (
              <section aria-labelledby="results-placements">
                <h2 id="results-placements" className="font-display text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Drives
                </h2>
                <ul className="mt-2 divide-y divide-slate-100 rounded-2xl border border-slate-200/80 bg-white px-4 dark:divide-white/10 dark:border-white/10 dark:bg-white/[0.04]">
                  {results.placements.map((placement) => (
                    <li key={placement._id} className="py-3">
                      <Link to="/home/dashboard/placements" className="group flex items-start justify-between gap-3">
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold text-slate-800 group-hover:text-teal-700 dark:text-slate-100 dark:group-hover:text-teal-300">
                            {placement.job_title}
                          </span>
                          <span className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                            <span className="inline-flex items-center gap-1"><Building2 className="h-3 w-3" /> {placement.company_name}</span>
                            {placement.location ? <span>{placement.location}</span> : null}
                            {placement.last_date ? (
                              <span className="inline-flex items-center gap-1">
                                <CalendarClock className="h-3 w-3" />
                                {new Date(placement.last_date).toLocaleDateString()}
                              </span>
                            ) : null}
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {results.students?.length > 0 && (
              <section aria-labelledby="results-students">
                <h2 id="results-students" className="font-display text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Students
                </h2>
                <ul className="mt-2 divide-y divide-slate-100 rounded-2xl border border-slate-200/80 bg-white px-4 dark:divide-white/10 dark:border-white/10 dark:bg-white/[0.04]">
                  {results.students.map((student) => (
                    <li key={student._id} className="flex items-center justify-between gap-3 py-3">
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{student.name}</span>
                        <span className="block truncate text-xs text-slate-400 dark:text-slate-500">
                          {student.email}
                          {student.department ? ` · ${student.department}` : ""}
                          {student.cgpa ? ` · CGPA ${student.cgpa}` : ""}
                        </span>
                      </span>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        student.approved
                          ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300"
                          : "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300"
                      }`}>
                        {student.approved ? "Approved" : "Pending"}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {results.applications?.length > 0 && (
              <section aria-labelledby="results-applications">
                <h2 id="results-applications" className="font-display text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Applications
                </h2>
                <ul className="mt-2 divide-y divide-slate-100 rounded-2xl border border-slate-200/80 bg-white px-4 dark:divide-white/10 dark:border-white/10 dark:bg-white/[0.04]">
                  {results.applications.map((app) => (
                    <li key={app._id} className="flex items-center justify-between gap-3 py-3">
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                          {app.user_id?.name || "Candidate"}
                        </span>
                        <span className="block truncate text-xs text-slate-400 dark:text-slate-500">
                          {app.placement_id?.company_name || "Company"} · {app.placement_id?.job_title || "Role"}
                        </span>
                      </span>
                      <span className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${statusPillClass(app.status)}`}>
                        {app.status}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {results.users?.length > 0 && (
              <section aria-labelledby="results-users">
                <h2 id="results-users" className="font-display text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Users
                </h2>
                <ul className="mt-2 divide-y divide-slate-100 rounded-2xl border border-slate-200/80 bg-white px-4 dark:divide-white/10 dark:border-white/10 dark:bg-white/[0.04]">
                  {results.users.map((user) => (
                    <li key={user._id} className="flex items-center justify-between gap-3 py-3">
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{user.name}</span>
                        <span className="block truncate text-xs text-slate-400 dark:text-slate-500">{user.email}</span>
                      </span>
                      <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold capitalize text-slate-600 dark:bg-white/10 dark:text-slate-300">
                        {String(user.role || "").replace("_", " ")}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchPage;
