"use server";

import { createServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { RestockCartItem } from "@/types";
import { requireSession } from "@/lib/auth";

export async function processPurchase(
  supplierName: string, 
  cartItems: RestockCartItem[], 
  totalAmount: number,
  paymentDetails: {
    status: string;
    method: string;
    amountPaid: number;
    dueDate: string | null;
  }
) {
  const { error: guardError } = await requireSession(["Super Admin", "Admin", "Manager"]);
  if (guardError) return { error: guardError };

  const supabase = await createServer();

  if (!supplierName.trim()) return { error: "Supplier name is required." };
  if (cartItems.length === 0) return { error: "Your restock cart is empty." };

  const { data: purchase, error: purchaseErr } = await supabase
    .from("purchases")
    .insert([{
      supplier_name: supplierName,
      total_amount: totalAmount,
      status: 'Completed',
      // NAYE PAYMENT FIELDS:
      payment_status: paymentDetails.status,
      payment_method: paymentDetails.method,
      amount_paid: paymentDetails.amountPaid,
      due_date: paymentDetails.dueDate || null
    }])
    .select()
    .single();

  if (purchaseErr || !purchase) {
    return { error: "Failed to create purchase record: " + purchaseErr?.message };
  }

  for (const item of cartItems) {
    const med = item.medicine;
    const totalUnitsGained = item.packs * (med.pack_size || 1);
    const totalPrice = item.packs * item.costPerPack;

    await supabase.from("purchase_items").insert([{
      purchase_id: purchase.id,
      medicine_id: med.id,
      quantity: item.packs,
      pack_price: item.costPerPack,
      total_price: totalPrice
    }]);

    await supabase
      .from("medicines")
      .update({
        stock: med.stock + totalUnitsGained,
        cost_price: item.costPerPack
      })
      .eq("id", med.id);
  }

  revalidatePath("/dashboard/inventory");
  revalidatePath("/dashboard/purchases");
  revalidatePath("/dashboard");

  return { success: true, message: "Inventory successfully restocked!" };
}