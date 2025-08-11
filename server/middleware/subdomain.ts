import { Request, Response, NextFunction } from "express";

interface SubdomainRequest extends Request {
  subdomain?: string;
  isSystemSubdomain?: boolean;
  isClientSite?: boolean;
  projectSlug?: string;
}

export const detectSubdomain = (req: SubdomainRequest, res: Response, next: NextFunction) => {
  try {
    const hostname = req.get('host') || req.get('x-forwarded-host') || 'localhost:5000';
    let subdomain = hostname.split('.')[0];
    
    // Handle different hosting environments
    if (hostname.includes('replit.dev') || hostname.includes('.replit.app')) {
      // Replit URLs like: meu-site-romntico--projectname.replit.app
      const match = hostname.match(/^([^-]+(?:-[^-]+)*)--/);
      if (match) {
        subdomain = match[1];
        console.log(`🎯 Extracted subdomain from Replit URL: ${subdomain}`);
      } else {
        subdomain = 'system';
        console.log(`🏠 System domain detected: ${hostname}`);
      }
    } else if (hostname.includes('.vercel.app') || hostname.includes('localhost')) {
      // Vercel URLs like: meu-site-romntico.your-app.vercel.app or localhost
      if (hostname !== 'localhost' && hostname !== 'localhost:5000' && !hostname.match(/^[a-f0-9-]{8,}.*\.vercel\.app$/)) {
        // Extract subdomain from Vercel format: subdomain.main-app.vercel.app
        const parts = hostname.split('.');
        if (parts.length >= 3 && parts[parts.length-2] !== 'vercel') {
          subdomain = parts[0];
          console.log(`🎯 Extracted subdomain from Vercel URL: ${subdomain}`);
        } else {
          subdomain = 'system';
          console.log(`🏠 System domain detected: ${hostname}`);
        }
      } else {
        subdomain = 'system';
        console.log(`🏠 System domain detected: ${hostname}`);
      }
    } else {
      // Custom domain or other hosting
      const parts = hostname.split('.');
      if (parts.length > 2) {
        subdomain = parts[0];
        console.log(`🎯 Extracted subdomain from custom domain: ${subdomain}`);
      } else {
        subdomain = 'system';
        console.log(`🏠 System domain detected: ${hostname}`);
      }
    }
    
    // Add subdomain info to request
    req.subdomain = subdomain;
    
    // Reserved subdomains for system use
    const reservedSubdomains = ['app', 'api', 'www', 'mail', 'ftp', 'admin', 'localhost:5000', 'localhost', 'system'];
    const isSystemDomain = reservedSubdomains.includes(subdomain) || 
                          subdomain === 'system' ||
                          hostname === 'localhost:5000' || 
                          hostname === 'localhost' ||
                          (hostname.includes('replit.dev') && !hostname.match(/^([^-]+(?:-[^-]+)*)--/)) ||
                          (hostname.includes('.vercel.app') && hostname.match(/^[a-f0-9-]{8,}.*\.vercel\.app$/));
    
    if (isSystemDomain) {
      req.isSystemSubdomain = true;
      console.log(`🔧 System subdomain: ${subdomain} | Hostname: ${hostname}`);
    } else {
      // This is a client site subdomain
      req.isClientSite = true;
      req.projectSlug = subdomain;
      console.log(`💕 Client site subdomain: ${subdomain} | Project slug: ${subdomain} | Hostname: ${hostname}`);
    }
    
    next();
  } catch (error) {
    console.error('❌ Subdomain detection error:', error);
    req.subdomain = 'unknown';
    req.isSystemSubdomain = true; // Default to system to avoid breaking
    next();
  }
};

declare global {
  namespace Express {
    interface Request {
      subdomain?: string;
      isSystemSubdomain?: boolean;
      isClientSite?: boolean;
      projectSlug?: string;
    }
  }
}
