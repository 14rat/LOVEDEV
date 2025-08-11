import { Request, Response } from "express";
import { getCacheStats } from "../middleware/cache";
import { storage } from "../storage";

export class HealthController {
  // Health check endpoint
  static async healthCheck(req: Request, res: Response) {
    try {
      // Test database connection - just check if we can access the user table
      const testUser = await storage.getUserByEmail('health-check@example.com');
      
      const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'unknown',
        database: 'connected',
        cache: getCacheStats(),
        memory: {
          usage: Math.round(process.memoryUsage().rss / 1024 / 1024),
          heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
        },
        version: process.env.npm_package_version || '1.0.0'
      };

      res.json(health);
    } catch (error) {
      console.error('Health check failed:', error);
      res.status(503).json({
        status: 'unhealthy',
        error: 'Database connection failed',
        timestamp: new Date().toISOString()
      });
    }
  }

  // Get system stats
  static async getStats(req: Request, res: Response) {
    try {
      // Basic system statistics
      const stats = {
        system: {
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          platform: process.platform,
          nodeVersion: process.version
        },
        cache: getCacheStats(),
        environment: {
          nodeEnv: process.env.NODE_ENV,
          port: process.env.PORT || 5000
        }
      };

      res.json(stats);
    } catch (error) {
      console.error('Stats error:', error);
      res.status(500).json({ error: 'Failed to retrieve stats' });
    }
  }
}