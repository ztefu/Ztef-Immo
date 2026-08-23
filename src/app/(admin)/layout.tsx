"use client";

import { useState } from "react";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { AppHeader } from "@/components/layout/AppHeader";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50/50 flex">
      <AdminSidebar 
        isExpanded={isSidebarExpanded} 
        toggleSidebar={() => setIsSidebarExpanded(!isSidebarExpanded)} 
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />
      <div className={`flex flex-col flex-1 transition-all duration-300 w-full lg:w-auto ${isSidebarExpanded ? 'lg:pl-[260px]' : 'lg:pl-[88px]'}`}>
        <AppHeader onMenuClick={() => setIsMobileSidebarOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[100vw] overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
