"use server";

import { createServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireSession } from "@/lib/auth";

export type ActionState = {
  error?: string;
  success?: string;
};

const MedicineSchema = z.object({
  name: z.string().min(1, "Medicine name is required"),
  brand: z.string().optional(),
  formula: z.string().optional(),
  potency: z.string().optional(),
  pack_size: z.coerce.number().min(1, "Pack size must be at least 1"),
  stock: z.coerce.number().min(0, "Stock cannot be negative"),
  cost_price: z.coerce.number().min(0, "Cost price cannot be negative"),
  sale_price: z.coerce.number().min(0, "Sale price cannot be negative"),
  category: z.string().optional(),
  expiry_date: z.string().optional(),
});

export async function addMedicine(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const { error: guardError } = await requireSession();
  if (guardError) return { error: guardError };

  const supabase = await createServer();
  const validatedFields = MedicineSchema.safeParse(Object.fromEntries(formData));

  if (!validatedFields.success) {
    return { error: "Please check your inputs and try again." };
  }

  const { error } = await supabase.from("medicines").insert([validatedFields.data]);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/inventory");
  return { success: "Medicine added successfully!" };
}

// YEH FUNCTION MISSING THA JO ERROR DE RAHA THA
export async function updateMedicine(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const { error: guardError } = await requireSession();
  if (guardError) return { error: guardError };

  const id = formData.get("id") as string;
  if (!id) return { error: "Medicine ID is required for updating." };

  const supabase = await createServer();
  const validatedFields = MedicineSchema.safeParse(Object.fromEntries(formData));

  if (!validatedFields.success) {
    return { error: "Please check your inputs and try again." };
  }

  const { error } = await supabase
    .from("medicines")
    .update(validatedFields.data)
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/inventory");
  revalidatePath(`/dashboard/inventory/${id}`);
  return { success: "Medicine updated successfully!" };
}

export async function deleteMedicine(formData: FormData) {
  const { error: guardError } = await requireSession();
  if (guardError) {
    console.log("Guest attempted to delete an item. Action blocked.");
    return;
  }

  const id = formData.get("id") as string;
  const supabase = await createServer();

  await supabase.from("medicines").delete().eq("id", id);
  revalidatePath("/dashboard/inventory");
}
// YEH FUNCTIONS actions.ts KE AAKHIR MEIN PASTE KAREIN

export async function quickUpdateMedicine(id: string, stock: number, sale_price: number) {
  const { error: guardError } = await requireSession();
  if (guardError) throw new Error(guardError);

  const supabase = await createServer();
  const { error } = await supabase
    .from("medicines")
    .update({ stock, sale_price })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/inventory");
  return { success: true };
}

export async function bulkDeleteMedicines(ids: string[]) {
  const { error: guardError } = await requireSession();
  if (guardError) throw new Error(guardError);

  const supabase = await createServer();
  const { error } = await supabase
    .from("medicines")
    .delete()
    .in("id", ids); // .in() array of IDs ko ek sath delete karta hai

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/inventory");
  return { success: true };
}
// actions.ts KE AAKHIR MEIN PASTE KAREIN

export async function bulkImportMedicines(medicinesList: any[]) {
  const { error: guardError } = await requireSession();
  if (guardError) throw new Error(guardError);

  const supabase = await createServer();

  // Excel (CSV) data ko database columns ke mutabiq map karna
  const formattedData = medicinesList
    .filter(item => item.Name) // Sirf un rows ko lein jinme Name majood ho
    .map(item => ({
      name: item.Name,
      brand: item.Brand || null,
      formula: item.Formula || null,
      category: item.Category || 'Other',
      stock: parseInt(item.Stock) || 0,
      cost_price: parseFloat(item.Cost_Price) || 0,
      sale_price: parseFloat(item.Sale_Price) || 0,
      expiry_date: item.Expiry_Date || null,
      // Default fallback if columns are missing in CSV
      pack_size: parseInt(item.Pack_Size) || 1,
      potency: item.Potency || null
    }));

  if (formattedData.length === 0) throw new Error("No valid data found to import.");

  // Bulk Insert - .insert() array accept karta hai aur milliseconds mein insert karta hai
  const { error } = await supabase.from("medicines").insert(formattedData);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/inventory");
  return { success: true, count: formattedData.length };
}