"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ShieldAlert, 
  Users, 
  Briefcase, 
  CreditCard,
  BarChart4,
  Settings,
  LogOut
} from 'lucide-react';
import { useAuth } from '@clerk/nextjs';

const navItems = [
  { name: 'Overview', href: '/admin', icon: BarChart4 },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Gigs', href: '/admin/gigs', icon: Briefcase },
  { name: 'Payments', href: '/admin/payments', icon: CreditCard },
  { name: 'Disputes', href: '/admin/disputes', icon: ShieldAlert },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { signOut } = useAuth();

  return (
    <aside className="w-64 border-r border-border bg-surface hidden md:flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-border bg-accent-primary/5">
        <ShieldAlert className="h-5 w-5 text-accent-primary mr-2" />
        <span className="text-lg font-bold text-foreground">Admin Portal</span>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium ${
                isActive 
                  ? 'bg-accent-primary text-white' 
                  : 'text-text-secondary hover:text-foreground hover:bg-surface-hover'
              }`}
            >
              <item.icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-text-secondary'}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-border space-y-1">
        <Link 
          href="/admin/settings"
          className="flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium text-text-secondary hover:text-foreground hover:bg-surface-hover"
        >
          <Settings className="h-4 w-4 text-text-secondary" />
          Settings
        </Link>
        <button 
          onClick={() => signOut({ redirectUrl: '/login' })}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium text-text-secondary hover:text-color-error hover:bg-color-error/10"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </div>
    </aside>
  );
}
