import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { trackClick } from '../utils/analyticsTracker';

export default function TerminalOverlay({ isOpen, onClose }) {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([
    { text: 'Ritik Kripani Developer Shell [Version 1.0.0]', type: 'system' },
    { text: 'Type "help" to see available commands or press ESC to exit.', type: 'system' },
    { text: '', type: 'system' }
  ]);
  const [theme, setTheme] = useState('matrix'); // matrix (green), cyan, amber
  const [matrixActive, setMatrixActive] = useState(false);
  const bodyRef = useRef(null);
  const inputRef = useRef(null);
  const canvasRef = useRef(null);

  // Focus input when terminal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Scroll to bottom of terminal body on updates
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [history]);

  // ESC key listener to close terminal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Matrix Rain Rain effect when sudo matrix is executed
  useEffect(() => {
    if (!matrixActive || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.parentElement.offsetWidth;
    canvas.height = canvas.parentElement.offsetHeight;

    const columns = Math.floor(canvas.width / 15);
    const yPositions = Array(columns).fill(0);

    const drawMatrix = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#0F0'; // Green text
      ctx.font = '15px monospace';

      for (let i = 0; i < yPositions.length; i++) {
        const char = String.fromCharCode(Math.floor(Math.random() * 96) + 33);
        const x = i * 15;
        const y = yPositions[i];
        ctx.fillText(char, x, y);

        if (y > 100 + Math.random() * 10000) {
          yPositions[i] = 0;
        } else {
          yPositions[i] += 15;
        }
      }
    };

    const interval = setInterval(drawMatrix, 35);
    return () => clearInterval(interval);
  }, [matrixActive]);

  const handleCommand = async (cmd) => {
    const trimmedCmd = cmd.trim();
    if (!trimmedCmd) return;

    const newHistory = [...history, { text: `Guest@RitikPortfolio:~# ${trimmedCmd}`, type: 'input' }];
    const args = trimmedCmd.split(' ');
    const mainCommand = args[0].toLowerCase();

    trackClick(`terminal-command-${mainCommand}`);

    switch (mainCommand) {
      case 'help':
        newHistory.push({
          text: `Available Commands:
  about           - Short biography of Ritik Kripani.
  skills          - Displays developer technical skills.
  projects        - List Ritik's featured engineering projects.
  contact         - Send a contact inquiry. Usage: contact "name" "email" "message"
  guestbook       - List approved visitor guestbook posts.
  guestbook sign  - Add your comment. Usage: guestbook sign "name" "comment"
  ping            - Check connection latency with Express server.
  theme           - Change console text color. Usage: theme [matrix|cyan|amber]
  clear           - Clears terminal console logs.
  sudo matrix     - Toggle retro raining code display backdrop.
  exit            - Close terminal overlay.`,
          type: 'output'
        });
        break;

      case 'about':
        newHistory.push({
          text: `Ritik Kripani
--------------------------------------------------
Role: Web Developer, 3D Enthusiast & Problem Solver.
Education: 2nd Year Student at JECRC (Jaipur Engineering College and Research Centre).
Focus Areas: Fullstack development, WebGL, 3D graphics using Three.js, and competitive programming.`,
          type: 'output'
        });
        break;

      case 'skills':
        try {
          const res = await axios.get('https://my-portfolio-6tlq.onrender.com/api/skills');
          const skillLines = res.data.map(
            (s) => `${s.name.padEnd(15)} [${'='.repeat(Math.round(s.level / 10))}${' '.repeat(10 - Math.round(s.level / 10))}] ${s.level}%`
          ).join('\n');
          newHistory.push({ text: `Technical Skills Profile:\n${skillLines}`, type: 'output' });
        } catch (error) {
          newHistory.push({ text: 'Error fetching skills from API backend database.', type: 'error' });
        }
        break;

      case 'projects':
        try {
          const res = await axios.get('https://my-portfolio-6tlq.onrender.com/api/projects');
          const projectLines = res.data.map(
            (p, idx) => `[${idx + 1}] ${p.title} - ${p.description}\n    Tech Stack: ${p.techTags.join(', ')}`
          ).join('\n\n');
          newHistory.push({ text: `Featured Engineering Projects:\n\n${projectLines}`, type: 'output' });
        } catch (error) {
          newHistory.push({ text: 'Error fetching projects from API backend database.', type: 'error' });
        }
        break;

      case 'clear':
        setHistory([]);
        setInput('');
        return;

      case 'theme':
        const chosenTheme = args[1] ? args[1].toLowerCase() : '';
        if (['matrix', 'cyan', 'amber'].includes(chosenTheme)) {
          setTheme(chosenTheme);
          newHistory.push({ text: `Theme successfully set to ${chosenTheme}`, type: 'output' });
        } else {
          newHistory.push({ text: 'Invalid theme choice. Choose matrix, cyan, or amber.', type: 'error' });
        }
        break;

      case 'ping':
        const start = Date.now();
        try {
          await axios.get('https://my-portfolio-6tlq.onrender.com/api/health');
          newHistory.push({ text: `Connection status: ONLINE. Ping latency: ${Date.now() - start}ms`, type: 'output' });
        } catch (e) {
          newHistory.push({ text: 'Connection status: OFFLINE. Cannot reach API server.', type: 'error' });
        }
        break;

      case 'exit':
        onClose();
        setInput('');
        return;

      case 'sudo':
        if (args[1] && args[1].toLowerCase() === 'matrix') {
          setMatrixActive(!matrixActive);
          newHistory.push({ text: `Matrix loading script: ${!matrixActive ? 'ACTIVE' : 'DEACTIVATED'}`, type: 'output' });
        } else {
          newHistory.push({ text: 'Error: Command syntax not found. Did you mean "sudo matrix"?', type: 'error' });
        }
        break;

      case 'contact':
        // Parse args inside quotes, e.g. contact "Ritik" "ritik@mail.com" "Hi!"
        const contactMatches = trimmedCmd.match(/contact\s+"([^"]+)"\s+"([^"]+)"\s+"([^"]+)"/i);
        if (contactMatches) {
          const [_, name, email, message] = contactMatches;
          try {
            newHistory.push({ text: 'Submitting message to database, please wait...', type: 'system' });
            await axios.post('https://my-portfolio-6tlq.onrender.com/api/contacts', { name, email, message });
            newHistory.push({ text: `Success! Thank you ${name}. Your message has been logged in Ritik's database.`, type: 'output' });
          } catch (e) {
            newHistory.push({ text: 'Error submitting contact form entry.', type: 'error' });
          }
        } else {
          newHistory.push({ text: 'Usage Error. Syntax: contact "Your Name" "Your Email" "Your Message"', type: 'error' });
        }
        break;

      case 'guestbook':
        if (args[1] && args[1].toLowerCase() === 'sign') {
          const signMatches = trimmedCmd.match(/guestbook\s+sign\s+"([^"]+)"\s+"([^"]+)"/i);
          if (signMatches) {
            const [_, name, comment] = signMatches;
            try {
              newHistory.push({ text: 'Submitting comment, waiting for moderator approval...', type: 'system' });
              await axios.post('https://my-portfolio-6tlq.onrender.com/api/guestbook', { name, comment });
              newHistory.push({ text: `Successfully registered! Thanks for signing the guestbook, ${name}.`, type: 'output' });
            } catch (e) {
              newHistory.push({ text: 'Failed to write comment to guestbook database.', type: 'error' });
            }
          } else {
            newHistory.push({ text: 'Usage Error. Syntax: guestbook sign "Your Name" "Your Comment"', type: 'error' });
          }
        } else {
          try {
            const res = await axios.get('https://my-portfolio-6tlq.onrender.com/api/guestbook');
            const commentsLines = res.data.map(
              (c) => `[${new Date(c.createdAt).toLocaleDateString()}] ${c.name}: "${c.comment}"`
            ).join('\n');
            newHistory.push({ text: `Visitor Guestbook:\n------------------\n${commentsLines || 'No approved comments yet. Be the first to sign!'}`, type: 'output' });
          } catch (e) {
            newHistory.push({ text: 'Failed to retrieve guestbook entries from database.', type: 'error' });
          }
        }
        break;

      default:
        newHistory.push({ text: `Command not found: "${mainCommand}". Type "help" for a list of valid commands.`, type: 'error' });
        break;
    }

    setHistory(newHistory);
    setInput('');
  };

  const handleInputSubmit = (e) => {
    if (e.key === 'Enter') {
      handleCommand(input);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="terminal-overlay open" onClick={onClose}>
      <div className="terminal-window" onClick={(e) => e.stopPropagation()}>
        {matrixActive && <canvas ref={canvasRef} className="matrix-bg-canvas" />}
        <div className="terminal-header">
          <div className="terminal-dots">
            <span className="terminal-dot close" onClick={onClose}></span>
            <span className="terminal-dot minimize"></span>
            <span className="terminal-dot maximize"></span>
          </div>
          <div className="terminal-title">rk_terminal_shell.sh</div>
          <div style={{ width: 40 }} /> {/* Spacer */}
        </div>
        <div className={`terminal-body theme-${theme}`} ref={bodyRef} onClick={() => inputRef.current && inputRef.current.focus()}>
          <div className="terminal-history">
            {history.map((line, idx) => (
              <div key={idx} className={`terminal-line ${line.type}`}>
                {line.text}
              </div>
            ))}
          </div>
          <div className="terminal-input-row">
            <span className="terminal-prompt">Guest@RitikPortfolio:~#</span>
            <input
              ref={inputRef}
              type="text"
              className="terminal-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleInputSubmit}
              autoFocus
            />
          </div>
        </div>
      </div>
    </div>
  );
}
