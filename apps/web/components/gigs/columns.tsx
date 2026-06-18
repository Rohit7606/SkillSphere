"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, ArrowUpDown, ExternalLink, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { deleteGigAction } from "../../app/actions/gigs";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const GigActions = ({ id }: { id: string }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this gig?")) return;
    setIsDeleting(true);
    const result = await deleteGigAction(id);
    setIsDeleting(false);
    if (result.success) {
      toast.success("Gig deleted successfully");
      queryClient.invalidateQueries({ queryKey: ['gigs'] });
    } else {
      toast.error(result.error || "Failed to delete gig");
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={isDeleting}
      className="p-2 hover:bg-color-error/10 rounded-md transition-colors text-text-secondary hover:text-color-error disabled:opacity-50"
      title="Delete Gig"
    >
      {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </button>
  );
};

export type Gig = {
  id: string;
  title: string;
  budget: number;
  status: string;
  location: string | null;
};

export const columns: ColumnDef<Gig>[] = [
  {
    accessorKey: "title",
    header: "Gig Title",
    cell: ({ row }) => {
      const id = row.original.id;
      return (
        <Link href={`/dashboard/gigs/${id}`} className="font-medium text-accent-primary hover:underline flex items-center gap-2">
          {row.getValue("title")}
          <ExternalLink className="h-3 w-3" />
        </Link>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold
          ${status === 'open' ? 'bg-color-success/10 text-color-success' : 
            status === 'in_progress' ? 'bg-color-info/10 text-color-info' : 
            status === 'completed' ? 'bg-text-secondary/10 text-text-secondary' : 
            'bg-surface-hover text-foreground'}`}>
          {status.replace('_', ' ').toUpperCase()}
        </div>
      );
    }
  },
  {
    accessorKey: "budget",
    header: ({ column }) => {
      return (
        <button
          className="flex items-center gap-1 hover:text-foreground transition-colors"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Budget
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </button>
      )
    },
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("budget"));
      const formatted = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(amount);
      return <div className="font-mono">{formatted}</div>;
    },
  },
  {
    accessorKey: "location",
    header: "Location",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return <GigActions id={row.original.id} />
    },
  },
];
