import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Helper function to validate image data
const validateImageData = (photoBase64: string, mimeType: string, fileSize?: number) => {
  // Check MIME type
  if (!mimeType || !mimeType.startsWith('image/')) {
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
  if (fileSize && fileSize > 5242880) { // 5MB in bytes
    throw new Error('Image file size exceeds 5MB limit');
  }
};

// GET all photos for a specific child
router.get('/child/:childId', async (req, res) => {
  try {
    const { childId } = req.params;
    const { includeBase64 = 'false' } = req.query;
    
    // Validate child exists
    const child = await prisma.child.findUnique({
      where: { id: parseInt(childId) }
    });
    
    if (!child) {
      return res.status(404).json({ error: 'Child not found' });
    }

    // Build select clause - exclude large base64 data unless specifically requested
    const select: any = {
      id: true,
      childId: true,
      mimeType: true,
      fileName: true,
      fileSize: true,
      description: true,
      uploadedAt: true,
      isProfile: true
    };

    // Include base64 data only if requested
    if (includeBase64 === 'true') {
      select.photoBase64 = true;
    }

    const photos = await prisma.childPhoto.findMany({
      where: { childId: parseInt(childId) },
      select,
      orderBy: { uploadedAt: 'desc' }
    });

    // Add data URLs if base64 is included
    const photosWithDataUrls = photos.map(photo => {
      if (photo.photoBase64 && photo.mimeType) {
        return {
          ...photo,
          dataUrl: `data:${photo.mimeType};base64,${photo.photoBase64}`
        };
      }
      return photo;
    });

    res.json(photosWithDataUrls);
  } catch (error) {
    console.error('Error fetching child photos:', error);
    res.status(500).json({ error: 'Failed to fetch photos' });
  }
});

// POST create new photo for a child
router.post('/child/:childId', async (req, res) => {
  try {
    const { childId } = req.params;
    const { photoBase64, mimeType, fileName, fileSize, description } = req.body;

    if (!photoBase64 || !mimeType) {
      return res.status(400).json({ error: 'Photo data and MIME type are required' });
    }

    // Validate child exists
    const child = await prisma.child.findUnique({
      where: { id: parseInt(childId) }
    });
    
    if (!child) {
      return res.status(404).json({ error: 'Child not found' });
    }

    // Validate image data
    try {
      validateImageData(photoBase64, mimeType, fileSize);
    } catch (error) {
      return res.status(400).json({ 
        error: error instanceof Error ? error.message : 'Invalid image data' 
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      // Mark all existing photos as non-profile (latest photo becomes profile)
      await tx.childPhoto.updateMany({
        where: { childId: parseInt(childId) },
        data: { isProfile: false }
      });

      // Create new photo (this will be the new profile photo)
      const newPhoto = await tx.childPhoto.create({
        data: {
          childId: parseInt(childId),
          photoBase64,
          mimeType,
          fileName: fileName?.trim() || null,
          fileSize: fileSize || null,
          description: description?.trim() || '',
          isProfile: true // Latest photo is always profile
        }
      });

      // Update child's last profile update timestamp
      await tx.child.update({
        where: { id: parseInt(childId) },
        data: {
          lastProfileUpdate: new Date()
        }
      });

      return newPhoto;
    });

    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating photo:', error);
    res.status(500).json({ error: 'Failed to create photo' });
  }
});

// GET specific photo by ID (serves the image directly)
router.get('/:photoId', async (req, res) => {
  try {
    const { photoId } = req.params;
    
    const photo = await prisma.childPhoto.findUnique({
      where: { id: parseInt(photoId) },
      select: {
        photoBase64: true,
        mimeType: true,
        fileName: true
      }
    });

    if (!photo || !photo.photoBase64 || !photo.mimeType) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    // Convert base64 to buffer
    const imageBuffer = Buffer.from(photo.photoBase64, 'base64');

    // Set appropriate headers
    res.set({
      'Content-Type': photo.mimeType,
      'Content-Length': imageBuffer.length.toString(),
      'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
      'ETag': `"${photoId}-${photo.photoBase64.substring(0, 10)}"`, // Simple ETag
    });

    // Set filename if available
    if (photo.fileName) {
      res.set('Content-Disposition', `inline; filename="${photo.fileName}"`);
    }

    res.send(imageBuffer);
  } catch (error) {
    console.error('Error serving photo:', error);
    res.status(500).json({ error: 'Failed to serve photo' });
  }
});

// PUT update photo description
router.put('/:photoId', async (req, res) => {
  try {
    const { photoId } = req.params;
    const { description } = req.body;

    const photo = await prisma.childPhoto.update({
      where: { id: parseInt(photoId) },
      data: { description: description?.trim() || '' },
      select: {
        id: true,
        childId: true,
        mimeType: true,
        fileName: true,
        fileSize: true,
        description: true,
        uploadedAt: true,
        isProfile: true
      }
    });

    res.json(photo);
  } catch (error) {
    console.error('Error updating photo:', error);
    // Handle Prisma not found error
    if (error instanceof Error && 'code' in error && error.code === 'P2025') {
      res.status(404).json({ error: 'Photo not found' });
    } else {
      res.status(500).json({ error: 'Failed to update photo' });
    }
  }
});

// DELETE photo
router.delete('/:photoId', async (req, res) => {
  try {
    const { photoId } = req.params;

    const result = await prisma.$transaction(async (tx) => {
      // Get the photo to be deleted
      const photoToDelete = await tx.childPhoto.findUnique({
        where: { id: parseInt(photoId) },
        select: { id: true, childId: true, isProfile: true }
      });

      if (!photoToDelete) {
        throw new Error('Photo not found');
      }

      // Delete the photo
      await tx.childPhoto.delete({
        where: { id: parseInt(photoId) }
      });

      // If this was the profile photo, make the next most recent photo the profile
      if (photoToDelete.isProfile) {
        const nextPhoto = await tx.childPhoto.findFirst({
          where: { childId: photoToDelete.childId },
          orderBy: { uploadedAt: 'desc' }
        });

        if (nextPhoto) {
          // Make the next photo the profile photo
          await tx.childPhoto.update({
            where: { id: nextPhoto.id },
            data: { isProfile: true }
          });
        }

        // Update child's last profile update timestamp
        await tx.child.update({
          where: { id: photoToDelete.childId },
          data: {
            lastProfileUpdate: new Date()
          }
        });
      }

      return { success: true, wasProfile: photoToDelete.isProfile };
    });

    res.json({ message: 'Photo deleted successfully', ...result });
  } catch (error) {
    console.error('Error deleting photo:', error);
    if (error instanceof Error && error.message === 'Photo not found') {
      res.status(404).json({ error: 'Photo not found' });
    } else {
      res.status(500).json({ error: 'Failed to delete photo' });
    }
  }
});

// GET profile photo for a child (returns the latest/profile photo)
router.get('/child/:childId/profile', async (req, res) => {
  try {
    const { childId } = req.params;
    
    const profilePhoto = await prisma.childPhoto.findFirst({
      where: { 
        childId: parseInt(childId),
        isProfile: true 
      },
      select: {
        photoBase64: true,
        mimeType: true,
        fileName: true
      }
    });

    if (!profilePhoto || !profilePhoto.photoBase64 || !profilePhoto.mimeType) {
      return res.status(404).json({ error: 'Profile photo not found' });
    }

    // Convert base64 to buffer
    const imageBuffer = Buffer.from(profilePhoto.photoBase64, 'base64');

    // Set appropriate headers
    res.set({
      'Content-Type': profilePhoto.mimeType,
      'Content-Length': imageBuffer.length.toString(),
      'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
    });

    // Set filename if available
    if (profilePhoto.fileName) {
      res.set('Content-Disposition', `inline; filename="profile_${profilePhoto.fileName}"`);
    }

    res.send(imageBuffer);
  } catch (error) {
    console.error('Error serving profile photo:', error);
    res.status(500).json({ error: 'Failed to serve profile photo' });
  }
});

export default router;