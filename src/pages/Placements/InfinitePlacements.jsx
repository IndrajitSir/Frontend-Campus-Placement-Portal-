import React, { useEffect, useMemo, useRef, useState } from 'react';
import { toast, ToastContainer } from "react-toastify";
import { useInView } from 'react-intersection-observer';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import CircleLoader from '../../Components/Loader/CircleLoader';
import PlacementCard from '../../Components/Placements/PlacementCard.jsx';
// Shadcn Components
import { Label } from '../../Components/ui/label';
import { Input } from '../../Components/ui/input';
import { Card, CardContent } from '../../Components/ui/card';
import { Button } from "../../Components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogDescription } from "../../Components/ui/dialog";
// Components
import PlacementSearch from "./PlacementSearch/PlacementSearch.jsx";
// Dialog Boxes
import CreateJobPost from "../../Dialog/Create_JobPost/CreateJobPost.jsx";
import Missing_Details_Form_Dialog from "../../Dialog/Student_Missing_Details_Form/Missing_Details_Form_Dialog.jsx";
import DeletePlacementPostDialog from "../../Dialog/DeletePlacement_dialog/DeletePlacementDialog";
// CONTEXT api
import { useUserData } from "../../context/AuthContext/AuthContext.jsx";
// Motion presets
import { staggerContainer, item, EASE } from "../../lib/motion";
// icons
import { ArrowLeftCircleIcon, LoaderCircle, Search, MapPin, Clock, Bookmark, X, SlidersHorizontal, Inbox } from "lucide-react";
// Environment variable
const API_URL = import.meta.env.VITE_API_URL;

// ---- deadline helpers (shared logic with the card badges) ----
const daysUntil = (date) => {
  if (!date) return null;
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;
  return (d.getTime() - Date.now()) / 86400000;
};
const isClosingSoon = (date) => {
  const days = daysUntil(date);
  return days !== null && days >= 0 && days <= 7;
};

// Skeleton card matching PlacementCard's shape, using .skeleton-shimmer blocks.
const SkeletonCard = () => (
  <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white dark:border-white/10 dark:bg-white/[0.04]">
    <div className="skeleton-shimmer h-1 w-full" />
    <div className="flex flex-col p-6">
      <div className="flex items-start gap-4">
        <div className="skeleton-shimmer h-12 w-12 rounded-xl" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="skeleton-shimmer h-3 w-24 rounded-full" />
          <div className="skeleton-shimmer h-5 w-40 rounded-md" />
        </div>
      </div>
      <div className="mt-5 space-y-2.5">
        <div className="skeleton-shimmer h-3.5 w-3/4 rounded-md" />
        <div className="skeleton-shimmer h-3.5 w-2/3 rounded-md" />
        <div className="skeleton-shimmer h-3.5 w-1/2 rounded-md" />
      </div>
      <div className="skeleton-shimmer mt-4 h-3.5 w-full rounded-md" />
      <div className="skeleton-shimmer mt-6 h-9 w-full rounded-md" />
    </div>
  </div>
);

const InfinitePlacements = () => {
  const [placements, setPlacements] = useState([]);
  const { accessToken, role } = useUserData();
  const [applyPlacementDialog, setApplyPlacementDialog] = useState(false);
  const [appliedConfirmationDialog, setAppliedConfirmationDialog] = useState(false);
  const [placementInfoDialog, setPlacementInfoDialog] = useState(false);
  const [createPostDialog, setCreatePostDialog] = useState(false);
  const [missingDetailsFillFormDialog, setMissingDetailsFillFormDialog] = useState(true);
  const [showSearchResult, setShowSearchResult] = useState(false);
  const [postDeleteDialog, setPostDeleteDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [placementInfo, setPlacementInfo] = useState({});
  const [filteredPlacement, setFilteredPlacement] = useState({});
  const [postID, setPostID] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [editedInfo, setEditedInfo] = useState(placementInfo);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { ref, inView } = useInView();
  // `loading` drives the delete-dialog spinner; `fetching` drives the page loader.
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [removingPostID, setRemovingPostID] = useState(null);

  // ---- client-side filters (compose over loaded data only) ----
  const [filterText, setFilterText] = useState("");
  const [filterLocation, setFilterLocation] = useState("all");
  const [closingSoonOnly, setClosingSoonOnly] = useState(false);
  const [savedOnly, setSavedOnly] = useState(false);

  // ---- bookmarks (silent failures; never break the browse experience) ----
  const [savedIds, setSavedIds] = useState(() => new Set());
  const [savedPlacements, setSavedPlacements] = useState([]);
  const [savedLoading, setSavedLoading] = useState(false);
  const savedFetchedRef = useRef(false);

  const fetchBookmarks = async () => {
    try {
      setSavedLoading(true);
      const res = await fetch(`${API_URL}/api/v2/bookmarks`, {
        method: "GET",
        credentials: "include",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
      });
      const response = await res.json();
      if (response?.success && response?.data) {
        const ids = Array.isArray(response.data.placementIds) ? response.data.placementIds : [];
        const docs = Array.isArray(response.data.placements) ? response.data.placements : [];
        setSavedIds(new Set(ids.map((id) => String(id))));
        setSavedPlacements((prev) => {
          const byId = new Map((Array.isArray(prev) ? prev : []).map((p) => [String(p?._id), p]));
          docs.forEach((p) => { if (p?._id) byId.set(String(p._id), p); });
          return Array.from(byId.values());
        });
      }
    } catch (error) {
      console.error("Failed to fetch bookmarks", error);
    } finally {
      setSavedLoading(false);
    }
  };

  // Hydrate bookmark state on mount so the card icons render correctly.
  useEffect(() => {
    if (!accessToken || savedFetchedRef.current) return;
    savedFetchedRef.current = true;
    fetchBookmarks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  // Re-fetch when the "Saved" toggle is switched on (per contract).
  useEffect(() => {
    if (savedOnly && accessToken) fetchBookmarks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedOnly, accessToken]);

  // Optimistic bookmark toggle — API failures roll back silently.
  const handleToggleBookmark = async (placement) => {
    const id = placement?._id ? String(placement._id) : "";
    if (!id || !accessToken) return;
    const wasSaved = savedIds.has(id);
    // Optimistic update
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (wasSaved) next.delete(id);
      else next.add(id);
      return next;
    });
    if (!wasSaved) {
      setSavedPlacements((prev) =>
        prev.some((p) => String(p?._id) === id) ? prev : [...prev, placement]
      );
    }
    try {
      const res = await fetch(`${API_URL}/api/v2/bookmarks/${id}`, {
        method: wasSaved ? "DELETE" : "POST",
        credentials: "include",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
      });
      if (!res.ok) throw new Error(`Bookmark request failed with status ${res.status}`);
    } catch (error) {
      // Roll back the optimistic update; never break the browse experience.
      console.error("Bookmark toggle failed", error);
      setSavedIds((prev) => {
        const next = new Set(prev);
        if (wasSaved) next.add(id);
        else next.delete(id);
        return next;
      });
      if (!wasSaved) {
        setSavedPlacements((prev) => prev.filter((p) => String(p?._id) !== id));
      }
    }
  };

  useEffect(() => {
    let cancelled = false;
    const fetchPlacements = async () => {
      try {
        setFetching(true);
        // v2 returns a paginated envelope: { data: { data: [...placements] } }
        const res = await axios.get(`${API_URL}/api/v2/placements?page=${page}&limit=10`, {
          withCredentials: true
        });
        const batch = Array.isArray(res?.data?.data?.data) ? res.data.data.data : [];
        if (batch.length === 0) {
          setHasMore(false);
          return;
        }
        // De-dupe by _id so React StrictMode / repeated triggers can never
        // append the same placement twice.
        setPlacements((prev) => {
          const existing = new Set((Array.isArray(prev) ? prev : []).map((p) => p?._id));
          const fresh = batch.filter((p) => p?._id && !existing.has(p._id));
          return [...(Array.isArray(prev) ? prev : []), ...fresh];
        });
      } catch (err) {
        if (!cancelled) console.error("Failed to fetch placements", err);
      } finally {
        if (!cancelled) setFetching(false);
      }
    };

    if (hasMore) fetchPlacements();
    return () => {
      cancelled = true;
    };
  }, [page, hasMore]);

  useEffect(() => {
    if (inView && hasMore) {
      setPage((prev) => prev + 1);
    }
  }, [inView, hasMore]);

  if (!accessToken || !role) return <CircleLoader />;

  const cleanSearchedData = () => {
    setFilteredPlacement({});
    setSearchQuery("");
    setShowSearchResult(false);
  }

  const handleEditChange = (e) => {
    setEditedInfo({ ...editedInfo, [e.target.name]: e.target.value });
  };

  const saveChanges = () => {
    setPlacementInfo(editedInfo);
    setEditMode(false);
  };

  const applyForPlacement = async () => {
    const res = await fetch(`${API_URL}/api/v1/applications/${postID}`, {
      method: "POST",
      credentials: "include",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
    })
    const response = await res.json();
    if (!response.success) {
      toast.warning(response.message)
    }
    if (response.success) {
      setAppliedConfirmationDialog(true);
    }
  }

  const handleUpdate = async () => {
    setEditMode(false);
    try {
      const { _id, company_name, job_title, description, eligibility, location, last_date } = editedInfo;
      const payload = { company_name, job_title, description, eligibility, location, last_date };
      const res = await fetch(`${API_URL}/api/v1/placements/${_id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(payload)
      });
      const response = await res.json();
      if (!res.ok) {
        toast.error(response.message || "Update failed");
        return;
      }
      toast.success(response.message || "Updated successfully!");
      setPlacementInfoDialog(false);
    } catch (error) {
      toast.error("Failed to update placement");
      console.error(error);
    }
  }

  const searchQueryFromChild = (query) => {
    if (typeof query === "string") { setSearchQuery(query); }
    setFilteredPlacement(query);
    setShowSearchResult(true);
  }
  const handlePostDeleted = (deletedID) => {
    setRemovingPostID(deletedID);
    setTimeout(() => {
      setPlacements((prevPlacements) => {
        return prevPlacements.filter((placement) => placement?._id !== deletedID);
      });
      setRemovingPostID(null);
      setLoading(false);
      setPostDeleteDialog(false);
    }, 300);
  }

  // ---- filter derivation (purely client-side over loaded + saved data) ----
  const locations = useMemo(() => {
    const set = new Set();
    (Array.isArray(placements) ? placements : []).forEach((p) => {
      const loc = (p?.location || "").trim();
      if (loc) set.add(loc);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [placements]);

  const visiblePlacements = useMemo(() => {
    let base;
    if (savedOnly) {
      // Merge saved (populated) docs with loaded placements that are bookmarked.
      const loadedIds = new Set((Array.isArray(placements) ? placements : []).map((p) => String(p?._id)));
      const loadedSaved = (Array.isArray(placements) ? placements : []).filter((p) => savedIds.has(String(p?._id)));
      const extraSaved = (Array.isArray(savedPlacements) ? savedPlacements : []).filter(
        (p) => p?._id && !loadedIds.has(String(p._id))
      );
      base = [...loadedSaved, ...extraSaved];
    } else {
      base = Array.isArray(placements) ? placements : [];
    }

    const q = filterText.trim().toLowerCase();
    return base.filter((p) => {
      if (!p?._id) return false;
      if (q) {
        const company = String(p.company_name || "").toLowerCase();
        const title = String(p.job_title || "").toLowerCase();
        if (!company.includes(q) && !title.includes(q)) return false;
      }
      if (filterLocation !== "all" && (p.location || "").trim() !== filterLocation) return false;
      if (closingSoonOnly && !isClosingSoon(p.last_date)) return false;
      return true;
    });
  }, [placements, savedPlacements, savedIds, savedOnly, filterText, filterLocation, closingSoonOnly]);

  const activeFilterCount =
    (filterText.trim() ? 1 : 0) +
    (filterLocation !== "all" ? 1 : 0) +
    (closingSoonOnly ? 1 : 0) +
    (savedOnly ? 1 : 0);

  const clearAllFilters = () => {
    setFilterText("");
    setFilterLocation("all");
    setClosingSoonOnly(false);
    setSavedOnly(false);
  };

  const renderCard = (placement, extraProps = {}) => (
    <motion.div key={placement._id} variants={item} layout>
      <PlacementCard
        placement={placement}
        role={role}
        removing={removingPostID === placement?._id}
        bookmarked={savedIds.has(String(placement?._id))}
        onToggleBookmark={handleToggleBookmark}
        onApply={() => { setApplyPlacementDialog(true); setPostID(placement?._id); }}
        onUpdate={() => { setPlacementInfo(placement); setEditedInfo(placement); setPlacementInfoDialog(true); }}
        onDelete={() => { setPostDeleteDialog(true); setPostID(placement?._id); }}
        {...extraProps}
      />
    </motion.div>
  );

  const gridChildren = showSearchResult ? (
    filteredPlacement?._id ? (
      <motion.div key={filteredPlacement?._id} variants={item}>
        <PlacementCard
          placement={filteredPlacement}
          role={role}
          bookmarked={savedIds.has(String(filteredPlacement?._id))}
          onToggleBookmark={handleToggleBookmark}
          onApply={() => { setApplyPlacementDialog(true); setPostID(filteredPlacement?._id); }}
          onUpdate={() => { setPlacementInfo(filteredPlacement); setEditedInfo(filteredPlacement); setPlacementInfoDialog(true); }}
          onDelete={() => { setPostDeleteDialog(true); setPostID(filteredPlacement?._id); }}
        />
      </motion.div>
    ) : (
      placements.filter((p) =>
        p.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.job_title.toLowerCase().includes(searchQuery.toLowerCase())
      )
        .map((placement) => (
          placement?._id && (
            <motion.div key={placement?._id} variants={item}>
              <PlacementCard
                placement={placement}
                role={role}
                bookmarked={savedIds.has(String(placement?._id))}
                onToggleBookmark={handleToggleBookmark}
                onApply={() => { setApplyPlacementDialog(true); setPostID(placement?._id); }}
                onUpdate={() => { setPlacementInfo(placement); setEditedInfo(placement); setPlacementInfoDialog(true); }}
                onDelete={() => { setPostDeleteDialog(true); setPostID(placement?._id); }}
              />
            </motion.div>
          )
        ))
    )
  ) : (
    visiblePlacements.map((placement) => renderCard(placement))
  );

  const showEmptyState =
    !showSearchResult && !fetching && visiblePlacements.length === 0;

  return (
    <>
      <div className="p-6">
        <ToastContainer position="top-right" autoClose={3000} />
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-slate-100">Available Placements</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Browse placement drives and apply to the ones that fit you.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {
              !showSearchResult && role !== "student" &&
              <Button variant="gradient" className="cursor-pointer" onClick={() => setCreatePostDialog(true)}>Create Post</Button>
            }
            {showSearchResult &&
              <Button onClick={() => { cleanSearchedData(); }} className="cursor-pointer rounded-xl bg-slate-900 text-white hover:bg-slate-700 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/20" aria-label="Clear search"> <ArrowLeftCircleIcon /></Button>
            }
            <PlacementSearch onQuery={searchQueryFromChild} />
          </div>
        </div>

        {/* Sticky filter bar — composes client-side over loaded data */}
        <AnimatePresence initial={false}>
          {!showSearchResult && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: EASE }}
              className="sticky top-0 z-20 mb-6 rounded-2xl border border-slate-200/80 bg-white/85 p-3 shadow-sm shadow-slate-900/5 backdrop-blur-md dark:border-white/10 dark:bg-slate-900/80 dark:shadow-black/20"
            >
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Text search */}
                <div className="relative min-w-[200px] flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                  <input
                    type="text"
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    placeholder="Filter by company or job title…"
                    className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-9 pr-8 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:placeholder:text-slate-500"
                  />
                  {filterText && (
                    <button
                      type="button"
                      onClick={() => setFilterText("")}
                      aria-label="Clear text filter"
                      className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer rounded-md p-1 text-slate-400 transition hover:bg-slate-200/60 hover:text-slate-600 dark:hover:bg-white/10 dark:hover:text-slate-200"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Location select */}
                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                  <select
                    value={filterLocation}
                    onChange={(e) => setFilterLocation(e.target.value)}
                    aria-label="Filter by location"
                    className="h-9 cursor-pointer appearance-none rounded-xl border border-slate-200 bg-slate-50/80 pl-9 pr-8 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 [&>option]:bg-white [&>option]:text-slate-700 dark:[&>option]:bg-slate-900 dark:[&>option]:text-slate-200"
                  >
                    <option value="all">All locations</option>
                    {locations.map((loc) => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>

                {/* Closing soon chip */}
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setClosingSoonOnly((v) => !v)}
                  aria-pressed={closingSoonOnly}
                  className={`flex h-9 cursor-pointer items-center gap-1.5 rounded-xl border px-3 text-sm font-medium transition ${
                    closingSoonOnly
                      ? "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-300"
                      : "border-slate-200 bg-slate-50/80 text-slate-500 hover:border-amber-300 hover:text-amber-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400 dark:hover:text-amber-300"
                  }`}
                >
                  <Clock className="h-4 w-4" />
                  Closing soon
                </motion.button>

                {/* Saved chip */}
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSavedOnly((v) => !v)}
                  aria-pressed={savedOnly}
                  className={`flex h-9 cursor-pointer items-center gap-1.5 rounded-xl border px-3 text-sm font-medium transition ${
                    savedOnly
                      ? "border-indigo-300 bg-indigo-50 text-indigo-700 dark:border-indigo-500/40 dark:bg-indigo-500/10 dark:text-indigo-300"
                      : "border-slate-200 bg-slate-50/80 text-slate-500 hover:border-indigo-300 hover:text-indigo-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400 dark:hover:text-indigo-300"
                  }`}
                >
                  <Bookmark className={`h-4 w-4 ${savedOnly ? "fill-current" : ""}`} />
                  Saved
                  {savedLoading && <LoaderCircle className="h-3.5 w-3.5 animate-spin" />}
                </motion.button>

                {/* Active filter count + clear all */}
                <AnimatePresence>
                  {activeFilterCount > 0 && (
                    <motion.button
                      type="button"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={clearAllFilters}
                      className="ml-auto flex h-9 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-500 transition hover:border-slate-300 hover:text-slate-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400 dark:hover:text-slate-200"
                    >
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-500 px-1.5 text-[11px] font-bold text-white">
                        {activeFilterCount}
                      </span>
                      <SlidersHorizontal className="h-3.5 w-3.5" />
                      Clear all
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* First load — no placements on screen yet: skeleton shimmer cards */}
        {fetching && placements.length === 0 && hasMore && !showSearchResult ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : (
          <motion.div
            variants={staggerContainer(0.06)}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
          >
            {gridChildren}

            {/* Empty state when client-side filters match nothing */}
            {showEmptyState && (
              <motion.div
                variants={item}
                className="col-span-full flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/60 py-16 text-center dark:border-white/15 dark:bg-white/[0.02]"
              >
                <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/10 to-fuchsia-500/10 text-indigo-500 ring-1 ring-indigo-100 dark:text-indigo-300 dark:ring-indigo-500/20">
                  <Inbox className="h-6 w-6" />
                </span>
                <p className="font-display text-base font-semibold text-slate-700 dark:text-slate-200">
                  No placements match your filters
                </p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Try adjusting or clearing your filters to see more results.
                </p>
                {activeFilterCount > 0 && (
                  <Button variant="gradient" className="mt-4 cursor-pointer" onClick={clearAllFilters}>
                    Clear all filters
                  </Button>
                )}
              </motion.div>
            )}

            {/* Infinite scroll sentinel — shimmer while loading more */}
            {hasMore && !showSearchResult && (
              <div ref={ref} className="col-span-full flex flex-col items-center justify-center gap-3 py-8">
                {fetching ? (
                  <>
                    <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                      <SkeletonCard />
                      <SkeletonCard />
                      <SkeletonCard />
                    </div>
                    <span className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                      <LoaderCircle className="h-4 w-4 animate-spin text-indigo-500" />
                      Loading more placements…
                    </span>
                  </>
                ) : (
                  <span className="text-sm text-slate-500 dark:text-slate-400">Scroll for more</span>
                )}
              </div>
            )}
          </motion.div>
        )}
        {/* Delete placement post */}
        <DeletePlacementPostDialog deletePlacementPostDialog={postDeleteDialog} setDeletePlacementPostDialog={setPostDeleteDialog} placementPostID={postID} onPostDelete={handlePostDeleted} loading={loading} setLoading={setLoading} />
        {/* Apply Placement Confirmation Dialog */}
        <Dialog open={applyPlacementDialog} onOpenChange={setApplyPlacementDialog} className="max-h-[90vh] overflow-y-auto">
          <DialogContent>
            <DialogHeader>Fill These Details: </DialogHeader>
            <Missing_Details_Form_Dialog onCancel={setMissingDetailsFillFormDialog} />
            <DialogFooter>
              <Button className="cursor-pointer" variant="outline" onClick={() => setApplyPlacementDialog(false)}>Cancel</Button>
              <Button className="cursor-pointer" variant="gradient" onClick={applyForPlacement}>{missingDetailsFillFormDialog ? "Skip & Apply" : "GO"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {/* Applied Placement Confirmation Dialog */}
        <Dialog open={appliedConfirmationDialog} onOpenChange={setAppliedConfirmationDialog}>
          <DialogContent>
            <DialogHeader>Applied</DialogHeader>
            <DialogFooter>
              {/* <Button className="cursor-pointer" variant="secondary" onClick={() => setApplyPlacementDialog(false)}>Cancel</Button> */}
              <Button className="cursor-pointer" variant="gradient" onClick={() => { setAppliedConfirmationDialog(false); setApplyPlacementDialog(false) }}>OK</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {/* Create Job Post Dialog */}
        <Dialog open={createPostDialog} onOpenChange={setCreatePostDialog}>
          <DialogContent>
            <DialogHeader>Create new post</DialogHeader>
            <DialogDescription><CreateJobPost onCancel={setCreatePostDialog} /></DialogDescription>
          </DialogContent>
        </Dialog>
        {/* Placement Post Info Dialog */}
        <Dialog open={placementInfoDialog} onOpenChange={setPlacementInfoDialog}>
          <DialogContent>
            <DialogHeader>
              <Card className="mt-6 p-4">
                <h3 className="flex justify-between text-lg font-semibold">
                  Placement Post Details
                  {
                    !editMode && <Button variant="outline" className="cursor-pointer" size="sm" onClick={() => setEditMode(true)}>✏️</Button>
                  }
                </h3>
                {editMode ? (
                  <div>
                    <Label>Job Title</Label>
                    <Input name="job_title" value={editedInfo.job_title} onChange={handleEditChange} />
                    <Label>Location</Label>
                    <Input name="location" value={editedInfo.location || ""} onChange={handleEditChange} />
                    <Label>Description</Label>
                    <Input name="description" value={editedInfo.description} onChange={handleEditChange} />
                    <Label>Eligibility</Label>
                    <Input name="eligibility" value={editedInfo.eligibility} onChange={handleEditChange} />
                    <Label>Last Date</Label>
                    <Input type="date" name="last_date" value={editedInfo.last_date} onChange={handleEditChange} />
                    <Button className="mt-2 cursor-pointer" variant="gradient" onClick={saveChanges}>Save Changes</Button>
                  </div>
                ) : (
                  <CardContent>
                    <p>Company: {editedInfo.company_name}</p>
                    <p>Location: {editedInfo.location || "Not found"}</p>
                    <p>Job Title: {editedInfo.job_title}</p>
                    <p>Eligibility: {editedInfo.eligibility}</p>
                    <p>Description: {editedInfo.description}</p>
                    <p>Last Date : {editedInfo.last_date}</p>
                  </CardContent>
                )}
              </Card>
            </DialogHeader>
            <DialogFooter>
              <Button className="cursor-pointer" variant="outline" onClick={() => { setEditMode(false); setPlacementInfoDialog(false); }}>Cancel</Button>
              <Button className="cursor-pointer" variant="gradient" onClick={handleUpdate}>Update</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div >
    </>
  );
};

export default InfinitePlacements;
