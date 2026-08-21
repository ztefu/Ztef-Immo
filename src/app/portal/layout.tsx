import { ReactNode } from "react";

export default function PortalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-100 flex justify-center">
      {/* Mobile container constraint on desktop */}
      <div className="w-full max-w-md bg-slate-50 min-h-screen shadow-2xl relative overflow-hidden flex flex-col">
        {children}
      </div>
    </div>
  );
}
