"use client";

import { useEffect, useState } from "react";
import { Award, CheckCircle2, RefreshCw, Star } from "lucide-react";
import { createClient } from "@/lib/supabaseBrowser";

export default function LoyaltyCard() {
  const [currentOrders, setCurrentOrders] = useState(0);
  const [maxTier, setMaxTier] = useState(5);
  const [discountValue, setDiscountValue] = useState(15);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return setLoading(false);

      const { data: sData } = await supabase.from("store_settings").select("loyalty_order_threshold, loyalty_discount_value").eq("id", 1).single();
      if (sData?.loyalty_order_threshold) setMaxTier(sData.loyalty_order_threshold);
      if (sData?.loyalty_discount_value) setDiscountValue(sData.loyalty_discount_value);

      const { count } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);
      
      if (count !== null) setCurrentOrders(count);
      setLoading(false);
    };

    fetchData();
  }, [supabase]);

  const isEligible = currentOrders >= maxTier;

  const handleClaim = () => {
    const msg = `مرحباً مقام! لقد أكملت ${currentOrders} طلبات وأرغب في استلام *مكافأة نظام الولاء الخاصة بي*.`;
    window.open(`https://wa.me/201032904142?text=${encodeURIComponent(msg)}`, "_blank");
  };

  if (loading) return (
    <div className="bg-brand-card rounded-3xl p-12 flex items-center justify-center border border-brand-border shadow-xl">
      <RefreshCw className="animate-spin text-brand-accent" size={32} />
    </div>
  );

  return (
    <div className="bg-brand-card rounded-[3rem] p-12 shadow-3xl relative overflow-hidden flex flex-col justify-center items-center text-center border border-brand-border group">
      
      {/* ── Background Aesthetics ── */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-accent/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-accent/5 rounded-full blur-[100px] pointer-events-none" />
      
      {/* ── Icon Section ── */}
      <div className="relative mb-10">
        <Award size={80} className="text-brand-accent transition-all duration-700 group-hover:scale-110 group-hover:rotate-3" />
        <div className="absolute -top-2 -right-2">
           <Star size={24} className="fill-brand-accent text-brand-accent animate-pulse" />
        </div>
      </div>
      
      {/* ── Content ── */}
      <h3 className="text-3xl font-black text-brand-text mb-4 uppercase italic tracking-tighter leading-none">
        نظام <span className="text-brand-accent">الولاء</span>
      </h3>
      
      <p className="text-brand-text/40 text-[10px] mb-12 max-w-[280px] font-black uppercase tracking-[0.4em] leading-relaxed">
        أكمل {maxTier} طلبات لفتح خصم VIP بنسبة {discountValue}% على مشترياتك القادمة.
      </p>

      {/* ── Progress Interface ── */}
      <div className="w-full max-w-sm flex flex-col items-center mb-12">
         <div className="w-full flex items-end justify-between mb-4">
            <div className="flex flex-col items-start gap-1">
               <span className="text-[9px] font-black uppercase tracking-widest opacity-30">التقدم الحالي</span>
               <span className="text-xl font-black text-brand-text italic">{currentOrders} / {maxTier}</span>
            </div>
            <span className="text-[10px] font-black text-brand-accent uppercase tracking-widest bg-brand-accent/10 px-3 py-1 rounded-full">
               {Math.min(100, Math.round((currentOrders/maxTier)*100))}% التسجيل
            </span>
         </div>
         
         <div className="w-full h-3 bg-brand-bg rounded-full relative overflow-hidden border border-brand-border">
            <div 
              className="h-full bg-brand-accent transition-all duration-1000 ease-in-out" 
              style={{ width: `${Math.min(100, (currentOrders / maxTier) * 100)}%` }}
            />
         </div>
      </div>

      {/* ── Action Trigger ── */}
      <button 
        onClick={handleClaim}
        disabled={!isEligible}
        className={`w-full max-w-xs py-5 rounded-[2rem] font-black uppercase tracking-[0.5em] transition-all flex items-center justify-center gap-4 text-sm relative overflow-hidden
          ${isEligible 
            ? "btn-melt shadow-[0_20px_50px_rgba(176,196,222,0.3)]" 
            : "bg-brand-bg text-brand-text/20 cursor-not-allowed border border-brand-border"
          }`}
      >
        {isEligible ? (
          <>
            استلام المكافأة <CheckCircle2 size={20} />
          </>
        ) : (
          "المستوى مقفل"
        )}
      </button>

      {/* ── Status Footer ── */}
      <div className="mt-10 flex items-center gap-2 opacity-20">
         <div className={`w-2 h-2 rounded-full ${isEligible ? 'bg-brand-accent' : 'bg-brand-pine'}`} />
         <span className="text-[9px] font-black uppercase tracking-[0.6em]">
           {isEligible ? "المستوى: نخبة" : "المستوى: عضو طموح"}
         </span>
      </div>

    </div>
  );
}
