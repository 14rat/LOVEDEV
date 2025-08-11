import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, serial, uuid, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Enum for project status
export const projectStatusEnum = pgEnum("project_status", ["draft", "published"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").notNull().unique(),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id),
  name: varchar("name").notNull(),
  slug: varchar("slug").unique(),
  status: projectStatusEnum("status").notNull().default("draft"),
  mainTitle: varchar("main_title"),
  subtitle: varchar("subtitle"),
  description: text("description"),
  primaryColor: varchar("primary_color", { length: 7 }),
  secondaryColor: varchar("secondary_color", { length: 7 }),
  backgroundColor: varchar("background_color", { length: 7 }),
  imagePath: varchar("image_path"),
  rainEmoji: varchar("rain_emoji", { length: 10 }).default("❤️"),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
  publishedAt: timestamp("published_at"),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  projects: many(projects),
}));

export const projectsRelations = relations(projects, ({ one }) => ({
  user: one(users, { fields: [projects.userId], references: [users.id] }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  publishedAt: true,
});

export const updateProjectSchema = createInsertSchema(projects).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
  publishedAt: true,
}).partial();

export const updateProjectContentSchema = createInsertSchema(projects).pick({
  mainTitle: true,
  subtitle: true,
  description: true,
}).transform((data) => ({
  mainTitle: data.mainTitle || "",
  subtitle: data.subtitle || "",
  description: data.description || "",
}));

export const updateProjectDesignSchema = createInsertSchema(projects).pick({
  primaryColor: true,
  secondaryColor: true,
  backgroundColor: true,
  imagePath: true,
  rainEmoji: true,
}).transform((data) => ({
  primaryColor: data.primaryColor || "#ff6b9d",
  secondaryColor: data.secondaryColor || "#ffc3d8",
  backgroundColor: data.backgroundColor || "#fff5f8",
  imagePath: data.imagePath || null,
  rainEmoji: data.rainEmoji || "❤️",
}));

export const publishProjectSchema = z.object({
  slug: z.string().min(1, "Slug é obrigatório para publicar"),
});

// Analytics schema
export const siteVisits = pgTable("site_visits", {
  id: serial("id").primaryKey(),
  projectId: serial("project_id").references(() => projects.id),
  slug: varchar("slug").notNull(),
  ip: varchar("ip"),
  userAgent: text("user_agent"),
  referer: text("referer"),
  path: varchar("path"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Add views count to projects
// Types for analytics
export type SiteVisit = typeof siteVisits.$inferSelect;
export type InsertSiteVisit = typeof siteVisits.$inferInsert;

// Select and Insert types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type UpdateProject = z.infer<typeof updateProjectSchema>;
export type UpdateProjectContent = z.infer<typeof updateProjectContentSchema>;
export type UpdateProjectDesign = z.infer<typeof updateProjectDesignSchema>;
export type PublishProject = z.infer<typeof publishProjectSchema>;
