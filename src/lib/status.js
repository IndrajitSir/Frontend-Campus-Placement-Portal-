// Shared status → pill-class mapping used by dashboards, search and cards.
const STATUS_CLASS = {
  applied: "pill-applied",
  shortlisted: "pill-shortlisted",
  selected: "pill-selected",
  rejected: "pill-rejected",
};

export const statusPillClass = (status) => STATUS_CLASS[status] || "pill-applied";
