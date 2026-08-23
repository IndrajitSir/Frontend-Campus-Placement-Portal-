import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion';
// Shadcn Components
import { Button } from '../../Components/ui/button';
import { Input } from '../../Components/ui/input';
// Icons
import { Search, X } from 'lucide-react';

function SearchDialog({ data, onQuery, placeholderValue }) {
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
            inputRef.current.focus();
        }
    }, [showOverlay]);

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchQuery(value);

        if (!value.trim()) {
            setFilteredResults([]);
            return;
        }

        const results = (Array.isArray(data) ? data : []).filter(p =>
            (p.name || "").toLowerCase().includes(value.toLowerCase()) ||
            (p.email || "").toLowerCase().includes(value.toLowerCase())
        );
        setFilteredResults(results);
    };

    const handleFocus = (val) => setShowOverlay(val);

    const handleOverlayClose = () => {
        setShowOverlay(false);
        setSearchQuery("");
        setFilteredResults([]);
    };

    const handleSuggestionClick = (user) => {
        setSearchQuery(user.name);
        onQuery(user);
        handleOverlayClose();
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && searchQuery.trim()) {
            const exactMatch = filteredResults.find(
                u => u.name?.toLowerCase() === searchQuery.toLowerCase()
            );
            if (exactMatch) {
                handleSuggestionClick(exactMatch);
            } else if (filteredResults.length > 0) {
                handleSuggestionClick(filteredResults[0]);
            } else {
                onQuery({ name: searchQuery });
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
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showOverlay]);

    return (
        <>
            {/* Icon-only trigger button */}
            <button
                onClick={() => handleFocus(true)}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                title="Search"
            >
                <Search className="h-4 w-4" />
            </button>

            <AnimatePresence>
                {showOverlay && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 backdrop-blur-sm pt-[12vh]"
                        onClick={(e) => { if (e.target === e.currentTarget) handleOverlayClose(); }}
                    >
                        <motion.div
                            ref={searchRef}
                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="w-[90%] max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200"
                        >
                            {/* Search input */}
                            <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
                                <Search className="h-4 w-4 shrink-0 text-slate-400" />
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    onKeyDown={handleKeyDown}
                                    placeholder={placeholderValue || "Search..."}
                                    className="flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => { setSearchQuery(""); setFilteredResults([]); inputRef.current?.focus(); }}
                                        className="cursor-pointer rounded p-0.5 text-slate-400 transition hover:text-slate-600"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                )}
                                <button
                                    onClick={handleOverlayClose}
                                    className="cursor-pointer rounded px-2 py-1 text-xs font-medium text-slate-500 transition hover:bg-slate-100"
                                >
                                    Esc
                                </button>
                            </div>

                            {/* Results */}
                            <div className="max-h-[320px] overflow-y-auto">
                                {searchQuery.trim() === "" ? (
                                    <div className="px-4 py-8 text-center text-sm text-slate-400">
                                        Type to search...
                                    </div>
                                ) : Array.isArray(filteredResults) && filteredResults.length > 0 ? (
                                    filteredResults.map((user, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleSuggestionClick(user)}
                                            className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left transition hover:bg-indigo-50"
                                        >
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-600">
                                                {(user.name || "?")[0].toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-medium text-slate-900">{user.name}</p>
                                                <p className="truncate text-xs text-slate-400">{user.email}</p>
                                            </div>
                                        </button>
                                    ))
                                ) : (
                                    <div className="px-4 py-8 text-center text-sm text-slate-400">
                                        No results found for "{searchQuery}"
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}

export default SearchDialog
