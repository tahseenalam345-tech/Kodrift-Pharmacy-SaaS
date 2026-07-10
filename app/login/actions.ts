"use server";

import { createServer } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";

export async function processLogin(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const role = formData.get("role") as string;
  const password = formData.get("password") as string;

  const supabase = await createServer();

  const { data: staffMember, error } = await supabase
    .from("staff")
    .select("*")
    .eq("email", email)
    .single();

  if (error || !staffMember) {
    return { error: "Account not found. Please contact the Super Admin." };
  }

  if (staffMember.status === "Inactive") {
    return { error: "This account has been deactivated. Please contact the Super Admin." };
  }

  if (staffMember.role !== role) {
    return { error: `Access Denied. You are registered as a ${staffMember.role}, not a ${role}.` };
  }

  const passwordValid = await bcrypt.compare(password, staffMember.password_hash ?? "");

  if (!passwordValid) {
    return { error: "Incorrect password." };
  }

  const cookieStore = await cookies();
  cookieStore.set("alazamat_staff_id", staffMember.id, { path: "/", httpOnly: true, sameSite: "lax" });
  cookieStore.set("alazamat_role", staffMember.role, { path: "/", httpOnly: true, sameSite: "lax" });
  cookieStore.set("alazamat_name", staffMember.name, { path: "/", httpOnly: true, sameSite: "lax" });

  redirect("/dashboard");
}