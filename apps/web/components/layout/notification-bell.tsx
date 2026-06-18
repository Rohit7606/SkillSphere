"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { io } from 'socket.io-client';
import { useUser } from '@clerk/nextjs';

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const { user } = useUser();
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  // Fetch initial notifications
  useEffect(() => {
    async function fetchNotifications() {
      try {
        const res = await fetch('/api/notifications');
        const json = await res.json();
        if (json.data) setNotifications(json.data);
      } catch (err) {
        console.error('Failed to fetch notifications', err);
      }
    }
    fetchNotifications();
  }, []);

  // Set up socket listener for real-time notifications
  useEffect(() => {
    if (!user?.id) return;
    
    // Connect to the separate express socket server running on port 3001
    const socket = io('http://localhost:3001', {
      query: { clerkId: user.id }
    });

    socket.on('new_notification', (notification) => {
      setNotifications((prev) => [notification, ...prev]);
    });

    return () => {
      socket.disconnect();
    };
  }, [user?.id]);

  const unreadCount = notifications.filter(n => !n.readAt).length;

  const markAsRead = async (id: string) => {
    try {
      // Optimistic update
      setNotifications(notifications.map(n => n.id === id ? { ...n, readAt: new Date().toISOString() } : n));
      await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
    } catch (error) {
      console.error('Failed to mark as read', error);
    }
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full text-text-secondary hover:bg-surface-hover hover:text-foreground transition-colors"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent-primary"></span>
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-border rounded-xl shadow-lg z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2">
          <div className="p-4 border-b border-border bg-slate-50 flex items-center justify-between">
            <h3 className="font-bold text-foreground">Notifications</h3>
            {unreadCount > 0 && (
              <span className="text-xs font-medium bg-accent-primary/10 text-accent-primary px-2 py-0.5 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-text-secondary text-sm">
                No notifications yet.
              </div>
            ) : (
              <div className="divide-y divide-border">
                {notifications.map((notif) => (
                  <div 
                    key={notif.id} 
                    className={`p-4 transition-colors ${notif.readAt ? 'bg-surface opacity-75' : 'bg-surface-hover'}`}
                  >
                    <div className="flex gap-3">
                      <div className="flex-1 space-y-1">
                        <p className="text-sm text-foreground">
                          {notif.payload?.message || 'New notification received'}
                        </p>
                        <p className="text-xs text-text-disabled">
                          {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      {!notif.readAt && (
                        <button 
                          onClick={() => markAsRead(notif.id)}
                          className="h-6 w-6 rounded-full hover:bg-color-success/20 flex items-center justify-center text-color-success transition-colors shrink-0"
                          title="Mark as read"
                        >
                          <Check className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
