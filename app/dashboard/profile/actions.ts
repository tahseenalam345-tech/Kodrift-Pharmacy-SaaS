"use server";

import { createServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export type ActionState = {
  error?: string;
  success?: string;
};

export async function logAttendance(staffId: string, type: 'Login' | 'Logout') {
  const supabase = await createServer();
  
  const { error } = await supabase.from("staff_activity").insert([{
    staff_id: staffId,
    type: type,
    status: 'Completed',
    details: `Staff member clocked ${type === 'Login' ? 'in' : 'out'}`
  }]);

  if (error) return { error: error.message };
  
  revalidatePath("/dashboard/profile");
  return { success: `Successfully clocked ${type === 'Login' ? 'in' : 'out'}!` };
}

const LeaveSchema = z.object({
  staff_id: z.string(),
  leave_date: z.string().min(1, "Date is required"),
  reason: z.string().min(5, "Please provide a valid reason"),
});

export async function submitLeaveRequest(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createServer();
  const validatedFields = LeaveSchema.safeParse(Object.fromEntries(formData));

  if (!validatedFields.success) {
    return { error: "Please fill out all fields correctly." };
  }

  const { staff_id, leave_date, reason } = validatedFields.data;

  const { error } = await supabase.from("staff_activity").insert([{
    staff_id: staff_id,
    type: 'LeaveRequest',
    status: 'Pending',
    details: `Date: ${leave_date} | Reason: ${reason}`
  }]);

  if (error) return { error: "Failed to submit request: " + error.message };

  revalidatePath("/dashboard/profile");
  return { success: "Leave request submitted to Admin for approval!" };
}