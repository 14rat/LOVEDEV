import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import jwt from "jsonwebtoken";
import { authMiddleware } from "./middleware/auth";
import { detectSubdomain } from "./middleware/subdomain";
import { validateProject, validateContent, validateColors } from "./middleware/validation";
import { apiRateLimit, authRateLimit, projectCreationRateLimit, uploadRateLimit, securityHeaders, sanitizeInput } from "./middleware/security";
import { requestLogger } from "./middleware/logging";
import { trackSiteVisit, trackProjectView } from "./middleware/analytics";
import { cacheSiteContent } from "./middleware/cache";
import { ProjectsController } from "./controllers/projects";
import { SitesController } from "./controllers/sites";
import { HealthController } from "./controllers/health";
import { AuthController } from "./controllers/auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set EJS as template engine
  app.set('view engine', 'ejs');
  app.set('views', path.join(import.meta.dirname, 'views'));

  // Ensure uploads directory exists (skip in serverless environments)
  const uploadsDir = path.join(import.meta.dirname, 'uploads');
  try {
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
  } catch (error) {
    console.warn('Could not create uploads directory (serverless environment):', error);
  }

  // Serve static files from uploads directory
  app.use('/uploads', express.static(uploadsDir));

  // Configure multer for file uploads
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, `romantic-${uniqueSuffix}${ext}`);
    }
  });

  const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG and PNG images are allowed'));
    }
  };

  const upload = multer({
    storage,
    fileFilter,
    limits: {
      fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880') // 5MB default
    }
  });

  // Apply global middleware
  app.use(securityHeaders);
  app.use(requestLogger);
  app.use(detectSubdomain);
  app.use(cacheSiteContent);
  app.use(trackSiteVisit);
  app.use(sanitizeInput);

  // API routes with authentication
  const apiRouter = express.Router();
  
  // Public routes (no auth needed)
  apiRouter.get('/health', HealthController.healthCheck);
  apiRouter.get('/stats', HealthController.getStats);
  apiRouter.get('/template', SitesController.getTemplate);
  
  // Auth routes
  apiRouter.post('/auth/test-token', authRateLimit, AuthController.createTestToken);
  apiRouter.post('/auth/verify', AuthController.verifyToken);
  apiRouter.post('/auth/refresh', authRateLimit, AuthController.refreshToken);
  
  // Apply auth middleware to protected routes
  apiRouter.use(authMiddleware);

  // Project CRUD routes
  apiRouter.post('/projects', projectCreationRateLimit, validateProject, ProjectsController.createProject);
  apiRouter.get('/projects', ProjectsController.getUserProjects);
  apiRouter.get('/projects/:id', ProjectsController.getProject);
  apiRouter.put('/projects/:id', validateProject, ProjectsController.updateProject);
  apiRouter.delete('/projects/:id', ProjectsController.deleteProject);

  // Project customization routes
  apiRouter.put('/projects/:id/content', validateContent, ProjectsController.updateContent);
  apiRouter.put('/projects/:id/colors', validateColors, ProjectsController.updateColors);
  apiRouter.post('/projects/:id/image', uploadRateLimit, upload.single('image'), ProjectsController.uploadImage);

  // Project publishing routes
  apiRouter.post('/projects/:id/publish', ProjectsController.publishProject);
  apiRouter.delete('/projects/:id/unpublish', ProjectsController.unpublishProject);

  // Project preview
  apiRouter.get('/projects/:id/preview', ProjectsController.getProjectPreview);

  // Error handling for multer
  apiRouter.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File size too large. Maximum 5MB allowed.' });
      }
    }
    if (error.message === 'Only JPEG and PNG images are allowed') {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  });

  // Analytics routes
  apiRouter.get('/projects/:id/analytics', ProjectsController.getProjectAnalytics);

  // Mount API routes with rate limiting
  app.use('/api', apiRateLimit, apiRouter);

  // Special route for development: /site/:slug
  app.get('/site/:slug', async (req, res) => {
    try {
      // Override request properties for development site access
      req.isClientSite = true;
      req.projectSlug = req.params.slug;
      req.subdomain = req.params.slug;
      
      console.log(`🔧 Development site access: ${req.params.slug}`);
      
      trackProjectView(req, res, () => {
        SitesController.renderSite(req, res);
      });
    } catch (error) {
      console.error('Development site access error:', error);
      res.status(500).render('500', { 
        message: 'Erro interno do servidor' 
      });
    }
  });

  // Site rendering routes (for client subdomains only)
  app.get('*', (req, res, next) => {
    if (req.isClientSite) {
      trackProjectView(req, res, () => {
        SitesController.renderSite(req, res);
      });
    } else {
      // Let Vite handle frontend routes
      next();
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
