"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import MaqamLogo from "@/components/common/MaqamLogo";
import { 
  ShoppingBag, 
  User, 
  Truck, 
  LayoutDashboard, 
  RefreshCw, 
  Sun, 
  Moon,
  Home,
  ShieldCheck,
  Headphones
} from "lucide-react";
import CartSlideOver from "@/components/layout/CartSlideOver";
import { useCart } from "@/lib/CartContext";
import { useTheme } from "@/lib/ThemeContext";
import { createClient } from "@/lib/supabaseBrowser";

const ADMIN_EMAIL = "alo1234salama@gmail.com";

/* ── Theme-Aware Urban Premium custom icon button style ── */
const iconBtn: React.CSSProperties = {
  background: "var(--brand-card)",
  border: "1px solid var(--brand-border)",
  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  color: "var(--brand-accent)",
  padding: "0.6rem",
  borderRadius: "9999px",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

export default function Navbar() {
  const pathname = usePathname();
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [customerServicePhone, setCustomerServicePhone] = useState("201032904142");
  const menuRef = useRef<HTMLDivElement>(null);

  const { theme, toggleTheme } = useTheme();
  const { items } = useCart();
  const cartCount = items.reduce((sum, item) => sum + item.qty, 0);
  const supabase = createClient();

  /* ── Scroll-reactive blur effect ── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const email = session?.user?.email ?? null;
      setUserEmail(email);
      setIsAdmin(email === ADMIN_EMAIL);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const email = session?.user?.email ?? null;
      setUserEmail(email);
      setIsAdmin(email === ADMIN_EMAIL);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    supabase.from("store_settings").select("banner_text").eq("id", 1).single().then(({ data }) => {
      if (data?.banner_text) {
        try {
          const parsed = JSON.parse(data.banner_text);
          if (parsed.customerServicePhone) setCustomerServicePhone(parsed.customerServicePhone);
        } catch {}
      }
    });
  }, [supabase]);

  useEffect(() => {
    if (showOrderModal) {
      setLoadingOrders(true);
      supabase.auth.getUser().then(async ({ data }) => {
        if (data.user) {
          const { data: ordersData } = await supabase
            .from("orders")
            .select("id, created_at, status, total")
            .eq("user_id", data.user.id)
            .order("created_at", { ascending: false });
          if (ordersData) setActiveOrders(ordersData);
        }
        setLoadingOrders(false);
      });
    }
  }, [showOrderModal, supabase]);

  const btnClass = "bg-brand-card border border-brand-border shadow-[0_2px_8px_rgba(0,0,0,0.04)] text-brand-accent p-2.5 sm:p-3 rounded-full transition-all duration-300 flex items-center justify-center hover:scale-105 active:scale-95 hover:shadow-[0_0_15px_rgba(188,212,230,0.4)] hover:-translate-y-0.5 shrink-0";

  return (
    <>
      {/* ── Top Fixed Navbar ── */}
      <nav
        className={`w-full fixed top-0 z-50 h-16 sm:h-20 flex items-center transition-all duration-300 ${
          scrolled ? "bg-brand-bg/90 backdrop-blur-xl shadow-sm" : "bg-brand-bg"
        }`}
        style={{
          borderBottom: "1px solid var(--brand-border)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex justify-between items-center">

          {/* Desktop Left Controls */}
          <div className="hidden sm:flex items-center gap-3">
            <button 
              onClick={toggleTheme} 
              className={btnClass}
              title={theme === "light" ? "الوضع الليلي" : "الوضع النهاري"}
              aria-label="Toggle Theme"
            >
              {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            
            <button 
              onClick={() => setShowCart(true)} 
              className={`${btnClass} relative`}
              title="سلة التسوق"
              aria-label="Shopping Cart"
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-black shadow-md bg-brand-accent">
                  {cartCount}
                </span>
              )}
            </button>

            {isAdmin && (
              <Link 
                href="/admin" 
                className={btnClass} 
                title="لوحة الإدارة"
                aria-label="Admin Dashboard"
              >
                <LayoutDashboard size={20} />
              </Link>
            )}

            <Link 
              href="/profile" 
              className={btnClass}
              title="حسابي"
              aria-label="Profile"
            >
              <User size={20} />
            </Link>
          </div>

          {/* Mobile Left Controls (Minimal & Compact) */}
          <div className="flex sm:hidden items-center gap-2">
            <button 
              onClick={toggleTheme} 
              className="p-2.5 rounded-full border border-brand-border bg-brand-card text-brand-accent shadow-sm active:scale-95 transition-transform"
              aria-label="Toggle Theme"
            >
              {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            {isAdmin && (
              <Link 
                href="/admin" 
                className="p-2.5 rounded-full border border-brand-border bg-brand-card text-brand-accent shadow-sm active:scale-95 transition-transform"
                title="لوحة الإدارة"
              >
                <ShieldCheck size={18} />
              </Link>
            )}
          </div>

          {/* Center: Brand Logo + Customer Service Pill */}
          <div className="flex items-center gap-2 sm:gap-3.5">
            <Link href="/" className="inline-block hover:scale-105 transition-transform duration-300">
              <MaqamLogo className="scale-90 sm:scale-100" />
            </Link>

            {/* Customer Service WhatsApp Button */}
            <a
              href={`https://wa.me/${customerServicePhone}?text=${encodeURIComponent("مرحباً، أود الاستفسار من خدمة عملاء مقام 🌟")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px] sm:text-xs font-black shadow-sm hover:bg-emerald-500/20 active:scale-95 transition-all"
              title="تواصل مع خدمة العملاء على واتساب"
            >
              <Headphones size={13} className="text-emerald-500 animate-pulse" />
              <span className="whitespace-nowrap">خدمة العملاء</span>
            </a>
          </div>

          {/* Desktop Right Controls (Tracking) */}
          <div className="hidden sm:flex items-center gap-3 justify-end">
            <button 
              onClick={() => setShowOrderModal(true)} 
              className={btnClass}
              title="تتبع الشحنات"
              aria-label="Track Orders"
            >
              <Truck size={20} />
            </button>
          </div>

          {/* Mobile Right Controls (Quick Cart Button with Count) */}
          <div className="flex sm:hidden items-center justify-end">
            <button 
              onClick={() => setShowCart(true)} 
              className="relative p-2.5 rounded-full border border-brand-border bg-brand-card text-brand-accent shadow-sm active:scale-95 transition-transform"
              aria-label="Shopping Cart"
            >
              <ShoppingBag size={18} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-black shadow-md bg-brand-accent">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

        </div>
      </nav>

      {/* ── Mobile Bottom Navigation Dock (High-End Native Experience) ── */}
      <div className="sm:hidden fixed bottom-3 inset-x-3 z-50 pointer-events-auto">
        <nav 
          aria-label="Mobile Navigation"
          className="bg-brand-card/95 backdrop-blur-2xl border border-brand-border/80 rounded-2xl py-2 px-3 shadow-[0_12px_36px_rgba(0,0,0,0.18)] flex items-center justify-around gap-1"
        >
          <Link
            href="/"
            className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition-all duration-200 ${
              pathname === "/" 
                ? "text-brand-accent font-black scale-105" 
                : "text-brand-text/60 hover:text-brand-text font-bold"
            }`}
          >
            <Home size={19} strokeWidth={pathname === "/" ? 2.5 : 2} />
            <span className="text-[10px] tracking-tight">الرئيسية</span>
          </Link>

          <a
            href={`https://wa.me/${customerServicePhone}?text=${encodeURIComponent("مرحباً، أود الاستفسار من خدمة عملاء مقام 🌟")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl text-emerald-500 font-bold transition-all hover:scale-105 active:scale-95"
          >
            <Headphones size={19} />
            <span className="text-[10px] tracking-tight">الدعم</span>
          </a>

          <button
            onClick={() => setShowCart(true)}
            className="flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl text-brand-text/70 hover:text-brand-accent font-bold transition-all relative"
          >
            <div className="relative">
              <ShoppingBag size={19} />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2 text-white text-[9px] min-w-4 h-4 px-1 flex items-center justify-center rounded-full font-black shadow-md bg-brand-accent">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="text-[10px] tracking-tight">السلة</span>
          </button>

          <button
            onClick={() => setShowOrderModal(true)}
            className="flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl text-brand-text/70 hover:text-brand-accent font-bold transition-all"
          >
            <Truck size={19} />
            <span className="text-[10px] tracking-tight">شحناتي</span>
          </button>

          <Link
            href="/profile"
            className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition-all duration-200 ${
              pathname === "/profile" 
                ? "text-brand-accent font-black scale-105" 
                : "text-brand-text/60 hover:text-brand-text font-bold"
            }`}
          >
            <User size={19} strokeWidth={pathname === "/profile" ? 2.5 : 2} />
            <span className="text-[10px] tracking-tight">حسابي</span>
          </Link>
        </nav>
      </div>

      <CartSlideOver isOpen={showCart} onClose={() => setShowCart(false)} />

      {showOrderModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-bg/80 backdrop-blur-md">
          <div className="p-8 sm:p-12 rounded-[2.5rem] sm:rounded-[3.5rem] max-w-xl w-full relative bg-brand-card border border-brand-border shadow-3xl overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-accent/5 rounded-full blur-[60px]" />
            <button onClick={() => setShowOrderModal(false)} className="absolute top-6 right-6 text-2xl font-black text-brand-text/40 hover:text-brand-text transition-colors">&times;</button>
            <h2 className="text-3xl sm:text-4xl font-black mb-8 uppercase italic tracking-tighter text-brand-text leading-none">
               تتبع <span className="text-brand-accent">الشحنات</span>
            </h2>
            
            {loadingOrders ? (
              <div className="flex justify-center py-16"><RefreshCw className="animate-spin text-brand-accent" size={36} /></div>
            ) : activeOrders.length === 0 ? (
              <div className="text-center py-16 border-2 border-dashed border-brand-border rounded-[2rem] flex flex-col items-center gap-3">
                 <Truck className="w-12 h-12 text-brand-text/20" />
                 <p className="text-[11px] uppercase tracking-[0.3em] font-black text-brand-text/30">لا توجد شحنات نشطة</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-2 scrollbar-hide">
                {activeOrders.map(order => (
                  <div key={order.id} className="p-6 rounded-[2rem] space-y-3 bg-brand-bg border border-brand-border group hover:border-brand-accent/40 transition-all duration-300">
                    <div className="flex justify-between items-end">
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-brand-text/40">رقم الطلب</span>
                        <span className="text-sm font-black text-brand-text italic leading-none">#{order.id.slice(0, 8).toUpperCase()}</span>
                      </div>
                      <div className="text-right">
                         <p className="text-xl sm:text-2xl font-black text-brand-accent leading-none italic">{order.total ?? order.total_amount} <span className="text-[10px] uppercase not-italic">ج.م</span></p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-brand-border/40">
                      <span className="text-[10px] font-black text-brand-text/30 uppercase tracking-widest">{new Date(order.created_at).toLocaleDateString("ar-EG", { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <span className="px-3 py-1 rounded-full bg-brand-accent/10 text-brand-accent text-[9px] font-black uppercase tracking-[0.2em] border border-brand-accent/20">{order.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
