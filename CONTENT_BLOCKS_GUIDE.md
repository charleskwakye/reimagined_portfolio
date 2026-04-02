# Content Block System Guide

## Overview

The content block system is a core feature of this portfolio website, enabling dynamic and flexible content creation for projects, internships, and other sections. It allows for rich, interactive content without requiring HTML knowledge.

## Supported Block Types

The system currently supports the following block types:

1. **Heading** - Section titles with different levels (H1-H4)
2. **Paragraph** - Text content for descriptions, explanations, etc.
3. **Image** - Display photos, screenshots, or other visuals
4. **Video** - Embed YouTube or other video content
5. **List** - Bulleted lists for features, steps, or other enumerated content
6. **Document** - Display or provide download links for PDF files and other documents
7. **PowerPoint** - Embed presentations directly in the page

## Using the Content Block Editor

### Adding a Block

1. Click the "Add Block" button at the top of the editor
2. Select the type of block you want to add from the dropdown menu
3. The block will be added at the end of your current content

### Managing Blocks

- **Reordering**: Use the up/down arrow buttons to change block position
- **Deleting**: Click the trash icon to remove a block
- **Editing**: Each block type has its own editing interface with relevant options

### Block-Specific Features

#### Headings
- Select heading level (H1-H4) from the dropdown
- Enter heading text in the input field

#### Paragraphs
- Enter text in the multi-line text area
- Basic text content with no formatting

#### Images
- Upload an image directly or paste an image URL
- Add an optional caption
- Preview shows how the image will appear

#### Videos
- Paste the embed URL (e.g., https://www.youtube.com/embed/VIDEO_ID)
- Add an optional caption
- Preview shows the embedded video

#### Lists
- Add multiple list items
- Add new items with the "Add Item" button
- Remove items with the "X" button (minimum one item required)

#### Documents
- Upload a document or paste a document URL
- Add a title/caption for the document
- Toggle "Show document on page" to embed a document viewer
- Documents that are embedded will display directly on the page
- All documents have download, open, and hide/show controls
- The document viewer uses Google Docs Viewer for consistent rendering

#### PowerPoint Presentations
- Upload a presentation file or paste a presentation URL
- Add a title/caption for the presentation
- Toggle "Show presentation on page" to embed a presentation viewer
- Embedded presentations display directly on the page
- All presentations have download, open, and hide/show controls
- The presentation viewer uses Google Docs Viewer for consistent rendering

## Document Viewer Component

The website uses a standardized DocumentViewer component across both project and internship pages for displaying documents and PowerPoint presentations:

### Features
- **Consistent UI**: The same viewing experience is maintained across all site sections
- **Responsive Design**: Optimized for both desktop and mobile viewing
- **Control Actions**: Provides controls to:
  - Open the document in a new tab
  - Download the document
  - Hide/Show the embedded viewer
- **Visual Feedback**: Shows loading states while documents are being prepared
- **Mobile-Optimized**: UI elements adjust for smaller screens to maximize viewing area

### Implementation
The DocumentViewer is used for both document and PowerPoint content blocks, ensuring users have a consistent experience regardless of which section of the site they're viewing.

## Technical Details

### Content Block Structure

Each content block is stored as a JSON object with the following base structure:

```typescript
interface ContentBlock {
  id: string;           // Unique identifier
  type: ContentBlockType; // Type of block
  content?: string;     // Text content (for heading, paragraph)
  level?: number;       // Heading level (1-4)
  url?: string;         // URL for images, videos, documents
  caption?: string;     // Optional caption
  items?: string[];     // Items for lists
  showEmbed?: boolean;  // Whether to embed documents/presentations
}
```

### Adding New Block Types

To add a new block type:

1. Update the `ContentBlockType` type definition in `src/components/content-blocks.ts`
2. Add handling for the new block type in:
   - `ContentBlockEditor.tsx` (for editing)
   - `ContentBlockRenderer.tsx` (for viewing)
3. Add appropriate styling for the new block type

## Best Practices

### Optimal Image Usage
- Use compressed images to improve loading times
- Recommended image width: 800-1200px
- Add descriptive captions for accessibility

### Video Embeds
- Use the embed URL format, not the regular video URL
- For YouTube: Use `https://www.youtube.com/embed/VIDEO_ID` format
- For Vimeo: Use `https://player.vimeo.com/video/VIDEO_ID` format

### Document Handling
- Use PDF format when possible for best compatibility
- Large documents may take longer to load when embedded
- Consider using the non-embedded option for very large files

### Presentation Embedding
- PowerPoint files (.ppt, .pptx) work best with Google Docs Viewer
- Alternatively, upload presentations to Google Slides and use the sharing link
- The embed viewer works with Office files and Google Slides links

## Troubleshooting

### Common Issues

#### Images Not Displaying
- Verify the image URL is correct and accessible
- Check that the image format is supported (JPG, PNG, GIF, WebP)
- Images are stored in Vercel Blob Storage and should remain accessible

#### Document/Presentation Embed Not Working
- Ensure the URL is publicly accessible
- Try converting to PDF if using Office formats
- For Google Docs/Slides, ensure the sharing settings allow anyone with the link to view

#### Embed Toggle Not Saving
- When toggling "Show document/presentation on page", make sure to save the form
- The toggle button must be explicitly clicked rather than clicking the label text
- Changes to the toggle state are immediately reflected in the preview

## File Upload Limits

- Images: Maximum 5MB per file
- Documents: Maximum 10MB per file
- Presentations: Maximum 10MB per file

All uploads are processed through the `/api/upload` endpoint and stored in Vercel Blob Storage for persistence. 