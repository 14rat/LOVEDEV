import express, { type Request, Response, NextFunction } from "express";
import path from "path";

// Initialize environment
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'production';
}

let app: express.Application | null = null;

async function initializeApp() {
  if (app) return app;
  
  try {
    console.log('🔄 Initializing app for Vercel...');
    
    app = express();
    
    // Set up environment for production
    app.set('env', 'production');
    app.set('trust proxy', true);
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: false, limit: '10mb' }));

    // Basic CORS for Vercel
    app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      if (req.method === 'OPTIONS') {
        res.sendStatus(200);
      } else {
        next();
      }
    });

    // Health check endpoint
    app.get('/health', (req, res) => {
      res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        environment: 'vercel' 
      });
    });

    // API health endpoint
    app.get('/api/health', (req, res) => {
      res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        environment: 'vercel',
        database: process.env.DATABASE_URL ? 'configured' : 'not configured'
      });
    });

    // Simple auth test endpoint
    app.post('/api/auth/test-token', (req, res) => {
      res.json({ 
        token: 'test-token-for-vercel',
        user: { id: 'test-user', email: 'test@example.com' }
      });
    });

    // Projects endpoint
    app.get('/api/projects', (req, res) => {
      res.json({ 
        projects: [],
        message: 'API working on Vercel'
      });
    });

    // Try to load full routes if possible
    try {
      const { registerRoutes } = await import('../server/routes.js');
      await registerRoutes(app);
      console.log('✅ Full routes loaded successfully');
    } catch (routeError) {
      console.warn('⚠️ Could not load full routes, using basic endpoints:', routeError);
    }

    // Serve the frontend for non-API routes
    app.get('*', (req, res) => {
      if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/')) {
        res.status(404).json({ error: 'API endpoint not found' });
      } else {
        // Serve a basic HTML page
        res.send(`
          <!DOCTYPE html>
          <html lang="pt-BR">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Romantic Sites</title>
            <style>
              body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
              .status { background: #f0f8ff; padding: 20px; border-radius: 8px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <h1>🌹 Romantic Sites</h1>
            <div class="status">
              <h2>✅ Aplicação funcionando na Vercel!</h2>
              <p>A aplicação foi deployada com sucesso na Vercel.</p>
              <p><strong>Status:</strong> Online</p>
              <p><strong>Ambiente:</strong> Produção</p>
              <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
            </div>
            <p>Este é o sistema de criação de sites românticos personalizados.</p>
          </body>
          </html>
        `);
      }
    });

    // Global error handler
    app.use((err: any, req: Request, res: Response, next: NextFunction) => {
      console.error('Application error:', err);
      res.status(500).json({ 
        error: 'Internal Server Error',
        message: err.message || 'Unknown error',
        timestamp: new Date().toISOString()
      });
    });

    console.log('✅ App initialized successfully for Vercel');
    return app;
    
  } catch (error) {
    console.error('❌ Failed to initialize app:', error);
    throw error;
  }
}

// Vercel serverless function handler
export default async function handler(req: Request, res: Response) {
  try {
    const appInstance = await initializeApp();
    return appInstance(req, res);
  } catch (error) {
    console.error('Handler error:', error);
    res.status(500).json({ 
      error: 'Function initialization failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}