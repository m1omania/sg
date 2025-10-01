const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Получить все активные проекты
router.get('/', (req, res) => {
  try {
    const stmt = db.prepare(`
      SELECT * FROM projects 
      WHERE status = 'active'
      ORDER BY created_at DESC
    `);
    
    const projects = stmt.all();
    res.json(projects);
  } catch (err) {
    console.error('Error fetching projects:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Получить проект по ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  
  try {
    const stmt = db.prepare(`
      SELECT * FROM projects 
      WHERE id = ?
    `);
    
    const project = stmt.get(id);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.json(project);
  } catch (err) {
    console.error('Error fetching project:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Поиск проектов
router.get('/search/:query', (req, res) => {
  const { query } = req.params;
  
  try {
    const stmt = db.prepare(`
      SELECT * FROM projects 
      WHERE status = 'active' AND (name LIKE ? OR description LIKE ?)
      ORDER BY created_at DESC
    `);
    
    const projects = stmt.all(`%${query}%`, `%${query}%`);
    res.json(projects);
  } catch (err) {
    console.error('Error searching projects:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;