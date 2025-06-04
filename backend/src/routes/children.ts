import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Helper function to process child data for response
const processChildForResponse = (child: any) => {
  let processedChild = { ...child };
  
  // Convert base64 back to data URL for frontend if image exists
  if (child.photoBase64 && child.photoMimeType) {
    processedChild.photoDataUrl = `data:${child.photoMimeType};base64,${child.photoBase64}`;
  }
  
  // Add computed isSponsored field
  processedChild.isSponsored = (child.sponsorships?.length || 0) > 0;
  
  return processedChild;
};

// Helper function to validate image data
const validateImageData = (photoBase64: string, photoMimeType: string, photoSize?: number) => {
  // Check MIME type
  if (!photoMimeType || !photoMimeType.startsWith('image/')) {
    throw new Error('Invalid image MIME type');
  }
  
  // Validate base64 format
  try {
    Buffer.from(photoBase64, 'base64');
  } catch (error) {
    throw new Error('Invalid base64 image data');
  }
  
  // Size limit check (5MB in base64 is roughly 6.7MB)
  if (photoBase64.length > 7000000) {
    throw new Error('Image too large. Maximum size is 5MB');
  }
  
  // Additional size check if provided
  if (photoSize && photoSize > 5242880) { // 5MB in bytes
    throw new Error('Image file size exceeds 5MB limit');
  }
};

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
    const includeImages = req.query.includeImages === 'true'; // Optional: include image data in list

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

    // Build select clause - exclude large image data unless specifically requested
    const select: any = {
      id: true,
      firstName: true,
      lastName: true,
      dateOfBirth: true,
      gender: true,
      class: true,
      fatherFullName: true,
      fatherAddress: true,
      fatherContact: true,
      motherFullName: true,
      motherAddress: true,
      motherContact: true,
      story: true,
      comment: true,
      // Remove photoUrl from select
      photoMimeType: true,
      photoFileName: true,
      photoSize: true,
      dateEnteredRegister: true,
      lastProfileUpdate: true,
      isSponsored: true,
      createdAt: true,
      updatedAt: true,
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
    };

    // Include image data only if requested (for performance)
    if (includeImages) {
      select.photoBase64 = true;
    }

    // Get paginated children
    const children = await prisma.child.findMany({
      where,
      select,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });

    // Process children data
    let childrenWithStatus = children.map(child => processChildForResponse(child));

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

// POST create new child with image support
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
      // Remove photoUrl handling
      // New image fields
      photoBase64,
      photoMimeType,
      photoFileName,
      photoSize,
      sponsorIds = [],
      newSponsor
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !dateOfBirth || !gender || !schoolId || !childClass) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!fatherFullName || !motherFullName) {
      return res.status(400).json({ error: 'Both parent names are required' });
    }

    // Validate image data if provided
    if (photoBase64) {
      try {
        validateImageData(photoBase64, photoMimeType, photoSize);
      } catch (error) {
        return res.status(400).json({ error: error instanceof Error ? error.message : 'Invalid image data' });
      }
    }

    // Validate school exists
    const school = await prisma.school.findUnique({
      where: { id: parseInt(schoolId) }
    });
    if (!school) {
      return res.status(400).json({ error: 'Invalid school ID' });
    }

    const result = await prisma.$transaction(async (tx) => {
      let finalSponsorIds: number[] = [];

      // Process existing sponsor IDs
      if (sponsorIds && sponsorIds.length > 0) {
        finalSponsorIds = sponsorIds.map((id: string) => parseInt(id));
        
        // Validate sponsor IDs exist
        const validSponsors = await tx.sponsor.findMany({
          where: { id: { in: finalSponsorIds } }
        });
        if (validSponsors.length !== finalSponsorIds.length) {
          throw new Error('One or more sponsor IDs are invalid');
        }
      }

      // Create new sponsor if provided
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

      // Prepare child data
      const childData: any = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        dateOfBirth: new Date(dateOfBirth),
        gender,
        schoolId: parseInt(schoolId),
        class: childClass,
        fatherFullName: fatherFullName.trim(),
        fatherAddress: fatherAddress?.trim() || null,
        fatherContact: fatherContact?.trim() || null,
        motherFullName: motherFullName.trim(),
        motherAddress: motherAddress?.trim() || null,
        motherContact: motherContact?.trim() || null,
        story: story?.trim() || null,
        comment: comment?.trim() || null,
        dateEnteredRegister: new Date(),
        lastProfileUpdate: new Date(),
        isSponsored: finalSponsorIds.length > 0
      };

      // Add image data if provided
      if (photoBase64 && photoMimeType) {
        childData.photoBase64 = photoBase64;
        childData.photoMimeType = photoMimeType;
        childData.photoFileName = photoFileName?.trim() || null;
        childData.photoSize = photoSize || null;
      }

      // Create child record
      const child = await tx.child.create({
        data: childData,
        include: {
          school: true
        }
      });

      // Create sponsorship records
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

    // Fetch complete child data with relationships
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

    const processedChild = processChildForResponse(completeChild);
    res.status(201).json(processedChild);
    
  } catch (error) {
    console.error('Error creating child:', error);
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      res.status(400).json({ error: 'A child with similar details already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create child record' });
    }
  }
});

// POST add sponsor to existing child
router.post('/:id/sponsors', async (req, res) => {
  try {
    const { id } = req.params;
    const { sponsorId, monthlyAmount, paymentMethod, notes } = req.body;

    if (!sponsorId) {
      return res.status(400).json({ error: 'Sponsor ID is required' });
    }

    // Check if child exists
    const child = await prisma.child.findUnique({
      where: { id: parseInt(id) }
    });
    if (!child) {
      return res.status(404).json({ error: 'Child not found' });
    }

    // Check if sponsor exists
    const sponsor = await prisma.sponsor.findUnique({
      where: { id: parseInt(sponsorId) }
    });
    if (!sponsor) {
      return res.status(404).json({ error: 'Sponsor not found' });
    }

    // Check for existing active sponsorship
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
        paymentMethod: paymentMethod?.trim() || null,
        notes: notes?.trim() || null,
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

    // Check remaining sponsorships
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
    
    // Validate child exists
    const existingChild = await prisma.child.findUnique({
      where: { id: parseInt(id) }
    });
    if (!existingChild) {
      return res.status(404).json({ error: 'Child not found' });
    }

    // Process update data
    updateData.lastProfileUpdate = new Date();
    
    if (updateData.dateOfBirth) {
      updateData.dateOfBirth = new Date(updateData.dateOfBirth);
    }
    
    if (updateData.schoolId) {
      updateData.schoolId = parseInt(updateData.schoolId);
      
      // Validate school exists
      const school = await prisma.school.findUnique({
        where: { id: updateData.schoolId }
      });
      if (!school) {
        return res.status(400).json({ error: 'Invalid school ID' });
      }
    }

    // Handle image updates
    if (updateData.photoBase64) {
      try {
        validateImageData(updateData.photoBase64, updateData.photoMimeType, updateData.photoSize);
      } catch (error) {
        return res.status(400).json({ error: error instanceof Error ? error.message : 'Invalid image data' });
      }
    }

    // Trim string fields
    const stringFields = ['firstName', 'lastName', 'fatherFullName', 'motherFullName', 'fatherAddress', 'fatherContact', 'motherAddress', 'motherContact', 'story', 'comment', 'photoUrl', 'photoFileName'];
    stringFields.forEach(field => {
      if (updateData[field] !== undefined) {
        updateData[field] = updateData[field]?.trim() || null;
      }
    });

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

    const processedChild = processChildForResponse(child);
    res.json(processedChild);
    
  } catch (error) {
    console.error('Error updating child:', error);
    res.status(500).json({ error: 'Failed to update child record' });
  }
});

// GET image endpoint for serving images directly
router.get('/:id/image', async (req, res) => {
  try {
    const { id } = req.params;
    const { size } = req.query; // Optional: 'thumbnail', 'medium', 'full'
    
    const child = await prisma.child.findUnique({
      where: { id: parseInt(id) },
      select: {
        photoBase64: true,
        photoMimeType: true,
        photoFileName: true
      }
    });

    if (!child || !child.photoBase64 || !child.photoMimeType) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Convert base64 to buffer
    const imageBuffer = Buffer.from(child.photoBase64, 'base64');

    // Set appropriate headers
    res.set({
      'Content-Type': child.photoMimeType,
      'Content-Length': imageBuffer.length.toString(),
      'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
      'ETag': `"${id}-${child.photoBase64.substring(0, 10)}"`, // Simple ETag
    });

    // Set filename if available
    if (child.photoFileName) {
      res.set('Content-Disposition', `inline; filename="${child.photoFileName}"`);
    }

    res.send(imageBuffer);
  } catch (error) {
    console.error('Error serving image:', error);
    res.status(500).json({ error: 'Failed to serve image' });
  }
});

// GET specific child by ID with full data - MUST be last
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const child = await prisma.child.findUnique({
      where: { id: parseInt(id) },
      include: {
        school: true,
        sponsorships: {
          include: {
            sponsor: {
              include: {
                proxy: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        photos: {
          select: {
            id: true,
            mimeType: true,
            fileName: true,
            fileSize: true,
            description: true,
            uploadedAt: true,
            isProfile: true
          },
          orderBy: { uploadedAt: 'desc' }
        }
      }
    });

    if (!child) {
      return res.status(404).json({ error: 'Child not found' });
    }

    const processedChild = processChildForResponse(child);
    res.json(processedChild);
    
  } catch (error) {
    console.error('Error fetching child:', error);
    res.status(500).json({ error: 'Failed to fetch child' });
  }
});

export default router;