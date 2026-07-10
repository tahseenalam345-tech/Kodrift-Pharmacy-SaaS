"use server";

import { createServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireSession } from "@/lib/auth";

export type ActionState = {
  error?: string;
  success?: string;
};

// Updated Schema with Tax and Recurring
const ExpenseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  category: z.string().min(1, "Category is required"),
  amount: z.coerce.number().min(1, "Amount must be at least 1"),
  tax_amount: z.coerce.number().optional().default(0),
  expense_date: z.string().min(1, "Date is required"),
  vendor_name: z.string().optional(),
  payment_method: z.string().min(1, "Payment method is required"),
});

export async function addExpense(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const { error: guardError } = await requireSession(["Super Admin", "Admin", "Manager"]);
  if (guardError) return { error: guardError };

  const supabase = await createServer();
  
  const validatedFields = ExpenseSchema.safeParse({
    title: formData.get("title"),
    category: formData.get("category"),
    amount: formData.get("amount"),
    tax_amount: formData.get("tax_amount") || 0,
    expense_date: formData.get("expense_date"),
    vendor_name: formData.get("vendor_name"),
    payment_method: formData.get("payment_method"),
  });

  if (!validatedFields.success) {
    const firstIssue = validatedFields.error.issues[0];
    return { error: `Input Error: ${firstIssue.message}` };
  }

  const is_recurring = formData.get("is_recurring") === "on";
  let receiptUrl = null;

  const file = formData.get("receipt") as File | null;
  if (file && file.size > 0) {
    if (file.size > 5 * 1024 * 1024) return { error: "File size must be less than 5MB" };
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `expense_receipts/${fileName}`;
    const { error: uploadError } = await supabase.storage.from('receipts').upload(filePath, file);
    if (uploadError) return { error: "Failed to upload receipt: " + uploadError.message };
    const { data: publicUrlData } = supabase.storage.from('receipts').getPublicUrl(filePath);
    receiptUrl = publicUrlData.publicUrl;
  }

  const expenseData = {
    ...validatedFields.data,
    is_recurring,
    receipt_url: receiptUrl
  };

  const { error } = await supabase.from("expenses").insert([expenseData]);

  if (error) return { error: "Database error: " + error.message };

  revalidatePath("/dashboard/expenses");
  revalidatePath("/dashboard");

  return { success: "Expense recorded successfully!" };
}

export async function deleteExpense(formData: FormData) {
  const { error: guardError } = await requireSession(["Super Admin", "Admin", "Manager"]);
  if (guardError) return;
  const supabase = await createServer();
  const id = String(formData.get("id"));
  await supabase.from("expenses").delete().eq("id", id);
  revalidatePath("/dashboard/expenses");
  revalidatePath("/dashboard");
}