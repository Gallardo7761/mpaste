import NavBar from '@/components/NavBar.jsx';
import { Route, Routes, useLocation } from 'react-router-dom'
import Home from '@/pages/Home.jsx'
import { useState, useEffect } from 'react';
import NotificationModal from './components/NotificationModal';

function App() {
  const [connected, setConnected] = useState(false);
  const [showExperimentalModal, setShowExperimentalModal] = useState(false);

  useEffect(() => {
    const hasSeenWarning = localStorage.getItem('experimental_rt_warned');

    if (!hasSeenWarning) {
      setShowExperimentalModal(true);
    }
  }, []);

  const handleCloseWarning = () => {
    localStorage.setItem('experimental_rt_warned', 'true');
    setShowExperimentalModal(false);
  };

  return (
    <>
      <NavBar connected={connected} />
      <div className="fill d-flex flex-column">
        <Routes>
          <Route path="/" element={<Home mode="create" onConnectChange={setConnected} />} />
          <Route path="/s/:pasteKey" element={<Home mode="static" onConnectChange={setConnected} />} />
          <Route path="/:rtKey" element={<Home mode="rt" onConnectChange={setConnected} />} />
        </Routes>
      </div>
      <NotificationModal
        show={showExperimentalModal}
        onClose={handleCloseWarning}
        title="Modo Experimental"
        message={
          <span>
            He añadido un modo tiempo real pero de momento es <strong>EXPERIMENTAL</strong>. Cualquier fallo por favor mandadlo a jose [arroba] miarma.net.
          </span>
        }
        variant="warning"
        buttons={[
          {
            label: "Vale",
            variant: "warning",
            onClick: handleCloseWarning
          }
        ]}
      />
    </>
  )
}

export default App
