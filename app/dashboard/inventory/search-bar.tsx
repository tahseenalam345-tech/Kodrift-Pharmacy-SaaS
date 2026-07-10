"use client";

import { Search } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransition, useState } from "react";

export function InventorySearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("query")?.toString() || "");

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    
    // URL update karega taake server new data laye (jaise ?query=panadol)
    startTransition(() => {
      const params = new URLSearchParams(searchParams);
      if (term) {
        params.set("query", term);
      } else {
        params.delete("query");
      }
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div className="relative flex-1 md:w-64">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className={`text-ink-mute transition-opacity ${isPending ? 'opacity-50 animate-pulse' : ''}`} size={16} />
      </div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search medicine or brand..."
        className="w-full bg-white border border-border text-ink placeholder-ink-mute rounded-xl py-2 pl-10 pr-4 focus:outline-none focus:border-terracotta transition-colors text-sm"
      />
    </div>
  );
}