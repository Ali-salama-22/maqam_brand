"use client";

import { useState, useEffect } from "react";
import { 
  LockKeyhole, 
  ShieldCheck, 
  Loader2, 
  ShoppingBag, 
  Package, 
  Layers, 
  Warehouse, 
  Receipt, 
  Settings, 
  LogOut, 
  ArrowLeft 
} from "lucide-react";
import Link from "next/link";
import ProductManager from "@/components/admin/ProductManager";
import CategoryManager from "@/components/admin/CategoryManager";
import OrderManager from "@/components/admin/OrderManager";
import StoreSettings from "@/components/admin/StoreSettings";
import WarehouseDashboard from "@/components/admin/WarehouseDashboard";
import InvoicesArchive from "@/components/admin/InvoicesArchive";
import { createClient } from "@/lib/supabaseBrowser";

const ADMIN_EMAIL = "alo1234salama@gmail.com";

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("orders");
  const supabase = createClient();

  useEffect(() => {
    // ✅ Check real Supabase session — no passcode needed
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email === ADMIN_EMAIL) {
        setIsAdmin(true);
      }
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAdmin(session?.user?.email === ADMIN_EMAIL);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4 bg-brand-bg">
        <Loader2 size={44} className="text-brand-accent animate-spin" />
        <p className="text-brand-text font-black text-base tracking-wider">جاري التحقق من الصلاحيات الإدارية...</p>
      </div>
    );
  }

  // Not admin — show friendly block
  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] bg-brand-bg px-4 text-center">
        <div className="w-20 h-20 rounded-full bg-brand-card border border-brand-border flex items-center justify-center mb-6 shadow-sm">
          <LockKeyhole size={40} className="text-brand-accent" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-brand-text tracking-tight mb-2">
          مطلوب صلاحيات الإدارة
        </h1>
        <p className="text-xs uppercase tracking-[0.3em] text-brand-text/50 font-bold mb-3">Admin Access Required</p>
        <p className="text-brand-text/60 mb-8 text-sm max-w-sm">
          يجب تسجيل الدخول بالبريد الإلكتروني المخصص لإدارة متجر مقام.
        </p>
        <Link
          href="/profile"
          className="btn-melt py-3.5 px-8 rounded-full font-black text-sm uppercase tracking-wider transition-all shadow-lg"
        >
          تسجيل الدخول بالحساب الإداري
        </Link>
      </div>
    );
  }

  const tabs = [
    { id: "orders", label: "الطلبات والمبيعات", icon: ShoppingBag },
    { id: "products", label: "المنتجات والمخزون", icon: Package },
    { id: "categories", label: "الأقسام ونمط العرض", icon: Layers },
    { id: "warehouse", label: "إدارة المستودع", icon: Warehouse },
    { id: "invoices", label: "أرشيف الفواتير", icon: Receipt },
    { id: "settings", label: "الإعدادات والواتساب", icon: Settings },
  ];

  return (
    <div className="w-full min-h-[85vh] bg-brand-bg text-brand-text flex flex-col pb-16">
      
      {/* ── Top Admin Header Bar ── */}
      <div className="w-full bg-brand-card/80 backdrop-blur-md border-b border-brand-border py-4 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Right: Badge & Title */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-brand-accent/10 border border-brand-accent/30 text-brand-accent shadow-sm">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-none text-brand-text">
                لوحة التحكم الإدارية
              </h2>
              <span className="text-[11px] font-mono text-brand-text/50 dir-ltr inline-block mt-1">
                {ADMIN_EMAIL}
              </span>
            </div>
          </div>

          {/* Left: Quick Actions (Store View & Sign Out) */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-brand-bg border border-brand-border hover:border-brand-accent/40 text-brand-text transition-all shadow-sm active:scale-95"
            >
              <span>العودة للمتجر</span>
              <ArrowLeft size={14} />
            </Link>

            <button
              onClick={() => supabase.auth.signOut()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-red-500 bg-red-500/10 hover:bg-red-500 hover:text-white border border-red-500/20 transition-all shadow-sm active:scale-95"
            >
              <LogOut size={14} />
              <span>تسجيل خروج</span>
            </button>
          </div>

        </div>
      </div>

      {/* ── Floating / Sticky Luxury Admin Navigation Dock ── */}
      <div className="sticky top-16 sm:top-20 z-40 w-full py-3 px-3 sm:px-6 bg-brand-bg/90 backdrop-blur-xl border-b border-brand-border/60">
        <div className="max-w-7xl mx-auto">
          <nav 
            aria-label="Admin Tabs"
            className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-1 px-1 scrollbar-hide mobile-snap-slider"
            dir="rtl"
          >
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-2.5 px-4 sm:px-5 rounded-2xl text-xs sm:text-sm font-black whitespace-nowrap transition-all duration-300 shrink-0 border shadow-sm select-none active:scale-95 ${
                    isActive
                      ? "bg-brand-accent text-brand-bg border-brand-accent shadow-[0_4px_20px_rgba(188,212,230,0.35)] scale-102"
                      : "bg-brand-card/90 text-brand-text/70 border-brand-border hover:text-brand-text hover:border-brand-accent/40 hover:bg-brand-card"
                  }`}
                >
                  <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* ── Main Content Container ── */}
      <div className="max-w-7xl mx-auto w-full p-4 sm:p-8 md:p-10 flex-grow">
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          {activeTab === "orders" && <OrderManager />}
          {activeTab === "products" && <ProductManager />}
          {activeTab === "categories" && <CategoryManager />}
          {activeTab === "warehouse" && <WarehouseDashboard />}
          {activeTab === "invoices" && <InvoicesArchive />}
          {activeTab === "settings" && <StoreSettings />}
        </div>
      </div>

    </div>
  );
}
