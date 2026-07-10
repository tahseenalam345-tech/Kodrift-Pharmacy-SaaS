"use server";

import { createServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { CartItem } from "./pos-client"; // We will export this type in the next step

export async function processCheckout(cartItems: CartItem[], totalAmount: number) {
  const supabase = await createServer();

  // 1. Calculate the Total Profit securely on the server
  let totalProfit = 0;
  
  cartItems.forEach((item) => {
    const med = item.medicine;
    const qty = item.quantity;
    const isPack = item.saleType === "Pack";
    const packSize = med.pack_size || 1;

    // Calculate cost and sale price based on Pack vs Unit
    const cost = isPack ? med.cost_price * qty : (med.cost_price / packSize) * qty;
    const price = isPack ? med.sale_price * qty : (med.sale_price / packSize) * qty;
    
    totalProfit += (price - cost);
  });

  // 2. Create the Master Sale Record
  const { data: sale, error: saleErr } = await supabase
    .from("sales")
    .insert([{ 
      total_amount: totalAmount, 
      net_total: totalAmount, 
      profit: totalProfit 
    }])
    .select()
    .single();

  if (saleErr || !sale) {
    return { error: "Failed to create sale record: " + saleErr?.message };
  }

  // 3. Process each item (Deduct Stock & Record Sale Item)
  for (const item of cartItems) {
    const med = item.medicine;
    const qty = item.quantity;
    const isPack = item.saleType === "Pack";
    const packSize = med.pack_size || 1;

    // If they sold 1 Pack and a pack has 10 items, we deduct 10 units from stock.
    const unitsToDeduct = isPack ? (qty * packSize) : qty;
    
    const cost = isPack ? med.cost_price * qty : (med.cost_price / packSize) * qty;
    const price = isPack ? med.sale_price * qty : (med.sale_price / packSize) * qty;
    const itemProfit = price - cost;

    // A. Record the line item
    await supabase.from("sale_items").insert([{
      sale_id: sale.id,
      medicine_id: med.id,
      quantity: qty,
      sale_type: item.saleType,
      price: price,
      profit: itemProfit
    }]);

    // B. Deduct the stock
    await supabase
      .from("medicines")
      .update({ stock: med.stock - unitsToDeduct })
      .eq("id", med.id);
  }

  // 4. Refresh all relevant pages so the new stock levels show up instantly
  revalidatePath("/dashboard/inventory");
  revalidatePath("/dashboard/sales");

  return { success: true, message: "Checkout completed successfully!" };
}