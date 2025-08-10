// Enhanced backend/src/routes/proxies.ts
import express from 'express';
import { prisma } from '../lib/db'; 

const router = express.Router();

// GET all proxies with pagination and search
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string || '';

    const skip = (page - 1) * limit;

    // Build where clause for search
    const where: any = {};
    
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { role: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { contact: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [proxies, totalCount] = await Promise.all([
      prisma.proxy.findMany({
        where,
        skip,
        take: limit,
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
        orderBy: { fullName: 'asc' }
      }),
      prisma.proxy.count({ where })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      data: proxies,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        startIndex: skip + 1,
        endIndex: Math.min(skip + limit, totalCount)
      }
    });
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
          }
        },
        _count: {
          select: { sponsors: true }
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

    // Validate email format if provided
    if (email?.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return res.status(400).json({ error: 'Invalid email format' });
      }
    }

    // Check if fullName already exists
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
    };

    if (email?.trim()) {
      proxyData.email = email.trim().toLowerCase();
    }

    if (phone?.trim()) {
      proxyData.phone = phone.trim();
    }

    if (description?.trim()) {
      proxyData.description = description.trim();
    }

    const proxy = await prisma.proxy.create({
      data: proxyData,
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

    res.status(201).json(proxy);
  } catch (error: unknown) {
    console.error('Error creating proxy:', error);
    
    // Handle unique constraint violations
    if (error instanceof Error && 'code' in error && (error as any).code === 'P2002') {
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
  } catch (error: unknown) {
    console.error('Error updating proxy:', error);
    
    // Handle unique constraint violations
    if (error instanceof Error && 'code' in error && (error as any).code === 'P2002') {
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

export default router;