interface VideoBlockProps {
  embedUrl: string;
  title: string;
}

export function VideoBlock({ embedUrl, title }: VideoBlockProps) {
  return (
    <div className="my-8">
      <div className="relative aspect-video overflow-hidden rounded-lg">
        <iframe
          src={embedUrl}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute top-0 left-0 w-full h-full border-0"
        />
      </div>
      {title && (
        <p className="mt-2 text-center text-sm text-muted-foreground">
          {title}
        </p>
      )}
    </div>
  );
} 