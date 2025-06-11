import express from 'express';
import { PrismaClient } from '@prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'

const adapter = new PrismaLibSQL({
  url: `${process.env.TURSO_DATABASE_URL}`,
  authToken: `${process.env.TURSO_AUTH_TOKEN}`,
})
const prisma = new PrismaClient({ adapter })

const router = express.Router();

// GET all proxies
router.get('/', async (req, res) => {
  try {
    const proxies = await prisma.proxy.findMany({
      include: {
        sponsors: true
      },
      orderBy: { fullName: 'asc' }
    });
    res.json(proxies);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch proxies' });
  }
});

// POST create new proxy
router.post('/', async (req, res) => {
  try {
    const { fullName, contact, role, description } = req.body;
    const proxy = await prisma.proxy.create({
      data: { fullName, contact, role, description }
    });
    res.status(201).json(proxy);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create proxy' });
  }
});

export default router;