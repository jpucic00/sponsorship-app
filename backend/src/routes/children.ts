import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Helper function to process child data for response
const processChildForResponse = async (child: any, includeProfilePhoto = false) => {
  let processedChild = { ...child };
  
  // Add computed isSponsored field
  processedChild.isSponsored = (child.sponsorships?.length || 0) > 0;
  
  // If requested, include profile photo data
  if (includeProfilePhoto) {
    try {
      const profilePhoto = await prisma.childPhoto.findFirst({
        where: { 
          childId: child.id,
          isProfile: true 
        },
        select: {
          photoBase64: true,
          mimeType: true,
          fileName: true,
          fileSize: true
        }
      });

      if (profilePhoto && profilePhoto.photoBase64 && profilePhoto.mimeType) {
        processedChild.photoDataUrl = `data:${profilePhoto.mimeType};base64,${profilePhoto.photoBase64}`;
        processedChild.photoMimeType = profilePhoto.mimeType;
        processedChild.photoFileName = profilePhoto.fileName;
        processedChild.photoSize = profilePhoto.fileSize;
      }
    } catch (error) {
      console.warn('Error fetching profile photo for child', child.id, error);
      // Continue without photo if there's an error
    }
  }
  
  return processedChild;
};

// GET all children with pagination - MUST be first
router.get('/', async (req, res) => {
  try {
    console.log('Children API called with query:', req.query);

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = (req.query.search as string)?.trim() || '';
    const sponsorship = req.query.sponsorship as string; // 'sponsored' | 'unsponsored' | undefined
    const gender = req.query.gender as string; // 'male' | 'female' | undefined
    const schoolId = req.query.schoolId as string;
    const sponsorId = req.query.sponsorId as string;
    const proxyId = req.query.proxyId as string;
    const includeImages = req.query.includeImages !== 'false'; // Include images by default

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
          firstName: { 
            contains: searchLower
          } 
        },
        { 
          lastName: { 
            contains: searchLower
          } 
        },
        { 
          school: { 
            name: { 
              contains: searchLower
            } 
          } 
        }
      ];
    }

    // Gender filter - SQLite doesn't support case-insensitive mode
    if (gender && gender !== 'all') {
      where.gender = gender; // Remove mode parameter for SQLite
    }

    // School filter
    if (schoolId && schoolId !== 'all') {
      const schoolIdNum = parseInt(schoolId);
      if (!isNaN(schoolIdNum)) {
        where.schoolId = schoolIdNum;
      }
    }

    // For sponsor and proxy filters, we need to use relationship queries
    if (sponsorId && sponsorId !== 'all') {
      if (sponsorId === 'none') {
        where.sponsorships = { none: { isActive: true } };
      } else {
        const sponsorIdNum = parseInt(sponsorId);
        if (!isNaN(sponsorIdNum)) {
          where.sponsorships = {
            some: {
              sponsorId: sponsorIdNum,
              isActive: true
            }
          };
        }
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
        const proxyIdNum = parseInt(proxyId);
        if (!isNaN(proxyIdNum)) {
          where.sponsorships = {
            some: {
              sponsor: { proxyId: proxyIdNum },
              isActive: true
            }
          };
        }
      }
    }

    // Handle sponsorship filter separately for better performance
    if (sponsorship === 'sponsored') {
      where.sponsorships = { some: { isActive: true } };
    } else if (sponsorship === 'unsponsored') {
      where.sponsorships = { none: { isActive: true } };
    }

    console.log('Final where clause:', JSON.stringify(where, null, 2));

    // Get total count for pagination
    const totalCount = await prisma.child.count({ where });
    console.log('Total count:', totalCount);

    // Build include clause
    const include = {
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

    // Get paginated children
    const children = await prisma.child.findMany({
      where,
      include,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });

    console.log('Children found:', children.length);

    // Process children data and include profile photos
    const childrenWithStatus = await Promise.all(
      children.map(async (child) => {
        try {
          return await processChildForResponse(child, includeImages);
        } catch (error) {
          console.error('Error processing child', child.id, error);
          // Return basic child data if processing fails
          return {
            ...child,
            isSponsored: (child.sponsorships?.length || 0) > 0
          };
        }
      })
    );

    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    const response = {
      data: childrenWithStatus,
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

    console.log('Sending response with', childrenWithStatus.length, 'children');
    res.json(response);
    
  } catch (error) {
    console.error('Error fetching children:', error);
    
    // Type-safe error handling
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error('Error stack:', errorStack);
    
    // Send a more detailed error response for debugging
    res.status(500).json({ 
      error: 'Failed to fetch children',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      stack: process.env.NODE_ENV === 'development' ? errorStack : undefined
    });
  }
});

// POST create new child with photo gallery integration
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
      // Image fields for photo gallery
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

      // Prepare child data (NO image fields in children table)
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

      // Create child record
      const child = await tx.child.create({
        data: childData,
        include: {
          school: true
        }
      });

      // Add photo to gallery if provided
      if (photoBase64 && photoMimeType) {
        // Validate image data
        if (!photoMimeType.startsWith('image/')) {
          throw new Error('Invalid image MIME type');
        }

        await tx.childPhoto.create({
          data: {
            childId: child.id,
            photoBase64,
            mimeType: photoMimeType,
            fileName: photoFileName?.trim() || null,
            fileSize: photoSize || null,
            description: '',
            isProfile: true // First photo is always profile
          }
        });
      }

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

    // Fetch complete child data with relationships and profile photo
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

    const processedChild = await processChildForResponse(completeChild, true);
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

    // Remove any image fields from update data (they should go through photo gallery)
    delete updateData.photoBase64;
    delete updateData.photoMimeType;
    delete updateData.photoFileName;
    delete updateData.photoSize;

    // Trim string fields
    const stringFields = ['firstName', 'lastName', 'fatherFullName', 'motherFullName', 'fatherAddress', 'fatherContact', 'motherAddress', 'motherContact', 'story', 'comment'];
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

    const processedChild = await processChildForResponse(child, true);
    res.json(processedChild);
    
  } catch (error) {
    console.error('Error updating child:', error);
    res.status(500).json({ error: 'Failed to update child record' });
  }
});

// GET profile image endpoint for serving profile images directly
router.get('/:id/image', async (req, res) => {
  try {
    const { id } = req.params;
    
    const profilePhoto = await prisma.childPhoto.findFirst({
      where: { 
        childId: parseInt(id),
        isProfile: true 
      },
      select: {
        photoBase64: true,
        mimeType: true,
        fileName: true
      }
    });

    if (!profilePhoto || !profilePhoto.photoBase64 || !profilePhoto.mimeType) {
      return res.status(404).json({ error: 'Profile image not found' });
    }

    // Convert base64 to buffer
    const imageBuffer = Buffer.from(profilePhoto.photoBase64, 'base64');

    // Set appropriate headers
    res.set({
      'Content-Type': profilePhoto.mimeType,
      'Content-Length': imageBuffer.length.toString(),
      'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
      'ETag': `"${id}-${profilePhoto.photoBase64.substring(0, 10)}"`, // Simple ETag
    });

    // Set filename if available
    if (profilePhoto.fileName) {
      res.set('Content-Disposition', `inline; filename="profile_${profilePhoto.fileName}"`);
    }

    res.send(imageBuffer);
  } catch (error) {
    console.error('Error serving profile image:', error);
    res.status(500).json({ error: 'Failed to serve profile image' });
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

    const processedChild = await processChildForResponse(child, true);
    res.json(processedChild);
    
  } catch (error) {
    console.error('Error fetching child:', error);
    res.status(500).json({ error: 'Failed to fetch child' });
  }
});

export default router;