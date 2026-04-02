interface TextBlockProps {
  content: string;
}

export function TextBlock({ content }: TextBlockProps) {
  return (
    <div className="prose dark:prose-invert max-w-none">
      <p>{content}</p>
    </div>
  );
} 