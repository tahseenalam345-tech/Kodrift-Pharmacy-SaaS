import { createServer } from "@/lib/supabase/server";
import { Medicine } from "@/types";
import { POSClient } from "./pos-client";

export default async function SalesPage() {
  const supabase = await createServer();

  const { data: medicines, error } = await supabase
    .from("medicines")
    .select("*")
    .gt("stock", 0)
    .order("name", { ascending: true });

  if (error) {
    return <div className="p-4 text-red-600">Failed to load inventory: {error.message}</div>;
  }

  const inventory = (medicines as Medicine[]) || [];

  return (
    <div className="max-w-7xl mx-auto flex flex-col h-[calc(100vh-88px)] lg:h-[calc(100vh-112px)]">
      <header className="mb-4 md:mb-6 flex-none">
        <h1 className="text-2xl md:text-3xl font-heading font-semibold text-teal">Sales & POS</h1>
        <p className="text-ink-dim text-sm mt-1">Tap items to build a cart and process customer checkout.</p>
      </header>

      <POSClient inventory={inventory} />
    </div>
  );
}