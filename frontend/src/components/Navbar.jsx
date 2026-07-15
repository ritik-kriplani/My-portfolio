import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import StatusIndicator from './StatusIndicator';
import { trackClick } from '../utils/analyticsTracker';

export default function Navbar({ onTerminalToggle }) {
  const [active, setActive] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Scroll event to change background
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 80) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleToggle = () => {
    setActive(!active);
  };

  const handleLinkClick = (hash) => {
    setActive(false);
    trackClick(`nav-link-${hash.replace('#', '')}`);
    
    // If not on homepage, navigate there first
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const el = document.querySelector(hash);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    } else {
      const el = document.querySelector(hash);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="navbar" style={{ background: scrolled ? 'rgba(10, 10, 10, 0.98)' : 'rgba(10, 10, 10, 0.95)' }}>
      <div className="nav-container">
        <div className="nav-logo" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>RK</div>
        
        <ul className={`nav-menu ${active ? 'active' : ''}`}>
          <li className="nav-item">
            <span className="nav-link" style={{ cursor: 'pointer' }} onClick={() => handleLinkClick('#home')}>Home</span>
          </li>
          <li className="nav-item">
            <span className="nav-link" style={{ cursor: 'pointer' }} onClick={() => handleLinkClick('#about')}>About</span>
          </li>
          <li className="nav-item">
            <span className="nav-link" style={{ cursor: 'pointer' }} onClick={() => handleLinkClick('#projects')}>Projects</span>
          </li>
          <li className="nav-item">
            <span className="nav-link" style={{ cursor: 'pointer' }} onClick={() => handleLinkClick('#guestbook')}>Guestbook</span>
          </li>
          <li className="nav-item">
            <span className="nav-link" style={{ cursor: 'pointer' }} onClick={() => handleLinkClick('#contact')}>Contact</span>
          </li>
          <li className="nav-item">
            <span className="nav-link" style={{ cursor: 'pointer', color: 'var(--primary-color)' }} onClick={onTerminalToggle}>
              <i className="fas fa-terminal" style={{ marginRight: '6px' }}></i>Shell
            </span>
          </li>
          {location.pathname !== '/admin' && (
            <li className="nav-item">
              <Link to="/admin" className="nav-link" style={{ color: 'var(--secondary-color)' }} onClick={() => trackClick('admin-nav-link')}>
                Admin
              </Link>
            </li>
          )}
        </ul>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <StatusIndicator />
          <div className={`hamburger ${active ? 'active' : ''}`} onClick={handleToggle}>
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
          </div>
        </div>
      </div>
    </nav>
  );
}
