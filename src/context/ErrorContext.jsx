import { createContext, useState, useContext } from 'react';
import NotificationModal from '../components/NotificationModal';

const ErrorContext = createContext();

export const ErrorProvider = ({ children }) => {
  const [error, setError] = useState(null);

  const showError = (err) => {
    setError({
      title: err.status ? `Error ${err.status}` : "Error",
      message: err.message,
      variant: 'danger'
    });
  };

  const closeError = () => setError(null);

  return (
    <ErrorContext.Provider value={{ showError }}>
      {children}
      {error && (
        <NotificationModal
          show={true}
          onClose={closeError}
          title={error.title}
          message={error.message}
          variant='danger'
          buttons={[{ label: "Aceptar", variant: "danger", onClick: closeError }]}
        />
      )}
    </ErrorContext.Provider>
  );
};

export const useError = () => useContext(ErrorContext);
