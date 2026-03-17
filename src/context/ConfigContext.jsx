import { createContext, useState, useEffect } from "react";
import PropTypes from "prop-types";

const ConfigContext = createContext();

export const ConfigProvider = ({ children }) => {
  const [config, setConfig] = useState(null);
  const [configLoading, setLoading] = useState(true);
  const [configError, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchConfig = async () => {
      try {
        const settingsPath = import.meta.env.MODE === 'production'
          ? "/config/settings.prod.json"
          : "/config/settings.dev.json";

        const response = await fetch(settingsPath);
        if (!response.ok) throw new Error("Error al cargar settings.*.json");
        const json = await response.json();
        if (isMounted) {
          setConfig(json);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Error al cargar configuración");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchConfig();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <ConfigContext.Provider value={{ config, configLoading, configError }}>
      {children}
    </ConfigContext.Provider>
  );
};

ConfigProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export {ConfigContext};