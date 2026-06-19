"use client";

import React, { useState, useRef } from 'react';
import { X, Briefcase, Plus, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { uploadPortfolioImage } from '../../app/actions/profile';
import { motion, AnimatePresence } from 'framer-motion';

export function PortfolioGallery({ initialItems = [] }: { initialItems?: any[] }) {
  const [items, setItems] = useState(initialItems);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingImageUrl, setPendingImageUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newTech, setNewTech] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setPendingImageUrl(imageUrl);
      setSelectedFile(file);
      setNewTitle('');
      setNewTech('');
      setIsModalOpen(true);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSaveUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Fallback if hot-reload wiped the selectedFile but preserved the blob URL
    let fileToUpload = selectedFile;
    if (!fileToUpload && pendingImageUrl) {
      try {
        const res = await fetch(pendingImageUrl);
        const blob = await res.blob();
        fileToUpload = new File([blob], "upload.jpg", { type: blob.type });
      } catch (err) {
        console.error("Could not recover file from blob url", err);
      }
    }

    if (!fileToUpload || !pendingImageUrl || !newTitle.trim()) return;

    setIsUploading(true);

    const tempItem = {
      id: Date.now(),
      title: newTitle.trim(),
      tech: newTech.trim(),
      image: pendingImageUrl
    };

    setItems([tempItem, ...items]);
    setIsModalOpen(false);
    toast.info('Uploading portfolio image...');

    try {
      const formData = new FormData();
      formData.append('file', fileToUpload);
      formData.append('title', tempItem.title);
      formData.append('tech', tempItem.tech);
      
      const realItem = await uploadPortfolioImage(formData);
      setItems(prev => prev.map(item => item.id === tempItem.id ? realItem : item));
      toast.success('Portfolio updated successfully!');
    } catch (err) {
      toast.error('Failed to upload portfolio item');
      setItems(prev => prev.filter(item => item.id !== tempItem.id));
    } finally {
      setIsUploading(false);
      setPendingImageUrl(null);
      setSelectedFile(null);
    }
  };

  return (
    <>
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/60 backdrop-blur-lg border border-white/40 rounded-3xl p-6 shadow-lg h-full flex flex-col relative overflow-hidden"
    >
      <div className="flex justify-between items-center mb-6 z-10 relative">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-accent-primary" />
          Featured Work
        </h2>
        <input 
          type="file" 
          accept="image/*" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
        />
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleUploadClick}
          className="flex items-center gap-1.5 text-sm font-semibold text-accent-primary bg-accent-primary/10 hover:bg-accent-primary/20 px-4 py-2 rounded-xl transition-all"
        >
          <Plus className="h-4 w-4" /> Upload
        </motion.button>
      </div>
      
      {items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 auto-rows-[180px]">
          {items.slice(0, 4).map((item, idx) => {
            const isOnly = items.length === 1;
            const isMain = idx === 0 && items.length >= 3;
            return (
              <motion.div 
                layoutId={`portfolio-${item.id}`}
                key={item.id} 
                whileHover={{ scale: 1.02 }}
                className={`relative rounded-2xl overflow-hidden group cursor-pointer border border-slate-200/50 shadow-sm ${isOnly ? 'sm:col-span-2 aspect-video' : isMain ? 'sm:col-span-1 sm:row-span-2 h-full' : 'h-full'}`}
              >
                <img 
                  src={item.image} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                  alt={item.title} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                  <span className="text-white font-bold tracking-wide">{item.title}</span>
                  {item.tech && <span className="text-slate-300 text-xs font-medium mt-1">{item.tech}</span>}
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="flex-1 min-h-[200px] rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
          <ImageIcon className="h-10 w-10 mb-3 opacity-40 text-accent-primary" />
          <p className="text-sm font-medium">No projects uploaded yet</p>
          <p className="text-xs mt-1 opacity-70">Click upload to add your first case study</p>
        </div>
      )}
    </motion.div>

    <AnimatePresence>
      {isModalOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md"
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white/80 backdrop-blur-2xl border border-white/50 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative"
          >
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-accent-primary to-purple-500"></div>
            
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-extrabold text-slate-900">Project Details</h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100/50 rounded-full transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {pendingImageUrl && (
                <div className="w-full h-40 rounded-2xl overflow-hidden mb-6 border border-slate-200/50 shadow-inner relative group">
                  <img src={pendingImageUrl} alt="Preview" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-2xl"></div>
                </div>
              )}

              <form onSubmit={handleSaveUpload} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Project Title</label>
                  <input 
                    type="text" 
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g., E-Commerce App"
                    required
                    className="w-full bg-white/50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-primary/50 transition-all shadow-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Tech Stack</label>
                  <input 
                    type="text" 
                    value={newTech}
                    onChange={(e) => setNewTech(e.target.value)}
                    placeholder="e.g., Next.js & Tailwind"
                    className="w-full bg-white/50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-primary/50 transition-all shadow-sm"
                  />
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={!newTitle.trim() || isUploading}
                    className="px-6 py-2.5 bg-accent-primary hover:bg-accent-secondary disabled:opacity-50 disabled:hover:bg-accent-primary text-white rounded-xl font-bold shadow-md shadow-accent-primary/20 transition-all flex items-center justify-center min-w-[100px]"
                  >
                    {isUploading ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : (
                      "Publish"
                    )}
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}
