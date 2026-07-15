const mongoose = require('mongoose');
const User = require('./models/User');
const Skill = require('./models/Skill');
const Project = require('./models/Project');
const Guestbook = require('./models/Guestbook');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/portfolio';

const skills = [
  { name: 'HTML', iconClass: 'fab fa-html5', category: 'Frontend', level: 95 },
  { name: 'CSS', iconClass: 'fab fa-css3-alt', category: 'Frontend', level: 90 },
  { name: 'JavaScript', iconClass: 'fab fa-js-square', category: 'Frontend', level: 90 },
  { name: 'React.js', iconClass: 'fab fa-react', category: 'Frontend', level: 85 },
  { name: 'Three.js', iconClass: 'fas fa-cube', category: 'Advanced', level: 80 },
  { name: 'C++', iconClass: 'fas fa-code', category: 'Languages', level: 85 },
  { name: 'C', iconClass: 'fas fa-code', category: 'Languages', level: 75 }
];

const projects = [
  {
    title: '3D Gallery',
    description: 'An immersive 3D gallery experience built with Three.js, featuring interactive 3D models and smooth animations.',
    techTags: ['Three.js', 'JavaScript', 'WebGL'],
    lottieSrc: '/Gallery (1).json',
    liveUrl: 'http://localhost:5173/',
    githubUrl: 'https://github.com/your_username',
    order: 1
  },
  {
    title: 'Particle Background Portfolio',
    description: 'A dynamic portfolio website featuring interactive particle backgrounds and smooth scroll animations.',
    techTags: ['HTML', 'CSS', 'JavaScript'],
    lottieSrc: 'https://assets5.lottiefiles.com/packages/lf20_xyadoh9h.json',
    liveUrl: '#',
    githubUrl: 'https://github.com/your_username',
    order: 2
  },
  {
    title: 'Help in Ren Site',
    description: 'A comprehensive help and support website with user-friendly interface and efficient navigation.',
    techTags: ['React', 'Node.js', 'MongoDB'],
    lottieSrc: '/robot.json',
    liveUrl: '#',
    githubUrl: 'https://github.com/your_username',
    order: 3
  },
  {
    title: 'Teachers Panel',
    description: 'A comprehensive dashboard for teachers to manage students, grades, and course materials efficiently.',
    techTags: ['React', 'Firebase', 'Material-UI'],
    lottieSrc: '/skills.json',
    liveUrl: '#',
    githubUrl: 'https://github.com/your_username',
    order: 4
  },
  {
    title: 'Sparks (SIH PS Website)',
    description: 'My Smart India Hackathon project website showcasing innovative solutions and project details.',
    techTags: ['HTML', 'CSS', 'JavaScript'],
    lottieSrc: '/skills2.json',
    liveUrl: 'http://127.0.0.1:5502/pages/login.html',
    githubUrl: 'https://github.com/your_username',
    order: 5
  }
];

const guestbookComments = [
  {
    name: 'Emily Watson',
    comment: 'Incredible design Ritik! The animations are super smooth and loading speed is very fast.',
    approved: true,
    avatarSeed: '1'
  },
  {
    name: 'Aarav Sharma',
    comment: 'Awesome portfolio website, Ritik! JECRC represents! Love the terminal commands feature.',
    approved: true,
    avatarSeed: '2'
  },
  {
    name: 'Senior Dev',
    comment: 'Solid execution! The admin panel is clean and the latency monitoring shows pro-level effort.',
    approved: true,
    avatarSeed: '5'
  }
];

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB database...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected! Starting database cleaning...');

    // Clear existing data
    await User.deleteMany({});
    await Skill.deleteMany({});
    await Project.deleteMany({});
    await Guestbook.deleteMany({});

    console.log('Database cleared. Seeding default Admin User...');
    
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'adminpassword123';
    
    const adminUser = new User({
      username: adminUsername,
      password: adminPassword // bcrypt hashing handled by pre-save schema hook
    });
    await adminUser.save();
    console.log(`Admin User successfully created! Username: ${adminUsername}, Password: ${adminPassword}`);

    console.log('Seeding skills list...');
    await Skill.insertMany(skills);
    console.log(`Inserted ${skills.length} skills!`);

    console.log('Seeding projects list...');
    await Project.insertMany(projects);
    console.log(`Inserted ${projects.length} projects!`);

    console.log('Seeding guestbook sample comments...');
    await Guestbook.insertMany(guestbookComments);
    console.log('Inserted sample guestbook comments!');

    console.log('Database Seeding successfully completed! 🎉');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
