import { Request, Response } from "express";
import { storage } from "../storage";

const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export class ProjectsController {
  // Create new project
  static async createProject(req: Request, res: Response) {
    try {
      const { name } = req.body;
      const userId = req.user!.id;
      
      const project = await storage.createProject({
        userId,
        name: name.trim()
      });
      
      res.status(201).json({
        message: 'Project created successfully',
        project
      });
    } catch (error) {
      console.error('Create project error:', error);
      res.status(500).json({ error: 'Failed to create project' });
    }
  }
  
  // Get user projects
  static async getUserProjects(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const projects = await storage.getUserProjects(userId);
      
      res.json({
        projects,
        count: projects.length
      });
    } catch (error) {
      console.error('Get projects error:', error);
      res.status(500).json({ error: 'Failed to retrieve projects' });
    }
  }
  
  // Get single project
  static async getProject(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user!.id;
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid project ID' });
      }
      
      const project = await storage.getProject(id, userId);
      
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      
      res.json({ project });
    } catch (error) {
      console.error('Get project error:', error);
      res.status(500).json({ error: 'Failed to retrieve project' });
    }
  }
  
  // Update project (general info like name)
  static async updateProject(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const { name } = req.body;
      const userId = req.user!.id;
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid project ID' });
      }
      
      const project = await storage.updateProject(id, userId, {
        name: name?.trim()
      });
      
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      
      res.json({
        message: 'Project updated successfully',
        project
      });
    } catch (error) {
      console.error('Update project error:', error);
      res.status(500).json({ error: 'Failed to update project' });
    }
  }

  // Update project content
  static async updateContent(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const { mainTitle, subtitle, description } = req.body;
      const userId = req.user!.id;
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid project ID' });
      }
      
      const project = await storage.updateProjectContent(id, userId, {
        mainTitle,
        subtitle,
        description
      });
      
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      
      res.json({
        message: 'Content updated successfully',
        project
      });
    } catch (error) {
      console.error('Update content error:', error);
      res.status(500).json({ error: 'Failed to update content' });
    }
  }
  
  // Update project colors
  static async updateColors(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const { primaryColor, secondaryColor, backgroundColor } = req.body;
      const userId = req.user!.id;
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid project ID' });
      }
      
      const project = await storage.updateProjectDesign(id, userId, {
        primaryColor,
        secondaryColor,
        backgroundColor
      });
      
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      
      res.json({
        message: 'Colors updated successfully',
        project
      });
    } catch (error) {
      console.error('Update colors error:', error);
      res.status(500).json({ error: 'Failed to update colors' });
    }
  }
  
  // Upload project image
  static async uploadImage(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user!.id;
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid project ID' });
      }
      
      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
      }
      
      const imagePath = `/uploads/${req.file.filename}`;
      const project = await storage.updateProjectDesign(id, userId, { imagePath });
      
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      
      res.json({
        message: 'Image uploaded successfully',
        imagePath,
        project
      });
    } catch (error) {
      console.error('Upload image error:', error);
      res.status(500).json({ error: 'Failed to upload image' });
    }
  }
  
  // Publish project
  static async publishProject(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user!.id;
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid project ID' });
      }
      
      // Get project first
      const existingProject = await storage.getProject(id, userId);
      if (!existingProject) {
        return res.status(404).json({ error: 'Project not found' });
      }
      
      let slug = existingProject.slug;
      
      // Generate slug if not exists
      if (!slug) {
        const baseSlug = slugify(existingProject.name);
        let counter = 1;
        slug = baseSlug;
        
        // Check if slug is unique
        while (await storage.checkSlugExists(slug, id)) {
          slug = `${baseSlug}-${counter}`;
          counter++;
        }
      }
      
      const project = await storage.publishProject(id, userId, slug);
      
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      
      const baseDomain = process.env.BASE_DOMAIN || 'seudominio.com';
      
      res.json({
        message: 'Project published successfully',
        siteUrl: `https://${slug}.${baseDomain}`,
        project
      });
    } catch (error) {
      console.error('Publish project error:', error);
      res.status(500).json({ error: 'Failed to publish project' });
    }
  }
  
  // Unpublish project
  static async unpublishProject(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user!.id;
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid project ID' });
      }
      
      const project = await storage.unpublishProject(id, userId);
      
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      
      res.json({
        message: 'Project unpublished successfully',
        project
      });
    } catch (error) {
      console.error('Unpublish project error:', error);
      res.status(500).json({ error: 'Failed to unpublish project' });
    }
  }
  
  // Get project preview data
  static async getProjectPreview(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user!.id;
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid project ID' });
      }
      
      const project = await storage.getProject(id, userId);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      
      res.json({
        project,
        preview: {
          title: `${project.mainTitle || 'Sem Nome'} - Nossa História`,
          mainTitle: project.mainTitle || 'Nossa História',
          subtitle: project.subtitle || 'Nossa História de Amor',
          description: project.description || 'Conte aqui a história de como vocês se conheceram...',
          colors: {
            primary: project.primaryColor || '#ff6b9d',
            secondary: project.secondaryColor || '#ffc3d8',
            background: project.backgroundColor || '#fff5f8'
          },
          imagePath: project.imagePath
        }
      });
    } catch (error) {
      console.error('Preview project error:', error);
      res.status(500).json({ error: 'Failed to generate preview' });
    }
  }
  
  // Delete project
  static async deleteProject(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user!.id;
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid project ID' });
      }
      
      const project = await storage.deleteProject(id, userId);
      
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      
      res.json({
        message: 'Project deleted successfully',
        project
      });
    } catch (error) {
      console.error('Delete project error:', error);
      res.status(500).json({ error: 'Failed to delete project' });
    }
  }

  // Get project analytics
  static async getProjectAnalytics(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user!.id;
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid project ID' });
      }
      
      const analytics = await storage.getProjectAnalytics(id, userId);
      
      res.json({
        analytics
      });
    } catch (error) {
      console.error('Get analytics error:', error);
      res.status(500).json({ error: 'Failed to retrieve analytics' });
    }
  }
}
