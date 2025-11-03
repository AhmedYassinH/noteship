import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Clock, FileText, Copy, ExternalLink } from "lucide-react";
import { Artifact } from "@/data/mockData";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";

interface ArtifactDialogProps {
  artifact: Artifact | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ArtifactDialog = ({ artifact, open, onOpenChange }: ArtifactDialogProps) => {
  const [selectedVersion, setSelectedVersion] = useState(0);

  if (!artifact) return null;

  const currentVersion = artifact.versions[selectedVersion];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentVersion.content);
    toast.success("Copied to clipboard!");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl">{artifact.platform} Draft</DialogTitle>
              <div className="flex items-center gap-3 mt-2">
                <Badge variant={artifact.status === "published" ? "default" : "secondary"}>
                  {artifact.status}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {artifact.versions.length} version{artifact.versions.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCopy}>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
              <Button size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                Publish
              </Button>
            </div>
          </div>
        </DialogHeader>

        <Separator />

        <div className="flex-1 flex overflow-hidden">
          {/* Version Sidebar */}
          <div className="w-64 border-r bg-muted/30">
            <div className="p-4">
              <h3 className="text-sm font-semibold mb-3">Versions</h3>
              <ScrollArea className="h-[calc(85vh-180px)]">
                <div className="space-y-2">
                  {artifact.versions.map((version, index) => (
                    <button
                      key={version.id}
                      onClick={() => setSelectedVersion(index)}
                      className={`w-full text-left p-3 rounded-lg border transition-smooth ${
                        selectedVersion === index
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background hover:bg-muted/50 border-border"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold">
                          Version {version.version}
                        </span>
                        {index === 0 && (
                          <Badge variant="secondary" className="text-xs">
                            Latest
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs opacity-80">
                        <Clock className="h-3 w-3" />
                        {version.createdAt}
                      </div>
                      <div className="flex items-center gap-2 text-xs opacity-80 mt-1">
                        <FileText className="h-3 w-3" />
                        {version.wordCount} words
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-6 prose prose-slate dark:prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {currentVersion.content}
                </ReactMarkdown>
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
