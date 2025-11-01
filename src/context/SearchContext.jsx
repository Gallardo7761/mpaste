import { createContext, useContext } from "react";
import { useSearchBar } from "@/hooks/useSearchBar";

const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
  const search = useSearchBar();
  return (
    <SearchContext.Provider value={search}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => useContext(SearchContext);
