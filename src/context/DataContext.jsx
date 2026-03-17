import { createContext } from "react";
import PropTypes from "prop-types";
import { useData } from "../hooks/useData";
import { useError } from "./ErrorContext";

export const DataContext = createContext();

export const DataProvider = ({ config, children }) => {
  const { showError } = useError();
  // Centraliza errores HTTP para que cualquier consumidor de DataContext
  // tenga comportamiento homogéneo sin repetir wiring en cada página.
  const dataApi = useData(config, showError);
  
  return (
    <DataContext.Provider value={dataApi}>
      {children}
    </DataContext.Provider>
  );
};

DataProvider.propTypes = {
  config: PropTypes.shape({
    baseUrl: PropTypes.string.isRequired,
    params: PropTypes.object,
  }).isRequired,
  children: PropTypes.node.isRequired,
};