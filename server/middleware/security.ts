import rateLimit from "express-rate-limit";
import { Request, Response, NextFunction } from "express";

// Rate limiting for API endpoints
export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: "Too many requests from this IP, please try again later."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limiting for auth endpoints
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  message: {
    error: "Too many authentication attempts, please try again later."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for project creation
export const projectCreationRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 project creations per hour
  message: {
    error: "Too many projects created, please try again later."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for file uploads
export const uploadRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 uploads per windowMs
  message: {
    error: "Too many uploads, please try again later."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Content Security Policy middleware
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Set security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Only add CSP for API routes, not for rendered sites
  if (req.path.startsWith('/api/')) {
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;");
  }
  
  next();
};

// Input sanitization middleware
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // Basic XSS protection for text inputs
  if (req.body && typeof req.body === 'object') {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        // Remove potential script tags and dangerous characters
        req.body[key] = req.body[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '');
      }
    });
  }
  next();
};