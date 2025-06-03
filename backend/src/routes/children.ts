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
        sponsorship: {
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
    res.json(children);
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
      sponsorId,
      newSponsor
    } = req.body;

    // Start a transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      let finalSponsorId = sponsorId ? parseInt(sponsorId) : null;

      // If we need to create a new sponsor
      if (newSponsor && newSponsor.fullName) {
        const createdSponsor = await tx.sponsor.create({
          data: {
            fullName: newSponsor.fullName,
            contact: newSponsor.contact,
            proxyId: newSponsor.proxyId ? parseInt(newSponsor.proxyId) : null
          }
        });
        finalSponsorId = createdSponsor.id;
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
          isSponsored: finalSponsorId ? true : false
        },
        include: {
          school: true
        }
      });

      // If we have a sponsor, create the sponsorship relationship
      if (finalSponsorId) {
        await tx.sponsorship.create({
          data: {
            childId: child.id,
            sponsorId: finalSponsorId,
            startDate: new Date(),
            isActive: true
          }
        });
      }

      return child;
    });

    // Return the complete child data with relationships
    const completeChild = await prisma.child.findUnique({
      where: { id: result.id },
      include: {
        school: true,
        sponsorship: {
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

    res.status(201).json(completeChild);
  } catch (error) {
    console.error('Error creating child:', error);
    res.status(500).json({ error: 'Failed to create child record' });
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
        sponsorship: {
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

    res.json(child);
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
        sponsorship: {
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

    res.json(child);
  } catch (error) {
    console.error('Error fetching child:', error);
    res.status(500).json({ error: 'Failed to fetch child' });
  }
});

export default router;