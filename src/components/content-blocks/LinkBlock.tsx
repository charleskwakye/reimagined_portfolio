import { FiExternalLink } from 'react-icons/fi';

interface LinkBlockProps {
  url: string;
  title: string;
  description?: string;
}

export function LinkBlock({ url, title, description }: LinkBlockProps) {
  return (
    <div className="my-6">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-start gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50"
      >
        <div className="flex-1">
          <h3 className="font-medium flex items-center">
            {title}
            <FiExternalLink className="ml-2 h-4 w-4" />
          </h3>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </a>
    </div>
  );
} 