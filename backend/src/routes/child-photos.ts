// File: backend/src/routes/child-photos.ts
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

// Helper function to update child's profile photo with latest photo
const updateChildProfilePhoto = async (childId: number, tx: any) => {
  // Get the latest photo
  const latestPhoto = await tx.childPhoto.findFirst({
    where: { childId },
    orderBy: { uploadedAt: 'desc' }
  });

  if (latestPhoto) {
    // Update child's main photo fields with latest photo
    await tx.child.update({
      where: { id: childId },
      data: {
        photoBase64: latestPhoto.photoBase64,
        photoMimeType: latestPhoto.mimeType,
        photoFileName: latestPhoto.fileName,
        photoSize: latestPhoto.fileSize,
        lastProfileUpdate: new Date()
      }
    });

    // Mark latest photo as profile photo
    await tx.childPhoto.updateMany({
      where: { childId },
      data: { isProfile: false }
    });

    await tx.childPhoto.update({
      where: { id: latestPhoto.id },
      data: { isProfile: true }
    });
  } else {
    // No photos left, clear child's photo fields
    await tx.child.update({
      where: { id: childId },
      data: {
        photoBase64: null,
        photoMimeType: null,
        photoFileName: null,
        photoSize: null,
        lastProfileUpdate: new Date()
      }
    });
  }
};

// GET all photos for a child
router.get('/child/:childId', async (req, res) => {
  try {
    const { childId } = req.params;
    const includeBase64 = req.query.includeBase64 === 'true';

    // Validate child exists
    const child = await prisma.child.findUnique({
      where: { id: parseInt(childId) }
    });

    if (!child) {
      return res.status(404).json({ error: 'Child not found' });
    }

    const selectFields: any = {
      id: true,
      childId: true,
      mimeType: true,
      fileName: true,
      fileSize: true,
      description: true,
      uploadedAt: true,
      isProfile: true
    };

    // Only include base64 data if specifically requested
    if (includeBase64) {
      selectFields.photoBase64 = true;
    }

    const photos = await prisma.childPhoto.findMany({
      where: { childId: parseInt(childId) },
      select: selectFields,
      orderBy: { uploadedAt: 'desc' }
    });

    // Add data URLs for photos if base64 is included
    const processedPhotos = photos.map(photo => ({
      ...photo,
      dataUrl: includeBase64 && photo.photoBase64 
        ? `data:${photo.mimeType};base64,${photo.photoBase64}`
        : undefined,
      photoBase64: includeBase64 ? photo.photoBase64 : undefined
    }));

    res.json(processedPhotos);
  } catch (error) {
    console.error('Error fetching child photos:', error);
    res.status(500).json({ error: 'Failed to fetch photos' });
  }
});

// POST add new photo to child
router.post('/child/:childId', async (req, res) => {
  try {
    const { childId } = req.params;
    const { photoBase64, mimeType, fileName, fileSize, description } = req.body;

    // Validate required fields
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
      return res.status(400).json({ error: error instanceof Error ? error.message : 'Invalid image data' });
    }

    const result = await prisma.$transaction(async (tx) => {
      // Create new photo record
      const newPhoto = await tx.childPhoto.create({
        data: {
          childId: parseInt(childId),
          photoBase64,
          mimeType,
          fileName: fileName?.trim() || null,
          fileSize: fileSize || null,
          description: description?.trim() || null,
          uploadedAt: new Date(),
          isProfile: false // Will be set to true by updateChildProfilePhoto
        }
      });

      // Update child's profile photo with latest photo
      await updateChildProfilePhoto(parseInt(childId), tx);

      return newPhoto;
    });

    // Return photo without base64 data for response
    const { photoBase64: _, ...photoResponse } = result;
    res.status(201).json({
      ...photoResponse,
      message: 'Photo uploaded successfully and set as profile photo'
    });

  } catch (error) {
    console.error('Error uploading photo:', error);
    res.status(500).json({ error: 'Failed to upload photo' });
  }
});

// DELETE photo by ID
router.delete('/:photoId', async (req, res) => {
  try {
    const { photoId } = req.params;

    // Get photo details before deletion
    const photo = await prisma.childPhoto.findUnique({
      where: { id: parseInt(photoId) },
      include: { child: true }
    });

    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    const childId = photo.childId;

    await prisma.$transaction(async (tx) => {
      // Delete the photo
      await tx.childPhoto.delete({
        where: { id: parseInt(photoId) }
      });

      // Update child's profile photo with remaining latest photo
      await updateChildProfilePhoto(childId, tx);
    });

    res.json({ 
      message: 'Photo deleted successfully',
      wasProfilePhoto: photo.isProfile
    });

  } catch (error) {
    console.error('Error deleting photo:', error);
    res.status(500).json({ error: 'Failed to delete photo' });
  }
});

// GET specific photo by ID with full data
router.get('/:photoId', async (req, res) => {
  try {
    const { photoId } = req.params;

    const photo = await prisma.childPhoto.findUnique({
      where: { id: parseInt(photoId) },
      include: {
        child: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    // Convert base64 to buffer for serving
    const imageBuffer = Buffer.from(photo.photoBase64, 'base64');

    // Set appropriate headers
    res.set({
      'Content-Type': photo.mimeType,
      'Content-Length': imageBuffer.length.toString(),
      'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
      'ETag': `"${photoId}-${photo.uploadedAt.getTime()}"`,
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

    const photo = await prisma.childPhoto.findUnique({
      where: { id: parseInt(photoId) }
    });

    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    const updatedPhoto = await prisma.childPhoto.update({
      where: { id: parseInt(photoId) },
      data: {
        description: description?.trim() || null
      },
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

    res.json(updatedPhoto);
  } catch (error) {
    console.error('Error updating photo:', error);
    res.status(500).json({ error: 'Failed to update photo' });
  }
});

export default router;