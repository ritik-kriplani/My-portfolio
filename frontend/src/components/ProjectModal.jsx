import React from 'react';
import { Player } from '@lottiefiles/react-lottie-player';
import { trackClick } from '../utils/analyticsTracker';

export default function ProjectModal({ project, isOpen, onClose }) {
  if (!isOpen || !project) return null;

  const handleLiveClick = () => {
    trackClick(`project-live-link-${project.title.replace(/\s+/g, '-').toLowerCase()}`);
  };

  const handleGithubClick = () => {
    trackClick(`project-github-link-${project.title.replace(/\s+/g, '-').toLowerCase()}`);
  };

  // Check if lottie src is a relative URL (which means local lottie JSON in public folder)
  const renderLottiePlayer = () => {
    return (
      <Player
        autoplay
        loop
        src={project.lottieSrc}
        style={{ width: '100%', height: '220px' }}
      />
    );
  };

  return (
    <div className="modal-overlay open" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-image">
          <button className="modal-close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
          {renderLottiePlayer()}
        </div>
        <div className="modal-body">
          <h2>{project.title}</h2>
          <p>{project.description}</p>
          
          <div className="modal-tags">
            {project.techTags && project.techTags.map((tag, idx) => (
              <span key={idx} className="tech-tag">
                {tag}
              </span>
            ))}
          </div>

          <div className="modal-btn-row">
            {project.liveUrl && project.liveUrl !== '#' && (
              <a 
                href={project.liveUrl} 
                target="_blank" 
                rel="noreferrer" 
                className="btn btn-primary"
                onClick={handleLiveClick}
              >
                <span>Live Demo</span>
                <i className="fas fa-external-link-alt"></i>
              </a>
            )}
            {project.githubUrl && (
              <a 
                href={project.githubUrl} 
                target="_blank" 
                rel="noreferrer" 
                className="btn btn-secondary"
                onClick={handleGithubClick}
              >
                <span>View Code</span>
                <i className="fab fa-github"></i>
              </a>
            )}
            <button onClick={onClose} className="btn btn-secondary" style={{ borderColor: '#555', color: '#aaa' }}>
              <span>Close</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
