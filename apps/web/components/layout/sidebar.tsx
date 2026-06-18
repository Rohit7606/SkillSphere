"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Briefcase, 
  FileText, 
  MessageSquare, 
  CreditCard, 
  UserCircle,
  Star,
  BarChart,
  Settings,
  LogOut,
  Search,
  Calendar
} from 'lucide-react';
import { useAuth } from '@clerk/nextjs';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Discover Gigs', href: '/dashboard/search', icon: Search },
  { name: 'My Gigs', href: '/dashboard/gigs', icon: Briefcase },
  { name: 'Proposals', href: '/dashboard/proposals', icon: FileText },
  { name: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
  { name: 'Payments', href: '/dashboard/payments', icon: CreditCard },
  { name: 'Profile', href: '/dashboard/profile', icon: UserCircle },
  { name: 'Reviews', href: '/dashboard/reviews', icon: Star },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart },
  { name: 'Schedule', href: '/dashboard/bookings', icon: Calendar },
];

export function Sidebar() {
  const pathname = usePathname();
  const { signOut } = useAuth();

  return (
    <aside className="group w-20 hover:w-64 bg-foreground border-r-0 hidden md:flex flex-col relative z-20 shadow-2xl transition-[width] duration-300 ease-in-out shrink-0">
      <div className="h-20 flex items-center px-6 group-hover:px-8 border-b border-white/10 transition-all duration-300 overflow-hidden whitespace-nowrap">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 shrink-0 rounded-lg bg-primary shadow-sm flex items-center justify-center">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <span className="text-xl font-extrabold text-white tracking-tight opacity-0 group-hover:opacity-100 transition-opacity duration-300">SkillSphere</span>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3 space-y-2">
        {navItems.map((item) => {
          const isActive = item.href === '/dashboard' 
            ? pathname === '/dashboard' 
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`group/item flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-sm font-semibold relative overflow-hidden w-full ${
                  isActive 
                    ? 'text-white bg-primary shadow-md shadow-primary/30' 
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-center shrink-0 w-6">
                  <item.icon className={`h-5 w-5 transition-transform duration-300 group-hover/item:scale-110 ${isActive ? 'text-white' : 'text-white/60 group-hover/item:text-white'}`} />
                </div>
                <span className="opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity duration-300">
                  {item.name}
                </span>
              </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-white/10 space-y-2 bg-foreground overflow-hidden">
        <Link 
          href="/dashboard/settings"
          className="group/item flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-sm font-semibold text-white/60 hover:text-white hover:bg-white/10 w-full"
        >
          <div className="flex items-center justify-center shrink-0 w-6">
            <Settings className="h-5 w-5 text-white/60 group-hover/item:text-white transition-transform group-hover/item:rotate-90" />
          </div>
          <span className="opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity duration-300">Settings</span>
        </Link>
        <button 
          onClick={() => signOut({ redirectUrl: '/login' })}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-sm font-semibold text-white/60 hover:text-red-400 hover:bg-red-500/10 group/item"
        >
          <div className="flex items-center justify-center shrink-0 w-6">
            <LogOut className="h-5 w-5 text-white/60 group-hover/item:text-red-400 group-hover/item:-translate-x-1 transition-transform" />
          </div>
          <span className="opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity duration-300">Log out</span>
        </button>
      </div>
    </aside>
  );
}
