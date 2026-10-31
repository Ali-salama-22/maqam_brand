"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabaseBrowser";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, ArrowLeft } from "lucide-react";

type Product = {
  id: string;
  name: string;
  price: number;
  image_url: string;
};

export default function NewCollection() {
  const [products, setProducts] = useState<Product[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchNew = async () => {
      const { data } = await supabase.from("products").select("*").eq("is_new_collection", true).limit(10);
      if (data) setProducts(data);
    };
    fetchNew();
  }, [supabase]);

  if (products.length === 0) return null;

  return (
    <section className="py-12 sm:py-24 w-full relative overflow-hidden bg-brand-card border-y border-brand-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-8 sm:mb-16 gap-4 sm:gap-6">
          <div className="text-center md:text-right">
            <h2 className="text-3xl sm:text-5xl md:text-7xl font-black uppercase italic tracking-tighter text-brand-text">
               أحدث <span className="text-brand-accent">الإصدارات</span>
            </h2>
            <div className="h-[4px] w-28 sm:w-40 mt-3 sm:mt-4 rounded-full mx-auto md:mx-0 bg-brand-accent/20" />
          </div>
          <Link href="/products" className="text-sm font-black uppercase tracking-[0.3em] text-brand-accent underline">عرض الكل</Link>
        </div>

        <div ref={scrollRef} className="flex gap-4 sm:gap-8 overflow-x-auto pb-6 sm:pb-10 scrollbar-hide mobile-snap-slider px-2 sm:px-4" dir="rtl">
          {products.map((product) => (
            <Link href={`/products/${product.id}`} key={product.id} className="min-w-[220px] sm:min-w-[320px] md:min-w-[380px] shrink-0 group">
              <div className="relative w-full h-[320px] sm:h-[460px] rounded-3xl sm:rounded-[2.5rem] overflow-hidden transition-all duration-300 border border-brand-border bg-brand-bg shadow-md hover:shadow-2xl">
                {product.image_url ? (
                  <Image src={product.image_url} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-700" sizes="(max-width: 640px) 220px, 380px" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center opacity-30"><Sparkles size={48} className="text-brand-accent" /></div>
                )}
                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6 bg-brand-card/90 backdrop-blur-xl border-t border-brand-border">
                   <h3 className="text-base sm:text-xl font-black text-brand-text uppercase italic tracking-tight">{product.name}</h3>
                   <div className="flex justify-between items-center mt-1 sm:mt-2">
                     <span className="text-sm sm:text-lg font-black text-brand-accent">{product.price} ج.م</span>
                     <span className="text-[10px] font-black uppercase tracking-wider text-brand-text/50 flex items-center gap-1">
                       تفاصيل <ArrowLeft size={12} />
                     </span>
                   </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
