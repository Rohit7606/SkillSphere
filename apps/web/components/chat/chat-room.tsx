"use client";

import React, { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { Send, UserCircle, Paperclip, FileIcon, Loader2, Image as ImageIcon, Download, ExternalLink } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import { uploadChatAttachment } from "../../app/actions/chat";

interface Message {
  id: string;
  senderId: string;
  content: string;
  createdAt: Date | string;
  fileUrl?: string;
}

interface ChatRoomProps {
  gigId: string;
  className?: string;
  title?: string;
  subtitle?: string;
}

export function ChatRoom({ gigId, className, title, subtitle }: ChatRoomProps) {
  const { userId } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Fetch historical messages
    fetch(`/api/messages?gigId=${gigId}`)
      .then(res => res.json())
      .then(json => {
        if (json.data) setMessages(json.data);
      })
      .catch(console.error);
  }, [gigId]);

  useEffect(() => {
    // Connect to the standalone Express Socket.IO server
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://127.0.0.1:3001";
    const newSocket = io(socketUrl);
    setSocket(newSocket);

    newSocket.on("connect", () => {
      setIsConnected(true);
      newSocket.emit("join_room", { gigId });
    });

    newSocket.on("disconnect", () => {
      setIsConnected(false);
    });

    newSocket.on("receive_message", (data: Message) => {
      setMessages((prev) => {
        if (prev.some(m => m.id === data.id)) return prev;
        return [...prev, data];
      });
    });

    newSocket.on("typing_start", (data: { senderId: string }) => {
      if (data.senderId !== userId) {
        setIsTyping(true);
      }
    });

    newSocket.on("typing_stop", (data: { senderId: string }) => {
      if (data.senderId !== userId) {
        setIsTyping(false);
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [gigId, userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleTyping = () => {
    if (socket && isConnected && userId) {
      socket.emit("typing_start", { gigId, senderId: userId });
      
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("typing_stop", { gigId, senderId: userId });
      }, 1000);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    if (!userId) {
      toast.error("User not authenticated");
      return;
    }
    
    if (!socket || !isConnected) {
      toast.error("Chat server disconnected. Trying to reconnect...");
      return;
    }

    const newMsg: Message = {
      id: Math.random().toString(36).substring(7),
      senderId: userId,
      content: input,
      createdAt: new Date(),
    };

    // Optimistic UI update
    setMessages((prev) => {
      if (prev.some(m => m.id === newMsg.id)) return prev;
      return [...prev, newMsg];
    });

    // Broadcast in real-time
    socket.emit("send_message", { ...newMsg, gigId });
    
    // Save to database
    fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gigId, content: input })
    }).catch(console.error);
    
    setInput("");
    socket.emit("typing_stop", { gigId, senderId: userId });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId || !socket || !isConnected) return;

    setIsUploading(true);
    toast.info("Uploading attachment...");

    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const fileUrl = await uploadChatAttachment(formData);
      
      const newMsg: Message = {
        id: Math.random().toString(36).substring(7),
        senderId: userId,
        content: `Sent an attachment: ${file.name}`,
        createdAt: new Date(),
        fileUrl
      };

      setMessages((prev) => [...prev, newMsg]);
      socket.emit("send_message", { ...newMsg, gigId });

      fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gigId, content: newMsg.content, fileUrl })
      }).catch(console.error);
      
      toast.success("Attachment sent!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload attachment");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className={className || "flex flex-col h-[500px] bg-card border-2 border-border shadow-sm rounded-2xl overflow-hidden"}>
      <div className="p-4 border-b border-border bg-secondary flex items-center gap-3 shrink-0">
        <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-success' : 'bg-warning'} animate-pulse`} />
        <div>
          <h3 className="font-medium text-foreground">{title || "Project Chat Room"}</h3>
          {subtitle && <p className="text-xs text-text-secondary">{subtitle}</p>}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-muted-foreground text-sm text-center px-4">
            No messages yet. Send a message to start collaborating!
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === userId;
            return (
              <div key={msg.id} className={`flex items-end gap-2 ${isMe ? "justify-end" : "justify-start"}`}>
                {!isMe && <UserCircle className="h-6 w-6 text-muted-foreground/50 mb-1" />}
                <div 
                  className={`max-w-[75%] px-4 py-2 rounded-2xl ${
                    isMe 
                      ? "bg-accent-primary text-white rounded-br-sm shadow-sm" 
                      : "bg-secondary border border-border text-foreground rounded-bl-sm"
                  }`}
                >
                  {msg.fileUrl ? (
                    <div className="flex flex-col gap-2">
                      <p className="text-sm font-medium opacity-90">{msg.content}</p>
                      {msg.fileUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                        <a href={msg.fileUrl} target="_blank" rel="noreferrer" className="block mt-1 overflow-hidden rounded-xl border border-white/20">
                          <img src={msg.fileUrl} alt="Attachment" className="max-w-full max-h-48 object-cover hover:scale-105 transition-transform" />
                        </a>
                      ) : (
                        <div className={`flex flex-col gap-2 p-3 rounded-lg border ${isMe ? 'bg-white/10 border-white/20' : 'bg-background border-border'}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <FileIcon className="h-5 w-5 shrink-0" />
                            <span className="text-xs font-semibold truncate max-w-[150px]">Document Attachment</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <a href={msg.fileUrl} target="_blank" rel="noreferrer" className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${isMe ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-surface hover:bg-surface-hover text-foreground border border-border'}`}>
                              <ExternalLink className="h-3.5 w-3.5" />
                              Preview
                            </a>
                            <a href={msg.fileUrl.includes('/raw/') ? msg.fileUrl : msg.fileUrl.replace('/upload/', '/upload/fl_attachment/')} download className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${isMe ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-accent-primary hover:bg-accent-hover text-white'}`}>
                              <Download className="h-3.5 w-3.5" />
                              Download
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm">{msg.content}</p>
                  )}
                </div>
              </div>
            );
          })
        )}
        
        {isTyping && (
          <div className="flex items-end gap-2 justify-start">
            <UserCircle className="h-6 w-6 text-muted-foreground/50 mb-1" />
            <div className="px-4 py-3 rounded-2xl bg-secondary border border-border text-foreground rounded-bl-sm flex gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t border-border bg-background">
        <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
          <input 
            type="file" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept="image/*,.pdf,.doc,.docx"
          />
          <button 
            type="button" 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors flex-shrink-0"
          >
            {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Paperclip className="h-5 w-5" />}
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              handleTyping();
            }}
            placeholder="Type a message..."
            className="flex-1 bg-card border border-border rounded-lg px-4 py-2 text-sm input-focus placeholder:text-muted-foreground/50"
          />
          <button 
            type="submit"
            disabled={!input.trim()}
            className="bg-accent-primary hover:bg-accent-hover text-white p-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
