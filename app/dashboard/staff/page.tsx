import { createServer } from "@/lib/supabase/server";
import { StaffForm } from "./staff-form";
import { deleteStaff, toggleStaffStatus } from "./actions";
import { Users, Shield, UserCircle, Trash2, Power, Clock, Banknote, Mail, Phone } from "lucide-react";

// Typescale update to include new fields
type StaffWithDetails = {
  id: string;
  name: string;
  role: string;
  shift: string;
  base_salary: number;
  phone: string;
  status: string;
  email: string;
  created_at: string;
};

export const dynamic = "force-dynamic";

export default async function StaffPage() {
  const supabase = await createServer();

  const { data: rawStaff, error } = await supabase
    .from("staff")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    return <div className="p-4 text-red-600">Failed to load staff directory: {error.message}</div>;
  }

  const staffList = (rawStaff as StaffWithDetails[]) || [];
  const activeCount = staffList.filter(s => s.status === 'Active').length;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 md:pb-10">

      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-semibold text-teal flex items-center gap-3">
            <Users className="text-terracotta" />
            Team Directory
          </h1>
          <p className="text-ink-dim text-sm mt-1">Manage employee profiles and system access levels.</p>
        </div>
        <div className="bg-white border border-border px-5 py-3 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-success-soft border border-success/30">
            <div className="w-3 h-3 rounded-full bg-success animate-pulse"></div>
          </div>
          <div>
            <span className="text-[10px] text-ink-mute uppercase font-bold tracking-wider block">Active Personnel</span>
            <span className="text-xl font-heading font-semibold text-teal leading-none">{activeCount} Members</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT PANEL: FORM */}
        <div className="lg:col-span-1">
          <StaffForm />
        </div>

        {/* RIGHT PANEL: STAFF CARDS */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {staffList.length === 0 ? (
              <div className="col-span-2 bg-white border border-border rounded-3xl p-12 text-center border-dashed">
                <p className="text-ink-mute">No staff members registered yet.</p>
              </div>
            ) : (
              staffList.map((person) => {
                const isElevated = person.role === 'Super Admin' || person.role === 'Admin';
                const isManager = person.role === 'Manager';
                
                return (
                <div key={person.id} className={`bg-white border ${person.status === 'Active' ? 'border-border' : 'border-red-100 bg-red-50/30'} rounded-3xl p-5 relative overflow-hidden flex flex-col justify-between shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all`}>

                  {/* Status Indicator Bar */}
                  <div className={`absolute top-0 left-0 w-1.5 h-full ${person.status === 'Active' ? 'bg-success' : 'bg-red-400'}`}></div>

                  <div className="flex justify-between items-start mb-4 pl-2">
                    <div className="flex items-center gap-3">
                      <div className="bg-cream p-2.5 rounded-xl border border-border">
                        <UserCircle className={person.status === 'Active' ? 'text-teal' : 'text-ink-mute'} size={28} />
                      </div>
                      <div>
                        <h3 className="font-bold text-ink text-lg">{person.name}</h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border flex items-center gap-1 ${isElevated ? 'bg-terracotta-dim text-terracotta border-terracotta/20' : isManager ? 'bg-teal-soft text-teal border-teal/20' : 'bg-cream text-ink-mute border-border'}`}>
                            <Shield size={10} /> {person.role}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pl-2 mb-5 space-y-2 flex-1">
                    <div className="grid grid-cols-2 gap-2 mb-3">
                       <div className="bg-cream/50 rounded-lg p-2 border border-border/50">
                          <div className="text-[9px] text-ink-mute uppercase font-bold flex items-center gap-1"><Clock size={10}/> Shift</div>
                          <div className="text-xs font-bold text-ink mt-0.5">{person.shift || "Not Assigned"}</div>
                       </div>
                       <div className="bg-cream/50 rounded-lg p-2 border border-border/50">
                          <div className="text-[9px] text-ink-mute uppercase font-bold flex items-center gap-1"><Banknote size={10}/> Base Salary</div>
                          <div className="text-xs font-bold text-ink mt-0.5">Rs {Math.round(person.base_salary || 0).toLocaleString()}</div>
                       </div>
                    </div>

                    <div className="text-[11px] text-ink-dim flex items-center gap-2">
                      <Mail size={12} className="text-ink-mute" /> {person.email}
                    </div>
                    <div className="text-[11px] text-ink-dim flex items-center gap-2">
                      <Phone size={12} className="text-ink-mute" /> {person.phone || "No phone provided"}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pl-2 pt-4 border-t border-dashed border-border/80 flex justify-between items-center mt-auto">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${person.status === 'Active' ? 'text-success' : 'text-red-500'}`}>
                      • {person.status}
                    </span>
                    <div className="flex gap-2">
                      <form action={toggleStaffStatus}>
                        <input type="hidden" name="id" value={person.id} />
                        <input type="hidden" name="current_status" value={person.status} />
                        <button
                          type="submit"
                          className={`p-2 rounded-xl transition-all border ${person.status === 'Active' ? 'bg-white border-border hover:bg-red-50 text-ink-mute hover:text-red-600' : 'bg-success-soft border-success/30 text-success hover:bg-success hover:text-white'}`}
                          title={person.status === 'Active' ? "Deactivate Account" : "Activate Account"}
                        >
                          <Power size={16} />
                        </button>
                      </form>

                      <form action={deleteStaff}>
                        <input type="hidden" name="id" value={person.id} />
                        <button
                          type="submit"
                          className="p-2 bg-white hover:bg-red-50 border border-border hover:border-red-200 rounded-xl text-ink-mute hover:text-red-600 transition-all"
                          title="Permanently Delete Staff"
                        >
                          <Trash2 size={16} />
                        </button>
                      </form>
                    </div>
                  </div>

                </div>
              );})
            )}
          </div>
        </div>

      </div>
    </div>
  );
}