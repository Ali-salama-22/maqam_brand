import Link from "next/link";
import { createClient } from "@/lib/supabaseServer";
import MaqamLogo from "@/components/common/MaqamLogo";

export default async function Footer() {
  const supabase = await createClient();
  const { data } = await supabase.from("store_settings").select("banner_text").eq("id", 1).single();
  let mainQuote = "لكل مقام مقال.. ولكل مقال مقام";
  let sigQuote = "لكل مقام مقال.. ولكل مقال مقام";
  
  if (data?.banner_text) {
     try {
        const parsed = JSON.parse(data.banner_text);
        if (parsed.main) mainQuote = parsed.main;
        if (parsed.signature) sigQuote = parsed.signature;
     } catch(e) {
        mainQuote = data.banner_text;
        sigQuote = data.banner_text;
     }
  }

  return (
    <footer
      className="w-full pt-16 pb-12 px-4 md:px-12 mt-auto bg-brand-card"
      style={{
        borderTop: "1px solid var(--brand-border)",
        color: "var(--brand-text)",
      }}
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-right">
        
        {/* Description / Signature (Now Dynamic) */}
        <div className="flex flex-col justify-center items-center md:items-start order-2 md:order-1">
          <p className="text-xl md:text-2xl italic font-black leading-relaxed max-w-[320px] text-brand-text/60 tracking-tighter">
            &ldquo;{sigQuote}&rdquo;
          </p>
        </div>

        {/* Center: Quote & Logo */}
        <div className="flex flex-col items-center justify-center space-y-10 order-1 md:order-2">
          
          {/* Social Icons (FB, IG, TikTok, WA) */}
          <div className="flex flex-col items-center gap-4 w-full">
            <span className="text-[11px] uppercase font-black tracking-[0.4em] text-brand-text/50">تواصل معنا</span>
            <div className="flex justify-center gap-4 w-full">
              <Link href="https://www.facebook.com/profile.php?id=61572361353046&mibextid=wwXIfr&mibextid=wwXIfr" target="_blank" className="p-3 rounded-full border border-brand-border hover:bg-brand-accent/20 hover:text-brand-accent transition-all duration-300 aura-glow hover:scale-110">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </Link>
              <Link href="https://www.instagram.com/brand_maqam7?igsh=MXB1M3ZzZ2o2a2pxdQ==" target="_blank" className="p-3 rounded-full border border-brand-border hover:bg-brand-accent/20 hover:text-brand-accent transition-all duration-300 aura-glow hover:scale-110">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </Link>
              <Link href="https://www.tiktok.com/@brand_maqam?_r=1&_t=ZS-97dUyatWb6G" target="_blank" className="p-3 rounded-full border border-brand-border hover:bg-brand-accent/20 hover:text-brand-accent transition-all duration-300 aura-glow hover:scale-110">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 2.22-1.15 4.39-2.88 5.76-1.74 1.39-4.14 1.83-6.26 1.13-2.12-.7-3.8-2.31-4.48-4.43-.68-2.11-.27-4.51 1.05-6.27 1.32-1.75 3.42-2.73 5.55-2.73v4.06c-1.39.04-2.61.82-3.23 2.05-.62 1.23-.46 2.77.41 3.84.87 1.07 2.37 1.38 3.65.75 1.28-.63 2.1-1.92 2.13-3.34V.02h4.02z" />
                </svg>
              </Link>
              <Link href="https://chat.whatsapp.com/LaCCO6k0tWj8zrzq5Jo2rl?s=cl&p=i&mlu=2" target="_blank" className="p-3 rounded-full border border-brand-border hover:bg-brand-accent/20 hover:text-brand-accent transition-all duration-300 aura-glow hover:scale-110">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
              </Link>
            </div>
          </div>

          <blockquote className="text-3xl md:text-4xl font-black italic text-center leading-tight text-brand-accent tracking-tighter">
            &ldquo;{mainQuote}&rdquo;
          </blockquote>

          <div className="flex flex-col items-center space-y-6 pt-10 border-t border-brand-border/30 w-full mt-4">
            <MaqamLogo imgClassName="h-[90px] md:h-[120px]" />
            <span className="text-[10px] opacity-40 uppercase tracking-[0.4em] font-black">&copy; {new Date().getFullYear()} جميع الحقوق محفوظة لـ مقام.</span>
          </div>
        </div>

        {/* Developer Credit */}
        <div className="flex flex-col justify-center items-center order-3 mt-8 md:mt-0 opacity-70 w-full">
          <p className="text-center bg-brand-bg/50 px-6 py-3 rounded-xl border border-brand-border shadow-sm flex items-center justify-center gap-2" dir="rtl">
            <span className="text-sm font-black text-brand-text/80 uppercase tracking-widest">صُنع بواسطة</span>
            <Link href="https://wa.me/201064592019" target="_blank" className="font-black transition-colors text-brand-accent hover:text-brand-text hover:underline hover:opacity-100 uppercase" dir="ltr">
              Ali Salama
            </Link>
          </p>
        </div>

      </div>
    </footer>
  );
}
