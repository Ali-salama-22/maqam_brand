"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import MaqamLogo from "@/components/common/MaqamLogo";
import {
  SketchyCart,
  SketchyUser,
  SketchyTruck,
  SketchyGroup,
} from "@/components/common/SketchyIcons";
import { LayoutDashboard, RefreshCw, Sun, Moon } from "lucide-react";
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
  padding: "1rem",
  borderRadius: "9999px",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

export default function Navbar() {
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [scrolled, setScrolled] = useState(false);
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



  const hoverIn = (e: React.MouseEvent<HTMLElement>) => {
    const el = e.currentTarget;
    el.style.boxShadow = "0 0 15px 5px rgba(255, 255, 255, 0.8), 0 0 30px 10px var(--brand-accent)";
    el.style.transform = "scale(1.1) translateY(-2px)";
  };
  const hoverOut = (e: React.MouseEvent<HTMLElement>) => {
    const el = e.currentTarget;
    el.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";
    el.style.transform = "scale(1) translateY(0)";
  };

  return (
    <>
      {/* ── Theme-Aware Navbar ── */}
      <nav
        className="w-full fixed top-0 z-50 h-20 flex items-center transition-colors duration-500"
        style={{
          background: "var(--brand-bg)",
          borderBottom: "1px solid var(--brand-border)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex justify-between items-center">

          {/* Left Side: Cart, Theme & Profile */}
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-3">
              <button 
                onClick={toggleTheme} 
                style={iconBtn} 
                onMouseEnter={hoverIn} 
                onMouseLeave={hoverOut}
              >
                {theme === "light" ? <Moon size={24} /> : <Sun size={24} />}
              </button>
              
              <button onClick={() => setShowCart(true)} style={iconBtn} onMouseEnter={hoverIn} onMouseLeave={hoverOut} className="relative">
                <SketchyCart className="w-8 h-8" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-black shadow"
                    style={{ background: "var(--brand-accent)" }}>
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
            <div className="flex items-center gap-4">
              {isAdmin && (
                <Link href="/admin" style={{ ...iconBtn, color: "#B0C4DE" }} onMouseEnter={hoverIn} onMouseLeave={hoverOut}>
                  <LayoutDashboard size={32} />
                </Link>
              )}
              <div className="relative">
                <Link href="/profile" style={iconBtn} onMouseEnter={hoverIn} onMouseLeave={hoverOut}>
                  <SketchyUser className="w-8 h-8" />
                </Link>
              </div>
            </div>
          </div>

          {/* Center: Logo */}
          <div className="flex-shrink-0">
            <Link href="/">
              <MaqamLogo className="hover:scale-105 transition-transform duration-500" />
            </Link>
          </div>

          {/* Right Side: Shipping & Social */}
          <div className="flex items-center gap-5">
            <button onClick={() => setShowOrderModal(true)} style={iconBtn} onMouseEnter={hoverIn} onMouseLeave={hoverOut}>
              <SketchyTruck className="w-8 h-8" />
            </button>
            <Link href="https://wa.me/201032904142" target="_blank" style={iconBtn} onMouseEnter={hoverIn} onMouseLeave={hoverOut}>
              <SketchyGroup className="w-8 h-8" />
            </Link>
          </div>
        </div>
      </nav>

      <CartSlideOver isOpen={showCart} onClose={() => setShowCart(false)} />

      {showOrderModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-bg/80 backdrop-blur-md">
          <div className="p-12 rounded-[3.5rem] max-w-xl w-full relative bg-brand-card border border-brand-border shadow-3xl overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-accent/5 rounded-full blur-[60px]" />
            <button onClick={() => setShowOrderModal(false)} className="absolute top-8 right-8 text-3xl font-black text-brand-text/30 hover:text-brand-text transition-colors">&times;</button>
            <h2 className="text-4xl font-black mb-10 uppercase italic tracking-tighter text-brand-text leading-none">
               تتبع <span className="text-brand-accent">الشحنات</span>
            </h2>
            
            {loadingOrders ? (
              <div className="flex justify-center py-20"><RefreshCw className="animate-spin text-brand-accent" size={40} /></div>
            ) : activeOrders.length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed border-brand-border rounded-[2.5rem] flex flex-col items-center gap-4">
                 <SketchyTruck className="w-16 h-16 text-brand-text/10" />
                 <p className="text-[12px] uppercase tracking-[0.4em] font-black text-brand-text/20">لا توجد شحنات نشطة</p>
              </div>
            ) : (
              <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-4 scrollbar-hide">
                {activeOrders.map(order => (
                  <div key={order.id} className="p-8 rounded-[2.5rem] space-y-4 bg-brand-bg border border-brand-border group hover:border-brand-accent/50 transition-all duration-500">
                    <div className="flex justify-between items-end">
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-brand-text/30">رقم الطلب</span>
                        <span className="text-sm font-black text-brand-text italic leading-none">#{order.id.slice(0, 8).toUpperCase()}</span>
                      </div>
                      <div className="text-right">
                         <p className="text-2xl font-black text-brand-accent leading-none italic">{order.total} <span className="text-[10px] uppercase not-italic">ج.م</span></p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-brand-border/50">
                      <span className="text-[10px] font-black text-brand-text/20 uppercase tracking-widest">{new Date(order.created_at).toLocaleDateString("ar-EG", { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <span className="px-4 py-2 rounded-full bg-brand-accent/10 text-brand-accent text-[9px] font-black uppercase tracking-[0.2em] border border-brand-accent/20">{order.status}</span>
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
