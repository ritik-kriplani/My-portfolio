import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Player } from '@lottiefiles/react-lottie-player';
import CanvasParticles from './CanvasParticles';
import ProjectModal from './ProjectModal';
import { trackClick } from '../utils/analyticsTracker';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get('https://my-portfolio-6tlq.onrender.com/api/projects');
        setProjects(response.data);
      } catch (error) {
        console.error('Error fetching projects list:', error);
      }
    };
    fetchProjects();
  }, []);

  const handleCardClick = (project) => {
    trackClick(`project-card-click-${project.title.replace(/\s+/g, '-').toLowerCase()}`);
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  return (
    <section id="projects" className="projects-section">
      <CanvasParticles color="#00d4ff" particleCount={60} />
      
      <div className="container">
        <h2 className="section-title">My Projects</h2>
        
        <div className="projects-grid">
          {projects.length > 0 ? (
            projects.map((project) => (
              <div 
                key={project._id} 
                className="project-card"
                onClick={() => handleCardClick(project)}
                style={{ transition: 'all 0.3s ease' }}
              >
                <div className="project-image">
                  <Player
                    autoplay
                    loop
                    src={project.lottieSrc}
                    style={{ width: '100%', height: '160px' }}
                  />
                </div>
                <div className="project-content">
                  <h3>{project.title}</h3>
                  <p>{project.description.length > 100 ? `${project.description.substring(0, 100)}...` : project.description}</p>
                  
                  <div className="project-tech">
                    {project.techTags && project.techTags.map((tag, idx) => (
                      <span key={idx} className="tech-tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p style={{ textAlign: 'center', gridColumn: '1/-1', color: 'var(--text-secondary)' }}>
              Loading engineering projects...
            </p>
          )}
        </div>
      </div>

      <ProjectModal 
        project={selectedProject} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </section>
  );
}
