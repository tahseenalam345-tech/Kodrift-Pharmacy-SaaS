"use server";

import { createServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { requireSession } from "@/lib/auth";

export type ActionState = {
  error?: string;
  success?: string;
};

// UPDATED SCHEMA: Added shift and base_salary
const StaffSchema = z.object({
  name: z.string().min(1, "Name is required"),
  role: z.enum(["Super Admin", "Admin", "Manager", "Cashier"]),
  shift: z.enum(["Morning", "Evening", "Night", "Flexible"]),
  base_salary: z.coerce.number().min(0, "Salary cannot be negative"),
  phone: z.string().optional(),
  status: z.enum(["Active", "Inactive"]),
  email: z.string().email("A valid email is required"),
  password_hash: z.string().min(6, "Password must be at least 6 characters"),
});

export async function addStaff(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const { error: guardError } = await requireSession(["Admin", "Super Admin"]);
  if (guardError) return { error: guardError };

  const supabase = await createServer();
  const validatedFields = StaffSchema.safeParse(Object.fromEntries(formData));

  if (!validatedFields.success) {
    const firstIssue = validatedFields.error.issues[0];
    return { error: `Check input for "${String(firstIssue.path[0])}": ${firstIssue.message}` };
  }

  const hashedPassword = await bcrypt.hash(validatedFields.data.password_hash, 10);

  const { error } = await supabase.from("staff").insert([
    { ...validatedFields.data, password_hash: hashedPassword },
  ]);

  if (error) {
    if (error.code === "23505") return { error: "This email is already registered to another staff member." };
    return { error: "Database error: " + error.message };
  }

  revalidatePath("/dashboard/staff");
  return { success: "Staff member added successfully! They can now log in." };
}

export async function toggleStaffStatus(formData: FormData) {
  const { error: guardError } = await requireSession(["Admin", "Super Admin"]);
  if (guardError) {
    console.log("Blocked toggleStaffStatus:", guardError);
    return;
  }

  const supabase = await createServer();
  const id = String(formData.get("id"));
  const currentStatus = String(formData.get("current_status"));
  const newStatus = currentStatus === "Active" ? "Inactive" : "Active";
  await supabase.from("staff").update({ status: newStatus }).eq("id", id);
  revalidatePath("/dashboard/staff");
}

export async function deleteStaff(formData: FormData) {
  const { error: guardError } = await requireSession(["Super Admin"]);
  if (guardError) {
    console.log("Blocked deleteStaff:", guardError);
    return;
  }

  const supabase = await createServer();
  const id = String(formData.get("id"));
  await supabase.from("staff").delete().eq("id", id);
  revalidatePath("/dashboard/staff");
}