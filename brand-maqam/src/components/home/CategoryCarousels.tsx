"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseBrowser";
import ProductCard from "@/components/product/ProductCard";

type Category = {
  id: string;
  name: string;
  display_type?: string;
};

type Product = {
  id: string;
  name: string;
  price: number;
  old_price?: number;
  image_url: string;
  sizes: string[];
  stock_count?: number;
  category_id: string;
};

export default function CategoryCarousels() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: cData, error: cError } = await supabase
          .from("categories")
          .select("*")
          .eq("display_type", "showcase");
        if (cError) throw cError;
        if (cData) setCategories(cData);

        const { data: pData, error: pError } = await supabase
          .from("products")
          .select("id, name, price, old_price, image_url, sizes, category_id")
          .order("created_at", { ascending: false });
        if (pError) throw pError;
        if (pData) setProducts(pData);
      } catch (err: any) {
        console.error("Error fetching showcase data:", err);
      }
    };
    fetchData();
  }, [supabase]);

  if (categories.length === 0 || products.length === 0) return null;

  return (
    <div className="w-full flex flex-col gap-24 py-20 bg-brand-bg relative z-10">
      {categories.map((category, index) => {
        const categoryProducts = products.filter(p => p.category_id === category.id).slice(0, 8);
        if (categoryProducts.length === 0) return null;

        const isEven = index % 2 === 0;

        return (
          <div key={category.id} className="w-full relative group">
            {/* Background Aesthetic */}
            <div className={`absolute top-1/2 -translate-y-1/2 ${isEven ? 'left-0' : 'right-0'} w-96 h-96 bg-brand-accent/5 rounded-full blur-[100px] pointer-events-none`} />

            <div className={`max-w-[1400px] mx-auto px-4 sm:px-8 flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-10`}>
              
              {/* Pinned Category Name */}
              <div className="lg:w-1/4 flex-shrink-0 flex flex-col items-center lg:items-start justify-center relative">
                 <div className="relative z-10">
                   <h2 className="text-4xl md:text-6xl font-black text-brand-text uppercase italic tracking-tighter leading-none mb-4" dir="rtl">
                     {category.name}
                   </h2>
                   <div className={`w-20 h-1 bg-brand-accent ${isEven ? 'ml-auto lg:mr-auto lg:ml-0' : 'mr-auto lg:ml-auto lg:mr-0'} mb-6`} />
                   <p className="text-brand-text/50 font-bold uppercase tracking-widest text-xs max-w-[250px] leading-relaxed text-center lg:text-right" dir="rtl">
                     تصفح أحدث المقتنيات الحصرية في هذا القسم واكتشف تصاميم النخبة.
                   </p>
                 </div>
                 
                 {/* Decorative vertical text */}
                 <div className={`hidden lg:block absolute top-1/2 -translate-y-1/2 ${isEven ? '-right-20' : '-left-20'} opacity-5 pointer-events-none`}>
                    <h2 className="text-[120px] font-black uppercase tracking-tighter [writing-mode:vertical-lr] rotate-180">
                      {category.name}
                    </h2>
                 </div>
              </div>

              {/* Horizontal Scrollable Carousel */}
              <div className="w-full lg:w-3/4 relative">
                 <div className="flex gap-6 overflow-x-auto pb-8 pt-4 px-4 snap-x snap-mandatory scrollbar-hide hide-scroll-bar" dir="rtl">
                    {categoryProducts.map((product) => (
                      <div key={product.id} className="min-w-[280px] md:min-w-[320px] snap-center shrink-0">
                        <ProductCard
                          id={product.id}
                          name={product.name}
                          price={product.price}
                          old_price={product.old_price}
                          sizes={product.sizes || []}
                          image_url={product.image_url}
                          stock_count={product.stock_count}
                        />
                      </div>
                    ))}
                 </div>
                 
                 {/* Gradient Fades */}
                 <div className="absolute top-0 right-0 bottom-8 w-20 bg-gradient-to-l from-brand-bg to-transparent pointer-events-none" />
                 <div className="absolute top-0 left-0 bottom-8 w-20 bg-gradient-to-r from-brand-bg to-transparent pointer-events-none" />
              </div>

            </div>
          </div>
        );
      })}
    </div>
  );
}
