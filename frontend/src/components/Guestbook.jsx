import React, { useState, useEffect } from 'react';
import axios from 'axios';
import confetti from 'canvas-confetti';
import { trackClick } from '../utils/analyticsTracker';

export default function Guestbook() {
  const [comments, setComments] = useState([]);
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [avatarSeed, setAvatarSeed] = useState('1'); // defaults to 1st avatar emoji
  const [activeSlide, setActiveSlide] = useState(0);
  const [statusMsg, setStatusMsg] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const avatars = [
    { seed: '1', emoji: '💻' },
    { seed: '2', emoji: '🚀' },
    { seed: '3', emoji: '🛸' },
    { seed: '4', emoji: '👾' },
    { seed: '5', emoji: '🔥' },
    { seed: '6', emoji: '🌟' }
  ];

  const fetchApprovedComments = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/guestbook');
      setComments(res.data);
    } catch (err) {
      console.error('Error fetching guestbook approved comments:', err);
    }
  };

  useEffect(() => {
    fetchApprovedComments();
  }, []);

  // Auto scroll comments slide every 6 seconds
  useEffect(() => {
    if (comments.length <= 1) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % comments.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [comments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !comment) return;

    setIsSubmitting(true);
    trackClick('guestbook-signature-submit');

    try {
      const res = await axios.post('http://localhost:5000/api/guestbook', {
        name,
        comment,
        avatarSeed
      });
      
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#00d4ff', '#4ecdc4', '#ff6b6b']
      });

      setStatusMsg({ type: 'success', text: res.data.msg });
      setName('');
      setComment('');
      
      // Auto clear message after 4 seconds
      setTimeout(() => setStatusMsg(null), 5000);
    } catch (err) {
      console.error(err);
      setStatusMsg({ type: 'error', text: 'Error submitting signature, please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAvatarEmoji = (seed) => {
    const found = avatars.find(a => a.seed === seed);
    return found ? found.emoji : '👋';
  };

  return (
    <section id="guestbook" class="guestbook-section">
      <div className="container">
        <h2 className="section-title">Visitor Guestbook</h2>
        
        <div className="guestbook-layout">
          {/* Left Column: Sign Form */}
          <div className="guestbook-intro">
            <h3>Sign the Guestbook</h3>
            <p>Leave a note, share feedback, or just say hello! Approved remarks will show up in the live slider on the right.</p>
            
            <form onSubmit={handleSubmit} className="guestbook-form">
              {statusMsg && (
                <div className={statusMsg.type === 'success' ? 'badge badge-success' : 'error-message'} style={{ display: 'block', marginBottom: '20px', padding: '10px', textAlign: 'center' }}>
                  {statusMsg.text}
                </div>
              )}
              
              <div className="form-group">
                <input 
                  type="text" 
                  id="gb-name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  className={name ? 'has-value' : ''} 
                  required 
                />
                <label htmlFor="gb-name">Your Name</label>
              </div>

              <div className="form-group">
                <textarea 
                  id="gb-comment" 
                  value={comment} 
                  onChange={(e) => setComment(e.target.value)} 
                  className={comment ? 'has-value' : ''} 
                  rows="3" 
                  required
                ></textarea>
                <label htmlFor="gb-comment">Your Comment</label>
              </div>

              <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '10px', fontSize: '0.9rem' }}>Choose Avatar Icon:</label>
              <div className="avatar-selector">
                {avatars.map((av) => (
                  <button
                    key={av.seed}
                    type="button"
                    className={`avatar-btn ${avatarSeed === av.seed ? 'selected' : ''}`}
                    onClick={() => setAvatarSeed(av.seed)}
                  >
                    {av.emoji}
                  </button>
                ))}
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={isSubmitting}>
                <span>{isSubmitting ? 'Signing...' : 'Sign Guestbook'}</span>
                <i className="fas fa-pen-fancy"></i>
              </button>
            </form>
          </div>

          {/* Right Column: Approved comments display */}
          <div className="guestbook-slides-wrapper">
            {comments.length > 0 ? (
              <>
                <div className="guestbook-slide">
                  <div className="guestbook-slide-meta">
                    <div className="guestbook-avatar">
                      {getAvatarEmoji(comments[activeSlide].avatarSeed)}
                    </div>
                    <div className="guestbook-author-info">
                      <h4>{comments[activeSlide].name}</h4>
                      <span>{new Date(comments[activeSlide].createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <p className="guestbook-text">
                    "{comments[activeSlide].comment}"
                  </p>
                </div>
                
                {comments.length > 1 && (
                  <div className="guestbook-controls">
                    {comments.map((_, idx) => (
                      <span 
                        key={idx} 
                        className={`guestbook-dot ${activeSlide === idx ? 'active' : ''}`}
                        onClick={() => setActiveSlide(idx)}
                      ></span>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="guestbook-slide" style={{ textAlign: 'center', padding: '40px' }}>
                <div className="guestbook-avatar" style={{ margin: '0 auto 15px' }}>👽</div>
                <p className="guestbook-text" style={{ fontStyle: 'normal' }}>
                  Guestbook is empty. Be the first to leave a comment on MongoDB database!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
