import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion';
// Shadcn Components
import { Button } from '../../Components/ui/button';
import { Input } from '../../Components/ui/input';

function SearchDialog({ data, onQuery, placeholderValue }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [showOverlay, setShowOverlay] = useState(false);
    const [filteredResults, setFilteredResults] = useState([]);
    const searchRef = useRef(null);

    useEffect(() => {
        setSearchQuery("");
        setFilteredResults({});
    }, []);
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchQuery(value);

        const results = data.filter(p =>
            p.name.toLowerCase().includes(value.toLowerCase()) ||
            p.email.toLowerCase().includes(value.toLowerCase())
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
            <div className="relative z-10 p-4">
                <Button onFocus={() => handleFocus(true)} className="cursor-pointer"> Search </Button>
                <AnimatePresence>
                    {showOverlay && (
                        <motion.div initial={{ y: "-100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "-100%", opacity: 0 }} transition={{ duration: 0.4, ease: "easeInOut" }} ref={searchRef}
                            className="fixed inset-0 bg-transparent bg-opacity-40 backdrop-blur-sm flex justify-center pt-20 z-20" >
                            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ delay: 0.1 }}
                                className="w-[90%] max-w-2xl bg-white rounded-xl shadow-lg p-4" >
                                <div className="flex justify-between">
                                    <Input type="text" value={searchQuery} onChange={handleSearchChange} placeholder={`${placeholderValue}`}
                                        className="w-140 px-4 py-2 border rounded-md shadow-sm"
                                    />
                                    <Button onFocus={() => handleFocus(false)} onClick={() => onQuery(searchQuery)} className="cursor-pointer"> Search </Button>
                                </div>
                                {Array.isArray(filteredResults) && filteredResults.length > 0 ? (
                                    filteredResults.map((user, i) => (
                                        <div key={i} onClick={() => handleSuggestionClick(user)}
                                            className="cursor-pointer px-3 py-2 hover:bg-gray-100 rounded" >
                                            <strong>{user.name}</strong> -- {user.email}
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center text-gray-400 py-4">No results found</div>
                                )}
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </>
    )
}

export default SearchDialog
