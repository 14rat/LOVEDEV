import React from 'react';
import { Heart, Monitor } from 'lucide-react';
import type { Project } from '@shared/schema';

interface SitePreviewProps {
  project: Project;
  colors: {
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
  };
  className?: string;
}

export function SitePreview({ project, colors, className }: SitePreviewProps) {
  return (
    <div className={`w-full h-full ${className}`}>
      {/* Browser-like frame */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900 shadow-sm">
        {/* Browser top bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Monitor className="w-4 h-4" />
            Preview
          </div>
        </div>
        
        {/* Site content preview */}
        <div 
          className="min-h-[400px] relative overflow-hidden"
          style={{ backgroundColor: colors.backgroundColor }}
        >
          {/* Animated background */}
          <div className="absolute inset-0 opacity-10">
            <div 
              className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full animate-pulse"
              style={{ backgroundColor: colors.primaryColor }}
            ></div>
            <div 
              className="absolute bottom-1/4 right-1/4 w-24 h-24 rounded-full animate-pulse delay-1000"
              style={{ backgroundColor: colors.secondaryColor }}
            ></div>
            <div 
              className="absolute top-3/4 left-1/3 w-20 h-20 rounded-full animate-pulse delay-500"
              style={{ backgroundColor: colors.primaryColor }}
            ></div>
          </div>

          {/* Content */}
          <div className="relative z-10 p-8 text-center">
            {/* Hearts animation */}
            <div className="flex justify-center items-center gap-2 mb-6">
              <Heart 
                className="w-6 h-6 animate-bounce" 
                style={{ color: colors.primaryColor }}
                fill="currentColor"
              />
              <Heart 
                className="w-8 h-8 animate-bounce delay-200" 
                style={{ color: colors.primaryColor }}
                fill="currentColor"
              />
              <Heart 
                className="w-6 h-6 animate-bounce delay-100" 
                style={{ color: colors.primaryColor }}
                fill="currentColor"
              />
            </div>

            {/* Title */}
            <h1 
              className="text-4xl font-bold mb-4"
              style={{ color: colors.primaryColor }}
            >
              {project.mainTitle || "Título Principal"}
            </h1>

            {/* Subtitle */}
            <h2 
              className="text-xl mb-6"
              style={{ color: colors.secondaryColor }}
            >
              {project.subtitle || "Subtítulo romântico"}
            </h2>

            {/* Description */}
            <p className="text-gray-700 dark:text-gray-300 max-w-md mx-auto leading-relaxed">
              {project.description || "Uma descrição especial sobre este momento único da sua história de amor..."}
            </p>

            {/* Decorative elements */}
            <div className="mt-8 flex justify-center items-center gap-4">
              <div 
                className="w-2 h-2 rounded-full animate-ping"
                style={{ backgroundColor: colors.primaryColor }}
              ></div>
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: colors.secondaryColor }}
              ></div>
              <div 
                className="w-2 h-2 rounded-full animate-ping delay-1000"
                style={{ backgroundColor: colors.primaryColor }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}