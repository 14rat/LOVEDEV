import { useState } from "react";
import { useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowLeft, Heart, Palette, Type, Image, Globe, Eye, Save, Trash2, ExternalLink, Copy, Monitor } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SitePreview } from "@/components/SitePreview";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { 
  updateProjectContentSchema, 
  updateProjectDesignSchema,
  publishProjectSchema,
  type Project,
  type UpdateProjectContent,
  type UpdateProjectDesign,
  type PublishProject
} from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function ProjectEditor() {
  const [match, params] = useRoute("/projects/:id");
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();
  
  const projectId = params?.id ? parseInt(params.id) : null;

  const { data: projectData, isLoading } = useQuery({
    queryKey: ['/api/projects', projectId],
    enabled: !!projectId,
  });

  const project = (projectData as any)?.project as Project | undefined;

  const contentForm = useForm<UpdateProjectContent>({
    resolver: zodResolver(updateProjectContentSchema),
    defaultValues: {
      mainTitle: "",
      subtitle: "",
      description: "",
    },
    values: {
      mainTitle: project?.mainTitle || "",
      subtitle: project?.subtitle || "",
      description: project?.description || "",
    },
  });

  const designForm = useForm<UpdateProjectDesign>({
    resolver: zodResolver(updateProjectDesignSchema),
    defaultValues: {
      primaryColor: "#ff6b9d",
      secondaryColor: "#ffc3d8",
      backgroundColor: "#fff5f8",
      imagePath: null,
      rainEmoji: "❤️",
    },
    values: {
      primaryColor: project?.primaryColor || "#ff6b9d",
      secondaryColor: project?.secondaryColor || "#ffc3d8",
      backgroundColor: project?.backgroundColor || "#fff5f8",
      imagePath: project?.imagePath || null,
      rainEmoji: project?.rainEmoji || "❤️",
    },
  });

  const publishForm = useForm<PublishProject>({
    resolver: zodResolver(publishProjectSchema),
    defaultValues: {
      slug: "",
    },
    values: {
      slug: project?.slug || "",
    },
  });

  const updateContentMutation = useMutation({
    mutationFn: (data: UpdateProjectContent) =>
      apiRequest(`/api/projects/${projectId}/content`, 'PUT', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId] });
      toast({
        title: "Conteúdo atualizado!",
        description: "As alterações foram salvas com sucesso.",
      });
    },
  });

  const updateDesignMutation = useMutation({
    mutationFn: (data: UpdateProjectDesign) =>
      apiRequest(`/api/projects/${projectId}/colors`, 'PUT', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId] });
      toast({
        title: "Design atualizado!",
        description: "As cores foram atualizadas com sucesso.",
      });
    },
  });

  const publishMutation = useMutation({
    mutationFn: (data: PublishProject) =>
      apiRequest(`/api/projects/${projectId}/publish`, 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId] });
      setIsPublishDialogOpen(false);
      toast({
        title: "Projeto publicado!",
        description: "Seu site romântico está agora ao vivo.",
      });
    },
  });

  const unpublishMutation = useMutation({
    mutationFn: () =>
      apiRequest(`/api/projects/${projectId}/unpublish`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId] });
      toast({
        title: "Projeto despublicado",
        description: "Seu site não está mais público.",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () =>
      apiRequest(`/api/projects/${projectId}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      toast({
        title: "Projeto excluído",
        description: "O projeto foi removido permanentemente.",
      });
      window.location.href = '/';
    },
  });

  const onContentSubmit = (data: UpdateProjectContent) => {
    updateContentMutation.mutate(data);
  };

  const onDesignSubmit = (data: UpdateProjectDesign) => {
    updateDesignMutation.mutate(data);
  };

  const onPublishSubmit = (data: PublishProject) => {
    publishMutation.mutate(data);
  };

  const getProjectUrl = () => {
    if (project?.status === 'published' && project?.slug) {
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

  const projectUrl = getProjectUrl();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/">
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Heart className="w-6 h-6 text-pink-500" />
                {project.name}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge 
                  variant={project.status === 'published' ? 'default' : 'secondary'}
                  className={project.status === 'published' ? 'bg-green-500' : ''}
                >
                  {project.status === 'published' ? 'Publicado' : 'Rascunho'}
                </Badge>
                {project.slug && (
                  <Badge variant="outline">
                    {project.slug}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {projectUrl ? (
              <Button asChild>
                <a href={projectUrl} target="_blank" rel="noopener noreferrer">
                  <Globe className="w-4 h-4 mr-2" />
                  Ver Site
                </a>
              </Button>
            ) : (
              <Button asChild>
                <Link href={`/projects/${project.id}/preview`}>
                  <Eye className="w-4 h-4 mr-2" />
                  Prévia
                </Link>
              </Button>
            )}

            {project.status === 'published' ? (
              <Button
                variant="outline"
                onClick={() => unpublishMutation.mutate()}
                disabled={unpublishMutation.isPending}
              >
                Despublicar
              </Button>
            ) : (
              <Dialog open={isPublishDialogOpen} onOpenChange={setIsPublishDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-green-500 hover:bg-green-600 text-white">
                    <Globe className="w-4 h-4 mr-2" />
                    Publicar
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Publicar Projeto</DialogTitle>
                    <DialogDescription>
                      Defina uma URL única para seu site romântico.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...publishForm}>
                    <form onSubmit={publishForm.handleSubmit(onPublishSubmit)} className="space-y-4">
                      <FormField
                        control={publishForm.control}
                        name="slug"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>URL do Site</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="joao-maria"
                                {...field}
                                onChange={(e) => {
                                  const value = e.target.value
                                    .toLowerCase()
                                    .replace(/[^a-z0-9-]/g, '')
                                    .replace(/^-+|-+$/g, '');
                                  field.onChange(value);
                                }}
                              />
                            </FormControl>
                            <p className="text-sm text-gray-500">
                              Seu site ficará em: {field.value || 'seu-slug'}--66f1500d-11f2-4833-add4-9a9a2be970eb-00-srz3798qveqm.spock.replit.dev
                            </p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsPublishDialogOpen(false)}
                        >
                          Cancelar
                        </Button>
                        <Button
                          type="submit"
                          disabled={publishMutation.isPending}
                          className="bg-green-500 hover:bg-green-600"
                        >
                          {publishMutation.isPending ? "Publicando..." : "Publicar"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            )}
            
            {/* URL Display for Published Sites */}
            {project.status === 'published' && project.slug && (
              <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2 flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Site Publicado!
                </h4>
                <p className="text-sm text-green-700 dark:text-green-300 mb-3">
                  Seu site romântico está no ar! Compartilhe o link com quem você ama:
                </p>
                <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 border rounded">
                  <Input
                    value={getProjectUrl() || ''}
                    readOnly
                    className="text-sm font-mono"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const url = getProjectUrl();
                      if (url) {
                        navigator.clipboard.writeText(url);
                        toast({ title: "Link copiado!" });
                      }
                    }}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    asChild
                  >
                    <a href={getProjectUrl() || '#'} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Editor Tabs */}
        <Tabs defaultValue="content" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="content" className="flex items-center gap-2">
              <Type className="w-4 h-4" />
              Conteúdo
            </TabsTrigger>
            <TabsTrigger value="design" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Design
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Configurações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Conteúdo do Site</CardTitle>
                <CardDescription>
                  Personalize os textos que aparecerão no seu site romântico
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...contentForm}>
                  <form onSubmit={contentForm.handleSubmit(onContentSubmit)} className="space-y-6">
                    <FormField
                      control={contentForm.control}
                      name="mainTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Título Principal</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="João & Maria"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={contentForm.control}
                      name="subtitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subtítulo</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Nossa História de Amor"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={contentForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrição / História</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Conte aqui a história de como vocês se conheceram..."
                              className="min-h-[120px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      disabled={updateContentMutation.isPending}
                      className="bg-pink-500 hover:bg-pink-600"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {updateContentMutation.isPending ? "Salvando..." : "Salvar Conteúdo"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="design" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Personalizar Design</CardTitle>
                <CardDescription>
                  Escolha as cores que representam o seu amor
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...designForm}>
                  <form onSubmit={designForm.handleSubmit(onDesignSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={designForm.control}
                        name="primaryColor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cor Principal</FormLabel>
                            <FormControl>
                              <div className="flex items-center gap-2">
                                <Input
                                  type="color"
                                  className="w-16 h-10"
                                  {...field}
                                />
                                <Input
                                  type="text"
                                  placeholder="#ff6b9d"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={designForm.control}
                        name="secondaryColor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cor Secundária</FormLabel>
                            <FormControl>
                              <div className="flex items-center gap-2">
                                <Input
                                  type="color"
                                  className="w-16 h-10"
                                  {...field}
                                />
                                <Input
                                  type="text"
                                  placeholder="#ffc3d8"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={designForm.control}
                        name="backgroundColor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cor de Fundo</FormLabel>
                            <FormControl>
                              <div className="flex items-center gap-2">
                                <Input
                                  type="color"
                                  className="w-16 h-10"
                                  {...field}
                                />
                                <Input
                                  type="text"
                                  placeholder="#fff5f8"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Rain Emoji Field */}
                    <FormField
                      control={designForm.control}
                      name="rainEmoji"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Emoji da Chuva</FormLabel>
                          <FormControl>
                            <div className="flex items-center gap-2">
                              <Input
                                type="text"
                                placeholder="❤️"
                                className="w-20 text-center text-xl"
                                maxLength={2}
                                {...field}
                              />
                              <span className="text-sm text-gray-500">
                                Este emoji cairá como chuva no fundo do site
                              </span>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Design Preview */}
                    <div className="border rounded-lg p-4 space-y-4">
                      <Label>Prévia das Cores:</Label>
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-16 h-16 rounded border"
                          style={{ backgroundColor: designForm.watch('primaryColor') || "#ff6b9d" }}
                        />
                        <div 
                          className="w-16 h-16 rounded border"
                          style={{ backgroundColor: designForm.watch('secondaryColor') || "#ffc3d8" }}
                        />
                        <div 
                          className="w-16 h-16 rounded border"
                          style={{ backgroundColor: designForm.watch('backgroundColor') || "#fff5f8" }}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Label>Emoji da Chuva:</Label>
                        <span className="text-2xl">
                          {designForm.watch('rainEmoji') || '❤️'}
                        </span>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      disabled={updateDesignMutation.isPending}
                      className="bg-pink-500 hover:bg-pink-600"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {updateDesignMutation.isPending ? "Salvando..." : "Salvar Design"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações do Projeto</CardTitle>
                <CardDescription>
                  Gerenciar configurações e ações do projeto
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-sm font-medium">Status do Projeto</Label>
                  <p className="text-sm text-gray-500">
                    {project.status === 'published' ? 
                      'Seu projeto está publicado e acessível publicamente.' : 
                      'Seu projeto está em modo rascunho.'
                    }
                  </p>
                </div>

                {project.slug && (
                  <div>
                    <Label className="text-sm font-medium">URL do Site</Label>
                    <p className="text-sm text-gray-500">
                      {project.slug}--66f1500d-11f2-4833-add4-9a9a2be970eb-00-srz3798qveqm.spock.replit.dev
                    </p>
                  </div>
                )}

                <div className="pt-6 border-t">
                  <Label className="text-sm font-medium text-red-600">Zona de Perigo</Label>
                  <p className="text-sm text-gray-500 mb-4">
                    Ações irreversíveis. Use com cuidado.
                  </p>
                  
                  <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="destructive">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Excluir Projeto
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Excluir Projeto</DialogTitle>
                        <DialogDescription>
                          Esta ação não pode ser desfeita. O projeto será removido permanentemente.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setIsDeleteDialogOpen(false)}
                        >
                          Cancelar
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => deleteMutation.mutate()}
                          disabled={deleteMutation.isPending}
                        >
                          {deleteMutation.isPending ? "Excluindo..." : "Confirmar Exclusão"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}