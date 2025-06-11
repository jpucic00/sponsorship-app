import express from 'express';
import { PrismaClient } from '@prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'

const adapter = new PrismaLibSQL({
  url: `${process.env.TURSO_DATABASE_URL}`,
  authToken: `${process.env.TURSO_AUTH_TOKEN}`,
})
const prisma = new PrismaClient({ adapter })

const router = express.Router();

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