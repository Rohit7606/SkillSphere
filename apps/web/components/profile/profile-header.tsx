"use client";

import React, { useState } from 'react';
import { UserCircle2, MapPin, ShieldCheck, Mail, Calendar, Edit3, Image as ImageIcon, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { updateProfile, uploadAvatar } from '../../app/actions/profile';

interface ProfileHeaderProps {
  user: {
    email: string;
    createdAt: Date;
    avatarUrl?: string | null;
    name?: string | null;
  };
  freelancer: {
    bio: string | null;
    hourlyRate: number | null;
    location: string | null;
    reputationScore: number | null;
  };
}

export function ProfileHeader({ user, freelancer }: ProfileHeaderProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  
  // Avatar State
  const [avatarImage, setAvatarImage] = useState<string | null>(null);
  const [avatarScale, setAvatarScale] = useState(1);
  const [avatarPos, setAvatarPos] = useState({ x: 0, y: 0 });
  
  // Crop Modal State
  const [pendingAvatar, setPendingAvatar] = useState<string | null>(null);
  const [tempScale, setTempScale] = useState(1);
  const [tempPos, setTempPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const coverInputRef = React.useRef<HTMLInputElement>(null);
  const avatarInputRef = React.useRef<HTMLInputElement>(null);

  // Clean up ugly generated Clerk emails for demo purposes
  const rawName = user.email.split('@')[0];
  const initialDisplayName = user.name || (rawName.startsWith('user_') ? 'SkillSphere Pro' : rawName);
  const displayEmail = user.email.startsWith('user_') ? 'hello@skillsphere.pro' : user.email;

  // Optimistic UI State
  const [localDisplayName, setLocalDisplayName] = useState(initialDisplayName);
  const [localBio, setLocalBio] = useState(freelancer.bio);
  const [localLocation, setLocalLocation] = useState(freelancer.location);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const bio = formData.get('bio') as string || null;
    const location = formData.get('location') as string || null;
    const hourlyRate = Number(formData.get('hourlyRate')) || 0;
    
    const displayName = formData.get('displayName') as string || localDisplayName;
    setLocalDisplayName(displayName);
    setLocalBio(bio);
    setLocalLocation(location);
    
    // Dispatch event for other components (like PricingCard) to pick up the change
    window.dispatchEvent(new CustomEvent('profileUpdated', { detail: { hourlyRate } }));
    setIsEditModalOpen(false);

    try {
      await updateProfile({ bio, location, hourlyRate, displayName });
      toast.success('Profile updated successfully!');
    } catch(err) {
      toast.error('Failed to save to database');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'cover' | 'avatar') => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      if (type === 'cover') {
        setCoverImage(url);
        toast.success('Cover photo updated!');
      } else {
        setPendingAvatar(url);
        setTempScale(1);
        setTempPos({ x: 0, y: 0 });
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - tempPos.x, y: e.clientY - tempPos.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setTempPos({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const confirmAvatar = async () => {
    const file = avatarInputRef.current?.files?.[0];
    if (!file) return;

    setAvatarImage(pendingAvatar);
    setAvatarScale(tempScale);
    setAvatarPos(tempPos);
    setPendingAvatar(null);
    toast.info('Uploading avatar...');

    try {
      const formData = new FormData();
      formData.append('file', file);
      await uploadAvatar(formData);
      toast.success('Profile picture saved successfully!');
    } catch (err) {
      toast.error('Failed to upload picture');
    }
  };

  return (
    <>
      <div className="bg-surface border border-border rounded-xl overflow-hidden relative">
        {/* Cover Photo Area */}
        <div 
          className="h-40 relative bg-gradient-to-r from-accent-primary to-accent-hover"
          style={coverImage ? { backgroundImage: `url(${coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
        >
          <input 
            type="file" 
            accept="image/*" 
            ref={coverInputRef} 
            onChange={(e) => handleImageUpload(e, 'cover')} 
            className="hidden" 
          />
          <button 
            onClick={() => coverInputRef.current?.click()}
            className="absolute top-4 right-4 bg-background/20 hover:bg-background/40 backdrop-blur-md text-white px-4 py-2 rounded-full transition-all shadow-sm flex items-center gap-2 border border-white/20"
          >
            <ImageIcon className="h-4 w-4" />
            <span className="text-xs font-semibold">Change Cover</span>
          </button>
        </div>

        <div className="px-6 sm:px-8 pb-8 relative">
          {/* Avatar */}
          <div className="-mt-16 mb-4 relative inline-block group">
            <div className="border-4 border-surface bg-background h-32 w-32 rounded-full flex items-center justify-center overflow-hidden shadow-md relative group-hover:border-accent-primary/20 transition-colors">
              {avatarImage || user.avatarUrl ? (
                <img 
                  src={avatarImage || user.avatarUrl} 
                  alt="Profile" 
                  className="w-full h-full max-w-none origin-center" 
                  style={{ 
                    transform: avatarImage ? `translate(${avatarPos.x}px, ${avatarPos.y}px) scale(${avatarScale})` : undefined,
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain'
                  }} 
                />
              ) : (
                <UserCircle2 className="h-20 w-20 text-text-secondary" />
              )}
            </div>
            
            <input 
              type="file" 
              accept="image/*" 
              ref={avatarInputRef} 
              onChange={(e) => handleImageUpload(e, 'avatar')} 
              className="hidden" 
            />
            <button 
              onClick={() => avatarInputRef.current?.click()}
              className="absolute bottom-1 right-1 bg-accent-primary hover:bg-accent-secondary text-white p-3 rounded-full shadow-lg transition-transform hover:scale-105 border-2 border-surface flex items-center justify-center"
            >
              <ImageIcon className="h-4 w-4" />
            </button>
          </div>

          {/* Profile Info */}
          <div className="space-y-4">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-foreground truncate max-w-sm sm:max-w-md">
                    {localDisplayName}
                  </h1>
              {freelancer.reputationScore !== null && freelancer.reputationScore >= 80 && (
                <div className="flex items-center gap-1 bg-success/10 text-success px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border border-success/20">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Top Rated
                </div>
              )}
              </div>
                
                <button 
                  onClick={() => setIsEditModalOpen(true)}
                  className="flex items-center justify-center gap-2 bg-accent-primary hover:bg-accent-secondary text-white px-4 py-2 rounded-xl transition-all duration-300 text-sm font-semibold shadow-[0_4px_14px_0_rgb(139,108,239,0.39)] hover:shadow-[0_6px_20px_rgba(139,108,239,0.23)] hover:-translate-y-0.5"
                >
                  <Edit3 className="h-4 w-4" />
                  Edit Profile
                </button>
              </div>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary mt-3">
                <div className="flex items-center gap-1.5">
                  <Mail className="h-4 w-4" />
                  {displayEmail}
                </div>
              {localLocation && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {localLocation}
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                Joined {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <h3 className="text-sm font-semibold text-foreground mb-2">About</h3>
            <p className="text-text-secondary text-sm leading-relaxed max-w-3xl">
              {localBio || "This freelancer hasn't added a bio yet. When they do, it will appear here."}
            </p>
          </div>
        </div>
      </div>
    </div>

    {/* Edit Profile Modal */}
    {isEditModalOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-surface border border-border w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-primary to-accent-secondary"></div>
          
          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-foreground">Edit Profile</h2>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 text-text-secondary hover:text-foreground hover:bg-surface-hover rounded-xl transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Display Name</label>
                <input 
                  type="text" 
                  name="displayName"
                  defaultValue={localDisplayName}
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary/50 transition-all !bg-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Professional Bio</label>
                <textarea 
                  name="bio"
                  defaultValue={localBio || ""}
                  rows={4}
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary/50 transition-all resize-none !bg-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Location</label>
                  <input 
                    type="text" 
                    name="location"
                    defaultValue={localLocation || ""}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary/50 transition-all !bg-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Hourly Rate (₹)</label>
                  <input 
                    type="number" 
                    name="hourlyRate"
                    defaultValue={freelancer.hourlyRate || 0}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary/50 transition-all !bg-transparent"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl font-semibold text-text-secondary hover:text-foreground hover:bg-surface-hover transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2.5 bg-accent-primary hover:bg-accent-secondary text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    )}

    {/* Adjust Avatar Modal */}
    {pendingAvatar && (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/90 backdrop-blur-sm animate-in fade-in duration-200"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div className="bg-surface border border-border w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-primary to-accent-secondary"></div>
          
          <div className="p-8">
            <h2 className="text-xl font-bold text-foreground text-center mb-6">Adjust Profile Picture</h2>
            
            <div className="flex justify-center mb-8">
              <div 
                className="h-48 w-48 rounded-full border-2 border-dashed border-accent-primary overflow-hidden relative cursor-move bg-background shadow-inner"
                onMouseDown={handleMouseDown}
              >
                <img 
                  src={pendingAvatar} 
                  alt="Crop Preview" 
                  className="w-full h-full max-w-none origin-center pointer-events-none select-none"
                  style={{ 
                    transform: `translate(${tempPos.x}px, ${tempPos.y}px) scale(${tempScale})`,
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain'
                  }} 
                />
                
                {/* Crosshair Overlay to help center */}
                <div className="absolute inset-0 pointer-events-none opacity-20 flex items-center justify-center">
                  <div className="w-full h-[1px] bg-white absolute"></div>
                  <div className="h-full w-[1px] bg-white absolute"></div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-xs text-text-secondary font-medium mb-2">
                  <span>Zoom Out</span>
                  <span>Zoom In</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="3" 
                  step="0.05" 
                  value={tempScale}
                  onChange={(e) => setTempScale(parseFloat(e.target.value))}
                  className="w-full accent-accent-primary h-1.5 bg-border rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button 
                  onClick={() => setPendingAvatar(null)}
                  className="px-5 py-2.5 rounded-xl font-semibold text-text-secondary hover:text-foreground hover:bg-surface-hover transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmAvatar}
                  className="px-6 py-2.5 bg-accent-primary hover:bg-accent-secondary text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
                >
                  Apply Picture
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}
  </>
  );
}
