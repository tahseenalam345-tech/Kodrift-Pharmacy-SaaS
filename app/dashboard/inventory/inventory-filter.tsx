"use client";

import { Filter, Check } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useTransition, useRef, useEffect } from "react";

const CATEGORIES = ["Tablet", "Syrup", "Injection", "Capsule", "Drops", "Sachet", "Surgicals", "Cream", "Cosmetics", "Other"];

export function InventoryFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentCategory = searchParams.get("category") || "All";
  const currentStock = searchParams.get("stock") || "All";

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const updateFilter = (type: "category" | "stock", value: string) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams);
      if (value === "All") {
        params.delete(type);
      } else {
        params.set(type, value);
      }
      router.replace(`${pathname}?${params.toString()}`);
    });
    // YEH LINE ADD KI HAI: Taa ke list select hote hi menu band ho jaye
    setIsOpen(false);
  };

  const clearAllFilters = () => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams);
      params.delete("category");
      params.delete("stock");
      router.replace(`${pathname}?${params.toString()}`);
      setIsOpen(false);
    });
  };

  const hasActiveFilters = currentCategory !== "All" || currentStock !== "All";

  return (
    <div className="relative" ref={dropdownRef}>
      {/* FILTER BUTTON */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-xl transition-colors flex items-center gap-2 relative ${
          hasActiveFilters || isOpen 
            ? 'bg-teal-soft border border-teal text-teal' 
            : 'bg-white border border-border text-ink-dim hover:text-teal hover:border-teal'
        } ${isPending ? 'opacity-50' : ''}`}
      >
        <Filter size={20} />
        {hasActiveFilters && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-terracotta rounded-full border-2 border-white"></span>
        )}
      </button>

      {/* DROPDOWN MENU */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-border rounded-2xl shadow-lg z-50 overflow-hidden animate-rise">
          
          <div className="flex justify-between items-center p-3 border-b border-border bg-cream/50">
            <h3 className="text-sm font-bold text-ink flex items-center gap-2">
              <Filter size={14} className="text-teal" /> Filters
            </h3>
            {hasActiveFilters && (
              <button onClick={clearAllFilters} className="text-[10px] font-bold text-terracotta hover:underline">
                Clear All
              </button>
            )}
          </div>

          <div className="p-3 max-h-[60vh] overflow-y-auto custom-scrollbar">
            {/* STOCK STATUS FILTER */}
            <div className="mb-4">
              <p className="text-[10px] font-bold text-ink-mute uppercase tracking-wider mb-2">Stock Level</p>
              <div className="space-y-1">
                {['All', 'Low Stock', 'Out of Stock'].map((status) => {
                  const filterValue = status === 'Low Stock' ? 'low' : status === 'Out of Stock' ? 'out' : 'All';
                  const isActive = currentStock === filterValue;
                  return (
                    <button
                      key={status}
                      onClick={() => updateFilter('stock', filterValue)}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium flex justify-between items-center transition-colors ${
                        isActive ? 'bg-teal/10 text-teal' : 'text-ink hover:bg-cream'
                      }`}
                    >
                      {status}
                      {isActive && <Check size={14} className="text-teal" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CATEGORY FILTER */}
            <div>
              <p className="text-[10px] font-bold text-ink-mute uppercase tracking-wider mb-2">Category</p>
              <div className="space-y-1">
                <button
                  onClick={() => updateFilter('category', 'All')}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium flex justify-between items-center transition-colors ${
                    currentCategory === 'All' ? 'bg-teal/10 text-teal' : 'text-ink hover:bg-cream'
                  }`}
                >
                  All Categories
                  {currentCategory === 'All' && <Check size={14} className="text-teal" />}
                </button>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => updateFilter('category', cat)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium flex justify-between items-center transition-colors ${
                      currentCategory === cat ? 'bg-teal/10 text-teal' : 'text-ink hover:bg-cream'
                    }`}
                  >
                    {cat}
                    {currentCategory === cat && <Check size={14} className="text-teal" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}