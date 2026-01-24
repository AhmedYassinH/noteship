import { useRef, useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownEditorProps {
  content: string;
  onContentChange: (content: string) => void;
  fileName: string;
}

export const MarkdownEditor = ({ content, onContentChange, fileName }: MarkdownEditorProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [localContent, setLocalContent] = useState(content);

  // Update local content when prop changes (e.g., switching notes)
  useEffect(() => {
    setLocalContent(content);
  }, [content]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setLocalContent(newContent);
    onContentChange(newContent);
  };

  const insertMarkdown = (before: string, after: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = localContent.substring(start, end);
    const beforeText = localContent.substring(0, start);
    const afterText = localContent.substring(end);

    const newText = beforeText + before + selectedText + after + afterText;
    const newCursorPos = start + before.length + selectedText.length;

    setLocalContent(newText);
    onContentChange(newText);

    // Update cursor position after state update
    setTimeout(() => {
      if (textarea) {
        textarea.setSelectionRange(newCursorPos, newCursorPos);
        textarea.focus();
      }
    }, 0);
  };

  // Expose insertMarkdown method to parent via window
  useEffect(() => {
    (window as any).insertMarkdown = insertMarkdown;
  });

  return (
    <Tabs defaultValue="editor" className="flex-1 flex flex-col">
      <TabsList className="h-10 w-full justify-start rounded-none border-b bg-transparent p-0">
        <TabsTrigger
          value="editor"
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
        >
          {fileName}
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
            ref={textareaRef}
            value={localContent}
            className="w-full h-full min-h-[600px] p-6 bg-editor-background resize-none focus:outline-none font-mono text-sm leading-relaxed text-foreground"
            onChange={handleChange}
            placeholder="Start writing in Markdown..."
          />
        </ScrollArea>
      </TabsContent>

      <TabsContent value="preview" className="flex-1 m-0 p-0">
        <ScrollArea className="h-full">
          <div className="p-6 prose prose-slate dark:prose-invert max-w-none prose-headings:text-foreground prose-p:text-foreground prose-li:text-foreground prose-strong:text-foreground prose-code:text-foreground prose-pre:bg-muted prose-pre:text-foreground">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{localContent}</ReactMarkdown>
          </div>
        </ScrollArea>
      </TabsContent>
    </Tabs>
  );
};
