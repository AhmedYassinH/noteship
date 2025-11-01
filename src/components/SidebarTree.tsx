import { useState } from "react";
import { 
  ChevronRight, 
  ChevronDown, 
  FileText, 
  Folder, 
  Plus, 
  FolderPlus, 
  Upload,
  Settings,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Note {
  id: string;
  name: string;
}

interface FolderItem {
  id: string;
  name: string;
  notes: Note[];
  expanded?: boolean;
}

interface Workspace {
  id: string;
  name: string;
  folders: FolderItem[];
  expanded?: boolean;
}

const mockData: Workspace[] = [
  {
    id: "1",
    name: "Personal",
    expanded: true,
    folders: [
      {
        id: "f1",
        name: "AWS Notes",
        expanded: true,
        notes: [
          { id: "n1", name: "Quartz setup.md" },
          { id: "n2", name: "CDK CoreStack.md" }
        ]
      }
    ]
  },
  {
    id: "2",
    name: "Tech Writing",
    expanded: false,
    folders: [
      {
        id: "f2",
        name: "AI Prompts",
        notes: [
          { id: "n3", name: "GPT-4 Tips.md" }
        ]
      }
    ]
  }
];

export const SidebarTree = () => {
  const [workspaces, setWorkspaces] = useState(mockData);
  const [selectedNote, setSelectedNote] = useState("n1");

  const toggleWorkspace = (id: string) => {
    setWorkspaces(prev =>
      prev.map(ws => ws.id === id ? { ...ws, expanded: !ws.expanded } : ws)
    );
  };

  const toggleFolder = (workspaceId: string, folderId: string) => {
    setWorkspaces(prev =>
      prev.map(ws =>
        ws.id === workspaceId
          ? {
              ...ws,
              folders: ws.folders.map(f =>
                f.id === folderId ? { ...f, expanded: !f.expanded } : f
              )
            }
          : ws
      )
    );
  };

  return (
    <aside className="sidebar-width border-r bg-sidebar flex flex-col h-full">
      <div className="p-3 border-b space-y-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="pl-8 h-8 bg-background"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" className="h-8">
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Note
          </Button>
          <Button variant="outline" size="sm" className="h-8">
            <FolderPlus className="h-3.5 w-3.5 mr-1.5" />
            Folder
          </Button>
        </div>

        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="h-8 flex-1">
            <Upload className="h-3.5 w-3.5 mr-1.5" />
            Import
          </Button>
          <Button variant="ghost" size="sm" className="h-8">
            <Settings className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {workspaces.map(workspace => (
            <div key={workspace.id}>
              <button
                onClick={() => toggleWorkspace(workspace.id)}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-sidebar-accent text-sm font-medium transition-smooth"
              >
                {workspace.expanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                <span>{workspace.name}</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {workspace.folders.reduce((acc, f) => acc + f.notes.length, 0)}
                </span>
              </button>

              {workspace.expanded && (
                <div className="ml-2 mt-1 space-y-1">
                  {workspace.folders.map(folder => (
                    <div key={folder.id}>
                      <button
                        onClick={() => toggleFolder(workspace.id, folder.id)}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-sidebar-accent text-sm transition-smooth"
                      >
                        {folder.expanded ? (
                          <ChevronDown className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronRight className="h-3.5 w-3.5" />
                        )}
                        <Folder className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{folder.name}</span>
                        <span className="ml-auto text-xs text-muted-foreground">
                          {folder.notes.length}
                        </span>
                      </button>

                      {folder.expanded && (
                        <div className="ml-6 mt-1 space-y-0.5">
                          {folder.notes.map(note => (
                            <button
                              key={note.id}
                              onClick={() => setSelectedNote(note.id)}
                              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-smooth ${
                                selectedNote === note.id
                                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                                  : "hover:bg-sidebar-accent/50"
                              }`}
                            >
                              <FileText className="h-3.5 w-3.5" />
                              <span className="truncate">{note.name}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </aside>
  );
};
