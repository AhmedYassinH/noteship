import { TopBar } from "@/components/TopBar";
import { StatusBar } from "@/components/StatusBar";
import { SidebarTree } from "@/components/SidebarTree";
import { EditorToolbar } from "@/components/EditorToolbar";
import { MarkdownEditor } from "@/components/MarkdownEditor";
import { ArtifactsPanel } from "@/components/ArtifactsPanel";

const Index = () => {
  return (
    <div className="h-screen w-full flex flex-col overflow-hidden">
      <TopBar />
      
      <div className="flex-1 flex overflow-hidden">
        <SidebarTree />
        
        <main className="flex-1 flex flex-col overflow-hidden">
          <EditorToolbar />
          <MarkdownEditor />
        </main>
        
        <ArtifactsPanel />
      </div>
      
      <StatusBar />
    </div>
  );
};

export default Index;
