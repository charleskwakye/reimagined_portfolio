'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Components } from 'react-markdown';

interface MarkdownBlockProps {
  content: string;
}

export function MarkdownBlock({ content }: MarkdownBlockProps) {
  const components: Components = {
    h1: ({ children, ...props }) => (
      <h1 
        className="text-3xl font-bold mt-8 mb-4 leading-tight scroll-mt-24 border-b pb-2" 
        {...props}
      >
        {children}
      </h1>
    ),
    h2: ({ children, ...props }) => (
      <h2 
        className="text-2xl font-bold mt-8 mb-4 leading-tight pl-4 border-l-4 border-primary bg-primary/15 rounded-r-md py-2 scroll-mt-24" 
        {...props}
      >
        {children}
      </h2>
    ),
    h3: ({ children, ...props }) => (
      <h3 
        className="text-xl font-bold mt-6 mb-4 leading-tight pl-3 border-l-2 border-primary/70 bg-primary/10 rounded-r-sm py-1 scroll-mt-24" 
        {...props}
      >
        {children}
      </h3>
    ),
    h4: ({ children, ...props }) => (
      <h4 
        className="text-lg font-bold mt-6 mb-3 leading-tight scroll-mt-24" 
        {...props}
      >
        {children}
      </h4>
    ),
    p: ({ children, ...props }) => (
      <p className="mb-4 text-muted-foreground leading-relaxed" {...props}>
        {children}
      </p>
    ),
    ul: ({ children, ...props }) => (
      <ul className="mb-4 pl-6 list-disc space-y-1" {...props}>
        {children}
      </ul>
    ),
    ol: ({ children, ...props }) => (
      <ol className="mb-4 pl-6 list-decimal space-y-1" {...props}>
        {children}
      </ol>
    ),
    li: ({ children, ...props }) => (
      <li className="leading-relaxed text-muted-foreground" {...props}>
        {children}
      </li>
    ),
    a: ({ children, href, ...props }) => (
      <a 
        href={href} 
        className="text-primary hover:underline" 
        target="_blank" 
        rel="noopener noreferrer"
        {...props}
      >
        {children}
      </a>
    ),
    code: ({ children, className, ...props }) => {
      const isInline = !className;
      return isInline ? (
        <code 
          className="px-1.5 py-0.5 bg-muted rounded text-sm font-mono" 
          {...props}
        >
          {children}
        </code>
      ) : (
        <pre className="my-4 p-4 bg-muted rounded-lg overflow-x-auto">
          <code className={`${className} text-sm font-mono`} {...props}>
            {children}
          </code>
        </pre>
      );
    },
    blockquote: ({ children, ...props }) => (
      <blockquote 
        className="my-4 pl-4 border-l-4 border-muted italic text-muted-foreground" 
        {...props}
      >
        {children}
      </blockquote>
    ),
    img: ({ src, alt, ...props }) => (
      <img 
        src={src} 
        alt={alt} 
        className="my-6 max-w-full h-auto rounded-lg border border-border shadow-sm"
        {...props} 
      />
    ),
    hr: ({ ...props }) => (
      <hr className="my-6 border-border" {...props} />
    ),
    table: ({ children, ...props }) => (
      <div className="my-4 overflow-x-auto">
        <table className="min-w-full border-collapse border border-border" {...props}>
          {children}
        </table>
      </div>
    ),
    thead: ({ children, ...props }) => (
      <thead className="bg-muted" {...props}>
        {children}
      </thead>
    ),
    th: ({ children, ...props }) => (
      <th className="border border-border px-4 py-2 text-left font-semibold" {...props}>
        {children}
      </th>
    ),
    td: ({ children, ...props }) => (
      <td className="border border-border px-4 py-2" {...props}>
        {children}
      </td>
    ),
  };

  return (
    <div className="prose dark:prose-invert max-w-none mb-6">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content || ''}
      </ReactMarkdown>
    </div>
  );
}