import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Home,
  User,
  FolderGit2,
  BookOpen,
  Mail,
  Terminal,
  Github,
  Linkedin,
  ShieldCheck,
  CornerDownLeft,
} from 'lucide-react';
import { trackClick } from '../utils/analyticsTracker';

const RECENTS_KEY = 'rk-command-palette-recents';

// Simple subsequence fuzzy matcher — returns match positions + a score,
// or null when the query does not appear in-order inside the text.
// Earlier start position and tighter spans score higher.
const fuzzyMatch = (query, text) => {
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  let cursor = 0;
  const matches = [];
  for (let i = 0; i < q.length; i++) {
    const found = t.indexOf(q[i], cursor);
    if (found === -1) return null;
    matches.push(found);
    cursor = found + 1;
  }
  const score = 100 - matches[0] * 2 - (cursor - q.length) * 3;
  return { score, matches };
};

// Prefer label matches over hint/id matches so results stay intuitive.
const matchCommand = (query, cmd) => {
  const label = fuzzyMatch(query, cmd.label);
  if (label) return { ...label, score: label.score + 500 }; // strong label bonus
  const hint = fuzzyMatch(query, `${cmd.hint} ${cmd.id}`);
  return hint ? { ...hint, matches: null } : null; // no highlight for hint-only hits
};

function HighlightedLabel({ text, matches, active }) {
  if (!matches) return text;
  const marked = new Set(matches);
  return (
    <>
      {text.split('').map((ch, i) =>
        marked.has(i) ? (
          <mark key={i} className={active ? 'cp-match cp-match-active' : 'cp-match'}>
            {ch}
          </mark>
        ) : (
          <span key={i}>{ch}</span>
        )
      )}
    </>
  );
}

export default function CommandPalette({ isOpen, onClose, onOpenTerminal }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const previousFocusRef = useRef(null);

  const [recents, setRecents] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(RECENTS_KEY)) || [];
    } catch {
      return [];
    }
  });

  const scrollToSection = (id) => {
    const el = document.querySelector(id);
    if (!el) return;
    // window.scrollTo is more reliable cross-browser than scrollIntoView
    const top = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  const commands = useMemo(
    () => [
      { id: 'home', label: 'Home', hint: 'hero section', group: 'Navigate', icon: Home, run: () => scrollToSection('#home') },
      { id: 'about', label: 'About', hint: 'bio & skills', group: 'Navigate', icon: User, run: () => scrollToSection('#about') },
      { id: 'projects', label: 'Projects', hint: 'featured work', group: 'Navigate', icon: FolderGit2, run: () => scrollToSection('#projects') },
      { id: 'guestbook', label: 'Guestbook', hint: 'visitor comments', group: 'Navigate', icon: BookOpen, run: () => scrollToSection('#guestbook') },
      { id: 'contact', label: 'Contact', hint: 'get in touch', group: 'Navigate', icon: Mail, run: () => scrollToSection('#contact') },
      { id: 'shell', label: 'Open Developer Shell', hint: 'interactive terminal', group: 'Actions', icon: Terminal, run: onOpenTerminal },
      { id: 'github', label: 'Visit GitHub', hint: 'code repositories', group: 'Actions', icon: Github, run: () => window.open('https://github.com/your_username', '_blank', 'noopener,noreferrer') },
      { id: 'linkedin', label: 'Visit LinkedIn', hint: 'professional profile', group: 'Actions', icon: Linkedin, run: () => window.open('https://linkedin.com/in/your_username', '_blank', 'noopener,noreferrer') },
      { id: 'admin', label: 'Go to Admin Panel', hint: 'restricted area', group: 'Actions', icon: ShieldCheck, run: () => navigate('/admin') },
    ],
    [navigate, onOpenTerminal]
  );

  const remember = useCallback((id) => {
    const next = [id, ...recents.filter((r) => r !== id)].slice(0, 4);
    setRecents(next);
    try {
      localStorage.setItem(RECENTS_KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable — ignore */
    }
  }, [recents]);

  const execute = useCallback((item) => {
    if (!item) return;
    document.body.style.overflow = ''; // unlock page scroll before the action runs
    trackClick(`command-palette-${item.cmd.id}`);
    remember(item.cmd.id);
    item.cmd.run();
    onClose();
  }, [remember, onClose]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands
      .map((cmd) => ({ cmd, match: matchCommand(q, cmd) }))
      .filter((x) => x.match)
      .sort((a, b) => b.match.score - a.match.score);
  }, [query, commands]);

  // Items to display: recents first (when empty query), then the rest / matches
  const items = useMemo(() => {
    if (query.trim()) return filtered.map((x) => ({ cmd: x.cmd, match: x.match }));
    const recentCmds = recents.map((id) => commands.find((c) => c.id === id)).filter(Boolean);
    const rest = commands.filter((c) => !recents.includes(c.id));
    return [...recentCmds, ...rest].map((cmd) => ({ cmd, match: null }));
  }, [query, filtered, recents, commands]);

  // Number of commands in the displayed list that are genuinely recent
  const recentCount = useMemo(() => {
    if (query.trim()) return 0;
    return recents.filter((id) => commands.some((c) => c.id === id)).length;
  }, [query, recents, commands]);

  // Focus, reset, body scroll lock, and focus restore when closing
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement;
      setQuery('');
      setSelected(0);
      if (inputRef.current) inputRef.current.focus();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      if (previousFocusRef.current && document.contains(previousFocusRef.current)) {
        previousFocusRef.current.focus();
      }
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Keep selection inside the list when results change
  useEffect(() => {
    if (items.length > 0 && selected >= items.length) setSelected(0);
  }, [items, selected]);

  // Scroll active item into view
  useEffect(() => {
    const el = listRef.current && listRef.current.querySelector('[data-active="true"]');
    if (el) el.scrollIntoView({ block: 'nearest' });
  }, [selected, items]);

  // Window-level keyboard handling: keeps working even if focus leaves the input
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.target !== inputRef.current) {
        // Focus is on a button — let it handle its own Enter/Space click
        return;
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelected((s) => (items.length ? (s + 1) % items.length : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelected((s) => (items.length ? (s - 1 + items.length) % items.length : 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        execute(items[selected]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, items, selected, execute, onClose]);

  if (!isOpen) return null;

  // Build grouped rows, inserting group headers on group change.
  // When the query is empty, recently used commands get a "Recent" header.
  const showRecents = !query.trim() && recentCount > 0;
  let lastGroup = null;
  const rows = [];
  items.forEach((item, idx) => {
    const header = showRecents && idx < recentCount ? 'Recent' : item.cmd.group;
    if (header !== lastGroup) {
      lastGroup = header;
      rows.push({ type: 'header', label: header, key: `h-${header}` });
    }
    rows.push({ type: 'item', item, idx, key: item.cmd.id });
  });

  return (
    <div
      className="command-palette-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      <div className="command-palette" onClick={(e) => e.stopPropagation()}>
        <div className="cp-search-row">
          <Search size={18} className="cp-search-icon" />
          <input
            ref={inputRef}
            type="text"
            className="cp-input"
            placeholder="Type a command or search…"
            aria-label="Search commands"
            role="combobox"
            aria-expanded="true"
            aria-controls="cp-listbox"
            aria-activedescendant={items[selected] ? `cp-option-${items[selected].cmd.id}` : undefined}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelected(0);
            }}
            autoComplete="off"
            spellCheck={false}
          />
          <button type="button" className="kbd cp-esc-hint" onClick={onClose} aria-label="Close command palette">
            esc
          </button>
        </div>

        <div className="cp-list" ref={listRef} role="listbox" id="cp-listbox" aria-label="Commands">
          {items.length === 0 && (
            <div className="cp-empty">
              <Search size={22} />
              <p>No commands found for “{query}”</p>
            </div>
          )}
          {rows.map((row) =>
            row.type === 'header' ? (
              <div key={row.key} className="cp-group-label" role="presentation">
                {row.label}
              </div>
            ) : (
              <button
                key={row.key}
                type="button"
                role="option"
                id={`cp-option-${row.item.cmd.id}`}
                aria-selected={row.idx === selected}
                data-active={row.idx === selected}
                className={`cp-item ${row.idx === selected ? 'cp-item-active' : ''}`}
                onClick={() => execute(row.item)}
                onMouseEnter={() => setSelected(row.idx)}
              >
                <span className="cp-item-icon">
                  <row.item.cmd.icon size={16} />
                </span>
                <span className="cp-item-label">
                  <HighlightedLabel
                    text={row.item.cmd.label}
                    matches={row.item.match && row.item.match.matches}
                    active={row.idx === selected}
                  />
                </span>
                <span className="cp-item-hint">{row.item.cmd.hint}</span>
              </button>
            )
          )}
        </div>

        <div className="cp-footer">
          <span className="kbd">↑</span>
          <span className="kbd">↓</span>
          <span className="cp-footer-label">to navigate</span>
          <span className="kbd">↵</span>
          <span className="cp-footer-label">to select</span>
          <span className="kbd">esc</span>
          <span className="cp-footer-label">to dismiss</span>
          <CornerDownLeft size={13} className="cp-footer-spark" />
        </div>
      </div>
    </div>
  );
}
