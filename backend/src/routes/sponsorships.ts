import express from 'express';
import { prisma } from '../lib/db'; 

const router = express.Router();

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

// GET active sponsorships only
router.get('/active', async (req, res) => {
  try {
    const sponsorships = await prisma.sponsorship.findMany({
      where: { isActive: true },
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
    res.status(500).json({ error: 'Failed to fetch active sponsorships' });
  }
});

// POST create new sponsorship
router.post('/', async (req, res) => {
  try {
    const { childId, sponsorId, monthlyAmount, paymentMethod, notes } = req.body;
    
    // Check if this specific sponsorship already exists and is active
    const existingSponsorship = await prisma.sponsorship.findFirst({
      where: {
        childId: parseInt(childId),
        sponsorId: parseInt(sponsorId),
        isActive: true
      }
    });
    
    if (existingSponsorship) {
      return res.status(400).json({ error: 'This sponsor is already actively sponsoring this child' });
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
      data: { 
        isSponsored: true,
        lastProfileUpdate: new Date()
      }
    });
    
    res.status(201).json(sponsorship);
  } catch (error) {
    console.error('Error creating sponsorship:', error);
    res.status(500).json({ error: 'Failed to create sponsorship' });
  }
});

// PUT update sponsorship
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    
    if (updateData.monthlyAmount) {
      updateData.monthlyAmount = parseFloat(updateData.monthlyAmount);
    }

    const sponsorship = await prisma.sponsorship.update({
      where: { id: parseInt(id) },
      data: updateData,
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

    res.json(sponsorship);
  } catch (error) {
    console.error('Error updating sponsorship:', error);
    res.status(500).json({ error: 'Failed to update sponsorship' });
  }
});

// PUT end sponsorship (set inactive)
router.put('/:id/end', async (req, res) => {
  try {
    const { id } = req.params;
    const { endDate, notes } = req.body;

    const sponsorship = await prisma.sponsorship.update({
      where: { id: parseInt(id) },
      data: {
        isActive: false,
        endDate: endDate ? new Date(endDate) : new Date(),
        notes: notes || undefined
      },
      include: {
        child: true,
        sponsor: {
          include: {
            proxy: true
          }
        }
      }
    });

    // Check if child still has other active sponsorships
    const remainingSponsorships = await prisma.sponsorship.count({
      where: {
        childId: sponsorship.childId,
        isActive: true
      }
    });

    // Update child's sponsored status if no more active sponsorships
    if (remainingSponsorships === 0) {
      await prisma.child.update({
        where: { id: sponsorship.childId },
        data: { 
          isSponsored: false,
          lastProfileUpdate: new Date()
        }
      });
    }

    res.json(sponsorship);
  } catch (error) {
    console.error('Error ending sponsorship:', error);
    res.status(500).json({ error: 'Failed to end sponsorship' });
  }
});

// GET sponsorships by child
router.get('/child/:childId', async (req, res) => {
  try {
    const { childId } = req.params;
    const sponsorships = await prisma.sponsorship.findMany({
      where: { childId: parseInt(childId) },
      include: {
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
    res.status(500).json({ error: 'Failed to fetch child sponsorships' });
  }
});

// GET sponsorships by sponsor
router.get('/sponsor/:sponsorId', async (req, res) => {
  try {
    const { sponsorId } = req.params;
    const sponsorships = await prisma.sponsorship.findMany({
      where: { sponsorId: parseInt(sponsorId) },
      include: {
        child: {
          include: {
            school: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(sponsorships);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sponsor sponsorships' });
  }
});

export default router;