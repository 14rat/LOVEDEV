import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { storage } from "../storage";
import { insertUserSchema } from "@shared/schema";

export class AuthController {
  // Create test token for development
  static async createTestToken(req: Request, res: Response) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }
      
      // Check if user exists, create if not
      let user = await storage.getUserByEmail(email);
      if (!user) {
        const validatedUser = insertUserSchema.parse({ email });
        user = await storage.createUser(validatedUser);
      }
      
      const testPayload = {
        sub: user.id,
        email: user.email,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour
      };
      
      const jwtSecret = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_JWT_SECRET || 'test-secret-key';
      const token = jwt.sign(testPayload, jwtSecret);
      
      res.json({ 
        token,
        user: { id: user.id, email: user.email },
        message: 'Test token created successfully'
      });
    } catch (error) {
      console.error('Test token error:', error);
      res.status(500).json({ error: 'Failed to generate test token' });
    }
  }

  // Verify token endpoint
  static async verifyToken(req: Request, res: Response) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing or invalid authorization header' });
      }

      const token = authHeader.substring(7);
      const jwtSecret = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_JWT_SECRET || 'test-secret-key';
      
      const decoded = jwt.verify(token, jwtSecret) as any;
      
      if (!decoded || !decoded.sub) {
        return res.status(401).json({ error: 'Invalid token payload' });
      }

      // Get user from database
      const user = await storage.getUser(decoded.sub);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        valid: true,
        user: { id: user.id, email: user.email },
        expiresAt: new Date(decoded.exp * 1000).toISOString()
      });
    } catch (error) {
      console.error('Token verification error:', error);
      
      if (error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({ error: 'Invalid or expired token' });
      }
      
      res.status(500).json({ error: 'Token verification failed' });
    }
  }

  // Refresh token endpoint
  static async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res.status(400).json({ error: 'Refresh token is required' });
      }

      // For now, just return the same token logic
      // In production, you'd validate the refresh token and issue a new access token
      res.status(501).json({ 
        error: 'Token refresh not implemented in MVP',
        message: 'Use createTestToken for development' 
      });
    } catch (error) {
      console.error('Refresh token error:', error);
      res.status(500).json({ error: 'Failed to refresh token' });
    }
  }
}