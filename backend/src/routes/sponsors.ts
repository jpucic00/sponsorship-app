// FIXED backend/src/routes/sponsors.ts - SQLite/Turso compatible version

import express from 'express';
import { prisma } from '../lib/db';
import { isAuthenticated } from '../middleware/auth';

const router = express.Router();

// All sponsor routes require authentication
router.use(isAuthenticated);

// GET all sponsors with pagination and search - FIXED VERSION
router.get('/', async (req, res) => {
  try {
    console.log('📥 Sponsors request received:', req.query);

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string || '';
    const proxyId = req.query.proxyId as string; // Changed from proxyFilter
    const hasSponsorship = req.query.hasSponsorship as string; // Changed from sponsorshipFilter

    const skip = (page - 1) * limit;

    // Build where clause for filtering
    const where: any = {};

    // Search filter - FIXED: Remove mode: 'insensitive' for SQLite compatibility
    if (search.trim()) {
      console.log('🔍 Adding search filter for:', search);
      // For SQLite, we need to handle case-insensitive search differently
      where.OR = [
        { fullName: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
        { contact: { contains: search } },
        {
          proxy: {
            fullName: { contains: search }
          }
        }
      ];
    }

    // Proxy filter - FIXED: Use proxyId parameter name
    if (proxyId && proxyId !== 'all') {
      console.log('🔗 Adding proxy filter:', proxyId);
      if (proxyId === 'none') {
        where.proxyId = null;
      } else {
        const proxyIdNum = parseInt(proxyId);
        if (!isNaN(proxyIdNum)) {
          where.proxyId = proxyIdNum;
        }
      }
    }

    // Sponsorship filter - FIXED: Use hasSponsorship parameter name
    if (hasSponsorship && hasSponsorship !== 'all') {
      console.log('💝 Adding sponsorship filter:', hasSponsorship);
      if (hasSponsorship === 'active') {
        where.sponsorships = {
          some: { isActive: true }
        };
      } else if (hasSponsorship === 'available') {
        where.sponsorships = {
          none: { isActive: true }
        };
      }
    }

    console.log('🗃️ Final where clause:', JSON.stringify(where, null, 2));

    // Execute the queries
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

    console.log(`✅ Query successful: ${sponsors.length} sponsors, ${totalCount} total`);

    const totalPages = Math.ceil(totalCount / limit);

    const response = {
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
    };

    res.json(response);
  } catch (error) {
    console.error('❌ Error fetching sponsors:', error);
    
    // More specific error handling
    let errorMessage = 'Failed to fetch sponsors';
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      if (error.message.includes('SQLITE_ERROR')) {
        errorMessage = 'Database query error - invalid search parameters';
      } else if (error.message.includes('Unknown column')) {
        errorMessage = 'Database schema error - please check field names';
      }
    }
    
    res.status(500).json({ 
      error: errorMessage,
      ...(process.env.NODE_ENV === 'development' && {
        details: error instanceof Error ? error.message : String(error)
      })
    });
  }
});

// GET specific sponsor by ID (unchanged - already working)
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

// PUT update specific sponsor (keeping existing implementation)
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

    // Update sponsor
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
        }
      }
    });

    console.log(`✅ Sponsor updated: ${sponsor.fullName} (ID: ${sponsor.id})`);
    res.json(sponsor);
  } catch (error: unknown) {
    console.error('❌ Error updating sponsor:', error);
    
    if (error instanceof Error && 'code' in error && (error as any).code === 'P2002') {
      return res.status(400).json({ 
        error: 'A sponsor with this information already exists' 
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to update sponsor',
      ...(process.env.NODE_ENV === 'development' && {
        details: error instanceof Error ? error.message : String(error)
      })
    });
  }
});

// DELETE sponsor
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const sponsorId = parseInt(id);
    
    if (isNaN(sponsorId)) {
      return res.status(400).json({ error: 'Invalid sponsor ID' });
    }

    console.log(`🗑️ Delete request for sponsor ID: ${sponsorId}`);

    // Check if sponsor exists
    const existingSponsor = await prisma.sponsor.findUnique({
      where: { id: sponsorId },
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
        error: `Cannot delete sponsor "${existingSponsor.fullName}" because they have ${existingSponsor.sponsorships.length} active sponsorship(s). Please end all sponsorships first.` 
      });
    }

    // Delete the sponsor (this will also delete related sponsorship records due to cascade)
    await prisma.sponsor.delete({
      where: { id: sponsorId }
    });

    console.log(`✅ Sponsor deleted: ${existingSponsor.fullName} (ID: ${sponsorId})`);
    res.json({ 
      message: `Sponsor "${existingSponsor.fullName}" has been deleted successfully`,
      deletedSponsor: {
        id: existingSponsor.id,
        fullName: existingSponsor.fullName
      }
    });
  } catch (error) {
    console.error('❌ Error deleting sponsor:', error);
    
    if (error instanceof Error && 'code' in error) {
      const prismaError = error as any;
      if (prismaError.code === 'P2003') {
        return res.status(400).json({ 
          error: 'Cannot delete sponsor because they are referenced by other records. Please remove all related data first.' 
        });
      }
    }
    
    res.status(500).json({ 
      error: 'Failed to delete sponsor',
      ...(process.env.NODE_ENV === 'development' && {
        details: error instanceof Error ? error.message : String(error)
      })
    });
  }
});
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

export default router;