import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

export const trackPageView = (path) => {
  try {
    axios.post(`${API_BASE}/analytics`, {
      path: path || window.location.pathname,
      eventType: 'pageview'
    });
  } catch (err) {
    console.error('Failed to log pageview analytics', err);
  }
};

export const trackClick = (elementId) => {
  try {
    axios.post(`${API_BASE}/analytics`, {
      path: window.location.pathname,
      eventType: 'click',
      elementId: elementId
    });
  } catch (err) {
    console.error('Failed to log click event analytics', err);
  }
};
