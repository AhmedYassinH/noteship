import { useState } from "react";
import {
  ExternalLink,
  Copy,
  Edit,
  ChevronRight,
  ChevronDown,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface BlogDraft {
  id: string;
  platform: string;
  status: "draft" | "published";
  lastUpdated: string;
}

const blogDrafts: BlogDraft[] = [
  { id: "1", platform: "Medium", status: "draft", lastUpdated: "2 hours ago" },
  { id: "2", platform: "DEV.to", status: "published", lastUpdated: "1 day ago" },
  { id: "3", platform: "Hashnode", status: "draft", lastUpdated: "3 days ago" }
];

const linkedInBlurbs = [
  { id: "1", text: "Just finished setting up Quartz for my notes. The build speed is incredible! 🚀" },
  { id: "2", text: "Static site generators have come so far. Quartz makes publishing seamless." }
];

export const ArtifactsPanel = () => {
  const [expandedSections, setExpandedSections] = useState({
    drafts: true,
    linkedin: true,
    publish: false,
    ai: true
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <aside className="artifacts-width border-l bg-card flex flex-col h-full">
      <div className="h-10 border-b flex items-center px-4">
        <h2 className="text-sm font-semibold">Artifacts</h2>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-3">
          {/* Blog Drafts */}
          <div>
            <button
              onClick={() => toggleSection("drafts")}
              className="w-full flex items-center justify-between py-2 px-2 rounded hover:bg-muted transition-smooth"
            >
              <span className="text-sm font-medium">Blog Drafts</span>
              {expandedSections.drafts ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>

            {expandedSections.drafts && (
              <div className="mt-2 space-y-2">
                {blogDrafts.map(draft => (
                  <div
                    key={draft.id}
                    className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-smooth"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-sm font-medium">{draft.platform}</span>
                      <Badge
                        variant={draft.status === "published" ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {draft.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">
                      Updated {draft.lastUpdated}
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="h-7 flex-1">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Open
                      </Button>
                      <Button variant="outline" size="sm" className="h-7">
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* LinkedIn Blurbs */}
          <div>
            <button
              onClick={() => toggleSection("linkedin")}
              className="w-full flex items-center justify-between py-2 px-2 rounded hover:bg-muted transition-smooth"
            >
              <span className="text-sm font-medium">LinkedIn Blurbs</span>
              {expandedSections.linkedin ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>

            {expandedSections.linkedin && (
              <div className="mt-2 space-y-2">
                {linkedInBlurbs.map(blurb => (
                  <div
                    key={blurb.id}
                    className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-smooth"
                  >
                    <p className="text-xs mb-3 line-clamp-2">{blurb.text}</p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="h-7 flex-1">
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </Button>
                      <Button variant="outline" size="sm" className="h-7 flex-1">
                        Publish
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* AI Presets */}
          <div>
            <button
              onClick={() => toggleSection("ai")}
              className="w-full flex items-center justify-between py-2 px-2 rounded hover:bg-muted transition-smooth"
            >
              <span className="text-sm font-medium">AI Presets</span>
              {expandedSections.ai ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>

            {expandedSections.ai && (
              <div className="mt-2 space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start h-9">
                  <Sparkles className="h-3.5 w-3.5 mr-2" />
                  Rewrite for Medium
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start h-9">
                  <Sparkles className="h-3.5 w-3.5 mr-2" />
                  Rewrite for DEV.to
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start h-9">
                  <Sparkles className="h-3.5 w-3.5 mr-2" />
                  Generate LinkedIn Blurb
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start h-9">
                  <Sparkles className="h-3.5 w-3.5 mr-2" />
                  Summarize
                </Button>
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </aside>
  );
};
