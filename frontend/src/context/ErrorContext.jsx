import { createContext, useState, useContext, useCallback } from 'react';
import NotificationModal from '../components/NotificationModal';

const ErrorContext = createContext();

export const ErrorProvider = ({ children }) => {
  const [error, setError] = useState(null);

  const showError = useCallback((err) => {
    if (err.status === 422) return;

    setError({
      title: err.status ? `Error ${err.status}` : "Ups!",
      message: err.message || "Algo ha salido mal miarma",
    });
  }, []);

  const closeError = () => setError(null);

  return (
    <ErrorContext.Provider value={{ showError }}>
      {children}
      <NotificationModal
        show={error !== null}
        onClose={closeError}
        title={error?.title || "Error"}
        message={error?.message || ""}
        variant='danger'
        buttons={[{ label: "Entendido", variant: "danger", onClick: closeError }]}
      />
    </ErrorContext.Provider>
  );
};

export const useError = () => useContext(ErrorContext);