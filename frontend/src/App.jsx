import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';

// Main Site Components
import Navbar from './components/Navbar';
import Home from './components/Home';
import About from './components/About';
import Projects from './components/Projects';
import Guestbook from './components/Guestbook';
import Contact from './components/Contact';
import Footer from './components/Footer';
import TerminalOverlay from './components/TerminalOverlay';
import CommandPalette from './components/CommandPalette';
import ScrollProgress from './components/ScrollProgress';

// Admin Components
import AdminLogin from './admin/AdminLogin';
import AdminDashboard from './admin/AdminDashboard';

// Analytics Tracker
import { trackPageView, trackClick } from './utils/analyticsTracker';

import CanvasParticles from './components/CanvasParticles';

function LandingPage({ onTerminalToggle, onPaletteToggle, theme, toggleTheme }) {
  return (
    <>
      <CanvasParticles color={theme === 'dark' ? '#00d4ff' : '#000000'} particleCount={70} />
      <Navbar onTerminalToggle={onTerminalToggle} onPaletteToggle={onPaletteToggle} theme={theme} onThemeToggle={toggleTheme} />
      <Home />
      <About />
      <Projects />
      <Guestbook />
      <Contact />
      <Footer />
    </>
  );
}

export default function App() {
  const [theme, setTheme] = useState(
    localStorage.getItem('theme') || 'dark'
  );
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(
    !!localStorage.getItem('adminToken')
  );
  
  const location = useLocation();

  // Apply theme class to document
  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light-theme');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Log pageview analytics on route changes
  useEffect(() => {
    trackPageView(location.pathname);
  }, [location]);

  const handleTerminalToggle = () => {
    trackClick('terminal-float-button-click');
    setIsTerminalOpen(!isTerminalOpen);
  };

  const openTerminal = useCallback(() => setIsTerminalOpen(true), []);

  const isAdminRoute = location.pathname.startsWith('/admin');

  const handlePaletteToggle = useCallback(() => {
    if (isAdminRoute) return;
    trackClick('command-palette-toggle');
    setIsPaletteOpen((prev) => !prev);
  }, [isAdminRoute]);

  // Global shortcut: Ctrl+K / Cmd+K opens the command palette
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        handlePaletteToggle();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePaletteToggle]);

  const toggleTheme = () => {
    trackClick('theme-toggle-click');
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <Routes>
        {/* Main Base Page */}
        <Route 
          path="/" 
          element={
            <LandingPage 
              onTerminalToggle={handleTerminalToggle} 
              onPaletteToggle={handlePaletteToggle} 
              theme={theme}
              toggleTheme={toggleTheme}
            />
          } 
        />
        
        {/* Admin Login Route */}
        <Route 
          path="/admin/login" 
          element={
            isAdminLoggedIn ? (
              <Navigate to="/admin" replace />
            ) : (
              <AdminLogin onLoginSuccess={() => setIsAdminLoggedIn(true)} />
            )
          } 
        />
        
        {/* Admin Dashboard Protected Route */}
        <Route 
          path="/admin" 
          element={
            isAdminLoggedIn ? (
              <AdminDashboard onLogout={() => setIsAdminLoggedIn(false)} />
            ) : (
              <Navigate to="/admin/login" replace />
            )
          } 
        />
        
        {/* Catch-all Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Floating Action Button: Toggles Developer Terminal overlay */}
      {location.pathname !== '/admin' && location.pathname !== '/admin/login' && (
        <button 
          className="terminal-toggle-btn" 
          onClick={handleTerminalToggle}
          title="Open Developer Shell (Ctrl + ~)"
        >
          <i className="fas fa-terminal" style={{ fontSize: '1.5rem' }}></i>
        </button>
      )}

      {/* Terminal Overlay Console */}
      <TerminalOverlay 
        isOpen={isTerminalOpen} 
        onClose={() => setIsTerminalOpen(false)} 
      />

      {/* Command Palette Overlay */}
      <CommandPalette
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        onOpenTerminal={openTerminal}
      />

      {/* Neon scroll progress bar (top of page) */}
      <ScrollProgress />
    </div>
  );
}
