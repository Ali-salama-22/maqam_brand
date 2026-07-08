"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabaseBrowser";
import { PlusCircle, Image as ImageIcon, Trash2, Check, RefreshCw, AlertTriangle, X } from "lucide-react";

type Category = { id: string; name: string };
type Product = { id: string; name: string; price: number; image_url: string };

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
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: "rgba(28,28,28,0.40)", backdropFilter: "blur(6px)" }}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-8 relative"
        style={{
          background: "#FFFFFF",
          border: "1px solid rgba(28,28,28,0.08)",
          boxShadow: "0 16px 48px rgba(28,28,28,0.14)",
        }}
      >
        <button
          onClick={onCancel}
          className="absolute top-4 left-4 p-1 rounded-lg transition-colors hover:bg-gray-100"
          style={{ color: "rgba(28,28,28,0.5)" }}
        >
          <X size={18} />
        </button>
        <div className="flex flex-col items-center text-center gap-4">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{ background: "rgba(239,68,68,0.10)" }}
          >
            <AlertTriangle size={28} style={{ color: "#ef4444" }} />
          </div>
          <p className="font-bold text-lg" style={{ color: "#1C1C1C" }}>
            {message}
          </p>
          <p className="text-sm" style={{ color: "rgba(28,28,28,0.50)" }}>
            لا يمكن التراجع عن هذا الإجراء الإداري.
          </p>
          <div className="flex gap-3 w-full pt-2">
            <button
              onClick={onCancel}
              className="flex-1 py-3 rounded-xl font-bold transition-all"
              style={{ background: "#F5F5F5", color: "#1C1C1C", border: "1px solid rgba(28,28,28,0.08)" }}
            >
              إلغاء
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-3 rounded-xl font-bold transition-all text-white"
              style={{ background: "#ef4444" }}
            >
              تأكيد الحذف
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductManager() {
  const supabase = createClient();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState("");
  const [wholesalePrice, setWholesalePrice] = useState("");
  const [oldPrice, setOldPrice] = useState("");
  const [catId, setCatId] = useState("");
  const [sizes, setSizes] = useState<string[]>([]);
  const [newSize, setNewSize] = useState("");
  const [stockCount, setStockCount] = useState("");
  const [variants, setVariants] = useState<{hex: string, name?: string, files: File[], sizes_stock: Record<string, number>}[]>([]);
  const [currentColor, setCurrentColor] = useState("#000000");
  const [currentColorName, setCurrentColorName] = useState("");
  const [isOffer, setIsOffer] = useState(false);
  const [isNeonOffer, setIsNeonOffer] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: cData } = await supabase.from("categories").select("id, name");
    if (cData) setCategories(cData);
    
    const { data: pData } = await supabase.from("products").select("id, name, price, image_url").order("created_at", { ascending: false });
    if (pData) setProducts(pData);
  };

  const handleAddSize = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newSize.trim()) {
      e.preventDefault();
      if (!sizes.includes(newSize.trim())) {
        setSizes([...sizes, newSize.trim()]);
      }
      setNewSize("");
    }
  };

  const removeSize = (s: string) => setSizes(sizes.filter(x => x !== s));

  const addVariant = () => {
    if (!variants.find(v => v.hex === currentColor)) {
      const defaultStock: Record<string, number> = {};
      sizes.forEach(s => { defaultStock[s] = 0; });
      setVariants([...variants, { hex: currentColor, name: currentColorName.trim() || undefined, files: [], sizes_stock: defaultStock }]);
      setCurrentColorName("");
    }
  };

  const updateVariantSizeStock = (hex: string, size: string, stock: number) => {
    setVariants(variants.map(v => v.hex === hex ? { ...v, sizes_stock: { ...v.sizes_stock, [size]: stock } } : v));
  };

  const updateVariantFiles = (hex: string, newFiles: FileList | null) => {
    if (!newFiles) return;
    setVariants(variants.map(v => v.hex === hex ? { ...v, files: [...v.files, ...Array.from(newFiles)] } : v));
  };

  const removeVariantFile = (hex: string, index: number) => {
    setVariants(variants.map(v => v.hex === hex ? { ...v, files: v.files.filter((_, i) => i !== index) } : v));
  };

  const removeVariant = (hex: string) => {
    setVariants(variants.filter(v => v.hex !== hex));
  };

  const generateSlug = (text: string) => {
    const clean = text
      .trim()
      .replace(/[^\p{L}\p{N}\s-]/gu, '')
      .toLowerCase()
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return clean || `product-${Date.now()}`;
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !price || !wholesalePrice || !catId || sizes.length === 0) {
       return alert("يرجى ملء الحقول الأساسية (الاسم، السعر، سعر الجملة، المقاسات، والقسم)");
    }
    
    setLoading(true);
    try {
      let firstImageUrl = null;
      const uploadedVariants = [];

      for (const variant of variants) {
        const imageUrls = [];
        for (const file of variant.files) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
          const { error: uploadError } = await supabase.storage.from("maqam-assets").upload(`products/${fileName}`, file);
          
          if (!uploadError) {
            const { data: publicUrlData } = supabase.storage.from("maqam-assets").getPublicUrl(`products/${fileName}`);
            imageUrls.push(publicUrlData.publicUrl);
            if (!firstImageUrl) firstImageUrl = publicUrlData.publicUrl;
          } else {
            console.error("Upload error:", uploadError);
            throw new Error(`فشل في رفع صورة اللون ${variant.hex}: ${uploadError.message}`);
          }
        }
        uploadedVariants.push({ hex: variant.hex, name: variant.name || null, images: imageUrls, sizes_stock: variant.sizes_stock });
      }

      // Calculate total stock from all variants
      const totalStock = uploadedVariants.reduce((sum, v) => {
        return sum + Object.values(v.sizes_stock || {}).reduce((s: number, n: any) => s + (Number(n) || 0), 0);
      }, 0);

      const { error } = await supabase.from("products").insert({
        name,
        description: desc,
        price: Number(price),
        wholesale_price: Number(wholesalePrice),
        old_price: oldPrice ? Number(oldPrice) : null,
        stock_count: totalStock,
        sizes,
        colors: variants.map(v => v.hex),
        variants: uploadedVariants,
        image_url: firstImageUrl,
        category_id: catId,
        is_offer: isOffer,
        is_new_collection: false,
        is_neon_offer: isNeonOffer,
        slug: generateSlug(name)
      });

      if (error) throw error;

      alert("تم إضافة المنتج بنجاح إلى أرشيف مقام!");
      fetchData();
      setName(""); setDesc(""); setPrice(""); setWholesalePrice(""); setOldPrice(""); setStockCount(""); setSizes([]); setVariants([]);
      setIsOffer(false); setIsNeonOffer(false);
    } catch (err: any) {
      alert("حدث خطأ أثناء إضافة المنتج: " + (err?.message || "خطأ غير معروف"));
    } finally {
      setLoading(false);
    }
  };

  const requestDeleteProduct = (id: string) => {
    setConfirmTarget(id);
  };

  const confirmDelete = async () => {
    if (!confirmTarget) return;
    try {
      const { error } = await supabase.from("products").delete().eq("id", confirmTarget);
      if (error) throw error;
      fetchData();
    } catch (err: any) {
      alert("حدث خطأ أثناء الحذف: " + (err?.message || "خطأ غير معروف"));
    } finally {
      setConfirmTarget(null);
    }
  };

  return (
    <>
      {confirmTarget && (
        <ConfirmModal
          message="هل أنت متأكد من حذف هذا المنتج نهائياً؟"
          onConfirm={confirmDelete}
          onCancel={() => setConfirmTarget(null)}
        />
      )}
      <div className="space-y-10 pb-20">

      {/* Form Section */}
      <div className="bg-brand-card p-10 rounded-3xl shadow-sm border border-brand-border">
        <h3 className="text-3xl font-black text-brand-text mb-10 flex items-center gap-3 italic uppercase tracking-tighter">
          <PlusCircle className="text-brand-accent" size={32} /> إضافة مقتنى جديد
        </h3>

        <form onSubmit={handleAddProduct} className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-brand-text/40 uppercase tracking-[0.4em]">مسمى المقتنى</label>
              <input 
                value={name} 
                onChange={e => setName(e.target.value)} 
                required 
                type="text" 
                placeholder="أدخل اسم المنتج..."
                className="w-full bg-brand-bg/50 border-2 border-brand-border rounded-2xl p-5 text-brand-text font-black uppercase tracking-widest outline-none focus:border-brand-accent transition-all shadow-inner" 
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-brand-text/40 uppercase tracking-[0.4em]">التفاصيل والقصة</label>
              <textarea 
                value={desc} 
                onChange={e => setDesc(e.target.value)} 
                required 
                rows={4} 
                placeholder="وصف الخامات والخصائص الإبداعية..."
                className="w-full bg-brand-bg/50 border-2 border-brand-border rounded-2xl p-5 text-brand-text font-black uppercase tracking-widest outline-none focus:border-brand-accent transition-all shadow-inner resize-none" 
              />
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-brand-text/40 uppercase tracking-[0.4em]">سعر البيع (ج.م)</label>
                <input 
                  value={price} 
                  onChange={e => setPrice(e.target.value)} 
                  required 
                  type="number" 
                  className="w-full bg-brand-bg/50 border-2 border-brand-border rounded-2xl p-5 text-brand-text font-black outline-none focus:border-brand-accent transition-all shadow-inner" 
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black text-brand-text/40 uppercase tracking-[0.4em]">سعر الجملة (ج.م)</label>
                <input 
                  value={wholesalePrice} 
                  onChange={e => setWholesalePrice(e.target.value)} 
                  required 
                  type="number" 
                  className="w-full bg-brand-bg/50 border-2 border-brand-border rounded-2xl p-5 text-brand-text font-black outline-none focus:border-brand-accent transition-all shadow-inner" 
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black text-brand-text/40 uppercase tracking-[0.4em]">المخزون (تلقائي)</label>
                <div className="w-full bg-brand-bg/50 border-2 border-brand-border rounded-2xl p-5 text-brand-text/50 font-black">
                  {variants.reduce((sum, v) => sum + Object.values(v.sizes_stock).reduce((s, n) => s + (Number(n) || 0), 0), 0)} قطعة
                </div>
              </div>

                <div className="space-y-2 animate-in fade-in slide-in-from-right-4">
                  <label className="block text-[10px] font-black text-brand-text/40 uppercase tracking-[0.4em]">القسم</label>
                  <select 
                    value={catId} 
                    onChange={e => setCatId(e.target.value)} 
                    required 
                    className="w-full bg-brand-bg/50 border-2 border-brand-border rounded-2xl p-5 text-brand-text font-black outline-none focus:border-brand-accent transition-all shadow-inner appearance-none"
                  >
                    <option value="">اختر القسم...</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
            </div>

            <div className="flex flex-wrap gap-8 pt-8 border-t border-brand-border">

              
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input type="checkbox" checked={isOffer} onChange={e => setIsOffer(e.target.checked)} className="peer w-6 h-6 opacity-0 absolute cursor-pointer" />
                  <div className="w-6 h-6 border-2 border-brand-border rounded-lg bg-brand-bg peer-checked:bg-red-500 peer-checked:border-red-500 transition-all" />
                  <Check className="absolute text-white w-4 h-4 opacity-0 peer-checked:opacity-100 transition-opacity" />
                </div>
                <span className="text-xs font-black text-red-500 uppercase tracking-widest">عرض خاص</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input type="checkbox" checked={isNeonOffer} onChange={e => setIsNeonOffer(e.target.checked)} className="peer w-6 h-6 opacity-0 absolute cursor-pointer" />
                  <div className="w-6 h-6 border-2 border-brand-border rounded-lg bg-brand-bg peer-checked:bg-brand-accent peer-checked:border-brand-accent transition-all" />
                  <Check className="absolute text-brand-card w-4 h-4 opacity-0 peer-checked:opacity-100 transition-opacity" />
                </div>
                <span className="text-xs font-black text-brand-accent uppercase tracking-widest">شارة نيون</span>
              </label>
            </div>

            {isOffer && (
              <div className="animate-in fade-in slide-in-from-top-4 mt-6 bg-red-500/5 p-6 rounded-2xl border-2 border-red-500/10">
                <label className="block text-[10px] font-black text-red-500 mb-3 uppercase tracking-[0.4em]">السعر قبل العرض (يظهر مشطوباً)</label>
                <input 
                  value={oldPrice} 
                  onChange={e => setOldPrice(e.target.value)} 
                  type="number" 
                  className="w-full bg-brand-card border-2 border-red-500/20 rounded-2xl p-5 text-red-500 font-black outline-none focus:border-red-500 transition-all" 
                  placeholder="0.00" 
                />
              </div>
            )}

            {/* Premium Color Picker & Variant Uploads */}
            <div className="pt-10 border-t border-brand-border mt-10">
               <label className="block text-[10px] font-black text-brand-text/40 mb-6 uppercase tracking-[0.4em]">إدارة ألوان وموديلات الصور (Variants)</label>
               <div className="flex items-center gap-6 mb-10">
                  <input 
                    type="color" 
                    value={currentColor} 
                    onChange={e => setCurrentColor(e.target.value)}
                    className="w-16 h-16 rounded-2xl cursor-pointer border-0 p-0 overflow-hidden shadow-2xl bg-brand-bg shrink-0"
                  />
                  <input 
                    type="text" 
                    value={currentColorName} 
                    onChange={e => setCurrentColorName(e.target.value)}
                    placeholder="اسم اللون (مثال: أسود، أبيض)"
                    className="flex-1 bg-brand-card border-2 border-brand-border rounded-2xl p-4 font-black outline-none focus:border-brand-accent transition-all text-sm"
                  />
                  <button 
                    type="button" 
                    onClick={addVariant}
                    className="btn-melt px-8 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform"
                  >
                    تثبيت اللون المختار
                  </button>
               </div>
               
               <div className="grid grid-cols-1 gap-8">
                  {variants.map(variant => (
                    <div key={variant.hex} className="bg-brand-bg/30 p-8 rounded-[2.5rem] border-2 border-brand-border relative group overflow-hidden">
                       <div className="absolute top-0 right-0 w-32 h-32 bg-brand-accent/5 rounded-full blur-3xl -mr-16 -mt-16" />
                       
                       <button 
                         type="button" 
                         onClick={() => removeVariant(variant.hex)}
                         className="absolute top-6 left-6 text-red-500 hover:bg-red-500/10 p-3 rounded-2xl transition-all opacity-0 group-hover:opacity-100"
                       >
                         <Trash2 size={24} />
                       </button>

                       <div className="flex flex-col gap-8 relative z-10">
                          <div className="flex items-center gap-5">
                             <div className="w-12 h-12 rounded-full border-4 border-brand-card shadow-2xl" style={{ backgroundColor: variant.hex }} />
                             <span className="font-black text-brand-text uppercase tracking-widest text-lg">
                                {variant.name ? `${variant.name} (${variant.hex})` : variant.hex}
                             </span>
                          </div>
                          
                          <div className="relative border-4 border-dashed border-brand-border rounded-3xl p-10 hover:border-brand-accent/50 hover:bg-brand-card transition-all text-center cursor-pointer overflow-hidden group/drop shadow-inner">
                            <input type="file" multiple accept="image/*" onChange={(e) => updateVariantFiles(variant.hex, e.target.files)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                            <div className="flex flex-col items-center justify-center text-brand-text/30 space-y-4 pointer-events-none group-hover/drop:scale-110 transition-transform">
                              <ImageIcon size={48} className="opacity-10" />
                              <span className="font-black text-xs uppercase tracking-[0.3em]">رفع كتالوج الصور لهذا اللون</span>
                            </div>
                          </div>

                          {variant.files.length > 0 && (
                            <div className="flex flex-wrap gap-3">
                              {variant.files.map((file, idx) => (
                                <div key={idx} className="bg-brand-card border-2 border-brand-border text-brand-text text-[9px] font-black px-4 py-2 rounded-full flex items-center gap-3 shadow-sm">
                                  <span className="truncate max-w-[150px]">{file.name}</span>
                                  <button type="button" onClick={() => removeVariantFile(variant.hex, idx)} className="text-red-500 hover:scale-125 transition-transform font-black">✕</button>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Per-Size Stock for this Color */}
                          {sizes.length > 0 && (
                            <div className="mt-4 pt-6 border-t border-brand-border">
                              <label className="block text-[10px] font-black text-brand-text/40 mb-4 uppercase tracking-[0.4em]">مخزون المقاسات لهذا اللون</label>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {sizes.map(size => (
                                  <div key={size} className="flex items-center gap-3 bg-brand-card border border-brand-border rounded-xl p-3">
                                    <span className="text-xs font-black text-brand-text uppercase min-w-[40px]">{size}</span>
                                    <input 
                                      type="number" 
                                      min={0} 
                                      value={variant.sizes_stock[size] || 0} 
                                      onChange={e => updateVariantSizeStock(variant.hex, size, Number(e.target.value))} 
                                      className="w-full bg-brand-bg border border-brand-border rounded-lg p-2 text-center text-brand-text font-black text-sm outline-none focus:border-brand-accent"
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>

          <div className="space-y-10">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-brand-text/40 mb-4 uppercase tracking-[0.4em]">المقاسات المتاحة (اكتب واضغط Enter)</label>
              <input 
                value={newSize} 
                onChange={e => setNewSize(e.target.value)} 
                onKeyDown={handleAddSize} 
                type="text" 
                placeholder="مثال: OVERSIZED L" 
                className="w-full bg-brand-bg/50 border-2 border-brand-border rounded-2xl p-5 text-brand-text font-black outline-none focus:border-brand-accent transition-all shadow-inner mb-6 uppercase" 
              />
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4" dir="ltr">
                {sizes.map(s => (
                  <div key={s} className="px-5 py-4 rounded-2xl font-black bg-brand-card text-brand-text border-2 border-brand-border flex items-center justify-between shadow-sm group hover:border-brand-accent/30 transition-all">
                    <span className="tracking-widest uppercase text-sm">{s}</span>
                    <button type="button" onClick={() => removeSize(s)} className="text-red-500 opacity-0 group-hover:opacity-100 hover:scale-125 transition-all">✕</button>
                  </div>
                ))}
                {sizes.length === 0 && <span className="col-span-full text-xs text-brand-text/10 italic font-black uppercase tracking-[0.4em] py-10 text-center border-2 border-dashed border-brand-border rounded-3xl">سجل المقاسات فارغ</span>}
              </div>
            </div>

            <div className="bg-brand-accent/5 p-10 rounded-[2.5rem] border-2 border-brand-accent/10 border-t-8 border-t-brand-accent relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-accent/10 rounded-full blur-3xl -mr-16 -mt-16" />
              <h4 className="font-black text-brand-text mb-5 uppercase tracking-[0.2em] text-sm flex items-center gap-3 relative z-10">
                <AlertTriangle size={24} className="text-brand-accent animate-pulse" /> ملحوظة تقنية
              </h4>
              <p className="text-xs text-brand-text/50 leading-relaxed font-black uppercase tracking-widest relative z-10">
                 يجب رفع صورتين على الأقل لكل لون لضمان عمل "Carousel" الصور بشكل احترافي في واجهة العميل. الصور الكبيرة تعطي انطباعاً أكثر فخامة.
              </p>
            </div>

            <button type="submit" disabled={loading} className="w-full btn-melt py-8 rounded-[2rem] font-black uppercase tracking-[0.4em] text-xl shadow-[0_20px_50px_rgba(120,144,156,0.3)] hover:-translate-y-2 active:translate-y-0 transition-all flex items-center justify-center gap-5 group">
              {loading ? <RefreshCw className="animate-spin" size={32} /> : <><PlusCircle size={32} className="group-hover:rotate-90 transition-transform duration-500" /> أرشفة المنتج في مقام</>}
            </button>
          </div>
        </form>
      </div>

      {/* Grid List */}
      <div className="pt-20">
        <div className="flex justify-between items-end mb-12 border-b-2 border-brand-border pb-8">
          <div>
            <h3 className="text-5xl font-black text-brand-text uppercase tracking-tighter italic">المخزون النشط</h3>
            <p className="text-[10px] text-brand-text/30 font-black uppercase tracking-[0.5em] mt-2">Inventory Ledger ({products.length} Mapped Items)</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map(p => (
            <div key={p.id} className="bg-brand-card border-2 border-brand-border p-6 rounded-[2.5rem] flex flex-col gap-5 shadow-sm hover:border-brand-accent/40 transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-accent/5 rounded-full blur-3xl -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="flex items-center gap-5 relative z-10">
                <div className="w-20 h-20 bg-brand-bg rounded-3xl overflow-hidden bg-center bg-cover border-2 border-brand-border group-hover:scale-110 transition-all duration-700 shadow-inner" style={{ backgroundImage: `url(${p.image_url})` }} />
                <div className="flex flex-col flex-1 truncate">
                  <p className="font-black text-brand-text truncate text-xl mb-1 uppercase italic tracking-tighter">{p.name}</p>
                  <p className="font-black text-brand-accent text-sm tracking-widest">{p.price} ج.م</p>
                </div>
                <button
                  onClick={() => requestDeleteProduct(p.id)}
                  type="button"
                  className="text-brand-text/10 hover:text-red-500 p-3 rounded-2xl hover:bg-red-500/10 transition-all"
                >
                  <Trash2 size={24} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      </div>
    </>
  );
}
