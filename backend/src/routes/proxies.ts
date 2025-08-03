// Updated proxies API routes with email and phone field support
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET all proxies
router.get('/', async (req, res) => {
  try {
    const proxies = await prisma.proxy.findMany({
      include: {
        sponsors: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            contact: true
          }
        },
        _count: {
          select: { sponsors: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(proxies);
  } catch (error) {
    console.error('Error fetching proxies:', error);
    res.status(500).json({ error: 'Failed to fetch proxies' });
  }
});

// GET specific proxy by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const proxy = await prisma.proxy.findUnique({
      where: { id: parseInt(id) },
      include: {
        sponsors: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            contact: true,
            createdAt: true,
            sponsorships: {
              where: { isActive: true },
              include: {
                child: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true
                  }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!proxy) {
      return res.status(404).json({ error: 'Proxy not found' });
    }

    res.json(proxy);
  } catch (error) {
    console.error('Error fetching proxy:', error);
    res.status(500).json({ error: 'Failed to fetch proxy' });
  }
});

// POST create new proxy
router.post('/', async (req, res) => {
  try {
    const { fullName, email, phone, contact, role, description } = req.body;

    // Validation
    if (!fullName?.trim()) {
      return res.status(400).json({ error: 'Proxy full name is required' });
    }

    if (!role?.trim()) {
      return res.status(400).json({ error: 'Proxy role is required' });
    }

    if (!email?.trim() && !phone?.trim()) {
      return res.status(400).json({ 
        error: 'At least one contact method (email or phone) is required' 
      });
    }

    // Validate email format if provided
    if (email?.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return res.status(400).json({ error: 'Invalid email format' });
      }
    }

    // Check if proxy with same name already exists
    const existingProxy = await prisma.proxy.findUnique({
      where: { fullName: fullName.trim() }
    });

    if (existingProxy) {
      return res.status(400).json({ 
        error: 'A proxy with this name already exists' 
      });
    }

    // Create proxy
    const proxyData: any = {
      fullName: fullName.trim(),
      role: role.trim(),
      contact: contact?.trim() || '',
      description: description?.trim() || null
    };

    if (email?.trim()) {
      proxyData.email = email.trim().toLowerCase();
    }

    if (phone?.trim()) {
      proxyData.phone = phone.trim();
    }

    const proxy = await prisma.proxy.create({
      data: proxyData,
      include: {
        _count: {
          select: { sponsors: true }
        }
      }
    });

    res.status(201).json(proxy);
  } catch (error) {
    console.error('Error creating proxy:', error);
    
    // Handle unique constraint violations
    if (error instanceof Error && 'code' in error && error.code === 'P2002') {
      return res.status(400).json({ 
        error: 'A proxy with this name already exists' 
      });
    }
    
    res.status(500).json({ error: 'Failed to create proxy' });
  }
});

// PUT update specific proxy
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, email, phone, contact, role, description } = req.body;
    
    // Validate proxy exists
    const existingProxy = await prisma.proxy.findUnique({
      where: { id: parseInt(id) }
    });
    if (!existingProxy) {
      return res.status(404).json({ error: 'Proxy not found' });
    }

    // Validation
    if (fullName !== undefined && !fullName?.trim()) {
      return res.status(400).json({ error: 'Proxy full name cannot be empty' });
    }

    if (role !== undefined && !role?.trim()) {
      return res.status(400).json({ error: 'Proxy role cannot be empty' });
    }

    // Check that at least one contact method will remain
    const finalEmail = email !== undefined ? email?.trim() : existingProxy.email;
    const finalPhone = phone !== undefined ? phone?.trim() : existingProxy.phone;
    
    if (!finalEmail && !finalPhone) {
      return res.status(400).json({ 
        error: 'At least one contact method (email or phone) must be provided' 
      });
    }

    // Validate email format if provided
    if (email?.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return res.status(400).json({ error: 'Invalid email format' });
      }
    }

    // Check if fullName conflicts with existing proxy (if changing fullName)
    if (fullName && fullName.trim() !== existingProxy.fullName) {
      const duplicateProxy = await prisma.proxy.findUnique({
        where: { fullName: fullName.trim() }
      });
      if (duplicateProxy) {
        return res.status(400).json({ 
          error: 'A proxy with this name already exists' 
        });
      }
    }

    // Build update data
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

    if (role !== undefined) {
      updateData.role = role.trim();
    }

    if (description !== undefined) {
      updateData.description = description?.trim() || null;
    }

    const proxy = await prisma.proxy.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        sponsors: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            contact: true
          }
        },
        _count: {
          select: { sponsors: true }
        }
      }
    });

    res.json(proxy);
  } catch (error) {
    console.error('Error updating proxy:', error);
    
    // Handle unique constraint violations
    if (error instanceof Error && 'code' in error && error.code === 'P2002') {
      return res.status(400).json({ 
        error: 'A proxy with this name already exists' 
      });
    }
    
    res.status(500).json({ error: 'Failed to update proxy' });
  }
});

// DELETE proxy
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if proxy exists
    const existingProxy = await prisma.proxy.findUnique({
      where: { id: parseInt(id) },
      include: {
        sponsors: true
      }
    });

    if (!existingProxy) {
      return res.status(404).json({ error: 'Proxy not found' });
    }

    // Check if proxy has associated sponsors
    if (existingProxy.sponsors.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete proxy with associated sponsors. Remove proxy from sponsors first.' 
      });
    }

    await prisma.proxy.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Proxy deleted successfully' });
  } catch (error) {
    console.error('Error deleting proxy:', error);
    res.status(500).json({ error: 'Failed to delete proxy' });
  }
});

// GET proxies with search functionality
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const searchTerm = query.toLowerCase();

    const proxies = await prisma.proxy.findMany({
      where: {
        OR: [
          { fullName: { contains: searchTerm } },
          { email: { contains: searchTerm } },
          { phone: { contains: searchTerm } },
          { contact: { contains: searchTerm } },
          { role: { contains: searchTerm } },
          { description: { contains: searchTerm } }
        ]
      },
      include: {
        sponsors: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            contact: true
          }
        },
        _count: {
          select: { sponsors: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(proxies);
  } catch (error) {
    console.error('Error searching proxies:', error);
    res.status(500).json({ error: 'Failed to search proxies' });
  }
});

export default router;