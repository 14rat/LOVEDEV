import { Request, Response, NextFunction } from "express";
import { z } from "zod";

const projectSchema = z.object({
  name: z.string().min(3, "Project name must be at least 3 characters").max(255, "Project name cannot exceed 255 characters")
});

const contentSchema = z.object({
  mainTitle: z.string().min(3, "Main title must be at least 3 characters").optional(),
  subtitle: z.string().max(255, "Subtitle cannot exceed 255 characters").optional(),
  description: z.string().max(5000, "Description cannot exceed 5000 characters").optional()
});

const colorSchema = z.object({
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Primary color must be a valid hexadecimal color").optional(),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Secondary color must be a valid hexadecimal color").optional(),
  backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Background color must be a valid hexadecimal color").optional()
});

export const validateProject = (req: Request, res: Response, next: NextFunction) => {
  try {
    projectSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: error.errors[0].message 
      });
    }
    res.status(400).json({ error: 'Invalid project data' });
  }
};

export const validateContent = (req: Request, res: Response, next: NextFunction) => {
  try {
    contentSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: error.errors[0].message 
      });
    }
    res.status(400).json({ error: 'Invalid content data' });
  }
};

export const validateColors = (req: Request, res: Response, next: NextFunction) => {
  try {
    colorSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: error.errors[0].message 
      });
    }
    res.status(400).json({ error: 'Invalid color data' });
  }
};
