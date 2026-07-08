"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabaseBrowser";
import { DollarSign, MessageCircle, PackageOpen, Award, Bell, AlertTriangle } from "lucide-react";

type OrderItem = { id: string; name: string; size: string; qty: number; price: string };

type Order = {
  id: string;
  customer_name: string;
  phone: string;
  address: string;
  alt_phone?: string;
  total: number;
  total_amount?: number;
  status: string;
  items: OrderItem[];
  created_at: string;
};

const ORDER_STATUSES = [
  "قيد المراجعة",
  "قيد التغليف",
  "في الطريق إليك",
  "تم الاستلام",
  "ملغي",
  "مرتجع"
];

export default function OrderManager() {
  const supabase = createClient();
  const [orders, setOrders] = useState<Order[]>([]);
  const [toast, setToast] = useState("");
  const [loyaltyThreshold, setLoyaltyThreshold] = useState(5);
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);

  const fetchOrders = async () => {
    const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    if (data) setOrders(data);
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 5000);
  };

  useEffect(() => {
    fetchOrders();

    // Fetch Loyalty Threshold
    supabase.from("store_settings").select("loyalty_order_threshold").eq("id", 1).single().then(({ data }) => {
      if (data?.loyalty_order_threshold) setLoyaltyThreshold(data.loyalty_order_threshold);
    });

    // Fetch Low Stock
    supabase.from("products").select("id, name, stock_count").lt("stock_count", 5).then(({ data }) => {
      if (data) setLowStockProducts(data);
    });

    // Set up Realtime Subscription for New Orders
    const channel = supabase
      .channel("orders_channel")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "orders" }, (payload) => {
        const newOrder = payload.new as Order;
        setOrders(prev => [newOrder, ...prev]);
        showToast(`طلب جديد وصل من ${newOrder.customer_name || 'عميل'} !`);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    // Optimistic UI
    setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
    await supabase.from("orders").update({ status: newStatus }).eq("id", id);
  };

  // Financials Calculation
  const totalRevenue = orders
    .filter(o => o.status === "تم الاستلام")
    .reduce((sum, o) => sum + Number(o.total ?? o.total_amount), 0);

  // Loyalty calculation (Grouping by phone number to find VIPs)
  const phoneCounts = orders.reduce((acc, obj) => {
    if (obj.phone) acc[obj.phone] = (acc[obj.phone] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const vipPhones = Object.keys(phoneCounts).filter(p => phoneCounts[p] >= loyaltyThreshold);

  return (
    <div className="space-y-12 relative pb-20">
      
      {/* Realtime Toast Notification */}
      {toast && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 bg-brand-accent text-black px-10 py-5 rounded-full font-black shadow-3xl flex items-center gap-4 animate-bounce border-2 border-white/20">
          <Bell className="aura-glow" /> <span className="uppercase tracking-widest text-sm">{toast}</span>
        </div>
      )}

      {/* Financials & Loyalty Dashboard */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        
        {/* Revenue Card */}
        <div className="bg-brand-text p-12 rounded-[3.5rem] shadow-3xl flex flex-col items-center justify-center relative overflow-hidden group border border-brand-border/20 shadow-[0_30px_100px_rgba(0,0,0,0.15)]">
          <div className="absolute inset-0 bg-brand-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <DollarSign size={120} className="absolute -right-8 -bottom-8 opacity-10 text-brand-bg rotate-12 group-hover:rotate-0 transition-transform duration-1000" />
          <h3 className="text-[10px] font-black text-brand-bg/60 mb-5 font-sans tracking-[0.5em] uppercase">
             إجمالي الإيرادات المعتمدة (صافي)
          </h3>
          <p className="text-7xl font-black tracking-tighter text-brand-bg drop-shadow-sm leading-none flex items-baseline gap-4" dir="ltr">
            {totalRevenue.toLocaleString()} <span className="text-xl opacity-40 not-italic font-black uppercase flex items-center">EGP</span>
          </p>
        </div>

        {/* Loyalty VIP Tracking */}
        <div className="bg-brand-card border border-brand-border p-10 rounded-[3rem] shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-accent/10 rounded-full blur-3xl -mr-16 -mt-16" />
          
          <h3 className="text-2xl font-black text-brand-text mb-6 flex items-center gap-3 italic uppercase tracking-tighter leading-none">
            <Award size={32} className="text-brand-accent" /> نادي مقام كبار الشخصيات
          </h3>
          <p className="text-[10px] text-brand-text/30 mb-8 font-black uppercase tracking-[0.4em] leading-relaxed">
            العملاء المكتملون لحاجز الـ ({loyaltyThreshold}) طلبيات بنجاح.
          </p>
          
          <div className="space-y-4 max-h-[280px] overflow-y-auto scrollbar-hide pr-2">
            {vipPhones.length === 0 ? (
              <p className="italic text-center py-16 text-brand-text/10 font-black uppercase text-xs tracking-[0.5em]">لا يوجد أعضاء في نظام الولاء</p>
            ) : (
              vipPhones.map(phone => {
                const customer = orders.find(o => o.phone === phone)?.customer_name;
                return (
                  <div key={phone} className="flex justify-between items-center bg-brand-bg/40 p-6 rounded-[2rem] border border-brand-border hover:border-brand-accent/30 transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-accent/5 rounded-full blur-3xl -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="flex flex-col relative z-10">
                      <span className="font-black text-brand-text text-xl italic tracking-tighter uppercase">{customer || "عضو مجهول"}</span>
                      <span className="text-[10px] font-black text-brand-text/20 tracking-[0.4em] mt-2 uppercase" dir="ltr">{phone}</span>
                    </div>
                    
                    <div className="flex items-center gap-5 relative z-10">
                      <span className="bg-brand-accent/10 text-brand-accent text-[9px] px-5 py-2.5 rounded-full font-black uppercase tracking-[0.2em] border border-brand-accent/20">
                        {phoneCounts[phone]} عمليات
                      </span>
                      <a 
                        href={`https://wa.me/${phone?.replace('+', '')}?text=أهلاً ${customer}! مبروك وصولك لنظام الولاء في مقام 🌟`}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-2xl shadow-xl shadow-green-500/30 transition-all hover:scale-110 active:scale-95"
                      >
                        <MessageCircle size={20} />
                      </a>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Low Stock Alerts Widget */}
        {lowStockProducts.length > 0 && (
          <div className="bg-red-500/5 border-2 border-red-500/10 p-10 rounded-[3rem] shadow-sm xl:col-span-2 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-[100px] -mr-32 -mt-32" />
            
            <h3 className="text-2xl font-black text-red-500 mb-8 flex items-center gap-3 italic uppercase tracking-tighter leading-none">
              <AlertTriangle size={32} className="animate-pulse" /> تحذير نفاذ المخزون (Critical)
            </h3>
            <div className="flex flex-wrap gap-5">
               {lowStockProducts.map(p => (
                 <div key={p.id} className="bg-brand-card px-8 py-4 rounded-2xl shadow-sm border border-red-500/20 flex items-center gap-6 group hover:bg-red-500/10 transition-all hover:-translate-y-1">
                    <span className="font-black text-brand-text text-sm uppercase tracking-[0.2em] truncate max-w-[250px] italic">{p.name}</span>
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] font-black text-brand-text/30 uppercase">متبقي:</span>
                       <span className="bg-red-500 text-white text-[10px] font-black px-4 py-1.5 rounded-full shadow-xl shadow-red-500/30">{p.stock_count}</span>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        )}

      </div>

      {/* Orders List */}
      <div className="bg-brand-card p-10 rounded-[3.5rem] shadow-sm border border-brand-border relative overflow-hidden">
        <div className="flex justify-between items-end mb-8 border-b-2 border-brand-border pb-10">
          <div>
            <h3 className="text-4xl font-black text-brand-text mb-3 flex items-center gap-4 italic uppercase tracking-tighter leading-none">
              <PackageOpen size={48} className="text-brand-accent" /> الأرشيف التشغيلي
            </h3>
            <p className="text-[10px] text-brand-text/30 font-black uppercase tracking-[0.5em] leading-relaxed">إدارة الشحنات والتحكم في دورة حياة الطلبات</p>
          </div>
        </div>

        {/* Archive Search Bar */}
        <div className="mb-10">
          <div className="relative">
            <input 
              type="text"
              placeholder="بحث بكود الطلب (Order ID)..."
              className="w-full bg-brand-bg/50 border-2 border-brand-border rounded-2xl p-5 text-brand-text font-black uppercase tracking-widest outline-none focus:border-brand-accent transition-all shadow-inner pr-14"
              dir="ltr"
              onChange={(e) => {
                const val = e.target.value.trim().toLowerCase();
                const container = document.getElementById('search-result-card');
                if (!val || val.length < 3) {
                  if (container) container.innerHTML = '';
                  return;
                }
                const found = orders.find(o => o.id.toLowerCase().includes(val) || o.id.slice(0,8).toLowerCase().includes(val));
                if (found && container) {
                  container.innerHTML = `
                    <div class="bg-brand-bg/60 border-2 border-brand-accent/30 rounded-3xl p-8 space-y-4 animate-in fade-in">
                      <div class="flex justify-between items-start">
                        <div>
                          <p class="text-[10px] font-black text-brand-text/30 uppercase tracking-widest mb-1">اسم العميل</p>
                          <p class="text-2xl font-black text-brand-text italic uppercase tracking-tighter">${found.customer_name || 'عميل زائر'}</p>
                        </div>
                        <div class="text-left">
                          <p class="text-[10px] font-black text-brand-text/30 uppercase tracking-widest mb-1">إجمالي السعر</p>
                          <p class="text-3xl font-black text-brand-accent italic">${found.total} <span class="text-xs">ج.م</span></p>
                        </div>
                      </div>
                      <div class="grid grid-cols-2 gap-4 pt-4 border-t border-brand-border">
                        <div>
                          <p class="text-[10px] font-black text-brand-text/30 uppercase tracking-widest mb-1">رقم الهاتف</p>
                          <p class="font-black text-brand-text" dir="ltr">${found.phone || '—'}</p>
                        </div>
                        <div>
                          <p class="text-[10px] font-black text-brand-text/30 uppercase tracking-widest mb-1">العنوان التفصيلي</p>
                          <p class="font-bold text-brand-text/60 text-sm">${found.address || '—'}</p>
                        </div>
                      </div>
                      <div class="pt-4 border-t border-brand-border">
                        <p class="text-[10px] font-black text-brand-text/30 uppercase tracking-widest mb-2">المنتجات المطلوبة</p>
                        <div class="flex flex-wrap gap-2">
                          ${found.items && found.items.length > 0 ? found.items.map((item: any) => `<span class="bg-brand-card border border-brand-border rounded-full px-4 py-2 text-xs font-black text-brand-text">${item.name} (${item.size}) × ${item.qty}</span>`).join('') : '<span class="opacity-30">—</span>'}
                        </div>
                      </div>
                      <button onclick="window.__showInvoice='${found.id}'; document.getElementById('invoice-modal-${found.id}')?.classList.remove('hidden')" class="w-full mt-4 py-4 rounded-2xl font-black uppercase tracking-widest text-sm bg-brand-accent/10 text-brand-accent border border-brand-accent/20 hover:bg-brand-accent hover:text-white transition-all">عرض الفاتورة الكاملة</button>
                    </div>
                  `;
                } else if (container) {
                  container.innerHTML = '<p class="text-center py-8 text-brand-text/20 font-black uppercase text-xs tracking-widest">لم يتم العثور على طلب بهذا الكود</p>';
                }
              }}
            />
            <span className="absolute top-1/2 -translate-y-1/2 right-5 text-brand-text/20">🔍</span>
          </div>
          <div id="search-result-card" className="mt-4"></div>
        </div>

        {/* Invoice Modals */}
        {orders.map(order => (
          <div key={`inv-${order.id}`} id={`invoice-modal-${order.id}`} className="hidden fixed inset-0 z-[200] flex items-center justify-center p-4 bg-brand-bg/80 backdrop-blur-md">
            <div className="bg-brand-card border border-brand-border rounded-[3rem] p-10 max-w-lg w-full shadow-3xl relative overflow-hidden max-h-[90vh] overflow-y-auto">
              <button onClick={() => document.getElementById(`invoice-modal-${order.id}`)?.classList.add('hidden')} className="absolute top-6 right-6 text-2xl font-black text-brand-text/30 hover:text-brand-text">&times;</button>
              <div className="text-center mb-8 pb-6 border-b border-brand-border">
                <h2 className="text-3xl font-black uppercase italic tracking-tighter text-brand-text">فاتورة <span className="text-brand-accent">مقام</span></h2>
                <p className="text-[9px] font-black text-brand-text/30 uppercase tracking-widest mt-2" dir="ltr">#{order.id.slice(0,8).toUpperCase()}</p>
              </div>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between"><span className="text-xs font-black text-brand-text/40">العميل</span><span className="font-black text-brand-text">{order.customer_name || 'زائر'}</span></div>
                <div className="flex justify-between"><span className="text-xs font-black text-brand-text/40">الهاتف</span><span className="font-black text-brand-text" dir="ltr">{order.phone}</span></div>
                {order.alt_phone && <div className="flex justify-between"><span className="text-xs font-black text-brand-text/40">هاتف بديل</span><span className="font-bold text-brand-accent" dir="ltr">{order.alt_phone}</span></div>}
                <div className="flex justify-between"><span className="text-xs font-black text-brand-text/40">العنوان</span><span className="font-bold text-brand-text/60 text-sm max-w-[200px] text-left">{order.address}</span></div>
                <div className="flex justify-between"><span className="text-xs font-black text-brand-text/40">التاريخ</span><span className="font-bold text-brand-text/60 text-sm" dir="ltr">{new Date(order.created_at).toLocaleDateString('ar-EG')}</span></div>
              </div>
              <div className="border-t border-brand-border pt-4 mb-6">
                <p className="text-[10px] font-black text-brand-text/30 uppercase tracking-widest mb-3">المنتجات</p>
                {order.items && order.items.map((item, i) => (
                  <div key={i} className="flex justify-between items-center py-3 border-b border-brand-border/50">
                    <span className="font-black text-sm text-brand-text">{item.name} <span className="text-brand-text/30">({item.size})</span></span>
                    <span className="font-black text-brand-accent">{item.qty} × {item.price}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center pt-4 border-t-2 border-brand-text">
                <span className="font-black text-xl text-brand-text uppercase">الإجمالي</span>
                <span className="font-black text-3xl text-brand-accent italic">{order.total ?? order.total_amount} ج.م</span>
              </div>
            </div>
          </div>
        ))}

        <div className="min-w-full overflow-x-auto scrollbar-hide">
          <table className="w-full text-right font-black text-brand-text border-separate border-spacing-y-6">
            <thead>
              <tr className="text-brand-text/20 text-[9px] uppercase tracking-[0.4em] font-black">
                <th className="px-8 pb-4 font-black">هوية العميل</th>
                <th className="px-8 pb-4 font-black">تفاصيل التواصل</th>
                <th className="px-8 pb-4 font-black">تكويد المنتجات</th>
                <th className="px-8 pb-4 font-black">صافي الفاتورة</th>
                <th className="px-8 pb-4 font-black text-left">الحالة التنفيذية</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-32 text-brand-text/10 font-black uppercase text-xs tracking-[0.6em] italic border-2 border-dashed border-brand-border rounded-[3rem]">لا توجد عمليات مسجلة في تيار البيانات حالياً</td>
                </tr>
              )}
              {orders.map(order => (
                <tr key={order.id} className="bg-brand-bg/40 border border-brand-border group hover:bg-brand-accent/5 transition-all shadow-sm">
                  <td className="px-8 py-8 items-start first:rounded-r-[2.5rem] border-y border-r border-brand-border">
                    <div className="font-black text-xl text-brand-text mb-3 italic tracking-tighter uppercase">{order.customer_name || "عميل زائر"}</div>
                    <div className="flex flex-col gap-2">
                      <span className="text-[9px] font-black text-brand-accent uppercase tracking-[0.3em] bg-brand-accent/5 w-fit px-4 py-1.5 rounded-full border border-brand-accent/10" dir="ltr">
                        LOG #{order.id.slice(0, 8).toUpperCase()}
                      </span>
                      <span className="text-[9px] font-black text-brand-text/20 uppercase tracking-[0.4em] mt-2 block" dir="ltr">
                        {new Date(order.created_at).toLocaleDateString('ar-EG')} • {new Date(order.created_at).toLocaleTimeString('ar-EG')}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-8 align-top border-y border-brand-border">
                    <div className="flex flex-col gap-3">
                       <span dir="ltr" className="font-black text-base text-brand-text tracking-[0.1em]">{order.phone}</span>
                       <span className="text-[10px] font-black text-brand-text/40 max-w-[200px] leading-relaxed uppercase tracking-widest">{order.address}</span>
                    </div>
                  </td>
                  <td className="px-8 py-8 align-top border-y border-brand-border">
                    <div className="flex flex-col gap-3">
                    {order.items && order.items.length > 0 ? order.items.map((item, i) => (
                       <div key={i} className="text-[9px] font-black bg-brand-card border-2 border-brand-border rounded-xl px-4 py-3 flex justify-between items-center gap-4 group/item hover:border-brand-accent/30 transition-all">
                         <span className="text-brand-text/60 truncate max-w-[120px] uppercase italic">{item.name}</span>
                         <span className="text-brand-accent bg-brand-accent/10 px-3 py-1 rounded-full text-[8px] border border-brand-accent/10">{item.size} • QTY {item.qty}</span>
                       </div>
                    )) : <span className="opacity-10">—</span>}
                    </div>
                  </td>
                  <td className="px-8 py-8 align-top border-y border-brand-border">
                    <div className="text-2xl font-black text-brand-text italic tracking-tighter leading-none">
                      {order.total ?? order.total_amount} <span className="text-[10px] opacity-20 uppercase tracking-widest not-italic">j.m</span>
                    </div>
                  </td>
                  <td className="px-8 py-8 align-top last:rounded-l-[2.5rem] border-y border-l border-brand-border text-left">
                    <div className="flex flex-col gap-6 items-end">
                      <select 
                        value={order.status || "قيد المراجعة"}
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                        className={`font-black p-5 rounded-2xl border-2 outline-none transition-all text-[11px] uppercase tracking-[0.3em] min-w-[180px] shadow-sm appearance-none text-center cursor-pointer
                          ${order.status === "تم الاستلام" ? "bg-green-500/10 border-green-500/30 text-green-500" :
                            order.status === "ملغي" ? "bg-red-500/10 border-red-500/30 text-red-500" :
                            order.status === "مرتجع" ? "bg-brand-text/10 border-brand-text/30 text-brand-text" :
                            order.status === "قيد المراجعة" ? "bg-brand-accent/10 border-brand-accent/30 text-brand-accent" :
                            "bg-brand-bg/50 border-brand-border text-brand-text"
                          }`}
                      >
                        {ORDER_STATUSES.map(s => <option key={s} value={s} className="bg-brand-card font-black">{s}</option>)}
                      </select>
                      
                      <div className="flex gap-3">
                        {order.status === "تم الاستلام" ? (
                          <button 
                            onClick={() => updateStatus(order.id, "مرتجع")} 
                            className="text-[9px] font-black py-2.5 px-5 bg-brand-text/5 text-brand-text/30 border border-brand-border rounded-full hover:bg-brand-text hover:text-brand-card transition-all uppercase tracking-[0.3em] shadow-sm"
                          >
                            إرجاع المقتنى
                          </button>
                        ) : order.status !== "ملغي" && order.status !== "مرتجع" ? (
                          <button 
                            onClick={() => updateStatus(order.id, "ملغي")} 
                            className="text-[9px] font-black py-3 px-6 bg-red-500/5 text-red-500/40 border border-red-500/10 rounded-full hover:bg-red-500 hover:text-white transition-all uppercase tracking-[0.4em] shadow-lg shadow-red-500/10"
                          >
                            سحب الطلب
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
