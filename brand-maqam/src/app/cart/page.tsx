"use client";

import { useEffect, useState } from "react";
import {
  PackageOpen, ArrowRight, Trash2, MapPin, Phone,
  User as UserIcon, RefreshCw, LogIn, Receipt, Download, CheckCircle2, ShoppingBag
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabaseBrowser";
import { useCart, CartItem } from "@/lib/CartContext";
import Image from "next/image";

// ─── Types ───────────────────────────────────────────────────────────────────
type CheckoutData = {
  name: string;
  phone: string;
  altPhone: string;
  address: string;
};

type OrderResult = {
  orderId: string;
  items: CartItem[];
  total: number;
  data: CheckoutData;
};

// ─── Invoice Modal ─────────────────────────────────────────────────────────
function InvoiceModal({ order, onClose }: { order: OrderResult; onClose: () => void }) {
  const handlePrint = () => window.print();

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="bg-white text-black rounded-[2rem] p-10 max-w-lg w-full shadow-2xl relative max-h-[90vh] overflow-y-auto" id="invoice-print">
        <button
          onClick={onClose}
          className="absolute top-5 left-5 text-black/40 hover:text-black text-2xl font-black"
        >
          ×
        </button>

        {/* Invoice Header */}
        <div className="text-center mb-8 pb-6 border-b-2 border-black/10">
          <h1 className="text-4xl font-black uppercase italic tracking-tighter mb-1">MAQAM</h1>
          <p className="text-xs font-black uppercase tracking-[0.4em] text-black/40">فاتورة إلكترونية رسمية</p>
          <p className="text-[10px] font-bold text-black/30 mt-2 font-mono" dir="ltr">
            #{order.orderId.slice(0, 8).toUpperCase()}
          </p>
        </div>

        {/* Customer Info */}
        <div className="space-y-3 mb-6 text-sm">
          <div className="flex justify-between">
            <span className="font-black text-black/40 uppercase text-[10px] tracking-widest">الاسم</span>
            <span className="font-black">{order.data.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-black text-black/40 uppercase text-[10px] tracking-widest">الهاتف</span>
            <span className="font-black" dir="ltr">{order.data.phone}</span>
          </div>
          {order.data.altPhone && (
            <div className="flex justify-between">
              <span className="font-black text-black/40 uppercase text-[10px] tracking-widest">هاتف احتياطي</span>
              <span className="font-black" dir="ltr">{order.data.altPhone}</span>
            </div>
          )}
          <div className="flex justify-between items-start">
            <span className="font-black text-black/40 uppercase text-[10px] tracking-widest shrink-0">العنوان</span>
            <span className="font-bold text-black/70 text-xs max-w-[280px] text-left leading-relaxed">{order.data.address}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-black text-black/40 uppercase text-[10px] tracking-widest">التاريخ</span>
            <span className="font-bold text-black/60 text-xs" dir="ltr">
              {new Date().toLocaleDateString("ar-EG")}
            </span>
          </div>
        </div>

        {/* Items */}
        <div className="border-t-2 border-black/10 pt-4 mb-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-black/40 mb-3">المنتجات المطلوبة</p>
          {order.items.map((item: any, i: number) => (
            <div key={i} className="flex justify-between items-center py-3 border-b border-black/5 text-sm">
              <div>
                <p className="font-black uppercase text-sm">{item.name}</p>
                <p className="text-[10px] text-black/40 font-bold uppercase">
                  مقاس: {item.size} {item.color ? `| لون: ${item.color}` : ""}
                </p>
              </div>
              <div className="text-left">
                <p className="font-black">{item.qty} × {item.price} ج.م</p>
                <p className="text-[10px] text-black/40 font-bold">{item.qty * item.price} ج.م</p>
              </div>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="flex justify-between items-center pt-4 border-t-4 border-black">
          <span className="font-black text-xl uppercase tracking-tighter">الإجمالي النهائي</span>
          <span className="font-black text-3xl italic">{order.total} <span className="text-sm">ج.م</span></span>
        </div>

        {/* Closing Message */}
        <div className="mt-8 pt-6 border-t border-black/10 text-center">
          <p className="text-lg font-black uppercase italic tracking-widest text-black/70">شكراً لطلبك من مقام 🌟</p>
          <p className="text-[9px] font-black uppercase tracking-[0.5em] text-black/30 mt-2">MAQAM | URBAN PREMIUM</p>
        </div>

        {/* Print Button */}
        <button
          onClick={handlePrint}
          className="w-full mt-6 flex items-center justify-center gap-3 bg-black text-white py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-black/80 transition-all print:hidden"
        >
          <Download size={18} /> تنزيل / طباعة الفاتورة
        </button>
      </div>
    </div>
  );
}

// ─── Main Cart Page ────────────────────────────────────────────────────────
export default function CartPage() {
  const [user, setUser] = useState<any>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orderResult, setOrderResult] = useState<OrderResult | null>(null);
  const { items, removeFromCart, updateQty, total, clearCart } = useCart();
  const supabase = createClient();

  const [checkoutData, setCheckoutData] = useState<CheckoutData>({
    name: "", phone: "", altPhone: "", address: ""
  });

  // Check auth + prefill data
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user);
      if (data.user) {
        const { data: pData } = await supabase
          .from("profiles").select("*").eq("id", data.user.id).single();
        if (pData) {
          setCheckoutData({
            name: pData.full_name || "",
            phone: pData.phone || "",
            altPhone: "",
            address: pData.address || ""
          });
        }
      }
    });
  }, []);

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const formatPhone = (raw: string) => {
    return raw.trim();
  };

  const buildWhatsAppMessage = (orderId: string, data: CheckoutData) => {
    const itemLines = items.map(i =>
      `▪ المنتج: ${i.name} - مقاس: ${i.size}${i.colorName ? ` - اللون: ${i.colorName}` : (i.color ? ` - اللون: ${i.color}` : "")} - الكمية: ${i.qty} - السعر: ${i.price} ج.م`
    ).join("\n");

    const altLine = data.altPhone
      ? `\nرقم احتياطي: ${formatPhone(data.altPhone)}`
      : "";

    return `*طلب جديد - مقام MAQAM* 🌟
🆔 كود الطلب: #${orderId.slice(0, 8).toUpperCase()}

━━━━━━━━━━━━━━━━━━━
المعلومات الشخصية:
━━━━━━━━━━━━━━━━━━━
الاسم: ${data.name}
رقم التلفون: ${formatPhone(data.phone)}${altLine}
العنوان: ${data.address}

━━━━━━━━━━━━━━━━━━━
بيانات الاوردر:
━━━━━━━━━━━━━━━━━━━
${itemLines}

━━━━━━━━━━━━━━━━━━━
إجمالي السعر النهائي: ${total} ج.م
شكراً لطلبك من مقام. 🌟`;
  };

  const handleCheckout = async () => {
    const { name, phone, address } = checkoutData;

    if (!name.trim()) return alert("يرجى إدخال الاسم الكامل.");
    if (!phone.trim()) return alert("يرجى إدخال رقم الهاتف.");
    if (!address.trim()) return alert("يرجى إدخال العنوان.");
    if (items.length === 0) return alert("عربة التسوق فارغة!");

    const formattedPhone = formatPhone(phone);
    const formattedAlt = checkoutData.altPhone ? formatPhone(checkoutData.altPhone) : null;

    setLoading(true);
    try {
      const orderItems = items.map(i => ({
        id: i.id, name: i.name, size: i.size,
        color: i.colorName || i.color || null, qty: i.qty, price: i.price
      }));

      const { error, data } = await supabase.rpc("place_order_with_stock_deduction", {
        p_user_id: user ? user.id : null,
        p_customer_name: name.trim(),
        p_customer_phone: formattedPhone,
        p_customer_address: address.trim(),
        p_alt_phone: formattedAlt,
        p_total_amount: total,
        p_items: orderItems
      });

      if (error) throw error;

      const orderId = typeof data === "string" ? data : String(Date.now());
      const updatedData = {
        ...checkoutData,
        phone: formattedPhone,
        altPhone: formattedAlt || ""
      };

      // Save result for invoice
      setOrderResult({ orderId, items: [...items], total, data: updatedData });

      // WhatsApp redirect
      const waNumber = "201032904142";
      const message = buildWhatsAppMessage(orderId, updatedData);
      window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`, "_blank");

      clearCart();
    } catch (err: any) {
      alert("حدث خطأ: " + (err?.message || "خطأ غير معروف"));
    } finally {
      setLoading(false);
    }
  };

  // ─── Success State ────────────────────────────────────────────────────────
  if (orderResult) {
    return (
      <>
        <InvoiceModal order={orderResult} onClose={() => setOrderResult(null)} />
        <div className="min-h-[80vh] flex flex-col items-center justify-center py-20 px-4 text-center">
          <CheckCircle2 size={80} className="text-green-500 mb-6 animate-bounce" />
          <h1 className="text-4xl font-black text-brand-text uppercase italic tracking-tighter mb-4">
            تم تأكيد طلبك!
          </h1>
          <p className="text-brand-text/50 font-bold mb-8 text-sm uppercase tracking-widest">
            كود الطلب: #{orderResult.orderId.slice(0, 8).toUpperCase()}
          </p>
          <Link href="/products" className="btn-melt px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-105 transition-all">
            تسوق أكثر
          </Link>
        </div>
      </>
    );
  }

  // ─── Auth State (not logged in, not guest) ────────────────────────────────
  const showAuthWall = !user && !isGuest;

  return (
    <div className="w-full min-h-[80vh] flex flex-col items-center py-20 px-4 bg-brand-bg">
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-16">

        {/* ── Left: Cart Items ─────────────────────────────────────────────── */}
        <div className="lg:col-span-2 flex flex-col space-y-10">
          <div className="flex items-center gap-6">
            <div className="bg-brand-text text-brand-bg p-4 rounded-3xl shadow-2xl aura-glow">
              <ShoppingBag size={32} />
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-brand-text tracking-tighter uppercase italic">
              حقيبة التسوق
            </h1>
          </div>

          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 bg-brand-card border-2 border-dashed border-brand-border rounded-[3rem] shadow-sm">
              <PackageOpen size={80} className="text-brand-text/10 mb-8" />
              <h2 className="text-2xl font-black text-brand-text mb-10 italic uppercase tracking-widest opacity-40">
                حقيبتك فارغة حالياً
              </h2>
              <Link href="/products" className="btn-melt px-12 py-5 rounded-2xl font-black uppercase tracking-[0.3em] hover:scale-105 transition-all shadow-xl">
                اكتشف المنتجات
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              {items.map((item) => (
                <div key={item.cartId} className="group flex bg-brand-card border border-brand-border p-6 rounded-[2.5rem] items-center shadow-sm hover:shadow-2xl hover:border-brand-accent/20 transition-all duration-500">
                  <div className="w-32 h-32 bg-brand-bg rounded-3xl mr-6 flex-shrink-0 flex items-center justify-center relative overflow-hidden border border-brand-border">
                    {item.image_url ? (
                      <Image src={item.image_url} alt={item.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                    ) : (
                      <PackageOpen size={40} className="text-brand-text/10" />
                    )}
                  </div>
                  <div className="flex-grow flex flex-col sm:flex-row justify-between sm:items-center px-4">
                    <div className="space-y-2">
                      <h3 className="font-black text-brand-text text-2xl uppercase italic tracking-tighter leading-none">{item.name}</h3>
                      <div className="flex items-center gap-4 text-[10px] font-black text-brand-text/30 uppercase tracking-[0.2em]">
                        <span className="bg-brand-bg px-3 py-1 rounded-full border border-brand-border">المقاس: {item.size}</span>
                        {item.color && <span className="w-3 h-3 rounded-full border border-brand-border" style={{ backgroundColor: item.color }} />}
                      </div>
                      <div className="flex items-center gap-6 bg-brand-bg border border-brand-border rounded-2xl px-5 py-2.5 mt-4 w-max shadow-inner">
                        <button onClick={() => updateQty(item.cartId, item.qty - 1)} className="font-black text-brand-text/40 hover:text-brand-text transition-colors">-</button>
                        <span className="font-black text-brand-text min-w-[20px] text-center">{item.qty}</span>
                        <button onClick={() => updateQty(item.cartId, item.qty + 1)} className="font-black text-brand-text/40 hover:text-brand-text transition-colors">+</button>
                      </div>
                    </div>
                    <div className="flex flex-col sm:items-end justify-between mt-6 sm:mt-0 gap-4">
                      <span className="text-3xl font-black text-brand-text">
                        {item.price * item.qty} <span className="text-xs opacity-40 uppercase tracking-tighter">ج.م</span>
                      </span>
                      <button onClick={() => removeFromCart(item.cartId)} className="text-brand-text/20 hover:text-red-500 transition-all p-2 hover:bg-red-500/5 rounded-xl">
                        <Trash2 size={24} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Right: Auth Wall / Checkout Panel ───────────────────────────── */}
        <div className="lg:col-span-1">

          {showAuthWall ? (
            /* ── Auth Wall ─────────────────────────────────────────────────── */
            <div className="sticky top-28 bg-brand-card border border-brand-border p-10 rounded-[3rem] shadow-2xl flex flex-col gap-6 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-accent/5 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none" />
              <div className="text-center relative z-10">
                <div className="w-20 h-20 rounded-full bg-brand-accent/10 flex items-center justify-center mx-auto mb-6">
                  <UserIcon size={40} className="text-brand-accent/50" />
                </div>
                <h2 className="text-3xl font-black text-brand-text uppercase italic tracking-tighter mb-2">
                  تسجيل الدخول
                </h2>
                <p className="text-brand-text/40 text-xs font-black uppercase tracking-widest">
                  سجل دخولك لإكمال الطلب وتتبع شحناتك
                </p>
              </div>

              {/* OAuth buttons */}
              <div className="flex flex-col gap-4 relative z-10">
                <button
                  onClick={async () => {
                    const { error } = await supabase.auth.signInWithOAuth({
                      provider: "google",
                      options: { redirectTo: `${window.location.origin}/auth/callback` }
                    });
                    if (error) alert(error.message);
                  }}
                  className="w-full flex items-center justify-center gap-4 bg-white text-black font-black py-4 rounded-2xl shadow-xl hover:scale-[1.02] transition-all text-xs tracking-[0.3em] uppercase border-2 border-white"
                >
                  <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                    <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                      <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                      <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                      <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                      <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
                    </g>
                  </svg>
                  المزامنة مع جوجل
                </button>

                {/* Divider */}
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-brand-border" />
                  <span className="text-[9px] font-black text-brand-text/20 uppercase tracking-widest">أو</span>
                  <div className="flex-1 h-px bg-brand-border" />
                </div>

                {/* Guest Checkout */}
                <button
                  onClick={() => setIsGuest(true)}
                  className="w-full flex items-center justify-center gap-3 bg-brand-bg border-2 border-brand-border text-brand-text font-black py-4 rounded-2xl hover:border-brand-accent/40 hover:bg-brand-accent/5 transition-all text-xs tracking-[0.3em] uppercase"
                >
                  <LogIn size={18} className="text-brand-accent" />
                  متابعة كضيف (بدون حساب)
                </button>
                <p className="text-center text-[9px] font-black text-brand-text/20 uppercase tracking-widest">
                  لن يتم احتساب نقاط الولاء للطلب كضيف
                </p>
              </div>
            </div>

          ) : (
            /* ── Checkout Panel ─────────────────────────────────────────────── */
            <div className="sticky top-28 bg-brand-card border border-brand-border p-10 rounded-[3rem] shadow-2xl flex flex-col overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-accent/5 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none" />

              {/* Guest badge */}
              {isGuest && (
                <div className="mb-6 bg-brand-accent/5 border border-brand-accent/20 rounded-2xl px-4 py-3 flex items-center gap-3">
                  <LogIn size={16} className="text-brand-accent shrink-0" />
                  <p className="text-[10px] font-black text-brand-accent/80 uppercase tracking-widest">
                    أنت تتسوق كضيف • لن تُحتسب نقاط الولاء
                  </p>
                </div>
              )}

              <h2 className="text-3xl font-black text-brand-text mb-6 border-b-2 border-brand-border pb-6 uppercase italic tracking-tighter relative z-10">
                مراجعة الطلب
              </h2>

              {/* Order Summary */}
              <div className="space-y-3 mb-8 flex-grow relative z-10">
                {items.map(i => (
                  <div key={i.cartId} className="flex justify-between text-xs font-bold text-brand-text/50">
                    <span className="truncate max-w-[160px]">{i.name} ({i.size}) ×{i.qty}</span>
                    <span className="text-brand-text font-black">{i.price * i.qty} ج.م</span>
                  </div>
                ))}
                <div className="pt-4 border-t border-dashed border-brand-border flex justify-between items-end text-brand-text">
                  <span className="text-lg font-black uppercase italic tracking-tighter">الإجمالي</span>
                  <span className="text-4xl font-black leading-none">{total} <span className="text-[10px] opacity-40 uppercase">ج.م</span></span>
                </div>
              </div>

              {/* Form */}
              <div className="space-y-4 mb-8 relative z-10">
                <p className="text-[10px] font-black text-brand-text/30 uppercase tracking-[0.4em]">بيانات الاستلام</p>

                {/* Name */}
                <div className="flex bg-brand-bg rounded-2xl border-2 border-brand-border focus-within:border-brand-accent/40 px-5 py-4 transition-all shadow-inner gap-3">
                  <UserIcon size={18} className="text-brand-text/20 shrink-0 mt-0.5" />
                  <input
                    type="text"
                    placeholder="الاسم بالكامل *"
                    value={checkoutData.name}
                    onChange={e => setCheckoutData({ ...checkoutData, name: e.target.value })}
                    className="w-full bg-transparent outline-none text-sm font-black text-brand-text placeholder:text-brand-text/20"
                  />
                </div>

                {/* Primary Phone */}
                <div className="flex flex-col gap-1">
                  <div className="flex bg-brand-bg rounded-2xl border-2 border-brand-border focus-within:border-brand-accent/40 px-5 py-4 transition-all shadow-inner gap-3">
                    <Phone size={18} className="text-brand-text/20 shrink-0 mt-0.5" />
                    <input
                      type="tel"
                      placeholder="رقم الهاتف (01xxxxxxxxx) *"
                      value={checkoutData.phone}
                      onChange={e => setCheckoutData({ ...checkoutData, phone: e.target.value })}
                      className="w-full bg-transparent outline-none text-sm font-black text-brand-text placeholder:text-brand-text/20"
                      dir="ltr"
                    />
                  </div>
                  <p className="text-[9px] text-brand-text/30 font-bold px-2">
                    يرجى إدخال رقم الهاتف الصحيح للتواصل والاتصال
                  </p>
                </div>

                {/* Alt Phone */}
                <div className="flex bg-brand-bg rounded-2xl border-2 border-brand-border focus-within:border-brand-accent/40 px-5 py-4 transition-all shadow-inner gap-3">
                  <Phone size={18} className="text-brand-text/10 shrink-0 mt-0.5" />
                  <input
                    type="tel"
                    placeholder="رقم هاتف احتياطي (اختياري)"
                    value={checkoutData.altPhone}
                    onChange={e => setCheckoutData({ ...checkoutData, altPhone: e.target.value })}
                    className="w-full bg-transparent outline-none text-sm font-bold text-brand-text/60 placeholder:text-brand-text/15"
                    dir="ltr"
                  />
                </div>

                {/* Address */}
                <div className="flex flex-col gap-1">
                  <div className="flex bg-brand-bg rounded-2xl border-2 border-brand-border focus-within:border-brand-accent/40 px-5 py-4 transition-all shadow-inner gap-3">
                    <MapPin size={18} className="text-brand-text/20 shrink-0 mt-0.5" />
                    <textarea
                      placeholder="المحافظة، المدينة، الشارع، المبنى، الشقة... *"
                      value={checkoutData.address}
                      onChange={e => setCheckoutData({ ...checkoutData, address: e.target.value })}
                      rows={3}
                      className="w-full bg-transparent outline-none text-sm font-black text-brand-text placeholder:text-brand-text/20 resize-none"
                    />
                  </div>
                  <div className="bg-red-500/5 border border-red-500/15 rounded-xl p-3">
                    <p className="text-[9px] text-red-500 font-black uppercase tracking-widest text-center">
                      ⚠️ يرجى كتابة العنوان بالتفصيل لضمان وصول الطلب
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <button
                onClick={handleCheckout}
                disabled={items.length === 0 || loading}
                className="w-full btn-melt py-6 rounded-3xl font-black uppercase tracking-[0.4em] text-lg shadow-2xl group relative overflow-hidden disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:scale-[1.02] active:scale-95 relative z-10"
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  {loading
                    ? <><RefreshCw size={20} className="animate-spin" /> جاري التأكيد...</>
                    : <><ArrowRight size={20} /> تأكيد الطلب عبر واتساب</>
                  }
                </span>
              </button>

              {/* Invoice note */}
              <p className="text-center text-[9px] font-black text-brand-text/20 uppercase tracking-widest mt-4 flex items-center justify-center gap-2 relative z-10">
                <Receipt size={12} /> ستظهر فاتورتك فور إتمام الطلب
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
