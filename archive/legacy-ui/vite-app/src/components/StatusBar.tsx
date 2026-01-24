import { CheckCircle2, Clock, Zap } from "lucide-react";

export const StatusBar = () => {
  return (
    <footer className="h-8 border-t bg-card flex items-center justify-between px-4 text-xs text-muted-foreground">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="h-3 w-3 text-green-600" />
          <span>Synced</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="h-3 w-3" />
          <span>Last build: 2m ago</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <Zap className="h-3 w-3 text-amber-500" />
        <span>AI Credits: 1,240 remaining</span>
      </div>
    </footer>
  );
};
