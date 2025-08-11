# Romantic Sites MVP

## Overview
This project is a Node.js + Express backend MVP for a service enabling users to create personalized romantic websites with dynamic subdomain hosting (e.g., `joao-maria.seudominio.com`). It features a React admin dashboard, PostgreSQL database with Drizzle ORM, and a template-based site generation system, aiming to provide a unique platform for personal romantic gestures with market potential.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React with TypeScript**: Client-side application utilizing Vite for development.
- **UI/UX**: `shadcn/ui` components built on Radix UI, styled with TailwindCSS (custom design tokens).
- **Data Management**: TanStack Query for data fetching; Wouter for lightweight routing.

### Backend Architecture
- **Express.js Server**: RESTful API following an MVC pattern (controllers, middleware, storage).
- **Dynamic Subdomain Routing**: Middleware for routing requests based on subdomains, distinguishing system subdomains from client sites mapped to project slugs.
- **Content Generation**: EJS for server-side rendering of romantic site templates.
- **File Upload System**: Multer for image handling (local storage).

### Database Design
- **Neon PostgreSQL with Drizzle ORM**: Type-safe operations using UUID primary keys for users and serial for projects.
- **Schema**: `users` and `projects` tables. `projects` includes `project_status` enum (draft/published), customizable content fields (title, subtitle, description, `rain_emoji`), and design fields (colors, image paths). Foreign key relationships enforce user ownership.

### Authentication & Authorization
- **Application-level Authentication**: Database-backed user management via email.
- **Security**: Protected routes, user session management, and application-layer row-level access control.

### Content Management
- **Project Lifecycle**: CRUD operations for projects, including customization of content, color theming, and image uploads.
- **Publication System**: Draft/published states with unique slug validation.

### System Design Choices
- **Dual Mode Support**: Server functions in both continuous development mode and serverless production environments (e.g., Vercel).
- **Dynamic Subdomain System**: Designed to work across various hosting environments (Replit, Vercel, custom domains) by parsing different URL patterns.
- **Performance**: Includes site content caching (5-min TTL) and template caching (1-hour TTL) with invalidation.
- **Security**: Implemented rate limiting, security headers (CSP, XSS protection), input sanitization, and robust file upload validation.
- **Scalability**: Designed for future analytics integration with basic visit tracking.

## External Dependencies

### Database & Storage
- **Neon PostgreSQL**: Cloud-hosted PostgreSQL.
- **Drizzle Kit**: For database migrations.
- **Local File Storage**: For image uploads.

### Authentication
- **bcryptjs**: For password hashing.

### Frontend Libraries
- **React**: Core UI library.
- **Radix UI**: UI primitive components.
- **TanStack Query**: Data fetching and state management.
- **React Hook Form & Zod**: Form validation and management.

### Development Tools
- **Vite**: Fast development server and build tool.
- **TSX**: TypeScript execution.
- **ESBuild**: Production bundling.

### Styling & UI
- **TailwindCSS**: Utility-first CSS framework.
- **Class Variance Authority**: Component variant management.
- **Lucide React**: Icon library.

### Utilities
- **Zod**: Runtime type validation.
- **CLSX/Tailwind Merge**: CSS class handling.
- **Compression**: HTTP response compression.

## Vercel Deployment Error 500 Resolution (August 11, 2025)

### Problem Escalation
After fixing the initial 404 error, encountered new 500 FUNCTION_INVOCATION_FAILED error indicating serverless function crashes during initialization.

### Enhanced Solutions Implemented
- **Simplified Serverless Function**: Created `/api/index.ts` with progressive enhancement approach
- **Robust Error Handling**: Multiple fallback layers to prevent function crashes  
- **Lightweight Core**: Basic endpoints always functional even if full system fails to load
- **Memory Optimization**: Increased function memory to 1024MB for complex operations

### Progressive Enhancement Architecture
- **Layer 1**: Always-working basic endpoints (/health, /api/health)
- **Layer 2**: Attempt to load full application routes with graceful fallback
- **Layer 3**: Comprehensive error boundaries to prevent total failures
- **Layer 4**: Informative fallback HTML page for non-API routes

The deployment strategy now handles both simple serverless deployment and complex full-feature loading with graceful degradation, ensuring the application always starts successfully on Vercel.