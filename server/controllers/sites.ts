import { Request, Response } from "express";
import { storage } from "../storage";

export class SitesController {
  // Render client site based on subdomain
  static async renderSite(req: Request, res: Response) {
    try {
      if (!req.isClientSite || !req.projectSlug) {
        return res.status(404).render('404', { message: 'Site not found' });
      }
      
      // Get published project by slug
      const project = await storage.getProjectBySlug(req.projectSlug);
      
      if (!project) {
        return res.status(404).render('404', { 
          message: 'Este site romântico não foi encontrado ou não está publicado.' 
        });
      }
      
      // Prepare data for template rendering
      const siteData = {
        title: `${project.mainTitle || 'Nosso Amor'} - Nossa História`,
        favicon: '💕',
        mainTitle: project.mainTitle || 'Nossa História',
        subtitle: project.subtitle || 'Nossa História de Amor',
        description: project.description || 'Conte aqui a história de como vocês se conheceram...',
        colors: {
          primary: project.primaryColor || '#ff6b9d',
          secondary: project.secondaryColor || '#ffc3d8',
          background: project.backgroundColor || '#fff5f8'
        },
        imagePath: project.imagePath,
        imageUrl: project.imagePath ? `/uploads/${project.imagePath}` : null,
        rainEmoji: project.rainEmoji || '❤️',
        slug: project.slug,
        baseDomain: process.env.BASE_DOMAIN || 'seudominio.com'
      };
      
      res.render('site-template', siteData);
    } catch (error) {
      console.error('Render site error:', error);
      res.status(500).render('500', { 
        message: 'Erro interno do servidor' 
      });
    }
  }
  
  // Get default template configuration
  static async getTemplate(req: Request, res: Response) {
    try {
      const defaultTemplate = {
        name: "Amor Clássico",
        config: {
          page: {
            title: "{{names}} - Nossa História",
            favicon: "💕"
          },
          content: {
            mainTitle: "{{names}}",
            subtitle: "Nossa História de Amor",
            description: "Conte aqui a história de como vocês se conheceram..."
          },
          theme: {
            primaryColor: "#ff6b9d",
            secondaryColor: "#ffc3d8", 
            backgroundColor: "#fff5f8"
          },
          effects: {
            rainEmoji: "❤️"
          }
        }
      };
      
      res.json({ template: defaultTemplate });
    } catch (error) {
      console.error('Get template error:', error);
      res.status(500).json({ error: 'Failed to retrieve template' });
    }
  }
}
