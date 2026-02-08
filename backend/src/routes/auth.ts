import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import passport from 'passport';
import { prisma } from '../lib/db';
import { isAuthenticated, isAdmin } from '../middleware/auth';

const router = express.Router();

// Register new user (public)
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { username, password, fullName, email } = req.body;

    // Validate input
    if (!username || !password || !fullName) {
      return res.status(400).json({
        error: 'Username, password, and full name are required'
      });
    }

    // Check if username already exists
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user (isApproved defaults to false)
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        fullName,
        email: email || null,
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        isApproved: true,
        createdAt: true,
      },
    });

    res.status(201).json({
      message: 'Registration successful. Your account is pending admin approval.',
      user,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login
router.post('/login', (req: Request, res: Response, next) => {
  passport.authenticate('local', (err: any, user: any, info: any) => {
    if (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (!user) {
      return res.status(401).json({ error: info.message || 'Login failed' });
    }

    req.logIn(user, (err) => {
      if (err) {
        return res.status(500).json({ error: 'Login failed' });
      }

      res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        },
      });
    });
  })(req, res, next);
});

// Logout
router.post('/logout', (req: Request, res: Response) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ message: 'Logout successful' });
  });
});

// Get current user
router.get('/me', isAuthenticated, (req: Request, res: Response) => {
  res.json({
    user: {
      id: req.user!.id,
      username: req.user!.username,
      fullName: req.user!.fullName,
      email: req.user!.email,
      role: req.user!.role,
      isApproved: req.user!.isApproved,
    },
  });
});

// Admin: Get all pending users
router.get('/pending-users', isAdmin, async (req: Request, res: Response) => {
  try {
    const pendingUsers = await prisma.user.findMany({
      where: { isApproved: false },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ users: pendingUsers });
  } catch (error) {
    console.error('Error fetching pending users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Get all users
router.get('/users', isAdmin, async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        role: true,
        isApproved: true,
        isActive: true,
        createdAt: true,
        lastLoginAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Approve user
router.patch('/users/:id/approve', isAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { isApproved: true },
      select: {
        id: true,
        username: true,
        fullName: true,
        isApproved: true,
      },
    });

    res.json({ message: 'User approved', user });
  } catch (error) {
    console.error('Error approving user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Deactivate user
router.patch('/users/:id/deactivate', isAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { isActive: false },
      select: {
        id: true,
        username: true,
        fullName: true,
        isActive: true,
      },
    });

    res.json({ message: 'User deactivated', user });
  } catch (error) {
    console.error('Error deactivating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Activate user
router.patch('/users/:id/activate', isAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { isActive: true },
      select: {
        id: true,
        username: true,
        fullName: true,
        isActive: true,
      },
    });

    res.json({ message: 'User activated', user });
  } catch (error) {
    console.error('Error activating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
