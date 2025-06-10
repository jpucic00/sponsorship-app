import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// GET all photos for a specific child
router.get('/child/:childId', async (req, res) => {
  try {
    const { childId } = req.params;
    const includeBase64 = req.query.includeBase64 !== 'false';

    const selectFields = {
      id: true,
      childId: true,
      mimeType: true,
      fileName: true,
      fileSize: true,
      description: true,
      uploadedAt: true,
      isProfile: true,
      ...(includeBase64 && { photoBase64: true })
    };

    const photos = await prisma.childPhoto.findMany({
      where: { childId: parseInt(childId) },
      select: selectFields,
      orderBy: { uploadedAt: 'desc' }
    });

    // Add dataUrl if base64 is included
    const photosWithDataUrl = photos.map(photo => ({
      ...photo,
      ...(includeBase64 && photo.photoBase64 && {
        dataUrl: `data:${photo.mimeType};base64,${photo.photoBase64}`
      })
    }));

    res.json(photosWithDataUrl);
  } catch (error) {
    console.error('Error fetching child photos:', error);
    res.status(500).json({ error: 'Failed to fetch photos' });
  }
});

// POST add new photo for a child
router.post('/child/:childId', async (req, res) => {
  try {
    const { childId } = req.params;
    const { photoBase64, mimeType, fileName, fileSize, description } = req.body;

    // Validate required fields
    if (!photoBase64 || !mimeType) {
      return res.status(400).json({ error: 'Photo data and MIME type are required' });
    }

    // Validate MIME type
    if (!mimeType.startsWith('image/')) {
      return res.status(400).json({ error: 'Invalid image MIME type' });
    }

    // Validate child exists
    const child = await prisma.child.findUnique({
      where: { id: parseInt(childId) }
    });
    if (!child) {
      return res.status(404).json({ error: 'Child not found' });
    }

    const result = await prisma.$transaction(async (tx) => {
      // Set all existing photos as non-profile
      await tx.childPhoto.updateMany({
        where: { childId: parseInt(childId) },
        data: { isProfile: false }
      });

      // Create new photo as profile
      const newPhoto = await tx.childPhoto.create({
        data: {
          childId: parseInt(childId),
          photoBase64,
          mimeType,
          fileName: fileName?.trim() || null,
          fileSize: fileSize || null,
          description: description?.trim() || '',
          isProfile: true // Latest photo becomes profile
        }
      });

      // Update child's last profile update
      await tx.child.update({
        where: { id: parseInt(childId) },
        data: { lastProfileUpdate: new Date() }
      });

      return newPhoto;
    });

    res.status(201).json(result);
  } catch (error) {
    console.error('Error adding photo:', error);
    res.status(500).json({ error: 'Failed to add photo' });
  }
});

// GET specific photo by ID (serves the image)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const photo = await prisma.childPhoto.findUnique({
      where: { id: parseInt(id) },
      select: {
        photoBase64: true,
        mimeType: true,
        fileName: true
      }
    });

    if (!photo || !photo.photoBase64) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    // Convert base64 to buffer
    const imageBuffer = Buffer.from(photo.photoBase64, 'base64');

    // Set appropriate headers
    res.set({
      'Content-Type': photo.mimeType,
      'Content-Length': imageBuffer.length.toString(),
      'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
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

// PUT update photo (description only)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { description } = req.body;

    const photo = await prisma.childPhoto.update({
      where: { id: parseInt(id) },
      data: { description: description?.trim() || '' }
    });

    res.json(photo);
  } catch (error) {
    console.error('Error updating photo:', error);
    res.status(500).json({ error: 'Failed to update photo' });
  }
});

// DELETE photo
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await prisma.$transaction(async (tx) => {
      // Get the photo to be deleted
      const photo = await tx.childPhoto.findUnique({
        where: { id: parseInt(id) }
      });

      if (!photo) {
        throw new Error('Photo not found');
      }

      const childId = photo.childId;
      const wasProfile = photo.isProfile;

      // Delete the photo
      await tx.childPhoto.delete({
        where: { id: parseInt(id) }
      });

      // If this was the profile photo, set the most recent remaining photo as profile
      if (wasProfile) {
        const remainingPhotos = await tx.childPhoto.findMany({
          where: { childId },
          orderBy: { uploadedAt: 'desc' },
          take: 1
        });

        if (remainingPhotos.length > 0) {
          await tx.childPhoto.update({
            where: { id: remainingPhotos[0].id },
            data: { isProfile: true }
          });
        }
      }

      // Update child's last profile update
      await tx.child.update({
        where: { id: childId },
        data: { lastProfileUpdate: new Date() }
      });

      return { success: true, childId };
    });

    res.json({ message: 'Photo deleted successfully' });
  } catch (error) {
    console.error('Error deleting photo:', error);
    if (error instanceof Error && error.message === 'Photo not found') {
      res.status(404).json({ error: 'Photo not found' });
    } else {
      res.status(500).json({ error: 'Failed to delete photo' });
    }
  }
});

export default router;