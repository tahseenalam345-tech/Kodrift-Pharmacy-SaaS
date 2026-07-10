import { createServer } from "@/lib/supabase/server";
import { Medicine } from "@/types";
import { Package, Plus } from "lucide-react";
import Link from "next/link";
import { InventorySearchBar } from "./search-bar";
import { InventoryFilter } from "./inventory-filter";
import { InventoryView } from "./inventory-view";
import { InventoryCSVManager } from "./inventory-actions"; // IMPORTED CSV MANAGER

export const dynamic = "force-dynamic";

export default async function InventoryPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ query?: string, category?: string, stock?: string }> 
}) {
  const supabase = await createServer();
  const params = await searchParams;
  
  const query = params?.query || "";
  const category = params?.category || "";
  const stock = params?.stock || "";

  // Dynamic Query Builder
  let dbQuery = supabase.from("medicines").select("*").order("created_at", { ascending: false });
  
  if (query) {
    dbQuery = dbQuery.or(`name.ilike.%${query}%,brand.ilike.%${query}%`);
  }
  if (category && category !== "All") {
    dbQuery = dbQuery.eq("category", category);
  }
  if (stock === "low") {
    dbQuery = dbQuery.lte("stock", 10).gt("stock", 0);
  } else if (stock === "out") {
    dbQuery = dbQuery.eq("stock", 0);
  }

  const { data: medicines, error } = await dbQuery;

  if (error) {
    return <div className="text-red-600 p-4 bg-red-50 rounded-xl border border-red-200">Error loading inventory: {error.message}</div>;
  }

  const inventory = (medicines as Medicine[]) || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20 md:pb-10">

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-semibold text-teal flex items-center gap-3">
            <Package className="text-terracotta" />
            Inventory Master
          </h1>
          <p className="text-ink-dim text-sm mt-1">Manage medicines, stock levels, expiry, and pricing.</p>
        </div>

        <div className="w-full md:w-auto flex items-center gap-2">
          <InventorySearchBar />
          <InventoryFilter />
          
          {/* YEH LINE MISSING THI: Ab Download icon show ho jayega */}
          <InventoryCSVManager inventory={inventory} />
          
          <Link
            href="/dashboard/inventory/new"
            className="flex items-center justify-center bg-terracotta hover:bg-terracotta-hover text-white p-2 md:px-4 md:py-2 rounded-xl transition-all shadow-md shadow-terracotta/20 active:scale-95 whitespace-nowrap"
          >
            <Plus size={20} className="md:mr-2" />
            <span className="hidden md:inline font-bold">Add Item</span>
          </Link>
        </div>
      </div>

      {/* RENDER CONTENT OR EMPTY STATE */}
      {inventory.length === 0 ? (
        <div className="bg-white border border-border rounded-3xl p-12 text-center flex flex-col items-center justify-center border-dashed shadow-sm">
          <div className="w-16 h-16 bg-cream rounded-full flex items-center justify-center mb-4 border border-border">
            <Package className="text-ink-mute" size={32} />
          </div>
          <h3 className="text-xl font-heading font-semibold text-teal mb-2">
            {(query || category || stock) ? "No matching items found" : "No items found"}
          </h3>
          <p className="text-ink-dim text-sm mb-6 max-w-md">
            {(query || category || stock) ? "Try adjusting your filters or search terms." : "Your inventory is currently empty. Click the button below to add your first medicine to the system."}
          </p>
          {!(query || category || stock) && (
            <Link href="/dashboard/inventory/new" className="bg-terracotta-dim text-terracotta-hover font-bold py-2 px-6 rounded-full border border-terracotta/30 hover:bg-terracotta/20 transition-colors">
              Add First Medicine
            </Link>
          )}
        </div>
      ) : (
        <InventoryView inventory={inventory} />
      )}
    </div>
  );
}