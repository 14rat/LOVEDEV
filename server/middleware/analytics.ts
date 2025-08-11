import { Request, Response, NextFunction } from "express";
import { storage } from "../storage";

// Analytics tracking middleware for published sites
export const trackSiteVisit = (req: Request, res: Response, next: NextFunction) => {
  // Only track if this is a site visit (not API or app subdomain)
  if (!req.subdomain || req.subdomain === 'app' || req.subdomain === 'api' || req.subdomain === 'www') {
    return next();
  }

  try {
    // Track the visit asynchronously without blocking the request
    setImmediate(async () => {
      try {
        await storage.trackSiteVisit(req.subdomain!, {
          ip: req.ip || 'unknown',
          userAgent: req.get('User-Agent') || 'unknown',
          referer: req.get('Referer'),
          path: req.path,
          timestamp: new Date()
        });
      } catch (error) {
        console.error('Analytics tracking error:', error);
      }
    });
  } catch (error) {
    console.error('Analytics middleware error:', error);
  }

  next();
};

// Middleware to track project views
export const trackProjectView = (req: Request, res: Response, next: NextFunction) => {
  // Add tracking info to response locals
  res.locals.trackView = async (projectId: number) => {
    try {
      await storage.incrementProjectViews(projectId);
    } catch (error) {
      console.error('Project view tracking error:', error);
    }
  };
  
  next();
};