"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function getSession() {
  const cookieStore = await cookies();
  const role = cookieStore.get("alazamat_role")?.value;
  const staffId = cookieStore.get("alazamat_staff_id")?.value;
  const name = cookieStore.get("alazamat_name")?.value;

  return {
    isLoggedIn: !!role,
    role: role || "Guest",
    staffId: staffId || null,
    name: name || null,
  };
}

/**
 * Shared guard for Server Actions. Returns { error: null } when the
 * caller is clear to proceed, or { error: "..." } when it's a guest
 * or lacks a required role. Use this instead of ad-hoc isLoggedIn
 * checks so every action is protected the same way.
 */
export async function requireSession(allowedRoles?: string[]) {
  const session = await getSession();

  if (!session.isLoggedIn) {
    return {
      session,
      error: "View-Only Demo Mode: Please log in with a Staff account to perform this action.",
    };
  }

  if (allowedRoles && !allowedRoles.includes(session.role)) {
    return {
      session,
      error: `Access Denied. This action requires one of: ${allowedRoles.join(", ")}.`,
    };
  }

  return { session, error: null };
}

export async function processLogout() {
  const cookieStore = await cookies();
  cookieStore.delete("alazamat_role");
  cookieStore.delete("alazamat_name");
  cookieStore.delete("alazamat_staff_id");
  redirect("/dashboard");
}