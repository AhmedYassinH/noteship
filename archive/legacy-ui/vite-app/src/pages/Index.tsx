import { useState } from "react";
import { TopBar } from "@/components/TopBar";
import { StatusBar } from "@/components/StatusBar";
import { SidebarTree } from "@/components/SidebarTree";
import { EditorToolbar } from "@/components/EditorToolbar";
import { MarkdownEditor } from "@/components/MarkdownEditor";
import { ArtifactsPanel } from "@/components/ArtifactsPanel";
import { mockWorkspaces } from "@/data/mockData";

const Index = () => {
  const [selectedNoteId, setSelectedNoteId] = useState("n1");
  const [noteContent, setNoteContent] = useState(() => {
    // Find initial note content
    for (const workspace of mockWorkspaces) {
      for (const folder of workspace.folders) {
        const note = folder.notes.find((n) => n.id === "n1");
        if (note) return note.content;
      }
    }
    return "";
  });

  const getCurrentNote = () => {
    for (const workspace of mockWorkspaces) {
      for (const folder of workspace.folders) {
        const note = folder.notes.find((n) => n.id === selectedNoteId);
        if (note) return note;
      }
    }
    return null;
  };

  const handleNoteSelect = (noteId: string) => {
    setSelectedNoteId(noteId);
    // Load the note content
    for (const workspace of mockWorkspaces) {
      for (const folder of workspace.folders) {
        const note = folder.notes.find((n) => n.id === noteId);
        if (note) {
          setNoteContent(note.content);
          return;
        }
      }
    }
  };

  const handleInsertMarkdown = (before: string, after: string = "") => {
    (window as any).insertMarkdown?.(before, after);
  };

  const currentNote = getCurrentNote();

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden">
      <TopBar />

      <div className="flex-1 flex overflow-hidden">
        <SidebarTree selectedNoteId={selectedNoteId} onNoteSelect={handleNoteSelect} />

        <main className="flex-1 flex flex-col overflow-hidden">
          <EditorToolbar onInsert={handleInsertMarkdown} />
          <MarkdownEditor
            content={noteContent}
            onContentChange={setNoteContent}
            fileName={currentNote?.name || "Note.md"}
          />
        </main>

        <ArtifactsPanel selectedNoteId={selectedNoteId} />
      </div>

      <StatusBar />
    </div>
  );
};

export default Index;
