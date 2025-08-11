import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/components/AuthProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import Home from "@/pages/Home";
import ProjectEditor from "@/pages/ProjectEditor";
import ProjectPreview from "@/pages/ProjectPreview";
import NotFound from "@/pages/not-found";
import { memo } from "react";

// Memoize Router component to prevent unnecessary re-renders
const Router = memo(() => {
  const { isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-rose-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full mx-auto mb-4 dark:border-pink-400"></div>
          <p className="text-gray-600 dark:text-gray-300">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/projects/:id/preview" component={ProjectPreview} />
      <Route path="/projects/:id" component={ProjectEditor} />
      <Route component={NotFound} />
    </Switch>
  );
});

Router.displayName = "Router";

// Memoize App component to optimize top-level renders
const App = memo(() => {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="romantic-sites-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <Toaster />
            <Router />
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
});

App.displayName = "App";

export default App;
