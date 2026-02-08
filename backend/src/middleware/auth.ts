import { Request, Response, NextFunction } from 'express';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface User {
      id: number;
      username: string;
      fullName: string;
      email: string | null;
      role: string;
      isApproved: boolean;
      isActive: boolean;
      lastLoginAt: Date | null;
    }
  }
}

// Middleware to check if user is authenticated
export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Unauthorized - Please log in' });
};

// Middleware to check if user is an admin
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated() && req.user?.role === 'admin') {
    return next();
  }
  res.status(403).json({ error: 'Forbidden - Admin access required' });
};

// Middleware to check if user is approved (additional check)
export const isApproved = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated() && req.user?.isApproved) {
    return next();
  }
  res.status(403).json({ error: 'Account pending approval' });
};
