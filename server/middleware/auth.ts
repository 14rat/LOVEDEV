import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email?: string;
  };
}

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // Skip auth for public routes
  if (req.path === '/health' || req.path === '/api/template' || req.path.startsWith('/api/auth/')) {
    return next();
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const jwtSecret = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_JWT_SECRET || 'test-secret-key';
    
    if (!jwtSecret) {
      console.error('JWT secret not configured');
      return res.status(500).json({ error: 'Authentication configuration error' });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, jwtSecret) as any;
    
    if (!decoded || !decoded.sub) {
      return res.status(401).json({ error: 'Invalid token payload' });
    }

    // Add user info to request
    req.user = {
      id: decoded.sub,
      email: decoded.email
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    res.status(401).json({ error: 'Authentication failed' });
  }
};

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email?: string;
      };
    }
  }
}
