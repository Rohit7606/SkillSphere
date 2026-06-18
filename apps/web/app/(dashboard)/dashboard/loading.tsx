import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] animate-in fade-in duration-500">
      <div className="flex flex-col items-center gap-4 text-accent-primary">
        <Loader2 className="w-12 h-12 animate-spin" />
        <p className="text-sm font-semibold tracking-widest uppercase opacity-70">Loading workspace...</p>
      </div>
    </div>
  );
}
