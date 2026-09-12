import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Shadcn Components
import { Button } from '../../Components/ui/button';
import { Input } from '../../Components/ui/input';
// Icons
import { Search, X, Sparkles, Command } from 'lucide-react';

function SearchDialog({
    data = [],
    searchCriteria = ["name", "email"],
    onQuery,
    placeholderValue,
    variant = "icon", // "icon" | "input" | "button"
    className = ""
}) {
    const [searchQuery, setSearchQuery] = useState("");
    const [showOverlay, setShowOverlay] = useState(false);
    const [filteredResults, setFilteredResults] = useState([]);
    const searchRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        setSearchQuery("");
        setFilteredResults([]);
    }, []);

    useEffect(() => {
        if (showOverlay && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [showOverlay]);

    // Keyboard shortcut (Cmd+K or Ctrl+K)
    useEffect(() => {
        const handleGlobalKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                setShowOverlay(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleGlobalKeyDown);
        return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }, []);

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchQuery(value);

        if (!value.trim()) {
            setFilteredResults([]);
            return;
        }

        const items = Array.isArray(data) ? data : [];
        const results = items.filter(item => {
            if (!item) return false;
            const primaryKey = searchCriteria[0] || "name";
            const secondaryKey = searchCriteria[1] || "email";

            const val1 = String(item[primaryKey] || item.name || item.company_name || item.title || "").toLowerCase();
            const val2 = String(item[secondaryKey] || item.email || item.job_title || item.description || "").toLowerCase();

            const query = value.toLowerCase();
            return val1.includes(query) || val2.includes(query);
        });

        setFilteredResults(results);
    };

    const handleOverlayClose = () => {
        setShowOverlay(false);
        setSearchQuery("");
        setFilteredResults([]);
    };

    const handleSuggestionClick = (item) => {
        const primaryKey = searchCriteria[0] || "name";
        const selectedValue = item[primaryKey] || item.name || item.company_name || "";
        setSearchQuery(selectedValue);
        if (onQuery) onQuery(item);
        handleOverlayClose();
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && searchQuery.trim()) {
            if (filteredResults.length > 0) {
                handleSuggestionClick(filteredResults[0]);
            } else {
                if (onQuery) onQuery({ [searchCriteria[0] || "name"]: searchQuery });
                handleOverlayClose();
            }
        }
        if (e.key === "Escape") {
            handleOverlayClose();
        }
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                handleOverlayClose();
            }
        };

        if (showOverlay) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showOverlay]);

    const getItemTitle = (item) => {
        const key = searchCriteria[0] || "name";
        return item[key] || item.name || item.company_name || item.title || "Item";
    };

    const getItemSub = (item) => {
        const key = searchCriteria[1] || "email";
        return item[key] || item.email || item.job_title || item.description || "";
    };

    return (
        <>
          {/* Trigger Rendering */}
          {variant === "input" ? (
            <button
              type="button"
              onClick={() => setShowOverlay(true)}
              className={`group flex h-9 w-full min-w-[200px] cursor-pointer items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-3 text-xs text-slate-400 shadow-sm transition hover:border-violet-300 hover:bg-white hover:shadow-md ${className}`}
            >
              <span className="flex items-center gap-2">
                <Search className="h-3.5 w-3.5 text-slate-400 group-hover:text-violet-600 transition-colors" />
                <span className="truncate">{placeholderValue || "Search user..."}</span>
              </span>
              <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 group-hover:border-violet-200 group-hover:text-violet-600">
                <Command className="h-2.5 w-2.5" />K
              </kbd>
            </button>
          ) : variant === "button" ? (
            <Button
              type="button"
              onClick={() => setShowOverlay(true)}
              className={`cursor-pointer gap-2 bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-500/25 transition hover:brightness-110 ${className}`}
            >
              <Search className="h-3.5 w-3.5" />
              <span>Search</span>
            </Button>
          ) : (
            <button
              type="button"
              onClick={() => setShowOverlay(true)}
              className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-slate-200/90 bg-white text-slate-500 shadow-sm transition-all hover:border-violet-300 hover:bg-violet-50/50 hover:text-violet-600 hover:shadow-md ${className}`}
              title="Search (⌘K)"
            >
              <Search className="h-4 w-4" />
            </button>
          )}

          {/* Spotlight Overlay Modal */}
          <AnimatePresence>
            {showOverlay && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/40 p-4 pt-[10vh] backdrop-blur-sm"
                onClick={(e) => {
                  if (e.target === e.currentTarget) handleOverlayClose();
                }}
              >
                <motion.div
                  ref={searchRef}
                  initial={{ opacity: 0, y: -16, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -16, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xl"
                >
                  {/* Header bar input */}
                  <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3.5 bg-slate-50/50">
                    <Search className="h-4 w-4 shrink-0 text-violet-600" />
                    <input
                      ref={inputRef}
                      type="text"
                      value={searchQuery}
                      onChange={handleSearchChange}
                      onKeyDown={handleKeyDown}
                      placeholder={placeholderValue || "Type to search..."}
                      className="flex-1 bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => {
                          setSearchQuery("");
                          setFilteredResults([]);
                          inputRef.current?.focus();
                        }}
                        className="cursor-pointer rounded p-1 text-slate-400 transition hover:bg-slate-200/60 hover:text-slate-600"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button
                      onClick={handleOverlayClose}
                      className="cursor-pointer rounded-lg border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-500 transition hover:bg-slate-100"
                    >
                      ESC
                    </button>
                  </div>

                  {/* Results list */}
                  <div className="max-h-[340px] overflow-y-auto p-2">
                    {searchQuery.trim() === "" ? (
                      <div className="flex flex-col items-center justify-center py-10 text-center">
                        <span className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-500">
                          <Search className="h-5 w-5 opacity-75" />
                        </span>
                        <p className="text-xs font-semibold text-slate-700">Quick Search</p>
                        <p className="mt-0.5 text-[11px] text-slate-400">
                          Type a name, email, or company title to find results instantly.
                        </p>
                      </div>
                    ) : Array.isArray(filteredResults) && filteredResults.length > 0 ? (
                      filteredResults.map((item, i) => (
                        <button
                          key={item._id || i}
                          onClick={() => handleSuggestionClick(item)}
                          className="flex w-full cursor-pointer items-center gap-3 rounded-xl p-2.5 text-left transition-all hover:bg-violet-50/70"
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 text-xs font-bold text-white shadow-sm">
                            {(getItemTitle(item) || "?")[0].toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-bold text-slate-900">
                              {getItemTitle(item)}
                            </p>
                            <p className="truncate text-[11px] text-slate-400">
                              {getItemSub(item)}
                            </p>
                          </div>
                          <span className="shrink-0 text-[10px] font-semibold text-violet-600">
                            Select →
                          </span>
                        </button>
                      ))
                    ) : (
                      <div className="py-8 text-center text-xs text-slate-400">
                        No results found for "<span className="font-semibold text-slate-600">{searchQuery}</span>"
                      </div>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
    );
}

export default SearchDialog;

