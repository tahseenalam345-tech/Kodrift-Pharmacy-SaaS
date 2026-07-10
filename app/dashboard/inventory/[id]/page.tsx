import { createServer } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { 
  ArrowLeft, Building2, Tag, Beaker, 
  Pill, Droplet, Syringe, Bandage, FlaskConical, Package 
} from "lucide-react";
import Link from "next/link";
import { EditMedicineForm } from "./edit-form";

export default async function MedicineDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServer();

  const { data: medicine } = await supabase
    .from("medicines")
    .select("*")
    .eq("id", id)
    .single();

  if (!medicine) {
    return notFound();
  }

  // NAYA FUNCTION: Dynamic Icon Generator for the background
  const getCategoryIcon = (category: string | undefined | null, size: number = 24) => {
    switch (category) {
      case 'Tablet':
      case 'Capsule':
        return <Pill className="text-teal" size={size} strokeWidth={1.5} />;
      case 'Syrup':
      case 'Drops':
        return <Droplet className="text-terracotta" size={size} strokeWidth={1.5} />;
      case 'Injection':
        return <Syringe className="text-teal" size={size} strokeWidth={1.5} />;
      case 'Cream':
      case 'Cosmetics':
        return <FlaskConical className="text-terracotta-hover" size={size} strokeWidth={1.5} />;
      case 'Surgicals':
        return <Bandage className="text-teal" size={size} strokeWidth={1.5} />;
      default:
        return <Package className="text-ink-mute" size={size} strokeWidth={1.5} />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      
      {/* HEADER SECTION */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/inventory" className="p-2 bg-white border border-border rounded-xl text-ink-mute hover:text-teal hover:border-teal transition-colors shadow-sm">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-heading font-bold text-teal flex items-center gap-3">
            Item Management
          </h1>
          <p className="text-ink-dim text-sm">Update details, pricing, and master stock levels.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* LEFT SIDE: Information Card (Using Vector Icon as Background) */}
        <div className="bg-white border border-border rounded-3xl p-6 flex flex-col relative overflow-hidden shadow-sm">
          
          {/* Faded Background Icon (Replaced Image) */}
          <div className="absolute -top-6 -right-6 opacity-[0.05] pointer-events-none z-0">
             {getCategoryIcon(medicine.category, 180)}
          </div>

          <div className="flex-1 relative z-10">
            <span className="px-3 py-1 bg-teal-soft rounded-full border border-teal/20 text-[10px] text-teal font-bold uppercase tracking-wider mb-4 inline-flex items-center gap-1.5">
              {getCategoryIcon(medicine.category, 12)}
              {medicine.category || "General"}
            </span>
            <h2 className="text-3xl font-heading font-extrabold text-ink mb-1">{medicine.name}</h2>
            <p className="text-lg text-terracotta-hover font-bold mb-6">{medicine.potency || "No Potency"}</p>

            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-3 text-ink-dim">
                <Building2 size={16} className="text-ink-mute" />
                <span className="font-bold text-ink-mute w-20">Brand:</span>
                <span className="font-medium text-ink">{medicine.brand || "-"}</span>
              </div>
              <div className="flex items-center gap-3 text-ink-dim">
                <Beaker size={16} className="text-ink-mute" />
                <span className="font-bold text-ink-mute w-20">Formula:</span>
                <span className="font-medium text-ink">{medicine.formula || "-"}</span>
              </div>
              <div className="flex items-center gap-3 text-ink-dim">
                <Tag size={16} className="text-ink-mute" />
                <span className="font-bold text-ink-mute w-20">Price:</span>
                <span className="font-bold text-teal">Rs {medicine.sale_price}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-border relative z-10">
            <p className="text-xs font-bold text-ink-mute uppercase tracking-wider mb-2">Current Stock Level</p>
            <div className="flex items-baseline gap-2">
              <span className={`text-5xl font-heading font-extrabold ${medicine.stock < 10 ? 'text-red-600' : 'text-teal'}`}>
                {medicine.stock}
              </span>
              <span className="text-ink-dim font-medium">units available</span>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: The Master Edit Form */}
        <div>
          <EditMedicineForm medicine={medicine} />
        </div>

      </div>
    </div>
  );
}