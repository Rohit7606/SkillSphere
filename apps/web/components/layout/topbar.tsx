"use client";

import React from 'react';
import { Search, Menu } from 'lucide-react';
import { UserButton } from '@clerk/nextjs';
import { NotificationBell } from './notification-bell';

export function Topbar() {
  return (
    <header className="h-20 bg-card border-b border-border flex items-center px-8 justify-between shrink-0 shadow-sm z-[100] relative">
      <div className="flex items-center gap-4">
        {/* Mobile menu trigger */}
        <button className="md:hidden p-2 text-muted-foreground hover:text-foreground">
          <Menu className="h-5 w-5" />
        </button>
        <div className="md:hidden text-lg font-bold text-primary">SkillSphere</div>
      </div>

      {/* Global Search - Centered */}
      <div className="hidden sm:flex items-center relative flex-1 max-w-md mx-8">
        <Search className="h-5 w-5 absolute left-4 text-muted-foreground" />
        <input 
          type="text" 
          placeholder="Search anything..." 
          className="w-full pl-12 pr-6 py-2.5 bg-secondary border border-border rounded-full text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300"
        />
      </div>

      <div className="flex items-center gap-6">
        <NotificationBell />
        <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center ring-2 ring-border overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <UserButton 
            appearance={{
              elements: {
                userButtonAvatarBox: "h-10 w-10 rounded-full",
              }
            }}
          />
        </div>
      </div>
    </header>
  );
}
