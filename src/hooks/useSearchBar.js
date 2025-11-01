import { useState } from "react";

export const useSearchBar = (initialFilters = {}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState(initialFilters);

  const isSearching = searchTerm.trim() !== "";
  const isFiltering = Object.keys(filters).length > 0;

  return {
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    isSearching,
    isFiltering,
    reset: () => {
      setSearchTerm("");
      setFilters(initialFilters);
    },
  };
};
