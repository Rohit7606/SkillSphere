import React from 'react';
import { AdminSidebar } from '../../components/admin/admin-sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AdminSidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Simple topbar for admin */}
        <header className="h-16 border-b border-border bg-surface flex items-center justify-end px-8 shrink-0">
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 rounded-full bg-accent-primary flex items-center justify-center text-white text-sm font-bold shadow-sm ring-2 ring-background">
              A
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-8 bg-background relative">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
