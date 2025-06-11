import express from 'express';
import { PrismaClient } from '@prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'

const adapter = new PrismaLibSQL({
  url: `${process.env.TURSO_DATABASE_URL?.trim()}`,
  authToken: `${process.env.TURSO_AUTH_TOKEN?.trim()}`,
})
const prisma = new PrismaClient({ adapter })

const router = express.Router();

// GET all volunteers
router.get('/', async (req, res) => {
  try {
    const volunteers = await prisma.volunteer.findMany({
      where: { isActive: true },
      orderBy: { firstName: 'asc' }
    });
    res.json(volunteers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch volunteers' });
  }
});

// POST create new volunteer
router.post('/', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, role } = req.body;
    const volunteer = await prisma.volunteer.create({
      data: { firstName, lastName, email, phone, role }
    });
    res.status(201).json(volunteer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create volunteer' });
  }
});

export default router;