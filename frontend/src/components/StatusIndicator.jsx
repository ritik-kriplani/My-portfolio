import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function StatusIndicator() {
  const [status, setStatus] = useState('offline');
  const [latency, setLatency] = useState(null);

  useEffect(() => {
    const checkHealth = async () => {
      const startTime = Date.now();
      try {
        const response = await axios.get('https://my-portfolio-6tlq.onrender.com/api/health');
        if (response.data.status === 'online' && response.data.database === 'connected') {
          setStatus('online');
          setLatency(Date.now() - startTime);
        } else {
          setStatus('offline');
          setLatency(null);
        }
      } catch (error) {
        setStatus('offline');
        setLatency(null);
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="nav-status-indicator" title={status === 'online' ? 'Database & Server fully connected' : 'Server is unreachable'}>
      <span className={`status-dot ${status}`}></span>
      <span>
        {status === 'online' 
          ? `Live Sync: Connected (${latency !== null ? `${latency}ms` : 'polling'})`
          : 'Sync Status: Offline'}
      </span>
    </div>
  );
}
