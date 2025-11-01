import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '@/css/NavBar.css';
import ThemeButton from '@/components/ThemeButton.jsx';
import { Navbar, Nav, Container } from 'react-bootstrap';
import SearchToolbar from './SearchToolbar';
import { useSearch } from "@/context/SearchContext";
import NotificationModal from './NotificationModal';

const NavBar = () => {
  const [expanded, setExpanded] = useState(false);
  const [isLg, setIsLg] = useState(window.innerWidth >= 992);
  const [isXs, setIsXs] = useState(window.innerWidth < 576);
  const { searchTerm, setSearchTerm } = useSearch();
  const [showContactModal, setShowContactModal] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsLg(window.innerWidth >= 992 && window.innerWidth < 1200);
      setIsXs(window.innerWidth < 576);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 992) {
        setExpanded(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  });


  return (
    <>
      <Navbar
        expand="lg"
        sticky="top"
        expanded={expanded}
        onToggle={() => setExpanded(!expanded)}
        className='shadow-none custom-border-bottom'
      >
        <Container fluid>
          {/* brand */}
          <Nav.Item
            title="mpaste"
            className={`navbar-brand`}
          >
            <div className="d-flex align-items-center gap-2">
              <img src='/images/favicon.svg' width={44} height={44} />
              <h3 className='m-0 p-0'>mpaste</h3>
            </div>
          </Nav.Item>

          {/* ThemeButton SIEMPRE fijo */}
          <div className="order-lg-2 ms-auto me-2">
            <ThemeButton onlyIcon={isXs} />
          </div>

          {/* burger */}
          <Navbar.Toggle
            aria-controls="main-navbar"
            className="custom-toggler border-0 order-lg-3"
          >
            <svg width="30" height="30" viewBox="0 0 30 30">
              <path
                d="M4 7h22M4 15h22M4 23h22"
                stroke="var(--navbar-link-color)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeMiterlimit="10"
              />
            </svg>
          </Navbar.Toggle>

          {/* links y search que colapsan */}
          <Navbar.Collapse id="main-navbar" className="order-lg-1">
            <Nav
              className={`me-auto gap-3 w-100 ${expanded ? "flex-column align-items-start mt-3 mb-2" : "d-flex align-items-center"}`}
            >
              <Nav.Link as={Link} to="/" onClick={() => setExpanded(false)}>inicio</Nav.Link>
              <Nav.Link as={Link} onClick={() => { setShowContactModal(true); setExpanded(false); }}>sugerencias</Nav.Link>
              <div className="w-50">
                <SearchToolbar
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                />
              </div>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      {/* Contact Modal */}
      <NotificationModal
        show={showContactModal}
        onClose={() => setShowContactModal(false)}
        title="Contacto"
        message={
          <span>
            Si tienes alguna pregunta o sugerencia, me puedes escribir a mi correo: <br />
            <strong>jose [arroba] miarma.net</strong>
          </span>
        }
        variant=""
        buttons={[
          { label: "Cerrar", variant: "secondary", onClick: () => setShowContactModal(false) }
        ]}
      />
    </>
  );
};

export default NavBar;