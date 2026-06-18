"use client";

import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { ChatRoom } from '../../../../components/chat/chat-room';

type Conversation = {
  id: string; // gigId
  name: string;
  gigTitle: string;
  initials: string;
  color: string;
  status: string;
  lastMessageTime: string;
  lastMessageText: string;
};

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/messages/conversations')
      .then(res => res.json())
      .then(json => {
        if (json.data) {
          setConversations(json.data);
          if (json.data.length > 0) setActiveId(json.data[0].id);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredConversations = conversations.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.gigTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.lastMessageText.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeConversation = conversations.find(c => c.id === activeId);

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-surface border border-border rounded-2xl shadow-sm overflow-hidden animate-in fade-in zoom-in-95 duration-500">
      
      {/* Sidebar / Contacts */}
      <div className="w-1/3 border-r border-border flex flex-col bg-background/50 min-w-[280px]">
        <div className="p-4 border-b border-border">
          <h2 className="text-xl font-bold text-foreground mb-4">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-disabled" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..." 
              className="w-full bg-surface border border-border rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary/50 transition-all"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-6 text-center text-text-secondary text-sm animate-pulse">Loading conversations...</div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-6 text-center text-text-secondary text-sm">No conversations found.</div>
          ) : (
            filteredConversations.map(conv => (
              <div 
                key={conv.id}
                onClick={() => setActiveId(conv.id)}
                className={`p-4 border-b border-border cursor-pointer flex gap-4 items-center transition-colors ${
                  activeId === conv.id 
                    ? 'bg-surface-hover/30 border-l-4 border-l-accent-primary' 
                    : 'hover:bg-surface-hover border-l-4 border-l-transparent'
                }`}
              >
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${conv.color} flex items-center justify-center text-white font-bold text-lg shadow-sm shrink-0`}>
                  {conv.initials}
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-foreground truncate pr-2">{conv.name}</span>
                    <span className="text-xs text-text-secondary shrink-0">{conv.lastMessageTime}</span>
                  </div>
                  <p className="text-xs text-accent-primary font-medium truncate mb-1">{conv.gigTitle}</p>
                  <p className="text-sm text-text-secondary truncate">
                    {conv.lastMessageText}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      {activeId && activeConversation ? (
        <ChatRoom 
          key={activeId}
          gigId={activeId} 
          title={activeConversation.name}
          subtitle={`Gig: ${activeConversation.gigTitle}`}
          className="flex-1 flex flex-col bg-background/30 relative h-full border-none rounded-none shadow-none" 
        />
      ) : (
        <div className="flex-1 flex items-center justify-center bg-background/30">
          <div className="text-center text-text-secondary">
            <p className="text-lg font-medium mb-2">Select a conversation</p>
            <p className="text-sm">Choose an active gig to start collaborating.</p>
          </div>
        </div>
      )}

    </div>
  );
}
