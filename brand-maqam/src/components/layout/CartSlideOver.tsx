"use client";

import { X, Trash2, ShoppingBag, Plus, Minus, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/CartContext";

type CartSlideOverProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function CartSlideOver({ isOpen, onClose }: CartSlideOverProps) {
  const { items, removeFromCart, updateQty, total } = useCart();

  const handleCompleteWhatsApp = () => {
    if (items.length === 0) return;
    // We now redirect to the full cart page to collect delivery info
    window.location.href = "/cart";
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-[60] transition-opacity"
          style={{ background: "rgba(28,28,28,0.25)", backdropFilter: "blur(4px)" }}
          onClick={onClose}
        />
      )}
      <div
        className={`fixed inset-y-0 right-0 z-[70] w-full md:w-96 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{
          background: "var(--brand-card)",
          borderLeft: "1px solid var(--brand-border)",
          boxShadow: "-8px 0 40px rgba(0,0,0,0.08)",
        }}
      >
        <div
          className="flex justify-between items-center p-6 border-b border-black/5"
        >
          <h2 className="text-xl font-bold flex items-center gap-2 text-brand-pine">
            <ShoppingBag size={28} className="text-brand-accent transition-all duration-300" />
            حقيبة المقتنيات
            {items.length > 0 && (
              <span
                className="text-xs px-2 py-0.5 rounded-full font-bold text-white bg-brand-accent animate-pulse"
              >
                {items.reduce((s, i) => s + i.qty, 0)}
              </span>
            )}
          </h2>
          <button onClick={onClose} className="hover:rotate-90 transition-transform duration-300">
            <X size={28} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4 opacity-30">
              <ShoppingBag size={48} />
              <p className="text-xl font-black uppercase tracking-tighter text-brand-text/30">حقيبتك فارغة حالياً.</p>
              <Link href="/products" onClick={onClose} className="btn-melt px-6 py-2 rounded-lg font-bold text-sm">استكشف</Link>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.cartId} className="flex justify-between items-start pb-4 gap-3 border-b border-black/5">
                <div className="w-16 h-16 rounded-md bg-brand-bg flex-shrink-0 relative overflow-hidden">
                  {item.image_url && <Image src={item.image_url} alt={item.name} fill className="object-cover" />}
                </div>
                <div className="flex-1 text-right">
                  <h3 className="font-bold text-sm text-brand-pine">{item.name}</h3>
                  <p className="text-[10px] opacity-40">مقاس: {item.size}</p>
                  <p className="font-black text-xs text-brand-accent mt-1">{item.price} ج.م</p>
                  <div className="flex items-center gap-2 mt-2 rounded-lg bg-brand-bg w-max px-2 py-0.5 border border-black/5">
                    <button onClick={() => updateQty(item.cartId, item.qty - 1)}><Minus size={12} /></button>
                    <span className="font-bold text-xs">{item.qty}</span>
                    <button onClick={() => updateQty(item.cartId, item.qty + 1)}><Plus size={12} /></button>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                   <button onClick={() => removeFromCart(item.cartId)} className="text-red-500"><Trash2 size={18} /></button>
                   <span className="text-xs font-black">{item.price * item.qty} ج.م</span>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 bg-brand-bg border-t border-black/5">
            <div className="flex justify-between items-center mb-6">
              <span className="font-black text-brand-text uppercase tracking-widest text-xs">إجمالي المنتجات</span>
              <span className="text-2xl font-black text-brand-accent">{total} ج.م</span>
            </div>
            <button onClick={handleCompleteWhatsApp} className="w-full btn-melt py-4 rounded-xl font-black tracking-wider text-sm flex items-center justify-center gap-3">
              متابعة الطلب <ArrowRight size={18} />
            </button>
            <Link href="/cart" onClick={onClose} className="block text-center mt-4 text-xs font-bold underline opacity-40 hover:opacity-100 transition-opacity">عرض السلة بالكامل</Link>
          </div>
        )}
      </div>
    </>
  );
}
