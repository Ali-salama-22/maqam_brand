"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Sparkles, Layers } from "lucide-react";
import { createClient } from "@/lib/supabaseBrowser";
import Link from "next/link";

type Category = { id: string; name: string; image_url: string; display_type?: string };

export default function CategoryCircle() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from("categories")
          .select("*")
          .eq("display_type", "circular");
        if (fetchError) throw fetchError;
        if (data) setCategories(data);
      } catch (err: any) {
        console.error("Error fetching circular categories:", err);
        setError(err?.message || "خطأ في تحميل الأقسام");
      }
    };
    fetchCategories();
  }, [supabase]);

  if (error) return null;
  if (categories.length === 0) return null;

  return (
    <section
      className="relative w-full py-6 sm:py-10 overflow-hidden bg-brand-card/60 backdrop-blur-md border-y border-brand-border"
      style={{
        boxShadow: "0 2px 16px rgba(0,0,0,0.03)",
      }}
    >
      <div className="max-w-7xl mx-auto px-2 sm:px-6">
        <div
          className="flex items-center justify-start sm:justify-center gap-4 sm:gap-8 overflow-x-auto pb-2 px-3 scrollbar-hide mobile-snap-slider select-none"
          dir="rtl"
        >
          {/* Quick "All Collections" Circle */}
          <Link
            href="/products"
            className="flex flex-col items-center gap-2.5 shrink-0 group cursor-pointer"
          >
            <div className="relative p-[2px] rounded-full bg-gradient-to-tr from-brand-accent/40 via-brand-border to-brand-accent group-hover:from-brand-accent group-hover:to-brand-text/60 transition-all duration-300">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-brand-bg flex items-center justify-center border border-brand-border/60 group-hover:scale-105 transition-transform duration-300 shadow-sm">
                <Sparkles size={24} className="text-brand-accent group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <span className="text-[11px] sm:text-xs font-black tracking-tight text-center text-brand-text group-hover:text-brand-accent transition-colors">
              الكل
            </span>
          </Link>

          {/* Dynamic Circular Categories */}
          {categories.map((cat) => (
            <Link
              href={`/products?category=${cat.id}`}
              key={cat.id}
              className="flex flex-col items-center gap-2.5 shrink-0 group cursor-pointer"
            >
              <div className="relative p-[2px] rounded-full bg-gradient-to-tr from-brand-accent/40 via-brand-border to-brand-accent group-hover:from-brand-accent group-hover:to-brand-text/60 transition-all duration-300">
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 aspect-square rounded-full overflow-hidden bg-brand-bg border border-brand-border/60 group-hover:scale-105 transition-transform duration-300 shadow-sm flex items-center justify-center">
                  {cat.image_url ? (
                    <Image 
                      src={cat.image_url} 
                      alt={cat.name} 
                      fill 
                      className="object-cover rounded-full group-hover:scale-110 transition-transform duration-500" 
                      sizes="(max-width: 640px) 64px, 80px"
                    />
                  ) : (
                    <span className="text-xs font-black uppercase text-brand-accent">
                      {cat.name.slice(0, 2)}
                    </span>
                  )}
                </div>
              </div>
              <span className="text-[11px] sm:text-xs font-black tracking-tight text-center max-w-[76px] sm:max-w-none leading-tight text-brand-text group-hover:text-brand-accent transition-colors line-clamp-1">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
