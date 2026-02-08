import express from 'express';
import { prisma } from '../lib/db';
import { isAuthenticated } from '../middleware/auth';

const router = express.Router();

// Require authentication for all routes
router.use(isAuthenticated);

// GET all schools
router.get('/', async (req, res) => {
  try {
    const schools = await prisma.school.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });
    res.json(schools);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch schools' });
  }
});

// POST create new school
router.post('/', async (req, res) => {
  try {
    const { name, location } = req.body;
    const school = await prisma.school.create({
      data: { name, location }
    });
    res.status(201).json(school);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create school' });
  }
});

export default router;