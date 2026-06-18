"use client";

import React, { useState } from "react";

import { useForm as useRHForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Plus, Loader2 } from "lucide-react";
import { createGigAction } from "../../app/actions/gigs";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const gigSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  budget: z.coerce.number().min(5, "Budget must be at least ₹500"),
  location: z.string().min(2, "Location is required"),
});

export function CreateGigModal() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useRHForm<z.infer<typeof gigSchema>>({
    resolver: zodResolver(gigSchema) as any,
    defaultValues: {
      location: "Remote",
    }
  });

  const onSubmit = async (values: z.infer<typeof gigSchema>) => {
    const result = await createGigAction(values);
    
    if (result.success) {
      toast.success("Gig posted successfully!");
      queryClient.invalidateQueries({ queryKey: ['gigs'] }); // Trigger TanStack refresh
      reset();
      setOpen(false);
    } else {
      toast.error(result.error || "Failed to post gig.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white font-bold py-2.5 px-5 rounded-xl border border-white/20 transition-all backdrop-blur-sm shadow-sm cursor-pointer">
        <Plus className="h-4 w-4" />
        Post a Gig
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-card border-border text-foreground shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Post a New Gig</DialogTitle>
          <DialogDescription className="text-text-secondary">
            Describe the job, set a budget, and find the perfect freelancer.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Gig Title</label>
            <input 
              {...register("title")}
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm input-focus placeholder:text-text-disabled" 
              placeholder="e.g. Build a React Dashboard"
            />
            {errors.title && <p className="text-xs text-color-error">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <textarea 
              {...register("description")}
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm input-focus min-h-[100px] placeholder:text-text-disabled" 
              placeholder="Provide a detailed description of the project requirements..."
            />
            {errors.description && <p className="text-xs text-color-error">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Budget (INR)</label>
              <input 
                type="number"
                {...register("budget")}
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm input-focus placeholder:text-text-disabled" 
                placeholder="1000"
              />
              {errors.budget && <p className="text-xs text-color-error">{errors.budget.message}</p>}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Location</label>
              <input 
                {...register("location")}
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm input-focus placeholder:text-text-disabled" 
                placeholder="Remote, NYC, etc."
              />
              {errors.location && <p className="text-xs text-color-error">{errors.location.message}</p>}
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-border mt-6">
            <button 
              type="button" 
              onClick={() => setOpen(false)}
              className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-accent-primary text-white text-sm font-semibold py-2 px-6 rounded-md btn-hover disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {isSubmitting ? "Posting..." : "Post Gig"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
