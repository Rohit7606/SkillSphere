"use client";

import React, { useState } from 'react';
import { UserProfile } from '@clerk/nextjs';
import { Settings, Bell, Shield, Paintbrush, CreditCard } from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'preferences' | 'notifications' | 'billing' | 'security'>('preferences');

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-accent-primary via-[#7256D6] to-foreground p-10 shadow-2xl group border border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[50%] -right-[10%] w-[70%] h-[150%] bg-white/10 blur-[100px] rounded-full rotate-12 group-hover:rotate-45 transition-transform duration-1000"></div>
          <div className="absolute -bottom-[50%] -left-[10%] w-[50%] h-[150%] bg-black/20 blur-[120px] rounded-full"></div>
        </div>
        
        <div className="absolute -right-12 -bottom-12 opacity-10 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-1000 pointer-events-none">
          <Settings className="w-96 h-96 text-white" />
        </div>
        
        <div className="relative z-10 w-full">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight flex items-center gap-4 text-white drop-shadow-md">
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-inner">
              <Settings className="h-8 w-8 text-white" />
            </div>
            Platform Settings
          </h1>
          <p className="text-white/80 mt-4 max-w-xl text-lg font-medium leading-relaxed">
            Manage your workspace preferences, notifications, billing, and security.
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Settings Navigation Sidebar */}
        <div className="w-full lg:w-64 shrink-0 flex flex-col gap-2">
          <button 
            onClick={() => setActiveTab('preferences')}
            className={`flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-bold transition-all ${activeTab === 'preferences' ? 'bg-accent-primary text-white shadow-md' : 'bg-surface hover:bg-surface-hover text-text-secondary border border-border shadow-sm'}`}
          >
            <Paintbrush className="h-5 w-5" /> Appearance
          </button>
          
          <button 
            onClick={() => setActiveTab('notifications')}
            className={`flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-bold transition-all ${activeTab === 'notifications' ? 'bg-accent-primary text-white shadow-md' : 'bg-surface hover:bg-surface-hover text-text-secondary border border-border shadow-sm'}`}
          >
            <Bell className="h-5 w-5" /> Notifications
          </button>
          
          <button 
            onClick={() => setActiveTab('billing')}
            className={`flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-bold transition-all ${activeTab === 'billing' ? 'bg-accent-primary text-white shadow-md' : 'bg-surface hover:bg-surface-hover text-text-secondary border border-border shadow-sm'}`}
          >
            <CreditCard className="h-5 w-5" /> Billing & Payouts
          </button>

          <div className="h-px bg-border my-2 mx-4"></div>

          <button 
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-bold transition-all ${activeTab === 'security' ? 'bg-foreground text-background shadow-md' : 'bg-surface hover:bg-surface-hover text-text-secondary border border-border shadow-sm'}`}
          >
            <Shield className="h-5 w-5" /> Account Security
          </button>
        </div>

        {/* Settings Content Area */}
        <div className="flex-1 w-full min-h-[500px]">
          {activeTab === 'preferences' && (
            <div className="bg-surface border border-border rounded-[2rem] p-8 md:p-10 shadow-sm animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-2xl font-bold text-foreground mb-6">Appearance & Theme</h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-5 bg-background border border-border rounded-2xl">
                  <div>
                    <h3 className="font-bold text-foreground">Dark Mode</h3>
                    <p className="text-sm text-text-secondary">Switch between light and dark themes.</p>
                  </div>
                  <div className="px-4 py-2 bg-accent-primary/10 text-accent-primary font-bold rounded-xl text-sm border border-accent-primary/20 cursor-pointer">
                    Enabled
                  </div>
                </div>
                <div className="flex items-center justify-between p-5 bg-background border border-border rounded-2xl">
                  <div>
                    <h3 className="font-bold text-foreground">Compact UI</h3>
                    <p className="text-sm text-text-secondary">Reduce padding to fit more data on screen.</p>
                  </div>
                  <div className="px-4 py-2 bg-surface-hover text-text-disabled font-bold rounded-xl text-sm border border-border cursor-not-allowed">
                    Coming Soon
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-surface border border-border rounded-[2rem] p-8 md:p-10 shadow-sm animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-2xl font-bold text-foreground mb-6">Notification Preferences</h2>
              <div className="space-y-4">
                {['New Proposal Received', 'Message from Client', 'Milestone Approved', 'Marketing & Tips'].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-5 bg-background border border-border rounded-2xl">
                    <div>
                      <h3 className="font-bold text-foreground">{item}</h3>
                      <p className="text-sm text-text-secondary">Push and email alerts</p>
                    </div>
                    <div className={`px-4 py-2 font-bold rounded-xl text-sm border cursor-pointer transition-colors ${i === 3 ? 'bg-surface-hover text-text-secondary border-border' : 'bg-success/10 text-success border-success/20'}`}>
                      {i === 3 ? 'Off' : 'On'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="bg-surface border border-border rounded-[2rem] p-8 md:p-10 shadow-sm animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-2xl font-bold text-foreground mb-6">Billing & Payouts</h2>
              <div className="p-8 border border-dashed border-border rounded-2xl flex flex-col items-center justify-center text-center bg-background">
                <CreditCard className="h-12 w-12 text-text-disabled mb-4" />
                <h3 className="text-lg font-bold text-foreground">Connect Payment Gateway</h3>
                <p className="text-text-secondary mt-2 max-w-md">You need to link your Razorpay or Stripe account to receive milestone payouts.</p>
                <button className="mt-6 px-6 py-3 bg-accent-primary hover:bg-accent-secondary text-white font-bold rounded-xl shadow-sm transition-all">
                  Connect Stripe
                </button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300 bg-surface border border-border rounded-[2rem] overflow-hidden shadow-sm p-4">
              <div className="w-full flex justify-center">
                <UserProfile 
                  routing="hash"
                  appearance={{
                    elements: {
                      rootBox: "w-full flex justify-center",
                      cardBox: "w-full max-w-3xl shadow-none border-none bg-transparent",
                      card: "w-full shadow-none rounded-none bg-transparent",
                      navbar: "border-r border-border hidden md:block",
                      headerTitle: "text-foreground font-bold",
                      headerSubtitle: "text-text-secondary",
                      profileSectionTitleText: "text-foreground",
                      profileSectionPrimaryButton: "text-accent-primary hover:bg-accent-primary/10",
                      badge: "bg-accent-primary/10 text-accent-primary border-accent-primary/20",
                      formButtonPrimary: "bg-accent-primary hover:bg-accent-secondary text-white",
                    }
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
