"use client";

import { useEffect, useState } from "react";
import { Heart, Trash2, PackageOpen } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabaseBrowser";

export default function FavoritesList() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchFavorites = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return setLoading(false);

    // Fetch favorites and join with products
    const { data, error } = await supabase
      .from("favorites")
      .select("*, product:products(*)")
      .eq("user_id", user.id);

    if (data) {
      setFavorites(data.map(f => ({ ...f, product: Array.isArray(f.product) ? f.product[0] : f.product })));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleRemove = async (productId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    await supabase.from("favorites").delete().eq("user_id", user.id).eq("product_id", productId);
    setFavorites(prev => prev.filter(f => f.product_id !== productId));
  };

  if (loading) return <div className="text-brand-text/40 font-bold animate-pulse">جاري تحميل المفضلة...</div>;

  return (
    <div className="bg-brand-card p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group border border-brand-border">
      <div className="flex items-center gap-4 mb-10">
        <div className="bg-red-500/10 text-red-500 p-4 rounded-3xl">
          <Heart size={28} className="fill-current" />
        </div>
        <h2 className="text-3xl lg:text-4xl font-black text-brand-text tracking-tighter uppercase italic">المقتنيات المفضلة</h2>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-brand-border rounded-[2rem]">
          <Heart size={48} className="mx-auto text-brand-text/10 mb-4" />
          <p className="text-brand-text/40 font-bold">لم تقم بإضافة أي منتجات للمفضلة بعد.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {favorites.map((fav) => {
            const p = fav.product;
            if (!p) return null;
            return (
              <div key={fav.id} className="relative bg-brand-bg rounded-2xl p-4 flex gap-4 items-center border border-brand-border hover:border-brand-accent/30 transition-all">
                <Link href={`/products/${p.id}`} className="w-20 h-24 bg-brand-card rounded-xl flex-shrink-0 relative overflow-hidden border border-brand-border">
                    {p.image_url ? (
                        <Image src={p.image_url} alt={p.name} fill className="object-cover" />
                    ) : (
                        <PackageOpen className="absolute inset-0 m-auto text-brand-text/10" size={24} />
                    )}
                </Link>
                <div className="flex-1">
                  <Link href={`/products/${p.id}`} className="font-black text-sm text-brand-text uppercase italic">{p.name}</Link>
                  <p className="text-xs font-bold text-brand-text/60 mt-1">{p.price} ج.م</p>
                </div>
                <button 
                  onClick={() => handleRemove(p.id)}
                  className="p-3 text-red-500 bg-red-500/5 hover:bg-red-500 hover:text-white rounded-xl transition-all"
                  title="إزالة من المفضلة"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
