import { Request, Response, NextFunction } from "express";
import NodeCache from "node-cache";

// Cache instance - TTL of 5 minutes for site content, 1 hour for static assets
const siteCache = new NodeCache({ 
  stdTTL: 300, // 5 minutes default
  checkperiod: 60 // Check for expired keys every minute
});

const templateCache = new NodeCache({
  stdTTL: 3600, // 1 hour for templates
  checkperiod: 600
});

// Cache middleware for published sites
export const cacheSiteContent = (req: Request, res: Response, next: NextFunction) => {
  // Only cache published sites, not API routes or app subdomain
  if (!req.subdomain || req.subdomain === 'app' || req.subdomain === 'api' || req.subdomain === 'www' || req.path.startsWith('/api/')) {
    return next();
  }

  const cacheKey = `site:${req.subdomain}:${req.path}`;
  const cachedContent = siteCache.get(cacheKey);

  if (cachedContent) {
    // Return cached content
    const { content, contentType, statusCode } = cachedContent as any;
    res.set('Content-Type', contentType);
    res.set('X-Cache', 'HIT');
    return res.status(statusCode).send(content);
  }

  // Cache the response
  const originalSend = res.send;
  const originalStatus = res.status;
  let statusCode = 200;

  res.status = function(code: number) {
    statusCode = code;
    return originalStatus.call(this, code);
  };

  res.send = function(content: any) {
    // Only cache successful responses
    if (statusCode === 200) {
      siteCache.set(cacheKey, {
        content,
        contentType: res.get('Content-Type') || 'text/html',
        statusCode
      });
    }
    
    res.set('X-Cache', 'MISS');
    return originalSend.call(this, content);
  };

  next();
};

// Cache middleware for templates
export const cacheTemplate = (templateName: string, content: string) => {
  templateCache.set(`template:${templateName}`, content);
};

export const getCachedTemplate = (templateName: string): string | undefined => {
  return templateCache.get(`template:${templateName}`);
};

// Clear cache for a specific site when project is updated
export const clearSiteCache = (subdomain: string) => {
  const keys = siteCache.keys();
  const siteKeys = keys.filter((key: string) => key.startsWith(`site:${subdomain}:`));
  siteKeys.forEach((key: string) => siteCache.del(key));
};

// Clear all caches
export const clearAllCaches = () => {
  siteCache.flushAll();
  templateCache.flushAll();
};

// Health check for cache
export const getCacheStats = () => {
  return {
    site: {
      keys: siteCache.keys().length,
      stats: siteCache.getStats()
    },
    template: {
      keys: templateCache.keys().length,
      stats: templateCache.getStats()
    }
  };
};