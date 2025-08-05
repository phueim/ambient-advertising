import { Request, Response, NextFunction } from 'express';

// Middleware to require authentication for protected routes
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ 
      error: 'Authentication required',
      message: 'Please log in to access this resource'
    });
  }
  next();
}

// Middleware to require admin role
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ 
      error: 'Authentication required',
      message: 'Please log in to access this resource'
    });
  }
  
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ 
      error: 'Admin access required',
      message: 'You do not have permission to access this resource'
    });
  }
  
  next();
}

// Middleware to optionally require authentication (for routes that work with or without auth)
export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  // This middleware doesn't block access but provides user context if authenticated
  next();
}