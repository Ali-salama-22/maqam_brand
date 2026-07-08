"use client";

import { useState, useEffect, use } from "react";
import { ShoppingCart, Heart, PackageOpen } from "lucide-react";
import Image from "next/image";
import { createClient } from "@/lib/supabaseBrowser";
import { useCart } from "@/lib/CartContext";

export default function ProductDetailPage(props: { params: Promise<{ slug: string }> }) {
  const params = use(props.params);
  const [product, setProduct] = useState<any>(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { addToCart } = useCart();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, [supabase]);

  useEffect(() => {
    const fetchProduct = async () => {
      const { data } = await supabase.from("products").select("*").eq("id", params.slug).single();
      if (data) {
        setProduct(data);
        if (data.sizes && data.sizes.length > 0) {
          setSelectedSize(data.sizes[0]);
        }
        if (data.colors && data.colors.length > 0) {
          setSelectedColor(data.colors[0]);
        }
      }
      if (user && data) {
         const { data: favData } = await supabase.from("favorites").select("*").eq("user_id", user.id).eq("product_id", data.id).maybeSingle();
         if (favData) setIsFavorite(true);
      }
      setLoading(false);
    };
    fetchProduct();
  }, [params.slug, supabase, user]);

  useEffect(() => {
    setCurrentImageIndex(0);
  }, [selectedColor]);

  if (loading) return <div className="min-h-[70vh] flex items-center justify-center bg-brand-pine/5 text-brand-pine font-bold">جاري تحميل المنتج...</div>;
  
  if (!product) return <div className="min-h-[70vh] flex items-center justify-center bg-brand-pine/5 font-bold text-2xl text-brand-pine">المنتج غير موجود.</div>;

  const handleAddToCart = () => {
    if (!selectedSize) return alert("يرجى اختيار المقاس");
    if (product.colors?.length > 0 && !selectedColor) return alert("يرجى اختيار اللون");
    
    const activeVariant = product.variants?.find((v: any) => v.hex === selectedColor);
    const selectedColorName = activeVariant?.name || selectedColor;

    addToCart({
      cartId: `${product.id}-${selectedSize}-${selectedColor}`,
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: currentImage, // Use variant image
      size: selectedSize,
      color: selectedColor, // Include selected color
      colorName: selectedColorName,
      qty: 1
    });

    alert("تم الإضافة إلى السلة بنجاح!");
  };

  const handleToggleFavorite = async () => {
    if (!user) {
      alert("يرجى تسجيل الدخول أولاً لإضافة المنتجات للمفضلة");
      return;
    }
    setFavoriteLoading(true);
    if (isFavorite) {
      await supabase.from("favorites").delete().eq("user_id", user.id).eq("product_id", product.id);
      setIsFavorite(false);
    } else {
      await supabase.from("favorites").insert({ user_id: user.id, product_id: product.id });
      setIsFavorite(true);
    }
    setFavoriteLoading(false);
  };

  const activeVariant = product?.variants?.find((v: any) => v.hex === selectedColor);
  const activeImages = activeVariant?.images?.length > 0 ? activeVariant.images : (product?.image_url ? [product.image_url] : []);
  const currentImage = activeImages[currentImageIndex] || activeImages[0];

  return (
    <div className="w-full flex-grow py-6 sm:py-12 px-3 sm:px-4 bg-brand-bg transition-colors duration-500">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8 lg:gap-20">
        
        {/* Left Side: Images */}
        <div className="w-full md:w-1/2 flex flex-col gap-4">
          <div className="w-full aspect-[4/5] bg-brand-card rounded-3xl flex items-center justify-center relative shadow-2xl transition-all border border-brand-border group overflow-hidden">
            {currentImage ? (
              <Image src={currentImage} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-700 z-10" />
            ) : (
              <PackageOpen size={80} className="text-brand-text/10 z-10" />
            )}
            <div className="absolute inset-0 bg-brand-accent/5 opacity-0 group-hover:opacity-10 transition-opacity z-0" />
            
            {activeImages.length > 1 && (
              <>
                <button 
                  onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((prev) => prev === 0 ? activeImages.length - 1 : prev - 1) }} 
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-brand-bg/80 hover:bg-brand-bg w-12 h-12 flex items-center justify-center text-brand-text font-black rounded-full shadow-2xl transition-all border border-brand-border hover:border-brand-accent/50"
                >
                  ❮
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((prev) => prev === activeImages.length - 1 ? 0 : prev + 1) }} 
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-brand-bg/80 hover:bg-brand-bg w-12 h-12 flex items-center justify-center text-brand-text font-black rounded-full shadow-2xl transition-all border border-brand-border hover:border-brand-accent/50"
                >
                  ❯
                </button>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {activeImages.length > 1 && (
             <div className="flex gap-4 overflow-x-auto py-4 px-1 scrollbar-hide">
                {activeImages.map((img: string, idx: number) => (
                   <button 
                     key={idx} 
                     onClick={() => setCurrentImageIndex(idx)} 
                     className={`w-20 h-24 rounded-2xl overflow-hidden border-2 flex-shrink-0 transition-all duration-300 relative ${currentImageIndex === idx ? 'border-brand-accent shadow-lg scale-105' : 'border-brand-border opacity-40 hover:opacity-100 hover:border-brand-accent/50'}`}
                   >
                      <Image src={img} alt={`${product.name} ${idx}`} fill className="object-cover" />
                   </button>
                ))}
             </div>
          )}
        </div>

        {/* Right Side: Details */}
        <div className="w-full md:w-1/2 flex flex-col pt-4">
          <div className="flex items-center gap-4 mb-6">
             <span className="bg-brand-text text-brand-bg text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em] shadow-sm">مجموعة مختارة</span>
             <p className="text-[10px] font-black text-brand-text/30 uppercase tracking-[0.3em]">المرجع #{product.id.slice(0,8).toUpperCase()}</p>
          </div>
          
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-black text-brand-text tracking-tighter leading-tight sm:leading-[0.85] mb-4 sm:mb-8 uppercase italic">
            {product.name}
          </h1>
          
          <div className="flex items-center gap-4 sm:gap-8 mb-6 sm:mb-12">
            <span className="text-3xl sm:text-5xl font-black text-brand-text drop-shadow-sm flex items-baseline gap-2">
              {product.price} <span className="text-sm opacity-40 uppercase tracking-tighter font-bold">ج.م</span>
            </span>
            {product.old_price && (
              <span className="text-lg sm:text-2xl font-bold line-through text-brand-text/20 decoration-brand-accent/50">
                {product.old_price} ج.م
              </span>
            )}
          </div>
          
          <p className="text-brand-text/60 text-lg leading-relaxed mb-16 font-medium max-w-lg border-r-4 border-brand-accent/20 pr-6">
            {product.description || "صُمم للجرأة. صُنع للنخبة. مقام تعيد تعريف عصر جديد من أزياء الشارع الفاخرة."}
          </p>

          {/* Color Selector */}
          {product.colors && product.colors.length > 0 && (
            <div className="mb-12">
              <label className="block text-[10px] font-black text-brand-text/40 uppercase tracking-[0.3em] mb-6">
                اللون المختار: <span className="text-brand-accent text-xs font-black mr-2 bg-brand-accent/10 px-3.5 py-1 rounded-full border border-brand-accent/10">
                  {selectedColor ? (product.variants?.find((v: any) => v.hex === selectedColor)?.name || selectedColor) : "الرجاء الاختيار"}
                </span>
              </label>
              <div className="flex gap-4">
                {product.colors.map((hex: string) => (
                  <button
                    key={hex}
                    onClick={() => setSelectedColor(hex)}
                    className={`w-12 h-12 rounded-full border-4 transition-all duration-500 relative group
                      ${selectedColor === hex ? "border-brand-accent scale-110 shadow-xl" : "border-brand-border hover:border-brand-accent/30"}
                    `}
                    style={{ backgroundColor: hex }}
                  >
                     {selectedColor === hex && (
                       <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-brand-accent rounded-full animate-pulse" />
                     )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Selector */}
          <div className="mb-10">
            <label className="block text-[10px] font-black text-brand-text/40 uppercase tracking-[0.3em] mb-6">دليل المقاسات</label>
            <div className="flex gap-3 flex-wrap" dir="ltr">
              {product.sizes && product.sizes.map((s: string) => (
                <button
                  key={s}
                  onClick={() => setSelectedSize(s)}
                  className={`min-w-[64px] h-16 rounded-2xl flex items-center justify-center font-black text-sm border-2 transition-all duration-500 ${
                    selectedSize === s 
                      ? "border-brand-text bg-brand-text text-brand-bg shadow-2xl scale-105" 
                      : "border-brand-border text-brand-text/40 hover:border-brand-text/60 hover:text-brand-text"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Low Stock Alert */}
          {(() => {
            const currentVariant = product?.variants?.find((v: any) => v.hex === selectedColor);
            const currentStock = currentVariant?.sizes_stock?.[selectedSize];
            if (currentStock !== undefined && currentStock <= 3 && currentStock > 0) {
              return (
                <div className="mb-8 flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-2xl p-4 animate-pulse">
                  <span className="text-red-500 text-xl">🔥</span>
                  <p className="text-sm font-black text-red-500 uppercase tracking-widest">يوشك على الانتهاء! (متبقي {currentStock} قطع فقط)</p>
                </div>
              );
            }
            if (currentStock !== undefined && currentStock === 0) {
              return (
                <div className="mb-8 flex items-center gap-3 bg-brand-text/5 border border-brand-border rounded-2xl p-4">
                  <span className="text-brand-text/40 text-xl">⚠️</span>
                  <p className="text-sm font-black text-brand-text/40 uppercase tracking-widest">نفدت الكمية</p>
                </div>
              );
            }
            return null;
          })()}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-auto">
            <button 
              onClick={handleAddToCart}
              disabled={(() => {
                const cv = product?.variants?.find((v: any) => v.hex === selectedColor);
                return cv?.sizes_stock?.[selectedSize] === 0;
              })()}
              className={`flex-grow btn-melt py-4 sm:py-6 rounded-2xl sm:rounded-3xl font-black uppercase tracking-[0.3em] text-base sm:text-xl flex items-center justify-center gap-3 sm:gap-4 hover:shadow-[0_0_30px_rgba(120,144,156,0.3)] ${
                (() => { const cv = product?.variants?.find((v: any) => v.hex === selectedColor); return cv?.sizes_stock?.[selectedSize] === 0; })() ? 'opacity-40 cursor-not-allowed' : ''
              }`}
            >
              {(() => { const cv = product?.variants?.find((v: any) => v.hex === selectedColor); return cv?.sizes_stock?.[selectedSize] === 0; })() 
                ? <><ShoppingCart size={22} className="opacity-50" /> نفدت الكمية</>
                : <><ShoppingCart size={22} className="aura-glow" /> إضافة للطلب</>
              }
            </button>
            <button 
              onClick={handleToggleFavorite}
              disabled={favoriteLoading}
              className={`py-4 sm:py-6 px-5 sm:p-6 rounded-2xl sm:rounded-3xl border-2 border-brand-border transition-all duration-500 group ${isFavorite ? 'bg-red-500 border-red-500 text-white' : 'text-brand-text/40 hover:bg-brand-text hover:text-brand-bg hover:border-brand-text'}`}
            >
               <Heart size={24} className={isFavorite ? "fill-current" : "group-hover:fill-current"} />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
