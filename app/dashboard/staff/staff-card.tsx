"use client";

import { useState } from "react";
import { Shield, UserCircle, Trash2, Power, Clock, Banknote, Lock, Tag, BarChart2, FileBadge, CheckCircle2, Percent, Edit2, X, Save, Activity, ChevronDown } from "lucide-react";
import { toggleStaffStatus, deleteStaff, payStaffSalary, updateStaffFinancials } from "./actions";

export function StaffCard({ person, isElevated, isManager, activityLog, isClockedIn }: any) {
  const [isEditingFin, setIsEditingFin] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={`bg-white border ${person.status === 'Active' ? 'border-border' : 'border-red-100 bg-red-50/30'} rounded-3xl relative overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md transition-all`}>
      <div className={`absolute top-0 left-0 w-1.5 h-full ${person.status === 'Active' ? 'bg-success' : 'bg-red-400'}`}></div>

      {/* Main Card Content */}
      <div className="p-5 pb-3">
        <div className="flex justify-between items-start mb-4 pl-2">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="bg-cream p-2.5 rounded-xl border border-border">
                <UserCircle className={person.status === 'Active' ? 'text-teal' : 'text-ink-mute'} size={28} />
              </div>
              {/* NAYA: Live Status Dot */}
              {isClockedIn && (
                <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-success border-2 border-white rounded-full shadow-sm" title="Currently Clocked In"></div>
              )}
            </div>
            <div>
              <h3 className="font-bold text-ink text-lg">{person.name}</h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border flex items-center gap-1 ${isElevated ? 'bg-terracotta-dim text-terracotta border-terracotta/20' : isManager ? 'bg-teal-soft text-teal border-teal/20' : 'bg-cream text-ink-mute border-border'}`}>
                  <Shield size={10} /> {person.role}
                </span>
                {person.cnic_url && (
                  <a href={person.cnic_url} target="_blank" className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border bg-ink/5 text-ink-dim border-ink/10 hover:bg-ink hover:text-white transition-colors flex items-center gap-1">
                    <FileBadge size={10}/> Doc
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="pl-2 mb-4 space-y-3 flex-1">
          {/* FINANCIALS SECTION (Editable) */}
          {isEditingFin ? (
            <form 
              action={async (formData) => {
                await updateStaffFinancials(formData);
                setIsEditingFin(false);
              }} 
              className="bg-cream/50 rounded-xl p-3 border border-teal/30 space-y-3 animate-in fade-in slide-in-from-top-2"
            >
              <input type="hidden" name="id" value={person.id} />
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-teal">Update Financials</span>
                <button type="button" onClick={() => setIsEditingFin(false)} className="text-ink-mute hover:text-red-500"><X size={14}/></button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] text-ink-mute font-bold uppercase">Base Salary (Rs)</label>
                  <input type="number" name="base_salary" defaultValue={person.base_salary || 0} className="w-full bg-white border border-border rounded-lg px-2 py-1.5 text-xs font-bold outline-none focus:border-teal" />
                </div>
                <div>
                  <label className="text-[9px] text-ink-mute font-bold uppercase">Commission %</label>
                  <input type="number" step="0.1" name="commission_rate" defaultValue={person.commission_rate || 0} className="w-full bg-white border border-border rounded-lg px-2 py-1.5 text-xs font-bold outline-none focus:border-teal text-teal" />
                </div>
              </div>
              <button type="submit" className="w-full bg-teal text-white text-[10px] font-bold py-1.5 rounded-lg flex items-center justify-center gap-1 hover:bg-teal-hover transition-colors">
                <Save size={12}/> Save Changes
              </button>
            </form>
          ) : (
            <div className="grid grid-cols-3 gap-2 relative group">
              <button 
                onClick={() => setIsEditingFin(true)} 
                className="absolute -top-2 -right-2 p-1.5 bg-white border border-border rounded-lg text-ink-mute opacity-0 group-hover:opacity-100 transition-opacity hover:text-teal hover:border-teal shadow-sm z-10"
                title="Edit Salary & Commission"
              >
                <Edit2 size={12} />
              </button>
              <div className="bg-cream/50 rounded-lg p-2 border border-border/50">
                <div className="text-[9px] text-ink-mute uppercase font-bold flex items-center gap-1"><Clock size={10}/> Shift</div>
                <div className="text-xs font-bold text-ink mt-0.5">{person.shift || "Flexible"}</div>
              </div>
              <div className="bg-cream/50 rounded-lg p-2 border border-border/50">
                <div className="text-[9px] text-ink-mute uppercase font-bold flex items-center gap-1"><Banknote size={10}/> Salary</div>
                <div className="text-xs font-bold text-ink mt-0.5">Rs {Math.round(person.base_salary || 0).toLocaleString()}</div>
              </div>
              <div className="bg-teal-soft/50 rounded-lg p-2 border border-teal/10">
                <div className="text-[9px] text-teal/80 uppercase font-bold flex items-center gap-1"><Percent size={10}/> Comm.</div>
                <div className="text-xs font-bold text-teal mt-0.5">{person.commission_rate || 0}%</div>
              </div>
            </div>
          )}

          {/* Permissions Badges */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {person.can_give_discount && <span className="bg-teal/10 text-teal text-[9px] font-bold px-2 py-0.5 rounded">Discounts</span>}
            {person.can_delete_sales && <span className="bg-red-100 text-red-600 text-[9px] font-bold px-2 py-0.5 rounded">Delete Sales</span>}
            {person.can_view_reports && <span className="bg-teal/10 text-teal text-[9px] font-bold px-2 py-0.5 rounded">Reports</span>}
            {!person.can_give_discount && !person.can_delete_sales && !person.can_view_reports && !isElevated && (
              <span className="bg-cream text-ink-mute text-[9px] font-bold px-2 py-0.5 rounded flex items-center gap-1"><Lock size={10}/> Standard</span>
            )}
          </div>
        </div>

        {/* Salary Payment Form */}
        {person.status === 'Active' && (
          <div className="pl-2 mb-4">
            <form action={payStaffSalary} className="flex gap-2 bg-cream/30 p-1.5 rounded-xl border border-border">
              <input type="hidden" name="staff_name" value={person.name} />
              <input type="text" name="description" placeholder="Month/Reason..." required className="flex-1 bg-white border border-border rounded-lg px-2 py-1 text-[10px] outline-none focus:border-teal" />
              <input type="number" name="amount" defaultValue={person.base_salary || ""} required className="w-20 bg-white border border-border rounded-lg px-2 py-1 text-[10px] outline-none font-bold focus:border-teal" />
              <button type="submit" title="Pay Salary & Log to Expenses" className="bg-teal hover:bg-teal-hover text-white p-1.5 rounded-lg transition-colors">
                <CheckCircle2 size={14} />
              </button>
            </form>
          </div>
        )}

        {/* Actions Footer */}
        <div className="pl-2 pt-3 border-t border-dashed border-border/80 flex justify-between items-center mt-auto mb-2">
          <div className="flex flex-col">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${person.status === 'Active' ? 'text-success' : 'text-red-500'}`}>
              • {person.status}
            </span>
            <span className="text-[9px] text-ink-mute">{person.email}</span>
          </div>
          
          <div className="flex gap-2">
            <form action={toggleStaffStatus}>
              <input type="hidden" name="id" value={person.id} />
              <input type="hidden" name="current_status" value={person.status} />
              <button type="submit" className={`p-2 rounded-xl transition-all border ${person.status === 'Active' ? 'bg-white border-border hover:bg-red-50 text-ink-mute hover:text-red-600' : 'bg-success-soft border-success/30 text-success hover:bg-success hover:text-white'}`} title={person.status === 'Active' ? "Deactivate Account" : "Activate Account"}>
                <Power size={16} />
              </button>
            </form>
            <form action={deleteStaff}>
              <input type="hidden" name="id" value={person.id} />
              <button type="submit" className="p-2 bg-white hover:bg-red-50 border border-border hover:border-red-200 rounded-xl text-ink-mute hover:text-red-600 transition-all" title="Permanently Delete Staff">
                <Trash2 size={16} />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* NAYA: EXPANDABLE ATTENDANCE & ACTIVITY HISTORY */}
      <div className="border-t border-border">
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full bg-cream/30 hover:bg-cream py-2.5 px-5 flex items-center justify-between transition-colors text-ink-dim"
        >
          <div className="flex items-center gap-2">
            <Activity size={14} className={isClockedIn ? "text-success" : "text-ink-mute"} />
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Live Terminal Activity {isClockedIn ? "(Clocked In)" : "(Offline)"}
            </span>
          </div>
          <ChevronDown size={14} className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} />
        </button>

        {isExpanded && (
          <div className="p-4 bg-cream/20 max-h-48 overflow-y-auto custom-scrollbar border-t border-border/50 animate-in slide-in-from-top-2">
            {activityLog.length === 0 ? (
              <p className="text-[10px] text-ink-mute text-center italic py-2">No login/logout history found.</p>
            ) : (
              <div className="space-y-3 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                {activityLog.map((log: any, i: number) => (
                  <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    {/* Timeline Dot */}
                    <div className={`flex items-center justify-center w-4 h-4 rounded-full border-2 border-white bg-cream shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 ${log.type === 'Login' ? 'bg-success' : log.type === 'Logout' ? 'bg-red-500' : 'bg-terracotta'}`}></div>
                    
                    <div className="w-[calc(100%-1.5rem)] md:w-[calc(50%-1.5rem)] p-2.5 rounded-xl bg-white border border-border shadow-sm">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[10px] font-bold uppercase ${log.type === 'Login' ? 'text-success' : log.type === 'Logout' ? 'text-red-500' : 'text-terracotta'}`}>
                          {log.type === 'LeaveRequest' ? 'Leave Req' : log.type}
                        </span>
                        <span className="text-[9px] text-ink-mute">{new Date(log.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      <span className="text-[9px] text-ink-dim block">{new Date(log.created_at).toLocaleDateString('en-GB')}</span>
                      {log.details && <p className="text-[10px] text-ink-mute mt-1 border-t border-dashed border-border/50 pt-1">{log.details}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}