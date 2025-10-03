const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// Basic security middleware
app.use(helmet());

// CORS
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api', limiter);

// Static files
app.use(express.static(path.join(__dirname, '../')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'production'
  });
});

// Basic API routes
app.get('/api/projects', (req, res) => {
  res.json([
    {
      id: 1,
      name: "Дирижабли",
      description: "Инвестируйте в инновационные проекты воздушных дирижаблей. Современные технологии и экологичный транспорт будущего.",
      image_url: "/images/airships.jpg",
      min_investment: 500,
      interest_rate: 12,
      duration: 36,
      status: "active",
      created_at: "2025-10-03 10:48:32"
    },
    {
      id: 2,
      name: "Совэлмаш",
      description: "Инвестируйте в развитие современного машиностроительного завода. Перспективный проект с высокой отдачей.",
      image_url: "/images/sovelmash.jpg",
      min_investment: 1000,
      interest_rate: 15,
      duration: 60,
      status: "active",
      created_at: "2025-10-03 10:48:32"
    },
    {
      id: 3,
      name: "Солнечные панели",
      description: "Инвестируйте в развитие солнечной энергетики. Проект по установке солнечных панелей в жилых комплексах.",
      image_url: "/images/solar.jpg",
      min_investment: 250,
      interest_rate: 10,
      duration: 24,
      status: "active",
      created_at: "2025-10-03 10:48:32"
    }
  ]);
});

app.get('/api/projects/:id', (req, res) => {
  const { id } = req.params;
  const projects = [
    {
      id: 1,
      name: "Дирижабли",
      description: "Инвестируйте в инновационные проекты воздушных дирижаблей. Современные технологии и экологичный транспорт будущего.",
      image_url: "/images/airships.jpg",
      min_investment: 500,
      interest_rate: 12,
      duration: 36,
      status: "active",
      created_at: "2025-10-03 10:48:32"
    },
    {
      id: 2,
      name: "Совэлмаш",
      description: "Инвестируйте в развитие современного машиностроительного завода. Перспективный проект с высокой отдачей.",
      image_url: "/images/sovelmash.jpg",
      min_investment: 1000,
      interest_rate: 15,
      duration: 60,
      status: "active",
      created_at: "2025-10-03 10:48:32"
    },
    {
      id: 3,
      name: "Солнечные панели",
      description: "Инвестируйте в развитие солнечной энергетики. Проект по установке солнечных панелей в жилых комплексах.",
      image_url: "/images/solar.jpg",
      min_investment: 250,
      interest_rate: 10,
      duration: 24,
      status: "active",
      created_at: "2025-10-03 10:48:32"
    }
  ];
  
  const project = projects.find(p => p.id === parseInt(id));
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }
  
  res.json(project);
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Export for Vercel
module.exports = app;
