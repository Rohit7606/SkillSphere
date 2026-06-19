"use client";

import React, { useState, useCallback } from 'react';
import { Plus, X, BrainCircuit, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface SkillsSectionProps {
  skills: string[];
}

export function SkillsSection({ skills: initialSkills }: SkillsSectionProps) {
  const [skills, setSkills] = useState(initialSkills || []);
  const [newSkill, setNewSkill] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  React.useEffect(() => {
    setSkills(initialSkills || []);
  }, [initialSkills]);

  const saveSkills = useCallback(async (newSkills: string[]) => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skills: newSkills }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save skills');
      }
      console.log('[SkillsSection] Saved successfully:', data);
      toast.success("Skills updated!");
      router.refresh();
    } catch (err: any) {
      console.error('[SkillsSection] Save failed:', err);
      toast.error(err.message || "Failed to save skills.");
      setSkills(initialSkills || []); // Revert to server state
    } finally {
      setIsSaving(false);
    }
  }, [initialSkills, router]);

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newSkill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      const newSkills = [...skills, trimmed];
      setSkills(newSkills);
      setNewSkill("");
      saveSkills(newSkills);
    }
  };

  const removeSkill = (skillToRemove: string) => {
    const newSkills = skills.filter(s => s !== skillToRemove);
    setSkills(newSkills);
    saveSkills(newSkills);
  };

  return (
    <div className="bg-surface border border-border rounded-xl p-6 relative">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <BrainCircuit className="h-5 w-5 text-accent-primary" />
          Technical Skills
          {isSaving && <Loader2 className="h-4 w-4 animate-spin text-accent-primary ml-2" />}
        </h3>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {skills.map((skill) => (
          <div 
            key={skill}
            className={`flex items-center gap-1.5 px-3 py-1.5 bg-surface-hover border border-border rounded-full text-sm font-medium text-foreground transition-colors ${isSaving ? 'opacity-70 pointer-events-none' : 'hover:border-accent-primary/50 group'}`}
          >
            {skill}
            <button 
              onClick={() => removeSkill(skill)}
              disabled={isSaving}
              className="text-text-disabled hover:text-color-error transition-colors ml-1"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        {skills.length === 0 && (
          <p className="text-sm text-text-secondary italic">No skills added yet.</p>
        )}
      </div>

      <form onSubmit={handleAddSkill} className="flex gap-2">
        <input 
          type="text"
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          disabled={isSaving}
          placeholder="Add a new skill (e.g. React, Python)"
          className="flex-1 bg-surface-hover border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent-primary transition-colors disabled:opacity-50"
        />
        <button 
          type="submit"
          disabled={!newSkill.trim() || isSaving}
          className="bg-surface-hover border border-border text-foreground p-2 rounded-md hover:bg-border transition-colors disabled:opacity-50 flex items-center justify-center min-w-[36px]"
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-5 w-5" />}
        </button>
      </form>
    </div>
  );
}

