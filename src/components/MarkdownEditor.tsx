import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

const sampleMarkdown = `# Quartz Setup Guide

## Introduction

Quartz is a fast, batteries-included static-site generator that transforms Markdown content into a fully functional website.

### Prerequisites

- Node.js 18+
- Git
- Basic understanding of Markdown

## Installation Steps

\`\`\`bash
npm install -g @quartzjs/cli
quartz create my-notes
cd my-notes
\`\`\`

### Configuration

Edit \`quartz.config.ts\` to customize:

- Theme colors
- Navigation structure
- Plugins

> **Note**: Always backup your content before major updates.

## Key Features

- [ ] Fast builds with incremental compilation
- [x] Beautiful, responsive themes
- [x] Full-text search
- [ ] Graph view of connections

## Publishing

Deploy to platforms like:

1. **Vercel** - Recommended for beginners
2. **Netlify** - Great Git integration  
3. **GitHub Pages** - Free hosting

---

*Last updated: 2024*`;

export const MarkdownEditor = () => {
  return (
    <Tabs defaultValue="editor" className="flex-1 flex flex-col">
      <TabsList className="h-10 w-full justify-start rounded-none border-b bg-transparent p-0">
        <TabsTrigger
          value="editor"
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
        >
          Note.md
        </TabsTrigger>
        <TabsTrigger
          value="preview"
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
        >
          Preview
        </TabsTrigger>
      </TabsList>

      <TabsContent value="editor" className="flex-1 m-0 p-0">
        <ScrollArea className="h-full">
          <textarea
            className="w-full h-full min-h-[600px] p-6 bg-editor-background resize-none focus:outline-none font-mono text-sm leading-relaxed"
            defaultValue={sampleMarkdown}
            placeholder="Start writing in Markdown..."
          />
        </ScrollArea>
      </TabsContent>

      <TabsContent value="preview" className="flex-1 m-0 p-0">
        <ScrollArea className="h-full">
          <div className="p-6 prose prose-slate max-w-none">
            <h1>Quartz Setup Guide</h1>
            <h2>Introduction</h2>
            <p>
              Quartz is a fast, batteries-included static-site generator that
              transforms Markdown content into a fully functional website.
            </p>
            <h3>Prerequisites</h3>
            <ul>
              <li>Node.js 18+</li>
              <li>Git</li>
              <li>Basic understanding of Markdown</li>
            </ul>
          </div>
        </ScrollArea>
      </TabsContent>
    </Tabs>
  );
};
