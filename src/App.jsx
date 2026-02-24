import NavBar from '@/components/NavBar.jsx';
import { Route, Routes, useLocation } from 'react-router-dom'
import Home from '@/pages/Home.jsx'

function App() {
  return (
    <>
      <NavBar />
      <div className="fill d-flex flex-column">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/:pasteKey" element={<Home />} />
        </Routes>
      </div>
    </>
  )
}

export default App
