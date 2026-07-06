"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabaseBrowser";
import { Layers, Image as ImageIcon, Trash2, Check, Rss, Save, AlertTriangle, X, RefreshCw } from "lucide-react";

type Category = { id: string; name: string; image_url: string };

/* ── Inline Confirmation Modal ── */
function ConfirmModal({
  message,
  onConfirm,
  onCancel,
}: {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-brand-bg/60 backdrop-blur-md"
    >
      <div
        className="w-full max-w-sm rounded-[2.5rem] p-10 relative bg-brand-card border border-brand-border shadow-3xl overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl -mr-16 -mt-16" />
        
        <button
          onClick={onCancel}
          className="absolute top-6 left-6 p-2 rounded-2xl transition-all hover:bg-brand-bg text-brand-text/50"
        >
          <X size={24} />
        </button>

        <div className="flex flex-col items-center text-center gap-6 pt-4">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center bg-red-500/10 shadow-inner"
          >
            <AlertTriangle size={40} className="text-red-500 animate-pulse" />
          </div>
          <p className="font-black text-2xl text-brand-text leading-tight uppercase italic tracking-tighter">
            {message}
          </p>
          <p className="text-xs text-brand-text/40 font-black uppercase tracking-[0.4em]">
            لا يمكن التراجع عن هذا الإجراء الإداري المحمي.
          </p>
          <div className="flex gap-4 w-full pt-6">
            <button
              onClick={onCancel}
              className="flex-1 py-5 rounded-2xl font-black transition-all bg-brand-bg text-brand-text border-2 border-brand-border hover:bg-brand-bg/80 uppercase tracking-widest text-xs"
            >
              إلغاء
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-5 rounded-2xl font-black transition-all text-white bg-red-500 hover:bg-red-600 shadow-2xl shadow-red-500/30 uppercase tracking-widest text-xs"
            >
              تأكيد السحب
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CategoryManager() {
  const supabase = createClient();
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [bannerText, setBannerText] = useState("");
  const [signatureTextContent, setSignatureTextContent] = useState("");
  const [displayType, setDisplayType] = useState("");
  const [bannerLoading, setBannerLoading] = useState(false);

  // Confirm modal state
  const [confirmTarget, setConfirmTarget] = useState<{ id: string; name: string } | null>(null);

  const fetchData = async () => {
    const { data: cData } = await supabase.from("categories").select("*");
    if (cData) setCategories(cData);

    const { data: bData } = await supabase.from("store_settings").select("banner_text").eq("id", 1).single();
    if (bData) {
      let currentMain = bData.banner_text || "";
      let currentSig = bData.banner_text || "";
      try {
        const parsed = JSON.parse(bData.banner_text);
        currentMain = parsed.main || "";
        currentSig = parsed.signature || "";
      } catch (e) {}
      setBannerText(currentMain);
      setSignatureTextContent(currentSig);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const generateSlug = (text: string) => {
    const clean = text
      .trim()
      .replace(/[^\p{L}\p{N}\s-]/gu, "")
      .toLowerCase()
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
    return clean || `category-${Date.now()}`;
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return alert("يرجى إدخال اسم القسم");

    setLoading(true);
    let imageUrl = null;

    if (file) {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("maqam-assets")
        .upload(`categories/${fileName}`, file);

      if (uploadError) {
        alert("فشل رفع الصورة: " + uploadError.message);
        setLoading(false);
        return;
      }

      const { data } = supabase.storage.from("maqam-assets").getPublicUrl(`categories/${fileName}`);
      imageUrl = data.publicUrl;
    }

    const { error } = await supabase.from("categories").insert({
      name,
      image_url: imageUrl,
      slug: generateSlug(name),
      display_type: displayType,
    });

    if (error) {
      alert("خطأ إداري: " + error.message);
    } else {
      alert("تم تسجيل القسم الجديد بنجاح!");
      setName("");
      setFile(null);
      fetchData();
    }
    setLoading(false);
  };

  const requestDelete = (id: string, catName: string) => {
    const protectedNames = ["الكولكشن الجديد", "العروض", "NEW COLLECTION", "OFFERS"];
    if (protectedNames.includes(catName.toUpperCase()) || protectedNames.includes(catName)) {
      alert("لا يمكن حذف الأقسام الأساسية المرتبطة بواجهة مقام.");
      return;
    }
    setConfirmTarget({ id, name: catName });
  };

  const confirmDelete = async () => {
    if (!confirmTarget) return;
    const { error } = await supabase.from("categories").delete().eq("id", confirmTarget.id);
    if (error) alert("خطأ أثناء الحذف: " + error.message);
    setConfirmTarget(null);
    fetchData();
  };

  const handleSaveBanner = async () => {
    setBannerLoading(true);
    const payload = JSON.stringify({ main: bannerText, signature: signatureTextContent });
    const { error } = await supabase.from("store_settings").update({ banner_text: payload }).eq("id", 1);
    if (error) alert("خطأ إداري: " + error.message);
    else alert("تم تحديث تذييل الموقع بنجاح!");
    setBannerLoading(false);
  };

  return (
    <>
      {/* Custom Confirm Modal */}
      {confirmTarget && (
        <ConfirmModal
          message={`هل أنت متأكد من حذف قسم "${confirmTarget.name}"؟`}
          onConfirm={confirmDelete}
          onCancel={() => setConfirmTarget(null)}
        />
      )}

      <div className="space-y-12 pb-20">
        {/* Footer Management */}
        <div className="bg-brand-card border border-brand-border p-10 rounded-[2.5rem] shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-48 h-48 bg-brand-accent/5 rounded-full blur-3xl -mr-24 -mt-24" />
          
          <h3 className="text-3xl font-black text-brand-text mb-6 flex items-center gap-3 italic uppercase tracking-tighter">
            <Rss className="text-brand-accent" size={32} /> تذييل الموقع (Footer)
          </h3>
          <p className="text-[10px] text-brand-text/30 mb-8 font-black uppercase tracking-[0.4em]">هذه العبارة ستظهر في أسفل كل صفحات الموقع الإبداعية:</p>

          <div className="flex flex-col lg:flex-row gap-6">
            <input
              value={bannerText}
              onChange={(e) => setBannerText(e.target.value)}
              placeholder="مثال: صنع بشغف بواسطة مقام..."
              className="flex-1 bg-brand-bg/50 border-2 border-brand-border rounded-2xl p-6 text-brand-text font-black focus:border-brand-accent outline-none text-2xl placeholder:opacity-10 shadow-inner"
            />
            <button
              onClick={handleSaveBanner}
              disabled={bannerLoading}
              className="btn-melt px-12 rounded-2xl font-black flex items-center justify-center gap-3 transition-all whitespace-nowrap min-h-[70px] uppercase tracking-widest text-sm shadow-xl"
            >
              {bannerLoading ? <RefreshCw className="animate-spin" /> : <Save size={24} />}
              {bannerLoading ? "جاري الحفظ..." : "تحديث الرسالة"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
          {/* Category Form */}
          <div className="bg-brand-card p-10 rounded-[2.5rem] shadow-sm border border-brand-border relative overflow-hidden">
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand-accent/5 rounded-full blur-3xl -ml-24 -mb-24" />
            
            <h3 className="text-3xl font-black text-brand-text mb-10 flex items-center gap-3 italic uppercase tracking-tighter leading-none">
              <Layers className="text-brand-accent" size={32} /> تسجيل تصنيف جديد
            </h3>

            <form onSubmit={handleAddCategory} className="space-y-8">
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-brand-text/40 uppercase tracking-[0.4em] mb-2">مسمى القسم الإداري</label>
                <input
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                  type="text" 
                  placeholder="مثال: تيشرتات أوفر سايز..." 
                  className="w-full bg-brand-bg/50 border-2 border-brand-border rounded-2xl p-6 text-brand-text font-black uppercase tracking-widest outline-none focus:border-brand-accent transition-all shadow-inner" 
                />
                <div className="mt-4">
                  <label className="block text-[10px] font-black text-brand-text/40 uppercase tracking-[0.4em] mb-2">نوع العرض على الصفحة الرئيسية</label>
                  <select
                    value={displayType}
                    onChange={e => setDisplayType(e.target.value)}
                    required
                    className="w-full bg-brand-bg/50 border-2 border-brand-border rounded-2xl p-6 text-brand-text font-black uppercase tracking-widest outline-none focus:border-brand-accent transition-all shadow-inner"
                  >
                    <option value="">اختر نوع العرض</option>
                    <option value="circular">أيقونة دائرية (قائمة رئيسية)</option>
                    <option value="showcase">عرض مستطيل (معرض)</option>
                  </select>
                </div>
              </div>

              <div className="relative border-4 border-dashed border-brand-border rounded-[2rem] p-10 hover:border-brand-accent/50 hover:bg-brand-bg transition-all text-center cursor-pointer group shadow-inner">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="flex flex-col items-center justify-center text-brand-text/30 space-y-4 pointer-events-none group-hover:scale-110 transition-transform">
                  {file ? (
                    <span className="font-black text-brand-accent flex items-center gap-3 bg-brand-accent/5 px-6 py-3 rounded-full border-2 border-brand-accent/20">
                      <Check className="text-brand-accent" size={24} /> {file.name}
                    </span>
                  ) : (
                    <>
                      <ImageIcon size={48} className="opacity-10" />
                      <span className="font-black uppercase tracking-[0.4em] text-xs">ارفع أيقونة القسم الدائرية</span>
                    </>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-melt py-6 rounded-[2rem] font-black uppercase tracking-[0.4em] transition-all text-xl shadow-2xl hover:-translate-y-1 active:translate-y-0"
              >
                {loading ? <RefreshCw className="animate-spin mx-auto" /> : "أرشفة القسم في النظام"}
              </button>
            </form>
          </div>

          {/* Categories List */}
          <div className="bg-brand-card p-10 rounded-[2.5rem] shadow-sm border border-brand-border relative overflow-hidden">
            <h3 className="text-[10px] font-black text-brand-text/20 uppercase tracking-[0.5em] mb-10 pb-6 border-b-2 border-brand-border">الأقسام المسجلة في قاعدة البيانات</h3>
            <div className="space-y-6 max-h-[600px] overflow-y-auto pr-4 scrollbar-hide">
              {categories.map((cat) => {
                const protectedNames = ["الكولكشن الجديد", "العروض", "NEW COLLECTION", "OFFERS"];
                const isProtected = protectedNames.includes(cat.name.toUpperCase()) || protectedNames.includes(cat.name);
                return (
                  <div
                    key={cat.id}
                    className="flex justify-between items-center p-6 bg-brand-bg/40 rounded-[2rem] border-2 border-brand-border hover:border-brand-accent/40 transition-all group relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-accent/5 rounded-full blur-3xl -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="flex items-center gap-6 relative z-10">
                      <div
                        className="w-16 h-16 rounded-full bg-brand-bg border-2 border-brand-border bg-cover bg-center overflow-hidden shadow-2xl group-hover:scale-110 transition-all duration-700"
                        style={{ backgroundImage: `url(${cat.image_url})` }}
                      >
                        {!cat.image_url && (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon size={24} className="text-brand-text/10" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-black text-brand-text text-xl uppercase italic tracking-tighter leading-none">{cat.name}</span>
                        {isProtected && (
                          <span className="text-[9px] font-black text-brand-accent uppercase tracking-[0.3em] mt-2 bg-brand-accent/5 px-3 py-1 rounded-full border border-brand-accent/20 w-max">
                             Core Department
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => requestDelete(cat.id, cat.name)}
                      disabled={isProtected}
                      className={`p-4 rounded-2xl transition-all relative z-10 ${
                        isProtected
                          ? "opacity-5 cursor-not-allowed text-brand-text"
                          : "text-red-500 hover:bg-red-500/10 hover:scale-110"
                      }`}
                    >
                      <Trash2 size={28} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
