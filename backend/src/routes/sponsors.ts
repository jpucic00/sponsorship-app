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
    const sponsorship = req.query.sponsorship as string; // 'active' | 'inactive' | undefined

    console.log('Search term received:', search, 'Length:', search.length);

    const skip = (page - 1) * limit;

    // Build where clause based on filters
    const where: any = {};

    // Search filter - SQLite doesn't support case-insensitive mode
    if (search && search.length > 0) {
      console.log('Adding search filter for:', search);
      // Convert search to lowercase for case-insensitive search in SQLite
      const searchLower = search.toLowerCase();
      where.OR = [
        { 
          fullName: { 
            contains: searchLower
          } 
        },
        { 
          contact: { 
            contains: searchLower
          } 
        },
        { 
          proxy: { 
            fullName: { 
              contains: searchLower
            } 
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

    // Sponsorship filter - filter based on active sponsorships
    if (sponsorship === 'active') {
      where.sponsorships = {
        some: { isActive: true }
      };
    } else if (sponsorship === 'inactive') {
      where.sponsorships = {
        none: { isActive: true }
      };
    }

    console.log('Final where clause:', JSON.stringify(where, null, 2));

    // Get total count for pagination
    const totalCount = await prisma.sponsor.count({ where });
    console.log('Total count:', totalCount);

    // Build include clause
    const include = {
      proxy: true,
      sponsorships: {
        where: { isActive: true },
        include: {
          child: {
            include: {
              school: true
            }
          }
        }
      }
    };

    // Get paginated sponsors
    const sponsors = await prisma.sponsor.findMany({
      where,
      include,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });

    console.log('Sponsors found:', sponsors.length);

    // Process sponsors data to add computed fields
    const sponsorsWithStatus = sponsors.map(sponsor => ({
      ...sponsor,
      isActive: (sponsor.sponsorships?.length || 0) > 0,
      activeChildrenCount: sponsor.sponsorships?.length || 0
    }));

    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    const response = {
      data: sponsorsWithStatus,
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
    };

    console.log('Sending response with', sponsorsWithStatus.length, 'sponsors');
    res.json(response);
    
  } catch (error) {
    console.error('Error fetching sponsors:', error);
    
    // Type-safe error handling
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

// POST create new sponsor
router.post('/', async (req, res) => {
  try {
    const { fullName, contact, proxyId, childIds = [] } = req.body;

    // Validate required fields
    if (!fullName) {
      return res.status(400).json({ error: 'Full name is required' });
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

    const result = await prisma.$transaction(async (tx) => {
      // Create sponsor
      const sponsor = await tx.sponsor.create({
        data: {
          fullName: fullName.trim(),
          contact: contact?.trim() || null,
          proxyId: proxyId ? parseInt(proxyId) : null
        },
        include: {
          proxy: true
        }
      });

      // Create sponsorships if child IDs provided
      if (childIds && childIds.length > 0) {
        const validChildIds: number[] = [];
        
        // Validate child IDs
        for (const childId of childIds) {
          const childIdNum = parseInt(childId);
          if (!isNaN(childIdNum)) {
            const child = await tx.child.findUnique({
              where: { id: childIdNum }
            });
            if (child) {
              validChildIds.push(childIdNum);
            }
          }
        }

        // Create sponsorship records
        if (validChildIds.length > 0) {
          await Promise.all(
            validChildIds.map(childId =>
              tx.sponsorship.create({
                data: {
                  sponsorId: sponsor.id,
                  childId: childId,
                  startDate: new Date(),
                  isActive: true
                }
              })
            )
          );

          // Update children's sponsored status
          await tx.child.updateMany({
            where: { id: { in: validChildIds } },
            data: { 
              isSponsored: true,
              lastProfileUpdate: new Date()
            }
          });
        }
      }

      return sponsor;
    });

    // Fetch complete sponsor data with relationships
    const completeSponsor = await prisma.sponsor.findUnique({
      where: { id: result.id },
      include: {
        proxy: true,
        sponsorships: {
          where: { isActive: true },
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

    const sponsorWithStatus = {
      ...completeSponsor,
      isActive: (completeSponsor?.sponsorships?.length || 0) > 0,
      activeChildrenCount: completeSponsor?.sponsorships?.length || 0
    };

    res.status(201).json(sponsorWithStatus);
    
  } catch (error) {
    console.error('Error creating sponsor:', error);
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      res.status(400).json({ error: 'A sponsor with this name already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create sponsor record' });
    }
  }
});

// POST add child to existing sponsor
router.post('/:id/children', async (req, res) => {
  try {
    const { id } = req.params;
    const { childId, monthlyAmount, paymentMethod, notes } = req.body;

    if (!childId) {
      return res.status(400).json({ error: 'Child ID is required' });
    }

    // Check if sponsor exists
    const sponsor = await prisma.sponsor.findUnique({
      where: { id: parseInt(id) }
    });
    if (!sponsor) {
      return res.status(404).json({ error: 'Sponsor not found' });
    }

    // Check if child exists
    const child = await prisma.child.findUnique({
      where: { id: parseInt(childId) }
    });
    if (!child) {
      return res.status(404).json({ error: 'Child not found' });
    }

    // Check for existing active sponsorship
    const existingSponsorship = await prisma.sponsorship.findFirst({
      where: {
        sponsorId: parseInt(id),
        childId: parseInt(childId),
        isActive: true
      }
    });

    if (existingSponsorship) {
      return res.status(400).json({ error: 'This sponsor is already sponsoring this child' });
    }

    const sponsorship = await prisma.sponsorship.create({
      data: {
        sponsorId: parseInt(id),
        childId: parseInt(childId),
        monthlyAmount: monthlyAmount ? parseFloat(monthlyAmount) : null,
        paymentMethod: paymentMethod?.trim() || null,
        notes: notes?.trim() || null,
        startDate: new Date(),
        isActive: true
      },
      include: {
        sponsor: {
          include: {
            proxy: true
          }
        },
        child: {
          include: {
            school: true
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
    console.error('Error adding child to sponsor:', error);
    res.status(500).json({ error: 'Failed to add child to sponsor' });
  }
});

// DELETE remove child from sponsor (end sponsorship)
router.delete('/:id/children/:childId', async (req, res) => {
  try {
    const { id, childId } = req.params;

    const sponsorship = await prisma.sponsorship.updateMany({
      where: {
        sponsorId: parseInt(id),
        childId: parseInt(childId),
        isActive: true
      },
      data: {
        isActive: false,
        endDate: new Date()
      }
    });

    if (sponsorship.count === 0) {
      return res.status(404).json({ error: 'Active sponsorship not found' });
    }

    // Check remaining sponsorships for this child
    const remainingSponsorships = await prisma.sponsorship.count({
      where: {
        childId: parseInt(childId),
        isActive: true
      }
    });

    // Update child's sponsored status if no more active sponsorships
    if (remainingSponsorships === 0) {
      await prisma.child.update({
        where: { id: parseInt(childId) },
        data: { 
          isSponsored: false,
          lastProfileUpdate: new Date()
        }
      });
    }

    res.json({ message: 'Sponsorship ended successfully' });
  } catch (error) {
    console.error('Error ending sponsorship:', error);
    res.status(500).json({ error: 'Failed to end sponsorship' });
  }
});

// PUT update specific sponsor
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    
    // Validate sponsor exists
    const existingSponsor = await prisma.sponsor.findUnique({
      where: { id: parseInt(id) }
    });
    if (!existingSponsor) {
      return res.status(404).json({ error: 'Sponsor not found' });
    }

    // Validate proxy exists if provided
    if (updateData.proxyId) {
      const proxy = await prisma.proxy.findUnique({
        where: { id: parseInt(updateData.proxyId) }
      });
      if (!proxy) {
        return res.status(400).json({ error: 'Invalid proxy ID' });
      }
      updateData.proxyId = parseInt(updateData.proxyId);
    } else if (updateData.proxyId === null || updateData.proxyId === '') {
      updateData.proxyId = null;
    }

    // Trim string fields
    const stringFields = ['fullName', 'contact'];
    stringFields.forEach(field => {
      if (updateData[field] !== undefined) {
        updateData[field] = updateData[field]?.trim() || null;
      }
    });

    const sponsor = await prisma.sponsor.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        proxy: true,
        sponsorships: {
          where: { isActive: true },
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

    const sponsorWithStatus = {
      ...sponsor,
      isActive: (sponsor.sponsorships?.length || 0) > 0,
      activeChildrenCount: sponsor.sponsorships?.length || 0
    };

    res.json(sponsorWithStatus);
    
  } catch (error) {
    console.error('Error updating sponsor:', error);
    res.status(500).json({ error: 'Failed to update sponsor record' });
  }
});

// DELETE sponsor (soft delete by marking as inactive)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if sponsor exists
    const sponsor = await prisma.sponsor.findUnique({
      where: { id: parseInt(id) },
      include: {
        sponsorships: {
          where: { isActive: true }
        }
      }
    });

    if (!sponsor) {
      return res.status(404).json({ error: 'Sponsor not found' });
    }

    // End all active sponsorships
    if (sponsor.sponsorships.length > 0) {
      await prisma.sponsorship.updateMany({
        where: {
          sponsorId: parseInt(id),
          isActive: true
        },
        data: {
          isActive: false,
          endDate: new Date()
        }
      });

      // Update children's sponsored status
      const childIds = sponsor.sponsorships.map(s => s.childId);
      for (const childId of childIds) {
        const remainingSponsorships = await prisma.sponsorship.count({
          where: {
            childId: childId,
            isActive: true
          }
        });

        if (remainingSponsorships === 0) {
          await prisma.child.update({
            where: { id: childId },
            data: { 
              isSponsored: false,
              lastProfileUpdate: new Date()
            }
          });
        }
      }
    }

    // For now, we'll keep the sponsor record but mark it as inactive via sponsorships
    // In the future, you might want to add an isActive field to the sponsor table
    
    res.json({ message: 'Sponsor and all sponsorships deactivated successfully' });
  } catch (error) {
    console.error('Error deleting sponsor:', error);
    res.status(500).json({ error: 'Failed to delete sponsor' });
  }
});

// GET specific sponsor by ID with full data - MUST be last
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
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!sponsor) {
      return res.status(404).json({ error: 'Sponsor not found' });
    }

    const sponsorWithStatus = {
      ...sponsor,
      isActive: sponsor.sponsorships.some(s => s.isActive),
      activeChildrenCount: sponsor.sponsorships.filter(s => s.isActive).length,
      totalChildrenSponsored: sponsor.sponsorships.length
    };

    res.json(sponsorWithStatus);
    
  } catch (error) {
    console.error('Error fetching sponsor:', error);
    res.status(500).json({ error: 'Failed to fetch sponsor' });
  }
});

export default router;