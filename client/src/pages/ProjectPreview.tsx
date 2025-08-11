import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function ProjectPreview() {
  const [match, params] = useRoute("/projects/:id/preview");
  const projectId = params?.id ? parseInt(params.id) : null;

  const { data: projectData, isLoading } = useQuery({
    queryKey: ['/api/projects', projectId],
    enabled: !!projectId,
  });

  const project = (projectData as any)?.project;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Projeto não encontrado
          </h1>
          <Button asChild>
            <Link href="/">Voltar ao início</Link>
          </Button>
        </div>
      </div>
    );
  }

  const siteUrl = project.status === 'published' && project.slug ? 
    `http://${project.slug}--${window.location.hostname}` : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href={`/projects/${project.id}`}>
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Prévia: {project.name}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Button asChild>
              <Link href={`/projects/${project.id}`}>
                Voltar ao Editor
              </Link>
            </Button>
            
            {siteUrl && (
              <Button asChild>
                <a href={siteUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Abrir Site
                </a>
              </Button>
            )}
          </div>
        </div>

        {/* Preview */}
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
          <iframe
            src={`/api/projects/${project.id}/preview`}
            className="w-full h-[600px] border-0 rounded"
            title={`Prévia de ${project.name}`}
          />
        </div>
      </div>
    </div>
  );
}