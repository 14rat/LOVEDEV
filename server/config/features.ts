// Feature flags and configuration for the MVP backend
export const config = {
  // Security features
  security: {
    rateLimiting: true,
    securityHeaders: true,
    inputSanitization: true,
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'), // 5MB
    allowedImageTypes: ['image/jpeg', 'image/jpg', 'image/png']
  },

  // Logging and monitoring
  logging: {
    enabled: true,
    level: process.env.LOG_LEVEL || 'info',
    fileLogging: true,
    requestLogging: true
  },

  // Cache configuration
  cache: {
    enabled: true,
    siteCacheTTL: 300, // 5 minutes
    templateCacheTTL: 3600, // 1 hour
    enableSiteCache: true
  },

  // Analytics features
  analytics: {
    trackVisits: true,
    trackViews: true,
    enableBasicAnalytics: true
  },

  // API limits
  rateLimits: {
    api: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // requests per window
    },
    auth: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5 // login attempts per window
    },
    projectCreation: {
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 10 // projects per hour
    },
    upload: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 20 // uploads per window
    }
  },

  // Business rules
  business: {
    maxProjectsPerUser: 50,
    maxImageSizeMB: 5,
    slugMaxLength: 50,
    contentMaxLength: {
      title: 255,
      subtitle: 255,
      description: 5000,
      projectName: 255
    }
  },

  // Environment settings
  environment: {
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
    baseDomain: process.env.BASE_DOMAIN || 'seudominio.com',
    port: parseInt(process.env.PORT || '5000')
  }
};

// Helper function to check if feature is enabled
export const isFeatureEnabled = (feature: string): boolean => {
  const keys = feature.split('.');
  let current: any = config;
  
  for (const key of keys) {
    if (current[key] === undefined) return false;
    current = current[key];
  }
  
  return Boolean(current);
};

// Export individual feature checks
export const features = {
  isSecurityEnabled: () => isFeatureEnabled('security.rateLimiting'),
  isCacheEnabled: () => isFeatureEnabled('cache.enabled'),
  isLoggingEnabled: () => isFeatureEnabled('logging.enabled'),
  isAnalyticsEnabled: () => isFeatureEnabled('analytics.trackVisits'),
  isDevelopment: () => config.environment.isDevelopment,
  isProduction: () => config.environment.isProduction
};