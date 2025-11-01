import {
  Bold,
  Italic,
  Code,
  Link,
  List,
  ListOrdered,
  Quote,
  Table,
  CheckSquare,
  SplitSquareVertical,
  Heading1,
  Heading2,
  Heading3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export const EditorToolbar = () => {
  return (
    <div className="h-12 border-b bg-toolbar flex items-center px-3 gap-1">
      <div className="flex items-center gap-0.5">
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Heading3 className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6 mx-1" />

      <div className="flex items-center gap-0.5">
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Bold className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Italic className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Code className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6 mx-1" />

      <div className="flex items-center gap-0.5">
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Link className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Quote className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6 mx-1" />

      <div className="flex items-center gap-0.5">
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <List className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <CheckSquare className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6 mx-1" />

      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
        <Table className="h-4 w-4" />
      </Button>

      <div className="ml-auto">
        <Button variant="ghost" size="sm" className="h-8">
          <SplitSquareVertical className="h-4 w-4 mr-1.5" />
          Split View
        </Button>
      </div>
    </div>
  );
};
