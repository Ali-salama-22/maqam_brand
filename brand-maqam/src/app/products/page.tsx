"use client";

import { useEffect, useState, Suspense } from "react";
import { createClient } from "@/lib/supabaseBrowser";
import Image from "next/image";
import Link from "next/link";
import ProductCard from "@/components/product/ProductCard";
import { RefreshCw } from "lucide-react";
import { useSearchParams } from "next/navigation";

type Product = {
  id: string;
  name: string;
  price: number;
  old_price?: number;
  image_url: string;
  sizes: string[];
  stock_count: number;
};


function CatalogContent() {
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("category");

  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [categoryName, setCategoryName] = useState<string>("");
  const supabase = createClient();


  useEffect(() => {
    const fetchData = async () => {
      let query = supabase.from("products").select("*").order("created_at", { ascending: false });
      if (categoryId) {
        query = query.eq("category_id", categoryId);
        const { data: catData } = await supabase.from("categories").select("name").eq("id", categoryId).single();
        if (catData) setCategoryName(catData.name);
      } else {
        setCategoryName("");
      }
      const { data } = await query;
      if (data) {
        setProducts(data);
        setFiltered(data);
      }
    };
    fetchData();
  }, [supabase, categoryId]);



  return (
    <div className="w-full flex-grow py-8 px-4 sm:px-6 lg:px-8 min-h-[80vh] bg-brand-bg">
      <div className="max-w-7xl mx-auto">
        
        {/* Grid Area */}
        <div className="w-full relative">
          <div className="flex justify-between items-end mb-6 pb-4 border-b border-brand-border">
            <h1 className="text-3xl font-black uppercase text-brand-text">{categoryName ? categoryName : "التشكيلة الكاملة"}</h1>
            <span className="font-bold text-sm text-brand-accent">{filtered.length} منتجات</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map(product => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={product.price}
                old_price={product.old_price}
                sizes={product.sizes || []}
                image_url={product.image_url}
                stock_count={product.stock_count}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-brand-bg text-brand-accent"><RefreshCw className="animate-spin" size={48} /></div>}>
      <CatalogContent />
    </Suspense>
  );
}
