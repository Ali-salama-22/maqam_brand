"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabaseBrowser";
import {
  Settings, Save, RefreshCw, Trophy, Image as ImageIcon,
  Video, Link as LinkIcon, Upload, X, ToggleLeft, ToggleRight, Tv2
} from "lucide-react";

export default function StoreSettings() {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [uploadingMedia, setUploadingMedia] = useState(false);

  // Footer / Loyalty
  const [threshold, setThreshold] = useState(5);
  const [discountValue, setDiscountValue] = useState(15);
  const [bannerText, setBannerText] = useState("");
  const [mainTextContent, setMainTextContent] = useState("");

  // Offers / Banner
  const [showOffers, setShowOffers] = useState(true);
  const [bannerMode, setBannerMode] = useState(false);
  const [bannerMediaType, setBannerMediaType] = useState<"image" | "video">("image");
  const [bannerMediaUrl, setBannerMediaUrl] = useState("");
  const [bannerTitle, setBannerTitle] = useState("");
  const [bannerSubtitle, setBannerSubtitle] = useState("");

  const fetchSettings = useCallback(async () => {
    setFetching(true);
    const { data } = await supabase.from("store_settings").select("*").eq("id", 1).single();
    if (data) {
      let currentSig = data.banner_text || "";
      let currentMain = data.banner_text || "";
      try {
        const parsed = JSON.parse(data.banner_text);
        currentSig = parsed.signature || "";
        currentMain = parsed.main || "";
        if (parsed.showOffers !== undefined) setShowOffers(parsed.showOffers);
        if (parsed.bannerMode !== undefined) setBannerMode(parsed.bannerMode);
        if (parsed.bannerMediaType) setBannerMediaType(parsed.bannerMediaType);
        if (parsed.bannerMediaUrl) setBannerMediaUrl(parsed.bannerMediaUrl);
        if (parsed.bannerTitle) setBannerTitle(parsed.bannerTitle);
        if (parsed.bannerSubtitle) setBannerSubtitle(parsed.bannerSubtitle);
      } catch {
        // plain text fallback
      }
      setBannerText(currentSig);
      setMainTextContent(currentMain);
      if (data.loyalty_order_threshold !== undefined) setThreshold(data.loyalty_order_threshold);
      if (data.loyalty_discount_value !== undefined) setDiscountValue(data.loyalty_discount_value);
    }
    setFetching(false);
  }, [supabase]);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const handleSave = async () => {
    setLoading(true);
    const payload = JSON.stringify({
      main: mainTextContent,
      signature: bannerText,
      showOffers,
      bannerMode,
      bannerMediaType,
      bannerMediaUrl,
      bannerTitle,
      bannerSubtitle,
    });

    const { error } = await supabase.from("store_settings").update({
      banner_text: payload,
      loyalty_order_threshold: Number(threshold),
      loyalty_discount_value: Number(discountValue),
      updated_at: new Date().toISOString(),
    }).eq("id", 1);

    if (error) {
      alert("حدث خطأ إداري أثناء الحفظ: " + error.message);
    } else {
      alert("تم تحديث بروتوكولات المتجر بنجاح!");
      fetchSettings();
    }
    setLoading(false);
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingMedia(true);
    const ext = file.name.split(".").pop();
    const filename = `banner/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("maqam-assets")
      .upload(filename, file, { upsert: true });
    if (upErr) {
      alert("فشل رفع الملف: " + upErr.message);
    } else {
      const { data: urlData } = supabase.storage.from("maqam-assets").getPublicUrl(filename);
      setBannerMediaUrl(urlData.publicUrl);
    }
    setUploadingMedia(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (fetching) return (
    <div className="flex justify-center py-32">
      <RefreshCw className="animate-spin text-brand-accent" size={48} />
    </div>
  );

  return (
    <div className="max-w-5xl space-y-12 pb-20">

      {/* ── Card: Footer & General ──────────────────────────────────────── */}
      <div className="bg-brand-card p-10 rounded-[3rem] border border-brand-border relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-accent/10 rounded-full blur-3xl -mr-16 -mt-16" />

        <h3 className="text-3xl font-black text-brand-text mb-10 flex items-center gap-4 italic uppercase tracking-tighter leading-none">
          <Settings size={36} className="text-brand-accent" /> بروتوكولات المتجر العامة
        </h3>

        <div className="space-y-8">
          {/* Footer Signature */}
          <div className="space-y-4">
            <div className="flex flex-col gap-1">
              <label className="block text-[10px] font-black text-brand-text/40 uppercase tracking-[0.5em]">
                توقيع تذييل الموقع (Footer Signature)
              </label>
              <p className="text-xs text-brand-text/20 font-black uppercase tracking-widest">
                العبارة الختامية التي تظهر في أسفل كل صفحة.
              </p>
            </div>
            <input
              value={bannerText}
              onChange={e => setBannerText(e.target.value)}
              type="text"
              placeholder="مثال: صُنع بشغف بواسطة عملاء مقام النخبة..."
              className="w-full bg-brand-bg/50 border-2 border-brand-border rounded-2xl p-5 text-brand-text font-black text-lg focus:border-brand-accent outline-none transition-all"
            />
          </div>

          {/* Footer Quote (large center text) */}
          <div className="space-y-4">
            <div className="flex flex-col gap-1">
              <label className="block text-[10px] font-black text-brand-text/40 uppercase tracking-[0.5em]">
                الاقتباس الرئيسي في التذييل
              </label>
              <p className="text-xs text-brand-text/20 font-black uppercase tracking-widest">
                العبارة الكبيرة المميزة التي تظهر في وسط التذييل.
              </p>
            </div>
            <input
              value={mainTextContent}
              onChange={e => setMainTextContent(e.target.value)}
              type="text"
              placeholder="مثال: لكل مقام مقال.. ولكل مقال مقام"
              className="w-full bg-brand-bg/50 border-2 border-brand-border rounded-2xl p-5 text-brand-text font-black text-lg focus:border-brand-accent outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* ── Card: Loyalty ──────────────────────────────────────────────── */}
      <div className="bg-brand-text p-14 rounded-[3.5rem] border border-brand-border/20 shadow-[0_30px_100px_rgba(0,0,0,0.2)] relative overflow-hidden group">
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-brand-accent/30 rounded-full blur-[100px] pointer-events-none group-hover:scale-110 transition-transform duration-1000" />

        <div className="flex items-center gap-5 mb-14 text-brand-bg relative z-10">
          <Trophy size={48} className="rotate-12 group-hover:rotate-0 transition-transform duration-700" />
          <h4 className="font-black text-4xl uppercase italic tracking-tighter leading-none">نظام الولاء</h4>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10 text-brand-bg">
          <div className="space-y-4">
            <label className="block text-[10px] font-black text-brand-bg/40 mb-2 uppercase tracking-[0.6em]">
              عتبة التأهل (Order Threshold)
            </label>
            <p className="text-sm font-black text-brand-bg/60 leading-relaxed uppercase tracking-widest italic">
              العدد الدقيق من العمليات اللازمة لترقية العميل إلى مستوى &quot;النخبة&quot;.
            </p>
          </div>
          <div className="flex items-center gap-8 justify-end lg:justify-start">
            <div className="relative w-full max-w-[200px]">
              <input
                value={threshold}
                onChange={e => setThreshold(Number(e.target.value))}
                type="number" min={1}
                className="w-full bg-brand-bg/10 border-4 border-brand-bg/20 rounded-[2.5rem] p-8 text-brand-bg font-black text-6xl text-center focus:border-brand-bg/50 transition-all outline-none"
              />
            </div>
            <span className="text-brand-bg/30 font-black text-xs uppercase tracking-[0.5em] [writing-mode:vertical-lr] rotate-180">عملية</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10 mt-16 pt-16 border-t-2 border-brand-bg/10 text-brand-bg">
          <div className="space-y-4">
            <label className="block text-[10px] font-black text-brand-bg/40 mb-2 uppercase tracking-[0.6em]">
              قيمة الامتياز (Benefit Value)
            </label>
            <p className="text-sm font-black text-brand-bg/60 leading-relaxed uppercase tracking-widest italic">
              نسبة الخصم المئوية الحصرية للأعضاء الذهبيين.
            </p>
          </div>
          <div className="flex items-center gap-8 justify-end lg:justify-start">
            <div className="relative w-full max-w-[200px]">
              <input
                value={discountValue}
                onChange={e => setDiscountValue(Number(e.target.value))}
                type="number" min={0}
                className="w-full bg-brand-bg/10 border-4 border-brand-bg/20 rounded-[2.5rem] p-8 text-brand-bg font-black text-6xl text-center focus:border-brand-bg/50 transition-all outline-none"
              />
            </div>
            <span className="text-brand-bg/30 font-black text-xs uppercase tracking-[0.5em] [writing-mode:vertical-lr] rotate-180">بالمائة</span>
          </div>
        </div>
      </div>

      {/* ── Card: Premium Banner / Offers ──────────────────────────────── */}
      <div className="bg-brand-card p-10 rounded-[3rem] border border-brand-border relative overflow-hidden">
        <div className="absolute top-0 left-0 w-48 h-48 bg-brand-accent/10 rounded-full blur-3xl -ml-20 -mt-20 pointer-events-none" />

        <h3 className="text-3xl font-black text-brand-text mb-10 flex items-center gap-4 italic uppercase tracking-tighter leading-none relative z-10">
          <Tv2 size={36} className="text-brand-accent" /> نظام البانر والعروض
        </h3>

        <div className="space-y-8 relative z-10">

          {/* Toggle: Show Offers Section */}
          <div className="flex items-center justify-between p-6 bg-brand-bg/50 rounded-2xl border border-brand-border">
            <div>
              <p className="font-black text-brand-text uppercase text-sm tracking-widest">إظهار قسم العروض في الصفحة الرئيسية</p>
              <p className="text-[10px] text-brand-text/40 font-bold mt-1">تفعيل أو تعطيل القسم بالكامل</p>
            </div>
            <button
              onClick={() => setShowOffers(!showOffers)}
              className={`w-16 h-8 rounded-full flex items-center transition-all duration-300 p-1 ${showOffers ? "bg-brand-accent" : "bg-brand-border"}`}
            >
              <div className={`w-6 h-6 rounded-full bg-white transition-all duration-300 shadow-sm ${showOffers ? "translate-x-0" : "-translate-x-8"}`} />
            </button>
          </div>

          {/* Toggle: Banner Ad Mode */}
          <div className={`flex items-center justify-between p-6 bg-brand-bg/50 rounded-2xl border border-brand-border transition-all ${!showOffers ? "opacity-30 pointer-events-none" : ""}`}>
            <div>
              <p className="font-black text-brand-text uppercase text-sm tracking-widest">تفعيل وضع البانر الإعلاني</p>
              <p className="text-[10px] text-brand-text/40 font-bold mt-1">يستبدل بطاقات العروض ببانر فيديو / صورة مخصص</p>
            </div>
            <button
              onClick={() => setBannerMode(!bannerMode)}
              className={`w-16 h-8 rounded-full flex items-center transition-all duration-300 p-1 ${bannerMode ? "bg-brand-text" : "bg-brand-border"}`}
            >
              <div className={`w-6 h-6 rounded-full bg-white transition-all duration-300 shadow-sm ${bannerMode ? "translate-x-0" : "-translate-x-8"}`} />
            </button>
          </div>

          {/* Banner Customization Panel */}
          {showOffers && bannerMode && (
            <div className="space-y-6 p-8 bg-brand-bg rounded-3xl border-2 border-brand-accent/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-accent/10 rounded-full blur-3xl -mr-16 -mt-16" />

              <h4 className="font-black text-lg text-brand-text uppercase tracking-widest flex items-center gap-3 relative z-10">
                <ImageIcon size={20} className="text-brand-accent" /> تخصيص البانر الإعلاني
              </h4>

              {/* Media Type Selector */}
              <div className="relative z-10">
                <label className="block text-[10px] font-black text-brand-text/40 uppercase tracking-[0.5em] mb-3">
                  نوع الوسيط
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setBannerMediaType("image")}
                    className={`flex items-center justify-center gap-3 p-4 rounded-2xl border-2 font-black text-sm uppercase tracking-widest transition-all ${bannerMediaType === "image" ? "border-brand-accent bg-brand-accent/10 text-brand-text" : "border-brand-border text-brand-text/40 hover:border-brand-accent/40"}`}
                  >
                    <ImageIcon size={20} /> صورة
                  </button>
                  <button
                    onClick={() => setBannerMediaType("video")}
                    className={`flex items-center justify-center gap-3 p-4 rounded-2xl border-2 font-black text-sm uppercase tracking-widest transition-all ${bannerMediaType === "video" ? "border-brand-accent bg-brand-accent/10 text-brand-text" : "border-brand-border text-brand-text/40 hover:border-brand-accent/40"}`}
                  >
                    <Video size={20} /> فيديو
                  </button>
                </div>
              </div>

              {/* Media URL + Upload */}
              <div className="relative z-10">
                <label className="block text-[10px] font-black text-brand-text/40 uppercase tracking-[0.5em] mb-3">
                  رابط {bannerMediaType === "video" ? "الفيديو" : "الصورة"} أو رفع ملف
                </label>
                <div className="flex gap-3 flex-wrap">
                  <div className="relative flex-1 min-w-[200px]">
                    <LinkIcon size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-text/30" />
                    <input
                      type="url"
                      value={bannerMediaUrl}
                      onChange={e => setBannerMediaUrl(e.target.value)}
                      placeholder={bannerMediaType === "video" ? "https://... رابط الفيديو" : "https://... رابط الصورة"}
                      className="w-full bg-brand-card border-2 border-brand-border rounded-xl pl-4 pr-10 py-3.5 text-brand-text font-bold text-sm focus:border-brand-accent outline-none transition-all"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingMedia}
                    className="flex items-center gap-2 px-5 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest bg-brand-accent/10 text-brand-text border-2 border-brand-accent/30 hover:bg-brand-accent/20 transition-all disabled:opacity-40 whitespace-nowrap"
                  >
                    {uploadingMedia ? <RefreshCw size={16} className="animate-spin" /> : <Upload size={16} />}
                    رفع ملف
                  </button>
                  <input ref={fileInputRef} type="file" accept={bannerMediaType === "video" ? "video/*" : "image/*"} className="hidden" onChange={handleMediaUpload} />
                </div>

                {/* Preview */}
                {bannerMediaUrl && (
                  <div className="mt-4 relative rounded-2xl overflow-hidden border-2 border-brand-border" style={{ height: 180 }}>
                    {bannerMediaType === "video" ? (
                      <video src={bannerMediaUrl} autoPlay muted loop playsInline className="w-full h-full object-cover" />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={bannerMediaUrl} alt="banner preview" className="w-full h-full object-cover" />
                    )}
                    <button
                      type="button"
                      onClick={() => setBannerMediaUrl("")}
                      className="absolute top-2 left-2 bg-black/70 text-white rounded-full p-1.5 hover:bg-red-500 transition-colors"
                    >
                      <X size={14} />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-black/40 text-white text-[9px] font-black uppercase tracking-widest">
                      معاينة البانر ({bannerMediaType === "video" ? "فيديو" : "صورة"})
                    </div>
                  </div>
                )}
              </div>

              {/* Banner Title */}
              <div className="relative z-10">
                <label className="block text-[10px] font-black text-brand-text/40 uppercase tracking-[0.5em] mb-3">
                  عنوان البانر (اختياري)
                </label>
                <input
                  type="text"
                  value={bannerTitle}
                  onChange={e => setBannerTitle(e.target.value)}
                  placeholder="مثال: كولكشن الصيف الجديد"
                  className="w-full bg-brand-card border-2 border-brand-border rounded-xl px-4 py-3.5 text-brand-text font-black text-sm focus:border-brand-accent outline-none transition-all"
                />
              </div>

              {/* Banner Subtitle */}
              <div className="relative z-10">
                <label className="block text-[10px] font-black text-brand-text/40 uppercase tracking-[0.5em] mb-3">
                  وصف البانر (اختياري)
                </label>
                <input
                  type="text"
                  value={bannerSubtitle}
                  onChange={e => setBannerSubtitle(e.target.value)}
                  placeholder="مثال: استكشف أحدث التصميمات وأكثرها إبداعاً"
                  className="w-full bg-brand-card border-2 border-brand-border rounded-xl px-4 py-3.5 text-brand-text font-bold text-sm focus:border-brand-accent outline-none transition-all"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Action Trigger ──────────────────────────────────────────────── */}
      <button
        onClick={handleSave}
        disabled={loading}
        className="w-full btn-melt py-10 rounded-[2.5rem] font-black text-2xl uppercase tracking-[0.6em] transition-all hover:-translate-y-3 active:translate-y-0 shadow-[0_30px_60px_rgba(120,144,156,0.25)] flex items-center justify-center gap-6 group"
      >
        {loading ? <RefreshCw className="animate-spin" size={40} /> : (
          <>
            <Save size={40} className="group-hover:scale-110 transition-transform" />
            <span className="italic tracking-tighter">تفعيل البروتوكولات</span>
          </>
        )}
      </button>

    </div>
  );
}
