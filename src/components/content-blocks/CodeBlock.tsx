'use client';

import { useState } from 'react';
import { FiCopy, FiCheck } from 'react-icons/fi';

interface CodeBlockProps {
  language: string;
  content: string;
}

export function CodeBlock({ language, content }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="my-8">
      <div className="flex items-center justify-between rounded-t-lg bg-muted px-4 py-2">
        <span className="text-sm font-medium">{language}</span>
        <button
          onClick={copyToClipboard}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground"
          aria-label="Copy code"
        >
          {copied ? (
            <FiCheck className="h-4 w-4 text-green-500" />
          ) : (
            <FiCopy className="h-4 w-4" />
          )}
        </button>
      </div>
      <pre className="overflow-x-auto rounded-b-lg bg-muted/50 p-4 font-mono text-sm">
        <code>{content}</code>
      </pre>
    </div>
  );
} 