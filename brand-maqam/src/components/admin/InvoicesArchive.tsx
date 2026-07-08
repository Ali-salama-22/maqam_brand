"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabaseBrowser";
import { Receipt, Search, RefreshCw, Printer, X, Filter } from "lucide-react";

type OrderItem = {
  id: string;
  name: string;
  size: string;
  color?: string;
  qty: number;
  price: number | string;
};

type Order = {
  id: string;
  customer_name: string;
  phone: string;
  alt_phone?: string;
  address: string;
  total: number;
  total_amount?: number;
  status: string;
  items: OrderItem[];
  created_at: string;
};

// ── Invoice Print View ─────────────────────────────────────────────────────
function InvoicePrintModal({ order, onClose }: { order: Order; onClose: () => void }) {
  const handlePrint = () => window.print();

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md print:bg-transparent print:p-0 print:items-start">
      <div
        className="bg-white text-black rounded-[2rem] p-10 max-w-lg w-full shadow-2xl relative max-h-[90vh] overflow-y-auto print:shadow-none print:rounded-none print:max-h-none print:overflow-visible"
        id="admin-invoice-print"
      >
        <button
          onClick={onClose}
          className="absolute top-5 left-5 text-black/40 hover:text-black text-2xl font-black print:hidden"
        >
          <X size={24} />
        </button>

        {/* Header */}
        <div className="text-center mb-8 pb-6 border-b-2 border-black/10">
          <h1 className="text-4xl font-black uppercase italic tracking-tighter mb-1">MAQAM</h1>
          <p className="text-xs font-black uppercase tracking-[0.4em] text-black/40">فاتورة إدارية رسمية</p>
          <p className="text-[10px] font-bold text-black/30 mt-2 font-mono" dir="ltr">
            #{order.id.slice(0, 8).toUpperCase()}
          </p>
          <div className="mt-3">
            <span className={`text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full ${
              order.status === "تم الاستلام" ? "bg-green-100 text-green-700" :
              order.status === "ملغي" ? "bg-red-100 text-red-700" :
              "bg-blue-100 text-blue-700"
            }`}>
              {order.status}
            </span>
          </div>
        </div>

        {/* Customer Info */}
        <div className="space-y-3 mb-6 text-sm">
          {[
            { label: "الاسم", value: order.customer_name || "عميل زائر" },
            { label: "الهاتف", value: order.phone, ltr: true },
            ...(order.alt_phone ? [{ label: "هاتف احتياطي", value: order.alt_phone, ltr: true }] : []),
            { label: "العنوان", value: order.address },
            { label: "التاريخ", value: new Date(order.created_at).toLocaleDateString("ar-EG"), ltr: true },
            { label: "الوقت", value: new Date(order.created_at).toLocaleTimeString("ar-EG"), ltr: true },
          ].map(({ label, value, ltr }) => (
            <div key={label} className="flex justify-between items-start">
              <span className="font-black text-black/40 uppercase text-[10px] tracking-widest shrink-0">{label}</span>
              <span className={`font-bold text-sm text-left max-w-[250px] leading-relaxed ${ltr ? "font-mono" : ""}`} dir={ltr ? "ltr" : "rtl"}>
                {value}
              </span>
            </div>
          ))}
        </div>

        {/* Items */}
        <div className="border-t-2 border-black/10 pt-4 mb-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-black/40 mb-3">المنتجات المطلوبة</p>
          {order.items?.map((item, i) => (
            <div key={i} className="flex justify-between items-center py-3 border-b border-black/5">
              <div>
                <p className="font-black uppercase text-sm">{item.name}</p>
                <p className="text-[10px] text-black/40 font-bold uppercase">
                  مقاس: {item.size}
                  {item.color ? ` | لون: ${item.color}` : ""}
                </p>
              </div>
              <div className="text-left">
                <p className="font-black text-sm">{item.qty} × {item.price} ج.م</p>
                <p className="text-[10px] text-black/40 font-bold">
                  {Number(item.qty) * Number(item.price)} ج.م
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="flex justify-between items-center pt-4 border-t-4 border-black">
          <span className="font-black text-xl uppercase tracking-tighter">الإجمالي النهائي</span>
          <span className="font-black text-3xl italic">{order.total ?? order.total_amount} <span className="text-sm">ج.م</span></span>
        </div>

        {/* Store Closing */}
        <div className="mt-8 pt-6 border-t border-black/10 text-center">
          <p className="text-lg font-black uppercase italic tracking-widest text-black/70">
            شكراً لطلبك من مقام 🌟
          </p>
          <p className="text-[9px] font-black uppercase tracking-[0.5em] text-black/30 mt-2">
            MAQAM | URBAN PREMIUM
          </p>
        </div>

        {/* Print */}
        <button
          onClick={handlePrint}
          className="w-full mt-6 flex items-center justify-center gap-3 bg-black text-white py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-black/80 transition-all print:hidden"
        >
          <Printer size={18} /> طباعة الفاتورة
        </button>
      </div>
    </div>
  );
}

// ── Main Invoices Archive ───────────────────────────────────────────────────
export default function InvoicesArchive() {
  const supabase = createClient();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("الكل");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      if (data) setOrders(data);
    } catch (err: any) {
      console.error("Invoice fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = orders.filter(o => {
    const matchesSearch =
      !searchTerm ||
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.customer_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.phone || "").includes(searchTerm);
    const matchesStatus = statusFilter === "الكل" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statuses = ["الكل", "قيد المراجعة", "قيد التغليف", "في الطريق إليك", "تم الاستلام", "ملغي", "مرتجع"];

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <RefreshCw className="animate-spin text-brand-accent" size={48} />
      </div>
    );
  }

  return (
    <>
      {selectedOrder && (
        <InvoicePrintModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}

      <div className="space-y-10 pb-20">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div>
            <h2 className="text-4xl font-black text-brand-text uppercase italic tracking-tighter flex items-center gap-3">
              <Receipt className="text-brand-accent" size={40} /> أرشيف الفواتير
            </h2>
            <p className="text-[10px] font-black text-brand-text/30 uppercase tracking-widest mt-2">
              Invoice Archive • {orders.length} فاتورة مسجلة
            </p>
          </div>
          <button
            onClick={fetchOrders}
            className="flex items-center gap-2 btn-melt px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:scale-105"
          >
            <RefreshCw size={16} /> تحديث
          </button>
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 flex items-center gap-3 bg-brand-card border-2 border-brand-border rounded-2xl px-5 py-4 focus-within:border-brand-accent/40 transition-all shadow-inner">
            <Search size={18} className="text-brand-text/30 shrink-0" />
            <input
              type="text"
              placeholder="بحث بالاسم، رقم الهاتف، أو كود الطلب..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm font-black text-brand-text placeholder:text-brand-text/20"
            />
          </div>
          <div className="flex items-center gap-2 bg-brand-card border-2 border-brand-border rounded-2xl px-4 overflow-x-auto scrollbar-hide">
            <Filter size={16} className="text-brand-text/30 shrink-0" />
            {statuses.map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                  statusFilter === s
                    ? "bg-brand-accent text-brand-bg"
                    : "text-brand-text/40 hover:text-brand-text"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Invoices Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-brand-text/20 font-black uppercase tracking-widest text-xs border-2 border-dashed border-brand-border rounded-[3rem]">
            لا توجد فواتير مطابقة للبحث
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map(order => (
              <div
                key={order.id}
                className="bg-brand-card border-2 border-brand-border rounded-[2rem] p-6 hover:border-brand-accent/30 transition-all group relative overflow-hidden cursor-pointer hover:shadow-xl"
                onClick={() => setSelectedOrder(order)}
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-accent/5 rounded-full blur-3xl -mr-12 -mt-12 opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Order Header */}
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div>
                    <p className="font-black text-brand-text text-lg uppercase italic tracking-tighter leading-none">
                      {order.customer_name || "عميل زائر"}
                    </p>
                    <p className="text-[9px] font-black text-brand-accent mt-1 tracking-[0.3em] uppercase" dir="ltr">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shrink-0 ${
                    order.status === "تم الاستلام" ? "bg-green-500/10 text-green-500" :
                    order.status === "ملغي" ? "bg-red-500/10 text-red-500" :
                    order.status === "مرتجع" ? "bg-brand-text/10 text-brand-text/50" :
                    "bg-brand-accent/10 text-brand-accent"
                  }`}>
                    {order.status}
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-2 relative z-10">
                  <div className="flex justify-between text-xs">
                    <span className="text-brand-text/40 font-black uppercase tracking-widest">الهاتف</span>
                    <span className="font-black text-brand-text" dir="ltr">{order.phone}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-brand-text/40 font-black uppercase tracking-widest">المنتجات</span>
                    <span className="font-black text-brand-text">{order.items?.length || 0} منتج</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-brand-text/40 font-black uppercase tracking-widest">التاريخ</span>
                    <span className="font-bold text-brand-text/60" dir="ltr">
                      {new Date(order.created_at).toLocaleDateString("ar-EG")}
                    </span>
                  </div>
                </div>

                {/* Total + CTA */}
                <div className="mt-4 pt-4 border-t border-brand-border flex justify-between items-center relative z-10">
                  <span className="text-2xl font-black text-brand-text italic">
                    {order.total ?? order.total_amount}
                    <span className="text-[10px] opacity-40 ml-1">ج.م</span>
                  </span>
                  <div className="flex items-center gap-2 text-brand-accent opacity-0 group-hover:opacity-100 transition-all">
                    <Receipt size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">عرض الفاتورة</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
