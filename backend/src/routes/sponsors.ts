import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// GET all sponsors
router.get('/', async (req, res) => {
  try {
    const sponsors = await prisma.sponsor.findMany({
      include: {
        proxy: true,
        sponsorships: {
          include: {
            child: {
              include: {
                school: true
              }
            }
          }
        }
      },
      orderBy: { fullName: 'asc' }
    });
    res.json(sponsors);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sponsors' });
  }
});

// POST create new sponsor
router.post('/', async (req, res) => {
  try {
    const { fullName, contact, proxyId } = req.body;
    const sponsor = await prisma.sponsor.create({
      data: {
        fullName,
        contact,
        proxyId: proxyId ? parseInt(proxyId) : null
      },
      include: {
        proxy: true
      }
    });
    res.status(201).json(sponsor);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create sponsor' });
  }
});

export default router;