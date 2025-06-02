import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// GET all sponsorships
router.get('/', async (req, res) => {
  try {
    const sponsorships = await prisma.sponsorship.findMany({
      include: {
        child: {
          include: {
            school: true
          }
        },
        sponsor: {
          include: {
            proxy: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(sponsorships);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sponsorships' });
  }
});

// POST create new sponsorship
router.post('/', async (req, res) => {
  try {
    const { childId, sponsorId, monthlyAmount, paymentMethod, notes } = req.body;
    
    // Check if child is already sponsored
    const existingSponsorship = await prisma.sponsorship.findUnique({
      where: { childId: parseInt(childId) }
    });
    
    if (existingSponsorship) {
      return res.status(400).json({ error: 'Child is already sponsored' });
    }
    
    const sponsorship = await prisma.sponsorship.create({
      data: {
        childId: parseInt(childId),
        sponsorId: parseInt(sponsorId),
        monthlyAmount: monthlyAmount ? parseFloat(monthlyAmount) : null,
        paymentMethod,
        notes
      },
      include: {
        child: {
          include: {
            school: true
          }
        },
        sponsor: {
          include: {
            proxy: true
          }
        }
      }
    });
    
    // Update child's sponsored status
    await prisma.child.update({
      where: { id: parseInt(childId) },
      data: { isSponsored: true }
    });
    
    res.status(201).json(sponsorship);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create sponsorship' });
  }
});

export default router;