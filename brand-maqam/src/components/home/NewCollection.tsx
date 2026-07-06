"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabaseBrowser";
import Image from "next/image";
import Link from "next/link";
import { CircleDashed } from "lucide-react";

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
    <section className="py-24 w-full relative overflow-hidden bg-brand-card border-y border-brand-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-16 gap-6">
          <div className="text-center md:text-right">
            <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter text-brand-text">
               أحدث <span className="text-brand-accent">الإصدارات</span>
            </h2>
            <div className="h-[4px] w-40 mt-4 rounded-full mx-auto md:mx-0 bg-brand-accent/20" />
          </div>
          <Link href="/products" className="text-sm font-black uppercase tracking-[0.3em] text-brand-accent underline">عرض الكل</Link>
        </div>

        <div ref={scrollRef} className="flex gap-10 overflow-x-auto pb-12 scrollbar-hide snap-x px-2" dir="rtl">
          {products.map((product) => (
            <Link href={`/products/${product.id}`} key={product.id} className="min-w-[300px] md:min-w-[400px] snap-center group">
              <div className="relative w-full h-[500px] rounded-[2rem] overflow-hidden transition-all duration-300 border border-brand-border bg-brand-bg shadow-lg hover:shadow-2xl">
                {product.image_url ? (
                  <Image src={product.image_url} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center opacity-10"><CircleDashed size={64} /></div>
                )}
                <div className="absolute inset-x-0 bottom-0 p-8 bg-brand-card/90 backdrop-blur-md border-t border-brand-border">
                   <h3 className="text-2xl font-black text-brand-text uppercase italic tracking-tight">{product.name}</h3>
                   <div className="flex justify-between items-center mt-2">
                     <span className="text-lg font-black text-brand-accent">{product.price} ج.م</span>
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
