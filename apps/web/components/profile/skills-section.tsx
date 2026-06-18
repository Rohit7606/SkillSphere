"use client";

import React, { useState } from 'react';
import { Plus, X, BrainCircuit } from 'lucide-react';

interface SkillsSectionProps {
  skills: string[];
}

export function SkillsSection({ skills: initialSkills }: SkillsSectionProps) {
  const [skills, setSkills] = useState(initialSkills || []);
  const [newSkill, setNewSkill] = useState("");

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  return (
    <div className="bg-surface border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <BrainCircuit className="h-5 w-5 text-accent-primary" />
          Technical Skills
        </h3>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {skills.map((skill) => (
          <div 
            key={skill}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-hover border border-border rounded-full text-sm font-medium text-foreground transition-colors hover:border-accent-primary/50 group"
          >
            {skill}
            <button 
              onClick={() => removeSkill(skill)}
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
          placeholder="Add a new skill (e.g. React, Python)"
          className="flex-1 bg-surface-hover border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent-primary transition-colors"
        />
        <button 
          type="submit"
          disabled={!newSkill.trim()}
          className="bg-surface-hover border border-border text-foreground p-2 rounded-md hover:bg-border transition-colors disabled:opacity-50"
        >
          <Plus className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
}
