"use client";

import React, { useState, useRef } from 'react';
import { X } from 'lucide-react';

import { toast } from 'sonner';
import { uploadPortfolioImage } from '../../app/actions/profile';

export function PortfolioGallery({ initialItems = [] }: { initialItems?: any[] }) {
  const [items, setItems] = useState(initialItems);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingImageUrl, setPendingImageUrl] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newTech, setNewTech] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setPendingImageUrl(imageUrl);
      setNewTitle('');
      setNewTech('');
      setIsModalOpen(true);
      
      // Reset input so they can upload the same file again if they cancel
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSaveUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const file = fileInputRef.current?.files?.[0];
    if (!file || !pendingImageUrl || !newTitle.trim()) return;

    const tempItem = {
      id: Date.now(),
      title: newTitle.trim(),
      tech: newTech.trim(),
      image: pendingImageUrl
    };

    setItems([tempItem, ...items]);
    setIsModalOpen(false);
    setPendingImageUrl(null);
    toast.info('Uploading portfolio image...');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', tempItem.title);
      formData.append('tech', tempItem.tech);
      
      const realItem = await uploadPortfolioImage(formData);
      setItems(prev => prev.map(item => item.id === tempItem.id ? realItem : item));
      toast.success('Portfolio updated successfully!');
    } catch (err) {
      toast.error('Failed to upload portfolio item');
      setItems(prev => prev.filter(item => item.id !== tempItem.id));
    }
  };

  return (
    <>
    <div className="bg-surface border border-border rounded-[2rem] p-8 h-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col relative overflow-hidden group">
      <div className="flex justify-between items-center mb-6 z-10 relative">
        <div>
          <h3 className="text-xl font-bold text-foreground">Featured Portfolio</h3>
          <p className="text-sm text-text-secondary mt-1">Showcasing recent projects and case studies</p>
        </div>
        <input 
          type="file" 
          accept="image/*" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
        />
        <button 
          onClick={handleUploadClick}
          className="text-sm font-semibold text-accent-primary hover:text-accent-secondary bg-accent-primary/10 hover:bg-accent-primary/20 px-5 py-2.5 rounded-xl transition-all"
        >
          Upload New
        </button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 h-full min-h-[350px] auto-rows-[170px]">
        {items.slice(0, 3).map((item, index) => {
          // Make the very first item (index 0) large, the next two small, and any others normal
          const isMain = index === 0;
          return (
            <div 
              key={item.id} 
              className={`rounded-2xl overflow-hidden relative group/item cursor-pointer border border-border/50 ${isMain ? 'sm:col-span-1 sm:row-span-2 h-full min-h-[350px]' : 'h-full'}`}
            >
              <img 
                src={item.image} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover/item:scale-110" 
                alt={item.title} 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover/item:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
                <span className={`text-white font-bold translate-y-2 group-hover/item:translate-y-0 transition-transform ${isMain ? 'text-xl' : ''}`}>
                  {item.title}
                </span>
                {item.tech && (
                  <span className="text-white/80 text-sm font-medium mt-1 translate-y-4 opacity-0 group-hover/item:translate-y-0 group-hover/item:opacity-100 transition-all duration-300 delay-75">
                    {item.tech}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>

    {/* Upload Details Modal */}
    {isModalOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-surface border border-border w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-primary to-accent-secondary"></div>
          
          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-foreground">Project Details</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-text-secondary hover:text-foreground hover:bg-surface-hover rounded-xl transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {pendingImageUrl && (
              <div className="w-full h-32 rounded-xl overflow-hidden mb-6 border border-border">
                <img src={pendingImageUrl} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}

            <form onSubmit={handleSaveUpload} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Project Title</label>
                <input 
                  type="text" 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., E-Commerce App"
                  required
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary/50 transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Tech Stack</label>
                <input 
                  type="text" 
                  value={newTech}
                  onChange={(e) => setNewTech(e.target.value)}
                  placeholder="e.g., Next.js & Tailwind"
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary/50 transition-all"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl font-semibold text-text-secondary hover:text-foreground hover:bg-surface-hover transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={!newTitle.trim()}
                  className="px-6 py-2.5 bg-accent-primary hover:bg-accent-secondary disabled:opacity-50 disabled:hover:bg-accent-primary text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
                >
                  Publish
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    )}
  </>
  );
}
