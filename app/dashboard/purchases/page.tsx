import { createServer } from "@/lib/supabase/server";
import { Medicine } from "@/types";
import { RestockClient } from "./restock-client";
import { PurchaseHistory } from "./purchase-history"; // NAYA IMPORT

export const dynamic = "force-dynamic";

export default async function PurchasesPage() {
  const supabase = await createServer();

  // 1. Load Inventory for Restocking
  const { data: medicines, error: medError } = await supabase
    .from("medicines")
    .select("*")
    .order("name", { ascending: true });

  if (medError) {
    return <div className="p-4 text-red-600">Failed to load inventory for restocking: {medError.message}</div>;
  }

  const inventory = (medicines as Medicine[]) || [];

  // 2. Load Full Purchase History (For Ledger and Auto-complete)
  const { data: purchasesData, error: purError } = await supabase
    .from("purchases")
    .select("id, supplier_name, total_amount, payment_status, payment_method, amount_paid, due_date, created_at")
    .order("created_at", { ascending: false });

  if (purError) {
    return <div className="p-4 text-red-600">Failed to load purchase history: {purError.message}</div>;
  }

  const purchases = purchasesData || [];
  
  // Extract unique supplier names for the Datalist
  const existingSuppliers = Array.from(
    new Set(purchases.map(p => p.supplier_name).filter(Boolean))
  ) as string[];

  return (
    <div className="max-w-7xl mx-auto flex flex-col min-h-[calc(100vh-88px)] lg:min-h-[calc(100vh-112px)] pb-10">
      <header className="mb-4 md:mb-6 flex-none">
        <h1 className="text-2xl md:text-3xl font-heading font-semibold text-teal">Supplier Purchases</h1>
        <p className="text-ink-dim text-sm mt-1">Log inbound deliveries, update costs, and restock inventory.</p>
      </header>

      {/* TOP: NEW RESTOCK ENTRY (Purana Component) */}
      <RestockClient inventory={inventory} existingSuppliers={existingSuppliers} />

      {/* BOTTOM: SUPPLIER LEDGER & HISTORY (Naya Component) */}
      <PurchaseHistory purchases={purchases} />
      
    </div>
  );
}