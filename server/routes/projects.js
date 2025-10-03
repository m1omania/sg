const express = require('express');
const router = express.Router();
const { dbGet, dbAll } = require('../config/database');

// Получить все активные проекты
router.get('/', async (req, res) => {
  try {
    const projects = await dbAll(`
      SELECT * FROM projects 
      WHERE status = 'active'
      ORDER BY created_at DESC
    `);
    
    res.json(projects);
  } catch (err) {
    console.error('Error fetching projects:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Получить проект по ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const project = await dbGet(`
      SELECT * FROM projects 
      WHERE id = ?
    `, [id]);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.json(project);
  } catch (err) {
    console.error('Error fetching project:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


module.exports = router;