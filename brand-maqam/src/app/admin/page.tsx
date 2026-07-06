"use client";

import { useState, useEffect } from "react";
import { LockKeyhole, ShieldCheck, Loader2 } from "lucide-react";
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
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
        <Loader2 size={48} className="text-brand-pine animate-spin" />
        <p className="text-brand-pine font-bold text-lg">جاري التحقق من الصلاحيات...</p>
      </div>
    );
  }

  // Not admin — show friendly block
  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] bg-brand-pine/5 px-4 text-center">
        <LockKeyhole size={80} className="text-brand-pine mb-6" />
        <h1 className="text-3xl font-extrabold text-brand-pine tracking-widest mb-2">
          مطلوب صلاحيات الإدارة
        </h1>
        <p className="text-brand-pine/70 mb-2 font-bold">Admin Access Required</p>
        <p className="text-brand-pine/50 mb-8 text-sm">
          يجب تسجيل الدخول بالحساب المخصص للإدارة
        </p>
        <Link
          href="/profile"
          className="bg-brand-pine text-brand-ivory font-bold py-4 px-8 rounded-xl text-lg hover:bg-[#052b2a] transition-all aura-glow shadow-xl"
        >
          تسجيل الدخول بجوجل
        </Link>
      </div>
    );
  }

  // ✅ Admin is authenticated — full dashboard
  return (
    <div className="w-full min-h-[80vh] flex flex-col md:flex-row bg-brand-pine/5">
      {/* Sidebar Navigation */}
      <div className="w-full md:w-64 bg-brand-ivory border-l border-brand-pine/10 p-6 flex flex-col gap-4">
        <div className="flex items-center gap-2 mb-6">
          <ShieldCheck size={24} className="text-brand-pine" />
          <h2 className="text-2xl font-extrabold text-brand-pine text-glow-neon">لوحة الإدارة</h2>
        </div>

        <p className="text-xs text-brand-pine/50 font-bold -mt-4 mb-2 truncate">
          {ADMIN_EMAIL}
        </p>

        <button
          onClick={() => setActiveTab("orders")}
          className={`text-right font-bold py-3 px-4 rounded-lg transition-all ${activeTab === "orders" ? "bg-brand-pine text-brand-ivory shadow-md" : "text-brand-pine hover:bg-brand-pine/10"}`}
        >
          🛒 الطلبات والمبيعات
        </button>
        <button
          onClick={() => setActiveTab("products")}
          className={`text-right font-bold py-3 px-4 rounded-lg transition-all ${activeTab === "products" ? "bg-brand-pine text-brand-ivory shadow-md" : "text-brand-pine hover:bg-brand-pine/10"}`}
        >
          📦 المنتجات
        </button>
        <button
          onClick={() => setActiveTab("categories")}
          className={`text-right font-bold py-3 px-4 rounded-lg transition-all ${activeTab === "categories" ? "bg-brand-pine text-brand-ivory shadow-md" : "text-brand-pine hover:bg-brand-pine/10"}`}
        >
          🗂️ الأقسام والواجهة
        </button>
        <button
          onClick={() => setActiveTab("warehouse")}
          className={`text-right font-bold py-3 px-4 rounded-lg transition-all ${activeTab === "warehouse" ? "bg-brand-pine text-brand-ivory shadow-md" : "text-brand-pine hover:bg-brand-pine/10"}`}
        >
          🏭 إدارة المستودع والمخزون
        </button>
        <button
          onClick={() => setActiveTab("invoices")}
          className={`text-right font-bold py-3 px-4 rounded-lg transition-all ${activeTab === "invoices" ? "bg-brand-pine text-brand-ivory shadow-md" : "text-brand-pine hover:bg-brand-pine/10"}`}
        >
          🧾 أرشيف الفواتير
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`text-right font-bold py-3 px-4 rounded-lg transition-all ${activeTab === "settings" ? "bg-brand-pine text-brand-ivory shadow-md" : "text-brand-pine hover:bg-brand-pine/10"}`}
        >
          ⚙️ تخصيص وبرنامج الولاء
        </button>

        <div className="mt-auto pt-8 border-t border-brand-pine/10">
          <button
            onClick={() => supabase.auth.signOut()}
            className="w-full text-right font-bold py-2 px-4 text-red-600 hover:bg-red-50 rounded-lg transition-all"
          >
            تسجيل خروج
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6 md:p-10 overflow-y-auto">
        {activeTab === "orders" && <OrderManager />}
        {activeTab === "products" && <ProductManager />}
        {activeTab === "categories" && <CategoryManager />}
        {activeTab === "warehouse" && <WarehouseDashboard />}
        {activeTab === "invoices" && <InvoicesArchive />}
        {activeTab === "settings" && <StoreSettings />}
      </div>
    </div>
  );
}
