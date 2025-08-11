import { db } from "./db";
import { eq, and, ne, desc, sql } from "drizzle-orm";
import { 
  users, 
  projects,
  siteVisits,
  type User, 
  type InsertUser, 
  type Project, 
  type InsertProject,
  type UpdateProject,
  type UpdateProjectContent,
  type UpdateProjectDesign,
  type SiteVisit,
  type InsertSiteVisit,
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Project methods
  createProject(project: InsertProject): Promise<Project>;
  getUserProjects(userId: string): Promise<Project[]>;
  getProject(id: number, userId: string): Promise<Project | undefined>;
  getProjectBySlug(slug: string): Promise<Project | undefined>;
  updateProject(id: number, userId: string, updates: UpdateProject): Promise<Project | undefined>;
  updateProjectContent(id: number, userId: string, content: UpdateProjectContent): Promise<Project | undefined>;
  updateProjectDesign(id: number, userId: string, design: UpdateProjectDesign): Promise<Project | undefined>;
  publishProject(id: number, userId: string, slug: string): Promise<Project | undefined>;
  unpublishProject(id: number, userId: string): Promise<Project | undefined>;
  deleteProject(id: number, userId: string): Promise<Project | undefined>;
  checkSlugExists(slug: string, excludeId?: number): Promise<boolean>;
  
  // Analytics methods
  trackSiteVisit(slug: string, visitData: Omit<InsertSiteVisit, 'slug' | 'projectId'>): Promise<void>;
  incrementProjectViews(projectId: number): Promise<void>;
  getProjectAnalytics(projectId: number, userId: string): Promise<{ viewsCount: number; recentVisits: SiteVisit[] }>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  // Project methods
  async createProject(project: InsertProject): Promise<Project> {
    const result = await db.insert(projects).values(project).returning();
    return result[0];
  }

  async getUserProjects(userId: string): Promise<Project[]> {
    return await db.select().from(projects).where(eq(projects.userId, userId)).orderBy(projects.createdAt);
  }

  async getProject(id: number, userId: string): Promise<Project | undefined> {
    const result = await db.select().from(projects)
      .where(and(eq(projects.id, id), eq(projects.userId, userId)))
      .limit(1);
    return result[0];
  }

  async getProjectBySlug(slug: string): Promise<Project | undefined> {
    const result = await db.select().from(projects)
      .where(and(eq(projects.slug, slug), eq(projects.status, "published")))
      .limit(1);
    return result[0];
  }

  async updateProject(id: number, userId: string, updates: UpdateProject): Promise<Project | undefined> {
    const result = await db.update(projects)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(projects.id, id), eq(projects.userId, userId)))
      .returning();
    return result[0];
  }

  async updateProjectContent(id: number, userId: string, content: UpdateProjectContent): Promise<Project | undefined> {
    const result = await db.update(projects)
      .set({ ...content, updatedAt: new Date() })
      .where(and(eq(projects.id, id), eq(projects.userId, userId)))
      .returning();
    return result[0];
  }

  async updateProjectDesign(id: number, userId: string, design: UpdateProjectDesign): Promise<Project | undefined> {
    const result = await db.update(projects)
      .set({ ...design, updatedAt: new Date() })
      .where(and(eq(projects.id, id), eq(projects.userId, userId)))
      .returning();
    return result[0];
  }

  async publishProject(id: number, userId: string, slug: string): Promise<Project | undefined> {
    const result = await db.update(projects)
      .set({ 
        slug, 
        status: "published", 
        publishedAt: new Date(),
        updatedAt: new Date() 
      })
      .where(and(eq(projects.id, id), eq(projects.userId, userId)))
      .returning();
    return result[0];
  }

  async unpublishProject(id: number, userId: string): Promise<Project | undefined> {
    const result = await db.update(projects)
      .set({ 
        status: "draft", 
        publishedAt: null,
        updatedAt: new Date() 
      })
      .where(and(eq(projects.id, id), eq(projects.userId, userId)))
      .returning();
    return result[0];
  }

  async deleteProject(id: number, userId: string): Promise<Project | undefined> {
    const result = await db.delete(projects)
      .where(and(eq(projects.id, id), eq(projects.userId, userId)))
      .returning();
    return result[0];
  }

  async checkSlugExists(slug: string, excludeId?: number): Promise<boolean> {
    let result;
    
    if (excludeId) {
      result = await db.select().from(projects)
        .where(and(eq(projects.slug, slug), ne(projects.id, excludeId)))
        .limit(1);
    } else {
      result = await db.select().from(projects)
        .where(eq(projects.slug, slug))
        .limit(1);
    }
    
    return result.length > 0;
  }

  // Analytics methods
  async trackSiteVisit(slug: string, visitData: Omit<InsertSiteVisit, 'slug' | 'projectId'>): Promise<void> {
    try {
      // Get project by slug first
      const project = await this.getProjectBySlug(slug);
      if (!project) return;

      await db.insert(siteVisits).values({
        projectId: project.id,
        slug,
        ...visitData
      });
    } catch (error) {
      console.error('Track site visit error:', error);
    }
  }

  async incrementProjectViews(projectId: number): Promise<void> {
    try {
      // For now, just track in site_visits table
      console.log(`View tracked for project ${projectId}`);
    } catch (error) {
      console.error('Increment views error:', error);
    }
  }

  async getProjectAnalytics(projectId: number, userId: string): Promise<{ viewsCount: number; recentVisits: SiteVisit[] }> {
    try {
      // Get project to ensure user owns it
      const project = await this.getProject(projectId, userId);
      if (!project) {
        return { viewsCount: 0, recentVisits: [] };
      }

      // Get recent visits (last 30 days) - only if site_visits table exists
      try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentVisits = await db.select()
          .from(siteVisits)
          .where(
            and(
              eq(siteVisits.projectId, projectId),
              sql`${siteVisits.createdAt} >= ${thirtyDaysAgo}`
            )
          )
          .orderBy(desc(siteVisits.createdAt))
          .limit(100);

        return {
          viewsCount: recentVisits.length,
          recentVisits
        };
      } catch (error) {
        // Table might not exist yet
        return { viewsCount: 0, recentVisits: [] };
      }
    } catch (error) {
      console.error('Get analytics error:', error);
      return { viewsCount: 0, recentVisits: [] };
    }
  }
}

export const storage = new DatabaseStorage();
