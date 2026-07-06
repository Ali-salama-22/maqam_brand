import { Package, RefreshCw, Receipt, Printer, X } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabaseBrowser";
import Image from "next/image";

export default function OrderHistory() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [invoiceOrder, setInvoiceOrder] = useState<any>(null);
  const invoiceRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  const handlePrint = () => {
     window.print();
  };

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (data.user) {
        const { data: ordersData } = await supabase
          .from("orders")
          .select("*")
          .eq("user_id", data.user.id)
          .order("created_at", { ascending: false });
        if (ordersData) setOrders(ordersData);
      }
      setLoading(false);
    });
  }, [supabase]);

  if (loading) {
    return (
      <div className="bg-brand-card border border-brand-border rounded-2xl p-8 shadow-sm w-full flex items-center justify-center py-20">
         <RefreshCw className="animate-spin text-brand-accent" size={32} />
      </div>
    );
  }

  return (
    <div className="bg-brand-card border border-brand-border rounded-[2.5rem] p-10 shadow-2xl w-full relative overflow-hidden transition-all duration-500">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-accent/20 to-transparent" />
      
      <h2 className="text-3xl font-black text-brand-text mb-10 border-b-2 border-brand-border pb-6 flex items-center gap-4 uppercase italic tracking-tighter">
        <Package size={32} className="text-brand-accent aura-glow" /> أرشيف الطلبات
      </h2>
      
      {orders.length === 0 ? (
        <div className="text-center py-20 bg-brand-bg/30 rounded-3xl border-2 border-dashed border-brand-border">
          <Package size={64} className="mx-auto text-brand-text/10 mb-6" />
          <p className="text-brand-text/30 italic font-black uppercase tracking-[0.2em]">لا يوجد سجل طلبات حالياً. ابدأ رحلتك مع مقام.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="flex flex-col md:flex-row justify-between p-8 bg-brand-bg/40 border border-brand-border rounded-[2rem] hover:bg-brand-accent/5 hover:border-brand-accent/30 transition-all duration-500 group shadow-sm hover:shadow-2xl">
              <div className="flex flex-col space-y-4 mb-6 md:mb-0">
                <div className="flex items-center gap-4">
                  <span className="font-black text-brand-text text-2xl tracking-tighter uppercase italic" dir="ltr">#{order.id.slice(0, 8).toUpperCase()}</span>
                  <span className="text-[10px] font-black text-brand-text/30 px-3 py-1 bg-brand-card rounded-full border border-brand-border uppercase tracking-widest">
                    {new Date(order.created_at).toLocaleDateString("ar-EG")}
                  </span>
                </div>
                
                <button 
                  onClick={() => setInvoiceOrder(order)}
                  className="flex items-center gap-3 text-[10px] font-black bg-brand-text text-brand-bg uppercase tracking-[0.2em] w-fit px-5 py-2.5 rounded-full hover:scale-105 transition-all shadow-xl"
                >
                  <Receipt size={16} /> تحميل الفاتورة
                </button>
              </div>
              
              <div className="flex flex-col md:items-end justify-between space-y-4">
                <span className="font-black text-brand-text text-3xl tabular-nums" dir="ltr">{order.total} <span className="text-xs opacity-30 uppercase tracking-tighter">ج.م</span></span>
                <span className={`text-[10px] font-black px-6 py-2 rounded-full uppercase tracking-[0.2em] shadow-sm border ${
                  order.status === "تم الاستلام" || order.status === "تم التوصيل" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                  order.status === "ملغي" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                  order.status === "مرتجع" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                   "bg-brand-accent/10 text-brand-text/80 border-brand-accent/20 animate-pulse"
                }`}>
                  {order.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Invoice Modal Overlay */}
      {invoiceOrder && (
        <div className="fixed inset-0 z-[200] bg-brand-bg/95 backdrop-blur-2xl overflow-y-auto pt-10 pb-20 px-4 sm:px-6 print:p-0 print:bg-white print:block transition-all duration-700 animate-in fade-in">
          <div className="bg-[#F8F9FA] w-full max-w-3xl mx-auto rounded-[3rem] shadow-[0_0_100px_rgba(120,144,156,0.15)] relative overflow-hidden print:shadow-none print:max-w-full border border-brand-border/20">
            
            {/* Modal Controls - Hidden in print */}
            <div className="flex justify-between items-center p-8 border-b border-brand-border/10 bg-white/50 backdrop-blur-md print:hidden sticky top-0 z-10">
               <button onClick={handlePrint} className="flex items-center gap-3 bg-black text-white px-8 py-3.5 rounded-full font-black text-[10px] tracking-[0.3em] uppercase hover:scale-105 transition-all shadow-2xl">
                 <Printer size={18} /> طباعة الفاتورة
               </button>
               <button onClick={() => setInvoiceOrder(null)} className="text-black/30 hover:text-black p-3 rounded-full hover:bg-black/5 transition-colors">
                 <X size={32} />
               </button>
            </div>

            {/* Invoice Document Body - CLEAN WHITE PAPER STYLE */}
            <div ref={invoiceRef} className="p-10 sm:p-16 md:p-20 text-black font-medium selection:bg-black/5">
               
               {/* Invoice Header */}
               <div className="flex flex-col sm:flex-row justify-between items-start gap-12 border-b-4 border-black/5 pb-12 mb-12">
                  <div className="order-2 sm:order-1">
                    <h2 className="text-5xl font-black text-black tracking-tighter mb-4 uppercase italic">MAQAM</h2>
                    <p className="text-[10px] font-black text-black/40 tracking-[0.4em] uppercase">أزياء الشارع الصناعية الفاخرة</p>
                    <div className="mt-8 space-y-1">
                      <p className="text-xs font-black uppercase opacity-60">فاتورة ضريبية / TAX INVOICE</p>
                      <p className="text-sm font-black tracking-tighter" dir="ltr">SID: MAQ-{invoiceOrder.id.slice(0,12).toUpperCase()}</p>
                    </div>
                  </div>
                  <div className="text-right sm:text-right order-1 sm:order-2 w-full sm:w-auto">
                    <p className="text-3xl font-black text-black tracking-tighter uppercase italic" dir="ltr">رقم الطلب #{invoiceOrder.id.slice(0, 5).toUpperCase()}</p>
                    <div className="mt-4 text-xs font-black text-black/40 space-y-1 uppercase tracking-widest leading-loose">
                      <p>{new Date(invoiceOrder.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      <p>{new Date(invoiceOrder.created_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute:'2-digit' })}</p>
                    </div>
                  </div>
               </div>

               {/* Customer Details */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
                 <div className="space-y-6">
                    <h3 className="text-[10px] font-black text-black/30 uppercase tracking-[0.4em] mb-4">بيانات العميل</h3>
                    <div className="space-y-2">
                       <p className="text-xl font-black uppercase tracking-tighter">{invoiceOrder.customer_name || "عميل مقام"}</p>
                       <p className="text-sm font-bold opacity-60" dir="ltr">{invoiceOrder.phone}</p>
                    </div>
                 </div>
                 <div className="space-y-6">
                    <h3 className="text-[10px] font-black text-black/30 uppercase tracking-[0.4em] mb-4">عنوان الشحن</h3>
                    <p className="text-sm font-bold leading-relaxed opacity-70">{invoiceOrder.address}</p>
                 </div>
               </div>

               {/* Items Table */}
               <div className="mb-12 border-2 border-black/5 rounded-[2rem] overflow-hidden">
                 <table className="w-full text-black text-xs sm:text-sm min-w-[500px]">
                   <thead className="bg-black text-[#F8F9FA]">
                     <tr>
                       <th className="p-6 text-right font-black uppercase tracking-[0.2em] text-[10px]">المنتج</th>
                       <th className="p-6 text-center font-black uppercase tracking-[0.2em] text-[10px]">المواصفات</th>
                       <th className="p-6 text-center font-black uppercase tracking-[0.2em] text-[10px]">الكمية</th>
                       <th className="p-6 text-left font-black uppercase tracking-[0.2em] text-[10px]">السعر</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-black/5">
                     {invoiceOrder.items?.map((item: any, i: number) => (
                       <tr key={i} className="hover:bg-black/[0.02] transition-colors">
                         <td className="p-6 align-middle">
                           <div className="font-black uppercase tracking-tighter text-sm">{item.name}</div>
                         </td>
                         <td className="p-6 text-center align-middle">
                            <div className="flex items-center justify-center gap-3">
                              <span className="w-4 h-4 rounded-full border border-black/10 shadow-inner" style={{backgroundColor: item.color || '#fff'}}></span>
                              <span className="font-black text-[10px] uppercase tracking-widest opacity-60">مقاس: {item.size}</span>
                            </div>
                         </td>
                         <td className="p-6 text-center align-middle font-black">{item.qty}</td>
                         <td className="p-6 text-left align-middle font-black tracking-tighter" dir="ltr">{item.price} ج.م</td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>

               {/* Totals */}
               <div className="flex flex-col items-start gap-6 border-t-4 border-black pb-12">
                  <div className="w-full sm:w-1/2 pt-12 space-y-4">
                    <div className="flex justify-between items-center text-xs font-black uppercase tracking-[0.2em] opacity-40">
                      <span>إجمالي المنتجات</span>
                      <span>{invoiceOrder.total} ج.م</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-black uppercase tracking-[0.2em] opacity-40">
                      <span>الشحن والتوصيل</span>
                      <span className="text-emerald-600 font-bold">شحن مجاني</span>
                    </div>
                    <div className="flex justify-between items-center pt-8 border-t-2 border-black/5">
                      <span className="font-black text-black text-2xl uppercase italic tracking-tighter">المبلغ المستحق</span>
                      <span className="font-black text-black text-5xl tracking-tighter leading-none" dir="ltr">{invoiceOrder.total} <span className="text-xs uppercase opacity-30 tracking-tighter">ج.م</span></span>
                    </div>
                  </div>
               </div>

               {/* Footer */}
               <div className="mt-20 text-center space-y-4">
                  <p className="text-[10px] font-black text-black opacity-30 tracking-[0.5em] uppercase">شكراً لاختيارك الفخامة مع مقام</p>
                  <div className="flex items-center justify-center gap-8 pt-8 border-t border-black/5">
                     <p className="text-[9px] font-black uppercase tracking-widest opacity-40">أزياء شارع أصلية</p>
                     <p className="text-[9px] font-black uppercase tracking-widest opacity-40">القاهرة // عالمي</p>
                  </div>
               </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
