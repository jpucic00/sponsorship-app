import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// GET all sponsors with pagination - MUST be first
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string || '';
    const proxyId = req.query.proxyId as string;
    const hasSponsorship = req.query.hasSponsorship as string; // 'active' | 'none' | undefined

    const skip = (page - 1) * limit;

    // Build where clause based on filters
    const where: any = {};

    // Search filter
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { contact: { contains: search, mode: 'insensitive' } },
        { proxy: { fullName: { contains: search, mode: 'insensitive' } } }
      ];
    }

    // Proxy filter
    if (proxyId && proxyId !== 'all') {
      if (proxyId === 'none') {
        where.proxyId = null;
      } else {
        where.proxyId = parseInt(proxyId);
      }
    }

    // Sponsorship status filter
    if (hasSponsorship && hasSponsorship !== 'all') {
      if (hasSponsorship === 'active') {
        where.sponsorships = { some: { isActive: true } };
      } else if (hasSponsorship === 'none') {
        where.sponsorships = { none: { isActive: true } };
      }
    }

    // Get total count for pagination
    const totalCount = await prisma.sponsor.count({ where });

    // Get paginated sponsors
    const sponsors = await prisma.sponsor.findMany({
      where,
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
      orderBy: { fullName: 'asc' },
      skip,
      take: limit
    });

    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.json({
      data: sponsors,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNextPage,
        hasPrevPage,
        startIndex: skip + 1,
        endIndex: Math.min(skip + limit, totalCount)
      }
    });
  } catch (error) {
    console.error('Error fetching sponsors:', error);
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