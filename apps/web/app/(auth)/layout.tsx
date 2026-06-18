import React from 'react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Subtle Background Glow for Glassmorphism Context */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-secondary/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-md">
        {/* We use Glassmorphism for Landing/Auth cards as allowed in AGENTS.md */}
        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl shadow-2xl p-8">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-foreground">SkillSphere</h1>
            <p className="text-text-secondary mt-2 text-sm">Sign in to your account</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
