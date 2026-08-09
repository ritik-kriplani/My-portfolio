import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';

export default function AdminDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('analytics'); // analytics, contacts, guestbook, projects, skills
  const [stats, setStats] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [comments, setComments] = useState([]);
  const [skills, setSkills] = useState([]);
  const [projects, setProjects] = useState([]);

  // Form states for Skills CRUD
  const [skillForm, setSkillForm] = useState({ name: '', iconClass: '', category: 'Frontend', level: 80 });
  const [editingSkillId, setEditingSkillId] = useState(null);
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);

  // Form states for Projects CRUD
  const [projectForm, setProjectForm] = useState({ title: '', description: '', techTags: '', lottieSrc: '', liveUrl: '', githubUrl: '', order: 0 });
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem('adminToken');

  const getHeaders = () => ({
    headers: { Authorization: `Bearer ${token}` }
  });

  useEffect(() => {
    if (!token) {
      navigate('/admin/login');
      return;
    }

    // Initial data fetch
    fetchAnalytics();
    fetchContacts();
    fetchComments();
    fetchSkills();
    fetchProjects();
  }, [token, navigate]);

  // --- API Fetches ---
  const fetchAnalytics = async () => {
    try {
      const res = await axios.get('https://my-portfolio-6tlq.onrender.com/api/analytics/stats', getHeaders());
      setStats(res.data);
    } catch (err) {
      handleAuthError(err);
    }
  };

  const fetchContacts = async () => {
    try {
      const res = await axios.get('https://my-portfolio-6tlq.onrender.com/api/contacts', getHeaders());
      setContacts(res.data);
    } catch (err) {
      handleAuthError(err);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await axios.get('https://my-portfolio-6tlq.onrender.com/api/guestbook/all', getHeaders());
      setComments(res.data);
    } catch (err) {
      handleAuthError(err);
    }
  };

  const fetchSkills = async () => {
    try {
      const res = await axios.get('https://my-portfolio-6tlq.onrender.com/api/skills');
      setSkills(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await axios.get('https://my-portfolio-6tlq.onrender.com/api/projects');
      setProjects(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAuthError = (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('adminToken');
      onLogout();
      navigate('/admin/login');
    }
  };

  const handleSignout = () => {
    localStorage.removeItem('adminToken');
    onLogout();
    navigate('/admin/login');
  };

  // --- Contact Operations ---
  const toggleContactRead = async (id) => {
    try {
      await axios.put(`https://my-portfolio-6tlq.onrender.com/api/contacts/${id}/read`, {}, getHeaders());
      fetchContacts();
      fetchAnalytics();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteContact = async (id) => {
    if (!window.confirm('Delete message thread?')) return;
    try {
      await axios.delete(`https://my-portfolio-6tlq.onrender.com/api/contacts/${id}`, getHeaders());
      fetchContacts();
      fetchAnalytics();
    } catch (err) {
      console.error(err);
    }
  };

  // --- Guestbook Operations ---
  const toggleCommentApproval = async (id) => {
    try {
      await axios.put(`https://my-portfolio-6tlq.onrender.com/api/guestbook/${id}/approve`, {}, getHeaders());
      fetchComments();
      fetchAnalytics();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteComment = async (id) => {
    if (!window.confirm('Delete guestbook comment?')) return;
    try {
      await axios.delete(`https://my-portfolio-6tlq.onrender.com/api/guestbook/${id}`, getHeaders());
      fetchComments();
      fetchAnalytics();
    } catch (err) {
      console.error(err);
    }
  };

  // --- Skill CRUD Operations ---
  const openSkillModal = (skill = null) => {
    if (skill) {
      setEditingSkillId(skill._id);
      setSkillForm({
        name: skill.name,
        iconClass: skill.iconClass,
        category: skill.category || 'Frontend',
        level: skill.level || 80
      });
    } else {
      setEditingSkillId(null);
      setSkillForm({ name: '', iconClass: '', category: 'Frontend', level: 80 });
    }
    setIsSkillModalOpen(true);
  };

  const handleSkillSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSkillId) {
        // Update skill
        await axios.put(`https://my-portfolio-6tlq.onrender.com/api/skills/${editingSkillId}`, skillForm, getHeaders());
      } else {
        // Create skill
        await axios.post('https://my-portfolio-6tlq.onrender.com/api/skills', skillForm, getHeaders());
      }
      setIsSkillModalOpen(false);
      fetchSkills();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteSkill = async (id) => {
    if (!window.confirm('Remove skill listing?')) return;
    try {
      await axios.delete(`https://my-portfolio-6tlq.onrender.com/api/skills/${id}`, getHeaders());
      fetchSkills();
    } catch (err) {
      console.error(err);
    }
  };

  // --- Project CRUD Operations ---
  const openProjectModal = (proj = null) => {
    if (proj) {
      setEditingProjectId(proj._id);
      setProjectForm({
        title: proj.title,
        description: proj.description,
        techTags: proj.techTags.join(', '),
        lottieSrc: proj.lottieSrc,
        liveUrl: proj.liveUrl || '',
        githubUrl: proj.githubUrl || '',
        order: proj.order || 0
      });
    } else {
      setEditingProjectId(null);
      setProjectForm({ title: '', description: '', techTags: '', lottieSrc: '', liveUrl: '', githubUrl: '', order: 0 });
    }
    setIsProjectModalOpen(true);
  };

  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    const formattedForm = {
      ...projectForm,
      techTags: projectForm.techTags.split(',').map(tag => tag.trim()).filter(Boolean)
    };

    try {
      if (editingProjectId) {
        // Update project
        await axios.put(`https://my-portfolio-6tlq.onrender.com/api/projects/${editingProjectId}`, formattedForm, getHeaders());
      } else {
        // Create project
        await axios.post('https://my-portfolio-6tlq.onrender.com/api/projects', formattedForm, getHeaders());
      }
      setIsProjectModalOpen(false);
      fetchProjects();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteProject = async (id) => {
    if (!window.confirm('Delete project card?')) return;
    try {
      await axios.delete(`https://my-portfolio-6tlq.onrender.com/api/projects/${id}`, getHeaders());
      fetchProjects();
    } catch (err) {
      console.error(err);
    }
  };

  // Colors list for PieCharts
  const COLORS = ['#00d4ff', '#ff6b6b', '#4ecdc4', '#ffbd2e', '#9b5de5', '#f15bb5'];

  return (
    <div className="admin-shell">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h2>Ritik Admin</h2>
          <span className="badge badge-success">Live</span>
        </div>
        <ul className="admin-sidebar-menu">
          <li 
            className={`admin-menu-item ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <i className="fas fa-chart-line"></i>
            <span>Traffic Analytics</span>
          </li>
          <li 
            className={`admin-menu-item ${activeTab === 'contacts' ? 'active' : ''}`}
            onClick={() => setActiveTab('contacts')}
          >
            <i className="fas fa-envelope"></i>
            <span>Inquiries ({contacts.filter(c => !c.isRead).length})</span>
          </li>
          <li 
            className={`admin-menu-item ${activeTab === 'guestbook' ? 'active' : ''}`}
            onClick={() => setActiveTab('guestbook')}
          >
            <i className="fas fa-book-open"></i>
            <span>Guestbook ({comments.filter(c => !c.approved).length})</span>
          </li>
          <li 
            className={`admin-menu-item ${activeTab === 'projects' ? 'active' : ''}`}
            onClick={() => setActiveTab('projects')}
          >
            <i className="fas fa-folder-open"></i>
            <span>Projects CRUD</span>
          </li>
          <li 
            className={`admin-menu-item ${activeTab === 'skills' ? 'active' : ''}`}
            onClick={() => setActiveTab('skills')}
          >
            <i className="fas fa-tools"></i>
            <span>Skills CRUD</span>
          </li>
        </ul>
        <div className="admin-sidebar-footer">
          <button onClick={handleSignout} className="admin-menu-item" style={{ border: 'none', background: 'transparent', width: '100%', textAlign: 'left' }}>
            <i className="fas fa-sign-out-alt"></i>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-content">
        <header className="admin-section-header">
          <h2>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Manager</h2>
          {activeTab === 'skills' && (
            <button className="btn btn-primary" onClick={() => openSkillModal()}>
              <i className="fas fa-plus"></i> Add Skill
            </button>
          )}
          {activeTab === 'projects' && (
            <button className="btn btn-primary" onClick={() => openProjectModal()}>
              <i className="fas fa-plus"></i> Add Project
            </button>
          )}
        </header>

        {/* 1. TRAFFIC ANALYTICS VIEW */}
        {activeTab === 'analytics' && stats && (
          <div>
            {/* Core Stats Overview Cards */}
            <div className="admin-stats-grid">
              <div className="stat-card">
                <div className="stat-icon"><i className="fas fa-eye"></i></div>
                <div className="stat-info">
                  <h3>Total Pageviews</h3>
                  <p>{stats.summary.totalViews}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon"><i className="fas fa-envelope-open-text"></i></div>
                <div className="stat-info">
                  <h3>Messages Received</h3>
                  <p>{stats.summary.totalContacts} ({stats.summary.pendingContacts} new)</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon"><i className="fas fa-pen-nib"></i></div>
                <div className="stat-info">
                  <h3>Guestbook Entries</h3>
                  <p>{stats.summary.totalComments} ({stats.summary.pendingComments} review)</p>
                </div>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="admin-charts-grid">
              {/* Daily Pageviews Area Chart */}
              <div className="chart-container">
                <h3>Daily Traffic (Past 7 Days)</h3>
                <div style={{ width: '100%', height: 260 }}>
                  <ResponsiveContainer>
                    <AreaChart data={stats.dailyViews}>
                      <defs>
                        <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#00d4ff" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" stroke="#888" tickLine={false} />
                      <YAxis stroke="#888" tickLine={false} />
                      <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '10px' }} />
                      <Area type="monotone" dataKey="views" stroke="#00d4ff" fillOpacity={1} fill="url(#colorViews)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Geographic Country Distribution Pie Chart */}
              <div className="chart-container">
                <h3>Geographic Distribution</h3>
                <div style={{ width: '100%', height: 260 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={stats.geoStats}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {stats.geoStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333' }} />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Action Clicks Logs Bar Chart */}
            <div className="chart-container" style={{ marginBottom: 40 }}>
              <h3>Interactive Click Event Metrics</h3>
              <div style={{ width: '100%', height: 280 }}>
                <ResponsiveContainer>
                  <BarChart data={stats.clickStats}>
                    <XAxis dataKey="name" stroke="#888" />
                    <YAxis stroke="#888" />
                    <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333' }} />
                    <Bar dataKey="clicks" fill="#4ecdc4" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* 2. CONTACTS MESSAGES VIEW */}
        {activeTab === 'contacts' && (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Sender</th>
                  <th>Email</th>
                  <th>Message</th>
                  <th>Submitted</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {contacts.length > 0 ? (
                  contacts.map(c => (
                    <tr key={c._id}>
                      <td style={{ fontWeight: 600 }}>{c.name}</td>
                      <td><a href={`mailto:${c.email}`} style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>{c.email}</a></td>
                      <td style={{ maxWidth: '300px', wordBreak: 'break-word' }}>{c.message}</td>
                      <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge ${c.isRead ? 'badge-success' : 'badge-pending'}`} style={{ cursor: 'pointer' }} onClick={() => toggleContactRead(c._id)}>
                          {c.isRead ? 'Read' : 'New'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button className="btn-icon" title="Mark Read/Unread" onClick={() => toggleContactRead(c._id)}>
                            <i className={c.isRead ? 'fas fa-envelope' : 'fas fa-envelope-open'}></i>
                          </button>
                          <button className="btn-icon delete" title="Delete Message" onClick={() => deleteContact(c._id)}>
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Inbox is empty.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 3. GUESTBOOK SIGNATURES VIEW */}
        {activeTab === 'guestbook' && (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Visitor</th>
                  <th>Comment</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {comments.length > 0 ? (
                  comments.map(c => (
                    <tr key={c._id}>
                      <td style={{ fontWeight: 600 }}>{c.name}</td>
                      <td style={{ maxWidth: '400px', wordBreak: 'break-word' }}>"{c.comment}"</td>
                      <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge ${c.approved ? 'badge-success' : 'badge-pending'}`} style={{ cursor: 'pointer' }} onClick={() => toggleCommentApproval(c._id)}>
                          {c.approved ? 'Approved' : 'Pending'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button className="btn-icon" title="Approve/Revoke" onClick={() => toggleCommentApproval(c._id)}>
                            <i className={c.approved ? 'fas fa-times-circle' : 'fas fa-check-circle'}></i>
                          </button>
                          <button className="btn-icon delete" title="Delete Comment" onClick={() => deleteComment(c._id)}>
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>No comments registered.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 4. PROJECTS CRUD VIEW */}
        {activeTab === 'projects' && (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Tech Stack</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map(p => (
                  <tr key={p._id}>
                    <td>{p.order}</td>
                    <td style={{ fontWeight: 600, color: 'var(--primary-color)' }}>{p.title}</td>
                    <td style={{ maxWidth: '300px', wordBreak: 'break-all' }}>{p.description}</td>
                    <td>{p.techTags.join(', ')}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn-icon" title="Edit Card" onClick={() => openProjectModal(p)}>
                          <i className="fas fa-edit"></i>
                        </button>
                        <button className="btn-icon delete" title="Delete Card" onClick={() => deleteProject(p._id)}>
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 5. SKILLS CRUD VIEW */}
        {activeTab === 'skills' && (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Skill Name</th>
                  <th>Category</th>
                  <th>Icon Class</th>
                  <th>Proficiency Level</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {skills.map(s => (
                  <tr key={s._id}>
                    <td style={{ fontWeight: 600 }}>{s.name}</td>
                    <td><span className="badge badge-success" style={{ background: 'rgba(0, 212, 255, 0.08)', color: '#00d4ff' }}>{s.category}</span></td>
                    <td><code>{s.iconClass}</code> (e.g. <i className={s.iconClass}></i>)</td>
                    <td>{s.level}%</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn-icon" onClick={() => openSkillModal(s)}>
                          <i className="fas fa-edit"></i>
                        </button>
                        <button className="btn-icon delete" onClick={() => deleteSkill(s._id)}>
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* --- SKILL CRUD DIALOG MODAL --- */}
      {isSkillModalOpen && (
        <div className="crud-modal">
          <div className="crud-modal-card">
            <h3>{editingSkillId ? 'Edit Skill Record' : 'Add New Skill'}</h3>
            <form onSubmit={handleSkillSubmit}>
              <div className="crud-form-group">
                <label>Skill Name</label>
                <input 
                  type="text" 
                  value={skillForm.name} 
                  onChange={(e) => setSkillForm({...skillForm, name: e.target.value})} 
                  required 
                />
              </div>

              <div className="crud-form-group">
                <label>FontAwesome Icon Class (e.g., fab fa-react)</label>
                <input 
                  type="text" 
                  value={skillForm.iconClass} 
                  onChange={(e) => setSkillForm({...skillForm, iconClass: e.target.value})} 
                  required 
                />
              </div>

              <div className="crud-form-group">
                <label>Skill Category</label>
                <select 
                  value={skillForm.category} 
                  onChange={(e) => setSkillForm({...skillForm, category: e.target.value})}
                >
                  <option value="Frontend">Frontend</option>
                  <option value="Backend">Backend</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Languages">Languages</option>
                  <option value="Tools">Tools</option>
                </select>
              </div>

              <div className="crud-form-group">
                <label>Proficiency Level: {skillForm.level}%</label>
                <input 
                  type="range" 
                  min="10" 
                  max="100" 
                  value={skillForm.level} 
                  onChange={(e) => setSkillForm({...skillForm, level: Number(e.target.value)})} 
                />
              </div>

              <div className="crud-actions">
                <button type="button" className="btn btn-secondary" style={{ padding: '8px 16px' }} onClick={() => setIsSkillModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ padding: '8px 16px' }}>Save Record</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- PROJECT CRUD DIALOG MODAL --- */}
      {isProjectModalOpen && (
        <div className="crud-modal">
          <div className="crud-modal-card" style={{ maxWidth: '600px' }}>
            <h3>{editingProjectId ? 'Edit Project Details' : 'Create Project Card'}</h3>
            <form onSubmit={handleProjectSubmit}>
              <div className="crud-form-group">
                <label>Project Title</label>
                <input 
                  type="text" 
                  value={projectForm.title} 
                  onChange={(e) => setProjectForm({...projectForm, title: e.target.value})} 
                  required 
                />
              </div>

              <div className="crud-form-group">
                <label>Description</label>
                <textarea 
                  rows="3" 
                  value={projectForm.description} 
                  onChange={(e) => setProjectForm({...projectForm, description: e.target.value})} 
                  required
                ></textarea>
              </div>

              <div className="crud-form-group">
                <label>Technology Tags (comma-separated, e.g. React, Node.js)</label>
                <input 
                  type="text" 
                  value={projectForm.techTags} 
                  onChange={(e) => setProjectForm({...projectForm, techTags: e.target.value})} 
                  required 
                />
              </div>

              <div className="crud-form-group">
                <label>Lottie Path / CDN URL (e.g. /robot.json or external JSON link)</label>
                <input 
                  type="text" 
                  value={projectForm.lottieSrc} 
                  onChange={(e) => setProjectForm({...projectForm, lottieSrc: e.target.value})} 
                  required 
                />
              </div>

              <div className="crud-form-group">
                <label>Live Demo URL</label>
                <input 
                  type="text" 
                  value={projectForm.liveUrl} 
                  onChange={(e) => setProjectForm({...projectForm, liveUrl: e.target.value})} 
                />
              </div>

              <div className="crud-form-group">
                <label>GitHub Code URL</label>
                <input 
                  type="text" 
                  value={projectForm.githubUrl} 
                  onChange={(e) => setProjectForm({...projectForm, githubUrl: e.target.value})} 
                />
              </div>

              <div className="crud-form-group">
                <label>Render Sort Order Index</label>
                <input 
                  type="number" 
                  value={projectForm.order} 
                  onChange={(e) => setProjectForm({...projectForm, order: Number(e.target.value)})} 
                />
              </div>

              <div className="crud-actions">
                <button type="button" className="btn btn-secondary" style={{ padding: '8px 16px' }} onClick={() => setIsProjectModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ padding: '8px 16px' }}>Save Project</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
