import React, { useState } from 'react';
import axios from 'axios';
import { trackClick } from '../utils/analyticsTracker';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    setIsSubmitting(true);
    trackClick('contact-form-submit');

    try {
      const res = await axios.post('http://localhost:5000/api/contacts', {
        name,
        email,
        message
      });
      setFeedback({ type: 'success', text: res.data.msg });
      setName('');
      setEmail('');
      setMessage('');
    } catch (error) {
      console.error(error);
      setFeedback({ type: 'error', text: 'Failed to send message. Please verify network connection.' });
    } finally {
      setIsSubmitting(false);
      // Auto clear feedback after 6 seconds
      setTimeout(() => setFeedback(null), 6000);
    }
  };

  const handleLinkClick = (platform) => {
    trackClick(`contact-social-${platform}`);
  };

  return (
    <section id="contact" className="contact-section">
      <div className="container">
        <h2 className="section-title">Get In Touch</h2>

        <div className="contact-content">
          <div className="contact-info">
            <h3>Let's Connect</h3>
            <p>I'm always interested in hearing about new opportunities and exciting projects. Feel free to reach out!</p>

            <div className="social-links">
              <a
                href="https://instagram.com/Ritik_kriplani"
                target="_blank"
                rel="noreferrer"
                className="social-link"
                onClick={() => handleLinkClick('instagram')}
              >
                <i className="fab fa-instagram"></i>
                <span>Instagram</span>
              </a>
              <a
                href="https://www.linkedin.com/in/ritik-kriplani-b0019b343/"
                target="_blank"
                rel="noreferrer"
                className="social-link"
                onClick={() => handleLinkClick('linkedin')}
              >
                <i className="fab fa-linkedin"></i>
                <span>LinkedIn</span>
              </a>
              <a
                href="https://github.com/ritik-kriplani"
                target="_blank"
                rel="noreferrer"
                className="social-link"
                onClick={() => handleLinkClick('github')}
              >
                <i className="fab fa-github"></i>
                <span>GitHub</span>
              </a>
            </div>
          </div>

          <div className="contact-form">
            <form onSubmit={handleSubmit}>
              {feedback && (
                <div
                  className={feedback.type === 'success' ? 'badge badge-success' : 'error-message'}
                  style={{ display: 'block', marginBottom: '20px', padding: '12px', textAlign: 'center' }}
                >
                  {feedback.text}
                </div>
              )}

              <div className="form-group">
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={name ? 'has-value' : ''}
                  required
                />
                <label htmlFor="name">Your Name</label>
              </div>

              <div className="form-group">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={email ? 'has-value' : ''}
                  required
                />
                <label htmlFor="email">Your Email</label>
              </div>

              <div className="form-group">
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className={message ? 'has-value' : ''}
                  rows="5"
                  required
                ></textarea>
                <label htmlFor="message">Your Message</label>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={isSubmitting}>
                <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
                <i className="fas fa-paper-plane"></i>
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
