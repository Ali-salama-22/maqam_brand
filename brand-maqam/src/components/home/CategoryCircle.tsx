"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { CircleDashed } from "lucide-react";
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
      className="relative w-full py-10 sm:py-16 overflow-hidden bg-brand-card border-y border-brand-border"
      style={{
        boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
      }}
    >
      <div className="max-w-7xl mx-auto px-2 sm:px-4 sm:px-6 lg:px-8">
        <div
          className="flex justify-start sm:justify-center gap-4 sm:gap-10 md:gap-16 overflow-x-auto pb-4 scrollbar-hide snap-x"
          dir="rtl"
        >
          {categories.map((cat) => (
            <Link
              href={`/products?category=${cat.id}`}
              key={cat.id}
              className="flex flex-col items-center gap-4 snap-start cursor-pointer group"
            >
              <div className="relative w-16 h-16 sm:w-24 sm:h-24 aspect-square rounded-full overflow-hidden transition-all duration-500 border-2 border-brand-border bg-brand-bg shadow-sm hover:border-brand-accent hover:shadow-[0_0_20px_var(--brand-accent)] hover:scale-110">
                {cat.image_url ? (
                  <Image 
                    src={cat.image_url} 
                    alt={cat.name} 
                    fill 
                    className="object-cover rounded-full" 
                    sizes="(max-width: 640px) 64px, 112px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <CircleDashed size={28} className="text-brand-accent animate-spin-slow" />
                  </div>
                )}
              </div>
              {/* Text placed OUTSIDE the circle, below it */}
              <span
                className="text-[10px] sm:text-sm font-black uppercase tracking-widest text-center max-w-[70px] sm:max-w-none leading-tight transition-colors duration-300 text-brand-text group-hover:text-brand-accent"
              >
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
