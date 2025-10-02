"use client";

import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { templates } from "@/constants/template";
import { cn } from "@/lib/utils";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "../../../convex/_generated/api";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Sparkles, Zap } from "lucide-react";

interface TemplatesGalleryProps {
  showPersonal?: boolean;
}

export const TemplatesGallery = ({ showPersonal = false }: TemplatesGalleryProps) => {
  const router = useRouter();
  const create = useMutation(api.documents.create);
  const [isCreating, setIsCreating] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const onTemplateClick = useCallback(async (title: string, initialContent: string) => {
    if (isCreating) return;
    
    setIsCreating(true);
    
    try {
      const documentId = await create({ 
        title, 
        initialContent,
        forcePersonal: showPersonal
      });
      
      const context = showPersonal ? "personal" : "organization";
      toast.success(
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-yellow-500" />
          <span>Document created in {context}!</span>
        </div>
      );
      router.push(`/documents/${documentId}`);
    } catch (error) {
      console.error("Failed to create document:", error);
      toast.error("Failed to create document");
    } finally {
      setIsCreating(false);
    }
  }, [create, showPersonal, router, isCreating]);

  return (
    <div className="relative bg-gradient-to-br from-gray-50 via-white to-gray-50 py-8 animate-fade-in">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-screen-xl mx-auto px-4 md:px-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Zap className="size-6 text-primary animate-pulse" />
            <h3 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-gray-900 via-primary to-accent bg-clip-text text-transparent">
              Start Creating
            </h3>
          </div>
          <div className={cn(
            "px-3 py-1.5 rounded-full text-xs font-medium shadow-sm",
            showPersonal 
              ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white" 
              : "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
          )}>
            {showPersonal ? "📝 Personal" : "🏢 Organization"}
          </div>
        </div>

        {/* Carousel */}
        <Carousel className="relative">
          <CarouselContent className="-ml-2 md:-ml-4">
            {templates.map((template) => (
              <CarouselItem
                key={template.id}
                className="pl-2 md:pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6"
                onMouseEnter={() => setHoveredId(template.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <div className={cn(
                  "aspect-[3/4] flex flex-col gap-y-3 group",
                  isCreating && "pointer-events-none opacity-50"
                )}>
                  <button
                    disabled={isCreating}
                    onClick={() => onTemplateClick(template.label, template.initialContent)}
                    className={cn(
                      "relative size-full rounded-xl border-2 transition-all duration-300 overflow-hidden",
                      "hover:border-primary hover:shadow-2xl hover:shadow-primary/20",
                      "transform hover:scale-105 hover:-rotate-1",
                      hoveredId === template.id && "scale-105 -rotate-1 border-primary shadow-2xl shadow-primary/20"
                    )}
                    style={{
                      backgroundImage: `url(${template.imageUrl})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat"
                    }}
                    aria-label={`Create ${template.label}`}
                  >
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Hover content */}
                    <div className="absolute inset-x-0 bottom-0 p-3 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <div className="flex items-center justify-center gap-2 text-white text-sm font-medium">
                        <Sparkles className="size-4" />
                        <span>Create</span>
                      </div>
                    </div>

                    {/* Shimmer effect */}
                    {hoveredId === template.id && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                    )}
                  </button>

                  {/* Template name */}
                  <p className="text-sm font-medium text-center truncate px-2 group-hover:text-primary transition-colors">
                    {template.label}
                  </p>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          {/* Navigation buttons */}
          <CarouselPrevious className="left-0 md:-left-4 bg-white/90 backdrop-blur-sm border-2 border-gray-200 hover:border-primary hover:bg-primary hover:text-white transition-all shadow-lg" />
          <CarouselNext className="right-0 md:-right-4 bg-white/90 backdrop-blur-sm border-2 border-gray-200 hover:border-primary hover:bg-primary hover:text-white transition-all shadow-lg" />
        </Carousel>

        {/* Loading indicator */}
        {isCreating && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-xl z-10">
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-primary/20 rounded-full animate-spin border-t-primary" />
                <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 size-5 text-primary animate-pulse" />
              </div>
              <p className="text-sm font-medium text-gray-600">Creating your document...</p>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
};