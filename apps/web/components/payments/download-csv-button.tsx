"use client";

import React from "react";
import { Download } from "lucide-react";

export function DownloadCsvButton({ data }: { data: any[] }) {
  const handleDownload = () => {
    if (!data || data.length === 0) return;

    // Extract headers based on the first object's keys, or specify manually
    const headers = ["Txn ID", "Title", "Amount", "Status", "Type", "Date"];

    const rows = data.map((payment) => {
      return [
        payment.id,
        `"${(payment.gigTitle || "Milestone Payment").replace(/"/g, '""')}"`,
        payment.amount,
        payment.status,
        payment.type || "credit",
        new Date(payment.date || payment.createdAt).toLocaleDateString(),
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `transactions_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <button 
      onClick={handleDownload}
      className="flex items-center gap-2 bg-accent-primary hover:bg-accent-secondary text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-sm group"
    >
      <Download className="h-4 w-4 group-hover:-translate-y-0.5 transition-transform" />
      Download CSV
    </button>
  );
}
