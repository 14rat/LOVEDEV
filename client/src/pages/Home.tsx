import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Plus, Heart, Globe, Palette, Image, Settings, Eye, ExternalLink } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertProjectSchema, type Project } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const createProjectSchema = insertProjectSchema.pick({ name: true });
type CreateProjectData = z.infer<typeof createProjectSchema>;

export default function Home() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { toast } = useToast();

  const { data: projects, isLoading } = useQuery<{projects: Project[]}>({
    queryKey: ['/api/projects'],
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateProjectData) => 
      apiRequest('/api/projects', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      setIsCreateOpen(false);
      form.reset();
      toast({
        title: "Projeto criado!",
        description: "Seu site romântico foi criado com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar projeto",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    },
  });

  const form = useForm<CreateProjectData>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = (data: CreateProjectData) => {
    createMutation.mutate(data);
  };

  const getProjectUrl = (project: Project) => {
    if (project.status === 'published' && project.slug) {
      const currentHost = window.location.hostname;
      const currentProtocol = window.location.protocol;
      const currentPort = window.location.port;
      
      if (currentHost.includes('.replit.app')) {
        // Replit deployment URL
        const replSlug = currentHost.split('.')[0];
        return `https://${project.slug}--${replSlug}.replit.app`;
      } else if (currentHost.includes('.vercel.app')) {
        // Vercel deployment URL - subdomain format: slug.lovedev.vercel.app
        return `https://${project.slug}.lovedev.vercel.app`;
      } else if (currentHost.includes('localhost') || currentHost.includes('replit.dev')) {
        // Development URL - use /site/:slug route
        const baseUrl = `${currentProtocol}//${currentHost}${currentPort ? ':' + currentPort : ''}`;
        return `${baseUrl}/site/${project.slug}`;
      } else {
        // Custom domain
        return `https://${project.slug}.${currentHost}`;
      }
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center gap-2">
            <Heart className="w-8 h-8 text-pink-500" />
            Sites Românticos
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Crie sites românticos personalizados para celebrar seu amor
          </p>
        </div>

        {/* Projects Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Seus Projetos
          </h2>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="bg-pink-500 hover:bg-pink-600 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Projeto
                </Button>
              </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Novo Projeto</DialogTitle>
                <DialogDescription>
                  Comece criando um novo site romântico personalizado.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Projeto</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: João & Maria"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreateOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={createMutation.isPending}
                      className="bg-pink-500 hover:bg-pink-600"
                    >
                      {createMutation.isPending ? "Criando..." : "Criar Projeto"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
          </div>
        </div>

        {/* Projects Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="space-y-2">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-4"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !projects || !projects.projects || projects.projects.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Nenhum projeto ainda
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Comece criando seu primeiro site romântico!
            </p>
            <Button 
              onClick={() => setIsCreateOpen(true)}
              className="bg-pink-500 hover:bg-pink-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeiro Projeto
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects && projects.projects && projects.projects.map((project: Project) => {
              const projectUrl = getProjectUrl(project);
              
              return (
                <Card key={project.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                      <Badge 
                        variant={project.status === 'published' ? 'default' : 'secondary'}
                        className={project.status === 'published' ? 'bg-green-500' : ''}
                      >
                        {project.status === 'published' ? 'Publicado' : 'Rascunho'}
                      </Badge>
                    </div>
                    <CardDescription>
                      {project.mainTitle || 'Sem título definido'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">
                      {project.description || 'Nenhuma descrição ainda'}
                    </p>
                    
                    <div className="flex items-center gap-2 mb-4">
                      {project.primaryColor && (
                        <div 
                          className="w-4 h-4 rounded border border-gray-300"
                          style={{ backgroundColor: project.primaryColor }}
                        />
                      )}
                      {project.imagePath && (
                        <Badge variant="outline" className="text-xs">
                          <Image className="w-3 h-3 mr-1" />
                          Imagem
                        </Badge>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button asChild variant="outline" size="sm" className="flex-1">
                        <Link href={`/projects/${project.id}`}>
                          <Settings className="w-4 h-4 mr-1" />
                          Editar
                        </Link>
                      </Button>
                      
                      {projectUrl ? (
                        <Button asChild variant="outline" size="sm">
                          <a href={projectUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                      ) : (
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/projects/${project.id}/preview`}>
                            <Eye className="w-4 h-4" />
                          </Link>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Features Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Palette className="w-6 h-6 text-pink-500" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Personalização Completa
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Cores, textos e imagens totalmente personalizáveis
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Globe className="w-6 h-6 text-pink-500" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              URL Única
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Cada site tem seu próprio subdomínio especial
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-6 h-6 text-pink-500" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Design Romântico
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Templates lindos com efeitos especiais
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}