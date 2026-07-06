"use client";

import { useState, useEffect } from "react";
import { User, Phone, MapPin, Save, RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabaseBrowser";

export default function ProfileForm() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (data.user) {
        setUserId(data.user.id);
        // Ensure you have a profiles table or use the metadata
        const { data: pData } = await supabase.from("profiles").select("*").eq("id", data.user.id).single();
        if (pData) {
          setFormData({
            name: pData.full_name || "",
            phone: pData.phone || "",
            address: pData.address || ""
          });
        }
      }
      setLoading(false);
    });
  }, [supabase]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").upsert({
      id: userId,
      full_name: formData.name,
      phone: formData.phone,
      address: formData.address,
      updated_at: new Date().toISOString()
    });
    setSaving(false);
    if (error) {
      alert("حدث خطأ أثناء الحفظ: " + error.message);
    } else {
      alert("تم حفظ بياناتك بنجاح!");
    }
  };

  if (loading) {
    return (
      <div className="bg-brand-ivory border border-brand-pine/10 rounded-2xl p-8 shadow-sm h-full w-full flex items-center justify-center">
         <RefreshCw className="animate-spin text-brand-pine" size={32} />
      </div>
    );
  }

  return (
    <div className="bg-transparent h-full w-full">
      <h2 className="text-3xl font-black text-brand-text mb-10 border-b-2 border-brand-border pb-6 uppercase italic tracking-tighter">
        هوية الملف الشخصي
      </h2>
      
      <form className="space-y-8" onSubmit={handleSave}>
        <div className="space-y-3">
          <label className="text-[10px] font-black text-brand-text/30 flex items-center gap-3 uppercase tracking-[0.4em]">
            <User size={18} className="text-brand-accent" /> اسم العميل
          </label>
          <input 
            type="text" 
            placeholder="أدخل الاسم بالكامل"
            className="w-full bg-brand-bg/50 border-2 border-brand-border rounded-2xl p-5 text-brand-text font-black uppercase tracking-widest focus:outline-none focus:border-brand-text transition-all shadow-inner placeholder:text-brand-text/20"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black text-brand-text/30 flex items-center gap-3 uppercase tracking-[0.4em]">
            <Phone size={18} className="text-brand-accent" /> رقم الهاتف
          </label>
          <input 
            type="text" 
            placeholder="+20 XXXXXXXXXX"
            className="w-full bg-brand-bg/50 border-2 border-brand-border rounded-2xl p-5 text-brand-text font-black uppercase tracking-widest focus:outline-none focus:border-brand-text transition-all shadow-inner placeholder:text-brand-text/10"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            dir="ltr"
          />
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black text-brand-text/30 flex items-center gap-3 uppercase tracking-[0.4em]">
            <MapPin size={18} className="text-brand-accent" /> عنوان الشحن
          </label>
          <textarea 
            rows={3}
            placeholder="المبنى، الشارع، المدينة، الحي..."
            className="w-full bg-brand-bg/50 border-2 border-brand-border rounded-2xl p-5 text-brand-text font-black uppercase tracking-widest focus:outline-none focus:border-brand-text transition-all shadow-inner placeholder:text-brand-text/20 resize-none"
            value={formData.address}
            onChange={(e) => setFormData({...formData, address: e.target.value})}
          />
        </div>
        
        <button 
          disabled={saving} 
          type="submit" 
          className="w-full btn-melt py-6 rounded-2xl font-black uppercase tracking-[0.4em] text-lg flex justify-center items-center gap-4 hover:shadow-[0_0_30px_rgba(120,144,156,0.3)] transition-all mt-8"
        >
          {saving ? <RefreshCw className="animate-spin" size={24} /> : <Save size={24} />}
          {saving ? "جاري المزامنة..." : "تحديث البيانات"}
        </button>

        <button
          type="button"
          onClick={async () => {
            await supabase.auth.signOut();
            window.location.href = '/';
          }}
          className="w-full py-6 rounded-2xl font-black uppercase tracking-[0.4em] text-lg flex justify-center items-center gap-4 border-2 border-red-500/20 text-red-500 hover:bg-red-500/10 transition-all mt-4"
        >
          تسجيل الخروج
        </button>
      </form>
    </div>
  );
}
