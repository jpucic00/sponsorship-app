import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// GET all children with pagination - MUST be first
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string || '';
    const sponsorship = req.query.sponsorship as string; // 'sponsored' | 'unsponsored' | undefined
    const gender = req.query.gender as string; // 'male' | 'female' | undefined
    const schoolId = req.query.schoolId as string;
    const sponsorId = req.query.sponsorId as string;
    const proxyId = req.query.proxyId as string;

    const skip = (page - 1) * limit;

    // Build where clause based on filters
    const where: any = {};

    // Search filter
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { school: { name: { contains: search, mode: 'insensitive' } } }
      ];
    }

    // Gender filter
    if (gender && gender !== 'all') {
      where.gender = { equals: gender, mode: 'insensitive' };
    }

    // School filter
    if (schoolId && schoolId !== 'all') {
      where.schoolId = parseInt(schoolId);
    }

    // Sponsorship filter - handled after initial query due to relationship complexity
    let sponsorshipFilter = null;
    if (sponsorship === 'sponsored') {
      sponsorshipFilter = 'sponsored';
    } else if (sponsorship === 'unsponsored') {
      sponsorshipFilter = 'unsponsored';
    }

    // For sponsor and proxy filters, we need to use relationship queries
    if (sponsorId && sponsorId !== 'all') {
      if (sponsorId === 'none') {
        where.sponsorships = { none: { isActive: true } };
      } else {
        where.sponsorships = {
          some: {
            sponsorId: parseInt(sponsorId),
            isActive: true
          }
        };
      }
    }

    if (proxyId && proxyId !== 'all') {
      if (proxyId === 'none') {
        where.sponsorships = {
          every: {
            sponsor: { proxyId: null }
          }
        };
      } else if (proxyId === 'direct') {
        where.sponsorships = {
          some: {
            sponsor: { proxyId: null },
            isActive: true
          }
        };
      } else {
        where.sponsorships = {
          some: {
            sponsor: { proxyId: parseInt(proxyId) },
            isActive: true
          }
        };
      }
    }

    // Get total count for pagination
    const totalCount = await prisma.child.count({ where });

    // Get paginated children
    const children = await prisma.child.findMany({
      where,
      include: {
        school: true,
        sponsorships: {
          where: { isActive: true },
          include: {
            sponsor: {
              include: {
                proxy: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });

    // Add computed isSponsored field and apply sponsorship filter if needed
    let childrenWithStatus = children.map(child => ({
      ...child,
      isSponsored: (child.sponsorships?.length || 0) > 0
    }));

    // Apply sponsorship filter post-query if specified
    if (sponsorshipFilter === 'sponsored') {
      childrenWithStatus = childrenWithStatus.filter(child => child.isSponsored);
    } else if (sponsorshipFilter === 'unsponsored') {
      childrenWithStatus = childrenWithStatus.filter(child => !child.isSponsored);
    }

    // Recalculate pagination if sponsorship filter was applied
    let finalCount = totalCount;
    if (sponsorshipFilter) {
      // Get actual count with sponsorship filter
      const sponsoredCount = await prisma.child.count({
        where: {
          ...where,
          sponsorships: sponsorshipFilter === 'sponsored' 
            ? { some: { isActive: true } }
            : { none: { isActive: true } }
        }
      });
      finalCount = sponsoredCount;
    }

    const totalPages = Math.ceil(finalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.json({
      data: childrenWithStatus,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount: finalCount,
        limit,
        hasNextPage,
        hasPrevPage,
        startIndex: skip + 1,
        endIndex: Math.min(skip + limit, finalCount)
      }
    });
  } catch (error) {
    console.error('Error fetching children:', error);
    res.status(500).json({ error: 'Failed to fetch children' });
  }
});

// POST create new child
router.post('/', async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      dateOfBirth,
      gender,
      schoolId,
      class: childClass,
      fatherFullName,
      fatherAddress,
      fatherContact,
      motherFullName,
      motherAddress,
      motherContact,
      story,
      comment,
      photoUrl,
      sponsorIds = [],
      newSponsor
    } = req.body;

    const result = await prisma.$transaction(async (tx) => {
      let finalSponsorIds: number[] = [];

      if (sponsorIds && sponsorIds.length > 0) {
        finalSponsorIds = sponsorIds.map((id: string) => parseInt(id));
      }

      if (newSponsor && newSponsor.fullName) {
        const createdSponsor = await tx.sponsor.create({
          data: {
            fullName: newSponsor.fullName,
            contact: newSponsor.contact,
            proxyId: newSponsor.proxyId ? parseInt(newSponsor.proxyId) : null
          }
        });
        finalSponsorIds.push(createdSponsor.id);
      }

      const child = await tx.child.create({
        data: {
          firstName,
          lastName,
          dateOfBirth: new Date(dateOfBirth),
          gender,
          schoolId: parseInt(schoolId),
          class: childClass,
          fatherFullName,
          fatherAddress,
          fatherContact,
          motherFullName,
          motherAddress,
          motherContact,
          story,
          comment,
          photoUrl,
          dateEnteredRegister: new Date(),
          lastProfileUpdate: new Date(),
          isSponsored: finalSponsorIds.length > 0
        },
        include: {
          school: true
        }
      });

      if (finalSponsorIds.length > 0) {
        await Promise.all(
          finalSponsorIds.map(sponsorId =>
            tx.sponsorship.create({
              data: {
                childId: child.id,
                sponsorId: sponsorId,
                startDate: new Date(),
                isActive: true
              }
            })
          )
        );
      }

      return child;
    });

    const completeChild = await prisma.child.findUnique({
      where: { id: result.id },
      include: {
        school: true,
        sponsorships: {
          where: { isActive: true },
          include: {
            sponsor: {
              include: {
                proxy: true
              }
            }
          }
        }
      }
    });

    res.status(201).json({
      ...completeChild,
      isSponsored: (completeChild?.sponsorships?.length || 0) > 0
    });
  } catch (error) {
    console.error('Error creating child:', error);
    res.status(500).json({ error: 'Failed to create child record' });
  }
});

// POST add sponsor to existing child
router.post('/:id/sponsors', async (req, res) => {
  try {
    const { id } = req.params;
    const { sponsorId, monthlyAmount, paymentMethod, notes } = req.body;

    const existingSponsorship = await prisma.sponsorship.findFirst({
      where: {
        childId: parseInt(id),
        sponsorId: parseInt(sponsorId),
        isActive: true
      }
    });

    if (existingSponsorship) {
      return res.status(400).json({ error: 'This sponsor is already sponsoring this child' });
    }

    const sponsorship = await prisma.sponsorship.create({
      data: {
        childId: parseInt(id),
        sponsorId: parseInt(sponsorId),
        monthlyAmount: monthlyAmount ? parseFloat(monthlyAmount) : null,
        paymentMethod,
        notes,
        startDate: new Date(),
        isActive: true
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

    await prisma.child.update({
      where: { id: parseInt(id) },
      data: { 
        isSponsored: true,
        lastProfileUpdate: new Date()
      }
    });

    res.status(201).json(sponsorship);
  } catch (error) {
    console.error('Error adding sponsor to child:', error);
    res.status(500).json({ error: 'Failed to add sponsor to child' });
  }
});

// DELETE remove sponsor from child (end sponsorship)
router.delete('/:id/sponsors/:sponsorId', async (req, res) => {
  try {
    const { id, sponsorId } = req.params;

    const sponsorship = await prisma.sponsorship.updateMany({
      where: {
        childId: parseInt(id),
        sponsorId: parseInt(sponsorId),
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

    const remainingSponsorships = await prisma.sponsorship.count({
      where: {
        childId: parseInt(id),
        isActive: true
      }
    });

    if (remainingSponsorships === 0) {
      await prisma.child.update({
        where: { id: parseInt(id) },
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

// PUT update specific child
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    
    updateData.lastProfileUpdate = new Date();
    
    if (updateData.dateOfBirth) {
      updateData.dateOfBirth = new Date(updateData.dateOfBirth);
    }
    
    if (updateData.schoolId) {
      updateData.schoolId = parseInt(updateData.schoolId);
    }

    const child = await prisma.child.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        school: true,
        sponsorships: {
          where: { isActive: true },
          include: {
            sponsor: {
              include: {
                proxy: true
              }
            }
          }
        }
      }
    });

    res.json({
      ...child,
      isSponsored: (child.sponsorships?.length || 0) > 0
    });
  } catch (error) {
    console.error('Error updating child:', error);
    res.status(500).json({ error: 'Failed to update child record' });
  }
});

// GET specific child by ID - MUST be last
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const child = await prisma.child.findUnique({
      where: { id: parseInt(id) },
      include: {
        school: true,
        sponsorships: {
          where: { isActive: true },
          include: {
            sponsor: {
              include: {
                proxy: true
              }
            }
          }
        }
      }
    });

    if (!child) {
      return res.status(404).json({ error: 'Child not found' });
    }

    res.json({
      ...child,
      isSponsored: (child?.sponsorships?.length || 0) > 0
    });
  } catch (error) {
    console.error('Error fetching child:', error);
    res.status(500).json({ error: 'Failed to fetch child' });
  }
});

export default router;