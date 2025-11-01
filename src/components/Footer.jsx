import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import '@/css/Footer.css';
import { faGithub } from '@fortawesome/free-brands-svg-icons';

const Footer = () => {
  const [heart, setHeart] = useState('💜');

  useEffect(() => {
    const hearts = ["❤️", "💛", "🧡", "💚", "💙", "💜"];
    const randomHeart = () => hearts[Math.floor(Math.random() * hearts.length)];

    const interval = setInterval(() => {
      setHeart(randomHeart());
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="footer d-flex flex-column align-items-center gap-5 pt-5 px-4">
      <div className="footer-columns w-100" style={{ maxWidth: '900px' }}>
        <div className="footer-column">
          <h4 className="footer-title">Contacto</h4>
          <div className="contact-info p-4">
            <a
              href="https://github.com/Gallardo7761"
              target="_blank"
              className='text-break d-block'
              rel="noopener noreferrer"
            >
              <FontAwesomeIcon icon={faGithub} className="fa-icon me-2 " />
              Gallardo7761
            </a>
            <a href="mailto:jose@miarma.net" className="text-break d-block">
              <FontAwesomeIcon icon={faEnvelope} className="fa-icon me-2" />
              jose@miarma.net
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom w-100 py-5 text-center">
        <h6 id="devd" className='m-0'>
          Hecho con <span className="heart-anim">{heart}</span> por{' '}
          <a href="https://gallardo.dev" target="_blank" rel="noopener noreferrer">
            Gallardo7761
          </a>
        </h6>
      </div>
    </footer>
  );
};

export default Footer;
