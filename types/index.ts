export interface Medicine {
  id: string;
  name: string;
  brand: string | null;
  formula: string | null;
  potency: string | null;
  pack_size: number;
  stock: number;
  cost_price: number;
  sale_price: number;
  category: string | null;
  expiry_date: string | null;
  created_at: string;
}

export interface Expense {
  id: string;
  title: string;
  category: string;
  amount: number;
  expense_date: string;
  created_at: string;
}

export interface Purchase {
  id: string;
  supplier_name: string;
  total_amount: number;
  status: string;
  created_at: string;
}

export type RestockCartItem = {
  medicine: Medicine;
  packs: number;
  costPerPack: number;
};

// --- UPDATED ENTERPRISE STAFF TYPES ---
export interface Staff {
  id: string;
  name: string;
  role: 'Super Admin' | 'Admin' | 'Manager' | 'Cashier';
  phone: string | null;
  cnic: string | null;      // NEW
  shift: string | null;     // NEW
  email: string | null;     // NEW
  status: 'Active' | 'Inactive';
  created_at: string;
}

export interface StaffActivity {
  id: string;
  staff_id: string;
  type: 'Login' | 'Logout' | 'LeaveRequest' | 'Attendance';
  status: string;
  details: string | null;
  created_at: string;
}