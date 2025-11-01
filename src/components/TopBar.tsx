import { Search, Command, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export const TopBar = () => {
  return (
    <header className="h-14 border-b bg-card flex items-center justify-between px-4 gap-4">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold text-primary">NoteShip</h1>
        <Badge variant="outline" className="text-xs">Dev</Badge>
      </div>

      <div className="flex-1 max-w-md relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search notes..."
          className="pl-9 pr-16 bg-muted/50"
        />
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          <Command className="h-3 w-3" />K
        </kbd>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="default">Deploy</Button>
        <Button variant="ghost" size="icon" className="rounded-full">
          <User className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
};
