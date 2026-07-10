"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Calendar, Filter } from "lucide-react";

export function ReportFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [from, setFrom] = useState(searchParams.get("from") || "");
  const [to, setTo] = useState(searchParams.get("to") || "");

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    if (from && to) {
      router.push(`/dashboard/reports?from=${from}&to=${to}`);
    } else {
      router.push(`/dashboard/reports`);
    }
  };

  return (
    <form onSubmit={handleFilter} className="bg-white border border-border rounded-2xl p-4 flex flex-col md:flex-row items-end gap-4 shadow-sm">
      <div className="flex-1 w-full">
        <label className="text-[10px] text-ink-mute uppercase font-bold tracking-wider mb-1 block pl-1">Start Date</label>
        <div className="relative">
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="bg-white border border-border p-3 rounded-xl w-full text-sm focus:border-terracotta outline-none text-ink-dim relative [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer z-10 bg-transparent transition-colors"
          />
          <Calendar className="absolute right-3 top-3 text-terracotta pointer-events-none z-0" size={18} />
        </div>
      </div>

      <div className="flex-1 w-full">
        <label className="text-[10px] text-ink-mute uppercase font-bold tracking-wider mb-1 block pl-1">End Date</label>
        <div className="relative">
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="bg-white border border-border p-3 rounded-xl w-full text-sm focus:border-terracotta outline-none text-ink-dim relative [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer z-10 bg-transparent transition-colors"
          />
          <Calendar className="absolute right-3 top-3 text-terracotta pointer-events-none z-0" size={18} />
        </div>
      </div>

      <button
        type="submit"
        className="w-full md:w-auto bg-terracotta hover:bg-terracotta-hover text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md shadow-terracotta/20 active:scale-95 flex items-center justify-center gap-2"
      >
        <Filter size={18} />
        Generate
      </button>
    </form>
  );
}