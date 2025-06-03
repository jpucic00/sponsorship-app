import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// GET all sponsors - MUST be first
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

// PUT update specific sponsor
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    
    if (updateData.proxyId) {
      updateData.proxyId = parseInt(updateData.proxyId);
    }

    const sponsor = await prisma.sponsor.update({
      where: { id: parseInt(id) },
      data: updateData,
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
      }
    });

    res.json(sponsor);
  } catch (error) {
    console.error('Error updating sponsor:', error);
    res.status(500).json({ error: 'Failed to update sponsor record' });
  }
});

// GET specific sponsor by ID - MUST be last
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const sponsor = await prisma.sponsor.findUnique({
      where: { id: parseInt(id) },
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
      }
    });

    if (!sponsor) {
      return res.status(404).json({ error: 'Sponsor not found' });
    }

    res.json(sponsor);
  } catch (error) {
    console.error('Error fetching sponsor:', error);
    res.status(500).json({ error: 'Failed to fetch sponsor' });
  }
});

export default router;