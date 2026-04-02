export { TextBlock } from './TextBlock';
export { ImageBlock } from './ImageBlock';
export { VideoBlock } from './VideoBlock';
export { PDFBlock } from './PDFBlock';
export { CodeBlock } from './CodeBlock';
export { ListBlock } from './ListBlock';
export { LinkBlock } from './LinkBlock';

export type ContentBlock = 
  | { type: 'text'; content: string }
  | { type: 'image'; url: string; caption?: string; alt?: string }
  | { type: 'video'; embedUrl: string; title: string }
  | { type: 'pdf'; url: string; title: string }
  | { type: 'code'; language: string; content: string }
  | { type: 'list'; items: string[]; ordered?: boolean }
  | { type: 'link'; url: string; title: string; description?: string }; 