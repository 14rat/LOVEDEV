CREATE TYPE "public"."project_status" AS ENUM('draft', 'published');--> statement-breakpoint
CREATE TABLE "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"name" varchar NOT NULL,
	"slug" varchar,
	"status" "project_status" DEFAULT 'draft' NOT NULL,
	"main_title" varchar,
	"subtitle" varchar,
	"description" text,
	"primary_color" varchar(7),
	"secondary_color" varchar(7),
	"background_color" varchar(7),
	"image_path" varchar,
	"views_count" serial DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"published_at" timestamp,
	CONSTRAINT "projects_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "site_visits" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" serial NOT NULL,
	"slug" varchar NOT NULL,
	"ip" varchar,
	"user_agent" text,
	"referer" text,
	"path" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "site_visits" ADD CONSTRAINT "site_visits_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;