import { useLocation } from 'react-router-dom';
import '@/css/Building.css';

export default function Building() {
  const location = useLocation();

  if (location.pathname === '/') return null;

  return (
    <div className="building-container d-flex flex-column align-items-center justify-content-center text-center py-5 px-3">
      <div className="building-icon">🚧</div>
      <div className="building-title">Esta página está en construcción</div>
      <div className="building-subtitle">Estamos trabajando para traértela pronto</div>
    </div>

  );
}
