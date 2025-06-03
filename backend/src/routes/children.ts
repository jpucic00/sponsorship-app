import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// GET all children - MUST be first
router.get('/', async (req, res) => {
  try {
    const children = await prisma.child.findMany({
      include: {
        school: true,
        sponsorships: {
          where: { isActive: true }, // Only get active sponsorships
          include: {
            sponsor: {
              include: {
                proxy: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Add computed isSponsored field based on active sponsorships
    const childrenWithStatus = children.map(child => ({
      ...child,
      isSponsored: (child.sponsorships?.length || 0) > 0
    }));

    res.json(childrenWithStatus);
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
      sponsorIds = [], // Accept array of sponsor IDs
      newSponsor
    } = req.body;

    // Start a transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      let finalSponsorIds: number[] = [];

      // Handle existing sponsor IDs
      if (sponsorIds && sponsorIds.length > 0) {
        finalSponsorIds = sponsorIds.map((id: string) => parseInt(id));
      }

      // If we need to create a new sponsor
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

      // Create the child
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

      // Create sponsorship relationships for each sponsor
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

    // Return the complete child data with relationships
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

    // Check if this sponsorship already exists and is active
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

    // Update child's sponsored status
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

    // End the sponsorship by setting isActive to false and endDate
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

    // Check if child still has other active sponsorships
    const remainingSponsorships = await prisma.sponsorship.count({
      where: {
        childId: parseInt(id),
        isActive: true
      }
    });

    // Update child's sponsored status if no more active sponsorships
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