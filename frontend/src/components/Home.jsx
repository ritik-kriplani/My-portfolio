import React, { useState, useEffect } from 'react';
import { Player } from '@lottiefiles/react-lottie-player';
import CanvasParticles from './CanvasParticles';
import { trackClick } from '../utils/analyticsTracker';

export default function Home() {
  const [typedText, setTypedText] = useState('');
  const [showTechItems, setShowTechItems] = useState(false);

  useEffect(() => {
    const fullText = "I'm a ";
    let idx = 0;
    
    const interval = setInterval(() => {
      if (idx < fullText.length) {
        setTypedText(prev => prev + fullText.charAt(idx));
        idx++;
      } else {
        clearInterval(interval);
        setTimeout(() => setShowTechItems(true), 500);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const handleScrollTo = (id) => {
    trackClick(`cta-button-${id.replace('#', '')}`);
    const el = document.querySelector(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="home" className="home-section">
      <CanvasParticles color="#00d4ff" particleCount={70} />
      
      <div className="home-content">
        <div className="home-text">
          <h1 className="glitch" data-text="Ritik Kripani">Ritik Kripani</h1>
          <p className="typing-text">{typedText}</p>
          
          <div className="tech-stack" style={{ minHeight: '50px' }}>
            <span 
              className="tech-item" 
              style={{ 
                opacity: showTechItems ? 1 : 0, 
                transform: showTechItems ? 'translateY(0)' : 'translateY(20px)',
                transition: 'all 0.5s ease 0s',
                animation: showTechItems ? 'float 3s ease-in-out infinite' : 'none'
              }}
            >
              Web Developer
            </span>
            <span 
              className="tech-item" 
              style={{ 
                opacity: showTechItems ? 1 : 0, 
                transform: showTechItems ? 'translateY(0)' : 'translateY(20px)',
                transition: 'all 0.5s ease 0.2s',
                animation: showTechItems ? 'float 3.5s ease-in-out infinite' : 'none'
              }}
            >
              3D Enthusiast
            </span>
            <span 
              className="tech-item" 
              style={{ 
                opacity: showTechItems ? 1 : 0, 
                transform: showTechItems ? 'translateY(0)' : 'translateY(20px)',
                transition: 'all 0.5s ease 0.4s',
                animation: showTechItems ? 'float 4s ease-in-out infinite' : 'none'
              }}
            >
              Problem Solver
            </span>
          </div>

          <p className="subtitle">2nd Year Student at JECRC</p>
          
          <div className="cta-buttons">
            <button onClick={() => handleScrollTo('#projects')} className="btn btn-primary">
              View My Work
            </button>
            <button onClick={() => handleScrollTo('#contact')} className="btn btn-secondary">
              Get In Touch
            </button>
          </div>
        </div>

        <div className="home-visual">
          <Player
            autoplay
            loop
            src="/robot.json"
            style={{ width: '400px', height: '400px' }}
          />
        </div>
      </div>

      <div className="scroll-indicator" onClick={() => handleScrollTo('#about')} style={{ cursor: 'pointer' }}>
        <div className="scroll-arrow"></div>
      </div>
    </section>
  );
}
