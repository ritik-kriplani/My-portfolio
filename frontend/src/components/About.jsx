import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Player } from '@lottiefiles/react-lottie-player';
import CanvasParticles from './CanvasParticles';
import { trackClick } from '../utils/analyticsTracker';

export default function About() {
  const [skills, setSkills] = useState([]);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/skills');
        setSkills(response.data);
      } catch (error) {
        console.error('Error fetching skills list:', error);
      }
    };
    fetchSkills();
  }, []);

  const handleSkillHover = (skillName) => {
    trackClick(`skill-hover-${skillName.toLowerCase()}`);
  };

  return (
    <section id="about" className="about-section">
      <CanvasParticles color="#00d4ff" particleCount={50} />
      
      <div className="container">
        <h2 className="section-title">About Me</h2>
        
        <div className="about-content">
          <div className="about-text">
            <p>
              Hello! I'm Ritik Kripani, a passionate 2nd-year student at JECRC with a deep interest in web development and 3D graphics. I love creating innovative solutions and bringing ideas to life through code.
            </p>
            <p>
              When I'm not coding, you can find me exploring new technologies, working on personal projects, or collaborating with fellow developers to build something amazing.
            </p>
            
            <h3>My Skills</h3>
            <div className="skills-grid">
              {skills.length > 0 ? (
                skills.map((skill) => (
                  <div 
                    key={skill._id} 
                    className="skill-item" 
                    data-skill={skill.name}
                    onMouseEnter={() => handleSkillHover(skill.name)}
                    style={{ transition: 'all 0.3s ease' }}
                  >
                    <i className={skill.iconClass}></i>
                    <span>{skill.name}</span>
                  </div>
                ))
              ) : (
                // Fallbacks if backend seed is loading
                ['HTML', 'CSS', 'JavaScript', 'React.js', 'Three.js', 'C++', 'C'].map((name, idx) => (
                  <div key={idx} className="skill-item">
                    <i className={name === 'React.js' ? 'fab fa-react' : 'fas fa-code'}></i>
                    <span>{name}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="about-visual">
            <Player
              autoplay
              loop
              src="/skills.json"
              style={{ width: '300px', height: '300px' }}
            />
            <Player
              autoplay
              loop
              src="/skills2.json"
              style={{ width: '300px', height: '300px' }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
