import React from "react";
import SearchDialog from "../../../Dialog/Search_Dialog/SearchDialog.jsx";
import { usePlacementData } from "../../../context/PlacementContext/PlacementContext.jsx";

// Thin wrapper around the shared SearchDialog.
// The suggestion rows / panel live inside Search_Dialog/SearchDialog.jsx
// (outside this file's edit scope); here we only tune the trigger styling
// with dark-mode variants via the supported `className` passthrough.
const PlacementSearch = ({ onQuery }) => {
    const { placements } = usePlacementData();

    return (
        <SearchDialog
            data={placements}
            searchCriteria={["company_name", "job_title"]}
            onQuery={onQuery}
            placeholderValue="Search placements by company or job title"
            variant="icon"
            className="dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-300"
        />
    );
};

export default PlacementSearch;
