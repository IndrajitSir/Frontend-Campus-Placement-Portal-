import React from "react";
import SearchDialog from "../../../Dialog/Search_Dialog/SearchDialog.jsx";
import { usePlacementData } from "../../../context/PlacementContext/PlacementContext.jsx";

const PlacementSearch = ({ onQuery }) => {
    const { placements } = usePlacementData();

    return (
        <SearchDialog
            data={placements}
            searchCriteria={["company_name", "job_title"]}
            onQuery={onQuery}
            placeholderValue="Search placements by company or job title"
            variant="icon"
        />
    );
};

export default PlacementSearch;
