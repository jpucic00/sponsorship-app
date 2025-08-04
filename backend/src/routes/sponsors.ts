import express from 'express';
import { prisma } from '../lib/db'; 
const router = express.Router();

// GET all sponsors with pagination and filtering
router.get('/', async (req, res) => {
  try {
    console.log('Sponsors API called with query:', req.query);

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = (req.query.search as string)?.trim() || '';
    const proxyId = req.query.proxyId as string;
    const hasSponsorship = req.query.hasSponsorship as string; // 'true' | 'false' | undefined

    console.log('Search term received:', search, 'Length:', search.length);

    const skip = (page - 1) * limit;

    // Build where clause based on filters
    const where: any = {};

    // Search filter
    if (search && search.length > 0) {
      console.log('Adding search filter for:', search);
      const searchLower = search.toLowerCase();
      where.OR = [
        { fullName: { contains: searchLower } },
        { email: { contains: searchLower } },
        { phone: { contains: searchLower } },
        { contact: { contains: searchLower } },
        {
          proxy: {
            fullName: { contains: searchLower }
          }
        }
      ];
    }

    // Proxy filter
    if (proxyId && proxyId !== 'all') {
      if (proxyId === 'none') {
        where.proxyId = null;
      } else if (proxyId === 'direct') {
        where.proxyId = null;
      } else {
        const proxyIdNum = parseInt(proxyId);
        if (!isNaN(proxyIdNum)) {
          where.proxyId = proxyIdNum;
        }
      }
    }

    // Sponsorship filter
    if (hasSponsorship && hasSponsorship !== 'all') {
      if (hasSponsorship === 'true') {
        where.sponsorships = { some: { isActive: true } };
      } else if (hasSponsorship === 'false') {
        where.sponsorships = { none: { isActive: true } };
      }
    }

    console.log('Final where clause:', JSON.stringify(where, null, 2));

    // Get total count for pagination
    const totalCount = await prisma.sponsor.count({ where });

    // Get sponsors with pagination
    const sponsors = await prisma.sponsor.findMany({
      where,
      include: {
        proxy: {
          select: {
            id: true,
            fullName: true,
            role: true,
            contact: true,
            email: true,
            phone: true
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
                    id: true,
                    name: true,
                    location: true
                  }
                }
              }
            }
          }
        },
        _count: {
          select: { sponsorships: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    const startIndex = skip + 1;
    const endIndex = Math.min(skip + limit, totalCount);

    console.log(`Returning ${sponsors.length} sponsors out of ${totalCount} total`);

    const response = {
      data: sponsors,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNextPage,
        hasPrevPage,
        startIndex,
        endIndex
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching sponsors:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error('Error stack:', errorStack);
    
    // Send a more detailed error response for debugging
    res.status(500).json({ 
      error: 'Failed to fetch sponsors',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      stack: process.env.NODE_ENV === 'development' ? errorStack : undefined
    });
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
                dateOfBirth: true,
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
            phone: true
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
            phone: true
          }
        },
        sponsorships: {
          where: { isActive: true },
          include: {
            child: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
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
  } catch (error: unknown) {
    console.error('Error deleting sponsor:', error);
    res.status(500).json({ error: 'Failed to delete sponsor' });
  }
});

// GET sponsors with search functionality
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const searchTerm = query.toLowerCase();

    const sponsors = await prisma.sponsor.findMany({
      where: {
        OR: [
          { fullName: { contains: searchTerm } },
          { email: { contains: searchTerm } },
          { phone: { contains: searchTerm } },
          { contact: { contains: searchTerm } },
          {
            proxy: {
              fullName: { contains: searchTerm }
            }
          }
        ]
      },
      include: {
        proxy: {
          select: {
            id: true,
            fullName: true,
            role: true,
            contact: true,
            email: true,
            phone: true
          }
        },
        sponsorships: {
          where: { isActive: true },
          include: {
            child: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        },
        _count: {
          select: { sponsorships: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(sponsors);
  } catch (error: unknown) {
    console.error('Error searching sponsors:', error);
    res.status(500).json({ error: 'Failed to search sponsors' });
  }
});

export default router;