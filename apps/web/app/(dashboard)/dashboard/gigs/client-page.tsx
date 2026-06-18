"use client";

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getGigs } from '../../../../lib/queries/gigs';
import { columns } from '../../../../components/gigs/columns';
import { DataTable } from '../../../../components/gigs/data-table';
import { CreateGigModal } from '../../../../components/gigs/create-gig-modal';
import { Briefcase } from 'lucide-react';

export function GigsClientPage({ isClientRole }: { isClientRole: boolean }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['gigs'],
    queryFn: getGigs,
  });

  return (
    <div className="space-y-6">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-accent-primary via-[#7256D6] to-foreground p-10 shadow-2xl group border border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
        {/* Animated Background Mesh/Gradients */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[50%] -right-[10%] w-[70%] h-[150%] bg-white/10 blur-[100px] rounded-full rotate-12 group-hover:rotate-45 transition-transform duration-1000"></div>
          <div className="absolute -bottom-[50%] -left-[10%] w-[50%] h-[150%] bg-black/20 blur-[120px] rounded-full"></div>
        </div>

        <div className="absolute -right-12 -bottom-12 opacity-10 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-1000 pointer-events-none">
          <Briefcase className="w-96 h-96 text-white" />
        </div>

        <div className="relative z-10 w-full md:w-auto">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight flex items-center gap-4 text-white drop-shadow-md">
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-inner">
              <Briefcase className="h-8 w-8 text-white" />
            </div>
            Gigs
          </h1>
          <p className="text-white/80 mt-4 max-w-xl text-lg font-medium leading-relaxed">
            Manage your active, pending, and completed gigs elegantly.
          </p>
        </div>
        {isClientRole && (
          <div className="relative z-10 w-full md:w-auto flex justify-end">
            <CreateGigModal />
          </div>
        )}
      </div>

      <div className="min-h-[400px]">
        {isLoading ? (
          <div className="space-y-4">
            <div className="h-12 skeleton-loader rounded-lg border border-border"></div>
            <div className="h-64 skeleton-loader rounded-xl border border-border"></div>
          </div>
        ) : isError ? (
          <div className="bg-color-error/10 border border-color-error rounded-xl p-8 text-center">
            <p className="text-color-error font-medium">Failed to load gigs. Please try again.</p>
          </div>
        ) : (
          <DataTable columns={columns} data={data || []} />
        )}
      </div>
    </div>
  );
}
