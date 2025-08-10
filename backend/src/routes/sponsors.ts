// Enhanced backend/src/routes/sponsors.ts
import express from 'express';
import { prisma } from '../lib/db'; 

const router = express.Router();

// GET all sponsors with pagination and search
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string || '';
    const proxyFilter = req.query.proxy as string || 'all';
    const sponsorshipFilter = req.query.sponsorship as string || 'all';

    const skip = (page - 1) * limit;

    // Build where clause for filtering
    const where: any = {};

    // Search filter
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { contact: { contains: search, mode: 'insensitive' } },
        {
          proxy: {
            fullName: { contains: search, mode: 'insensitive' }
          }
        }
      ];
    }

    // Proxy filter
    if (proxyFilter === 'with_proxy') {
      where.proxyId = { not: null };
    } else if (proxyFilter === 'without_proxy') {
      where.proxyId = null;
    }

    // Sponsorship filter
    if (sponsorshipFilter === 'active') {
      where.sponsorships = {
        some: { isActive: true }
      };
    } else if (sponsorshipFilter === 'inactive') {
      where.sponsorships = {
        none: { isActive: true }
      };
    }

    const [sponsors, totalCount] = await Promise.all([
      prisma.sponsor.findMany({
        where,
        skip,
        take: limit,
        include: {
          proxy: {
            select: {
              id: true,
              fullName: true,
              role: true,
              email: true,
              phone: true,
              contact: true,
              description: true
            }
          },
          sponsorships: {
            where: { isActive: true },
            include: {
              child: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  school: {
                    select: {
                      name: true,
                      location: true
                    }
                  }
                }
              }
            }
          }
        },
        orderBy: { fullName: 'asc' }
      }),
      prisma.sponsor.count({ where })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      data: sponsors,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        startIndex: skip + 1,
        endIndex: Math.min(skip + limit, totalCount)
      }
    });
  } catch (error) {
    console.error('Error fetching sponsors:', error);
    res.status(500).json({ error: 'Failed to fetch sponsors' });
  }
});

// GET specific sponsor by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const sponsor = await prisma.sponsor.findUnique({
      where: { id: parseInt(id) },
      include: {
        proxy: {
          select: {
            id: true,
            fullName: true,
            role: true,
            email: true,
            phone: true,
            contact: true,
            description: true
          }
        },
        sponsorships: {
          include: {
            child: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                school: {
                  select: {
                    name: true,
                    location: true
                  }
                }
              }
            }
          },
          orderBy: { startDate: 'desc' }
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

// POST create new sponsor
router.post('/', async (req, res) => {
  try {
    const { fullName, email, phone, contact, proxyId } = req.body;

    // Validation
    if (!fullName?.trim()) {
      return res.status(400).json({ error: 'Sponsor full name is required' });
    }

    // Validate email format if provided
    if (email?.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return res.status(400).json({ error: 'Invalid email format' });
      }
    }

    // Validate proxy exists if provided
    if (proxyId) {
      const proxy = await prisma.proxy.findUnique({
        where: { id: parseInt(proxyId) }
      });
      if (!proxy) {
        return res.status(400).json({ error: 'Invalid proxy ID' });
      }
    }

    // Create sponsor
    const sponsorData: any = {
      fullName: fullName.trim(),
      contact: contact?.trim() || '',
    };

    if (email?.trim()) {
      sponsorData.email = email.trim().toLowerCase();
    }

    if (phone?.trim()) {
      sponsorData.phone = phone.trim();
    }

    if (proxyId) {
      sponsorData.proxyId = parseInt(proxyId);
    }

    const sponsor = await prisma.sponsor.create({
      data: sponsorData,
      include: {
        proxy: {
          select: {
            id: true,
            fullName: true,
            role: true,
            contact: true,
            email: true,
            phone: true,
            description: true
          }
        }
      }
    });

    res.status(201).json(sponsor);
  } catch (error: unknown) {
    console.error('Error creating sponsor:', error);
    
    // Handle unique constraint violations
    if (error instanceof Error && 'code' in error && (error as any).code === 'P2002') {
      return res.status(400).json({ 
        error: 'A sponsor with this information already exists' 
      });
    }
    
    res.status(500).json({ error: 'Failed to create sponsor' });
  }
});

// PUT update specific sponsor
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, email, phone, contact, proxyId } = req.body;
    
    // Validate sponsor exists
    const existingSponsor = await prisma.sponsor.findUnique({
      where: { id: parseInt(id) }
    });
    if (!existingSponsor) {
      return res.status(404).json({ error: 'Sponsor not found' });
    }

    // Validation
    if (fullName !== undefined && !fullName?.trim()) {
      return res.status(400).json({ error: 'Sponsor full name cannot be empty' });
    }

    // Validate email format if provided
    if (email?.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return res.status(400).json({ error: 'Invalid email format' });
      }
    }

    // Validate proxy exists if provided
    if (proxyId) {
      const proxy = await prisma.proxy.findUnique({
        where: { id: parseInt(proxyId) }
      });
      if (!proxy) {
        return res.status(400).json({ error: 'Invalid proxy ID' });
      }
    }

    // Build update data
    const updateData: any = {};
    
    if (fullName !== undefined) {
      updateData.fullName = fullName.trim();
    }
    
    if (email !== undefined) {
      updateData.email = email?.trim()?.toLowerCase() || null;
    }
    
    if (phone !== undefined) {
      updateData.phone = phone?.trim() || null;
    }
    
    if (contact !== undefined) {
      updateData.contact = contact?.trim() || '';
    }

    if (proxyId !== undefined) {
      updateData.proxyId = proxyId ? parseInt(proxyId) : null;
    }

    const sponsor = await prisma.sponsor.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        proxy: {
          select: {
            id: true,
            fullName: true,
            role: true,
            contact: true,
            email: true,
            phone: true,
            description: true
          }
        },
        sponsorships: {
          include: {
            child: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                school: {
                  select: {
                    name: true,
                    location: true
                  }
                }
              }
            }
          },
          orderBy: { startDate: 'desc' }
        }
      }
    });

    res.json(sponsor);
  } catch (error: unknown) {
    console.error('Error updating sponsor:', error);
    res.status(500).json({ error: 'Failed to update sponsor' });
  }
});

// DELETE sponsor
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if sponsor exists
    const existingSponsor = await prisma.sponsor.findUnique({
      where: { id: parseInt(id) },
      include: {
        sponsorships: {
          where: { isActive: true }
        }
      }
    });

    if (!existingSponsor) {
      return res.status(404).json({ error: 'Sponsor not found' });
    }

    // Check if sponsor has active sponsorships
    if (existingSponsor.sponsorships.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete sponsor with active sponsorships. End sponsorships first.'
      });
    }

    await prisma.sponsor.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Sponsor deleted successfully' });
  } catch (error) {
    console.error('Error deleting sponsor:', error);
    res.status(500).json({ error: 'Failed to delete sponsor' });
  }
});

export default router;