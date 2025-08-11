import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { config } from "../config/features";

// Enhanced validation schemas with business rules
const enhancedProjectSchema = z.object({
  name: z.string()
    .min(3, "Project name must be at least 3 characters")
    .max(config.business.contentMaxLength.projectName, "Project name too long")
    .regex(/^[a-zA-Z0-9\s\-_]+$/, "Project name contains invalid characters")
});

const enhancedContentSchema = z.object({
  mainTitle: z.string()
    .min(1, "Main title is required")
    .max(config.business.contentMaxLength.title, "Title too long")
    .optional(),
  subtitle: z.string()
    .max(config.business.contentMaxLength.subtitle, "Subtitle too long")
    .optional(),
  description: z.string()
    .max(config.business.contentMaxLength.description, "Description too long")
    .optional()
});

const enhancedColorSchema = z.object({
  primaryColor: z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Primary color must be a valid hex color")
    .optional(),
  secondaryColor: z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Secondary color must be a valid hex color")
    .optional(),
  backgroundColor: z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Background color must be a valid hex color")
    .optional()
});

const slugSchema = z.object({
  slug: z.string()
    .min(3, "Slug must be at least 3 characters")
    .max(config.business.slugMaxLength, "Slug too long")
    .regex(/^[a-z0-9\-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens")
});

// Enhanced validation middleware with detailed error responses
export const validateEnhancedProject = (req: Request, res: Response, next: NextFunction) => {
  try {
    enhancedProjectSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }))
      });
    }
    res.status(400).json({ error: 'Invalid project data' });
  }
};

export const validateEnhancedContent = (req: Request, res: Response, next: NextFunction) => {
  try {
    enhancedContentSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Content validation failed',
        details: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }))
      });
    }
    res.status(400).json({ error: 'Invalid content data' });
  }
};

export const validateEnhancedColors = (req: Request, res: Response, next: NextFunction) => {
  try {
    enhancedColorSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Color validation failed',
        details: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }))
      });
    }
    res.status(400).json({ error: 'Invalid color data' });
  }
};

export const validateSlug = (req: Request, res: Response, next: NextFunction) => {
  try {
    slugSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Slug validation failed',
        details: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }))
      });
    }
    res.status(400).json({ error: 'Invalid slug data' });
  }
};

// File upload validation
export const validateImageUpload = (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file provided' });
  }

  const { file } = req;
  
  // Validate file type
  if (!config.security.allowedImageTypes.includes(file.mimetype)) {
    return res.status(400).json({ 
      error: 'Invalid file type',
      allowedTypes: config.security.allowedImageTypes
    });
  }

  // Validate file size
  if (file.size > config.security.maxFileSize) {
    return res.status(400).json({ 
      error: 'File too large',
      maxSize: `${config.security.maxFileSize / 1024 / 1024}MB`
    });
  }

  next();
};