"use client";

import { useState, useRef } from "react";
import { ShoppingCart, Check, ChevronDown } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/CartContext";

type ProductCardProps = {
  id: string;
  name: string;
  price: string | number;
  old_price?: string | number | null;
  sizes: string[];
  image_url: string;
  video_url?: string;
  stock_count?: number;
};

export default function ProductCard({ id, name, price, old_price, sizes, image_url, video_url, stock_count }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [showSizes, setShowSizes] = useState(false);
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();
  const videoRef = useRef<HTMLVideoElement>(null);

  const demoVideo = video_url || "https://player.vimeo.com/external/517090025.sd.mp4?s=69123c5c56c39f168f80cb5f7de3bbf67b84d4fa&profile_id=165&oauth2_token_id=57447761";

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current) {
      videoRef.current.play().catch(e => console.log("Video auto-play prevented:", e));
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setShowSizes(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // If only one size, add directly. If multiple, show size picker first.
    const sizeToUse = selectedSize || (sizes.length === 1 ? sizes[0] : "");

    if (!sizeToUse && sizes.length > 1) {
      setShowSizes(true);
      return;
    }

    if (!sizeToUse && sizes.length === 0) return;
    if (stock_count === 0) return;

    const finalSize = sizeToUse || sizes[0];
    addToCart({
      cartId: `${id}-${finalSize}-${Date.now()}`,
      id,
      name,
      price: Number(price),
      image_url,
      size: finalSize,
      qty: 1,
    });

    setAdded(true);
    setShowSizes(false);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleSelectSize = (e: React.MouseEvent, size: string) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedSize(size);
    // Add to cart immediately after selecting size
    addToCart({
      cartId: `${id}-${size}-${Date.now()}`,
      id,
      name,
      price: Number(price),
      image_url,
      size,
      qty: 1,
    });
    setAdded(true);
    setShowSizes(false);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div
      className="group relative rounded-3xl overflow-hidden flex flex-col bg-brand-card transition-all duration-700 ease-in-out border-2 border-brand-border hover:border-brand-accent/50 hover:shadow-[0_0_30px_rgba(188,212,230,0.15)]"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link href={`/products/${id}`} className="flex-grow flex flex-col">
        <div className="w-full aspect-[4/5] relative overflow-hidden bg-brand-bg flex items-center justify-center">
          {/* Static Image */}
          <div className={`absolute inset-0 z-10 transition-opacity duration-700 ${isHovered ? 'opacity-0' : 'opacity-100'}`}>
            <Image
              src={image_url || "/placeholder.jpg"}
              alt={name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>

          {/* Cinematic Video */}
          <div className={`absolute inset-0 z-0 transition-opacity duration-700 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            <video
              ref={videoRef}
              src={demoVideo}
              muted
              loop
              playsInline
              preload="none"
              className="w-full h-full object-cover scale-105"
            />
          </div>

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/80 via-transparent to-transparent z-20 pointer-events-none" />

          {/* Offer / Stock Tags */}
          <div className="absolute top-4 right-4 z-30 flex flex-col gap-2 items-end">
            {stock_count === 0 && (
              <span className="bg-brand-text text-brand-bg text-[10px] px-3 py-1.5 rounded-full font-black tracking-widest uppercase shadow-lg">
                نفدت الكمية
              </span>
            )}
            {stock_count !== undefined && stock_count > 0 && stock_count <= 3 && (
              <span className="bg-red-500/90 text-white text-[10px] px-3 py-1.5 rounded-full font-black tracking-widest uppercase shadow-lg animate-pulse backdrop-blur-md">
                أخر {stock_count} قطع!
              </span>
            )}
            {old_price && stock_count !== 0 && (
              <span className="bg-red-500/10 border border-red-500/30 text-red-500 text-[10px] px-3 py-1.5 rounded-full font-black tracking-widest uppercase animate-pulse backdrop-blur-md">
                عرض خاص
              </span>
            )}
          </div>
        </div>

        <div className="p-6 flex flex-col flex-grow relative z-30 -mt-8">
          <div className="bg-brand-card/90 backdrop-blur-xl border border-brand-border p-4 rounded-2xl shadow-xl flex flex-col gap-2">
            <h3 className="text-xl font-black uppercase tracking-tight line-clamp-1 text-brand-text italic drop-shadow-md">
              {name}
            </h3>

            <div className="flex justify-between items-end mt-2">
              <div className="flex flex-col">
                {old_price ? (
                  <>
                    <span className="font-black text-2xl text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)] leading-none mb-1">
                      {price} <span className="text-[10px] font-bold uppercase text-brand-text">ج.م</span>
                    </span>
                    <span className="text-xs font-bold text-brand-text/50 line-through decoration-red-500 decoration-2">
                      {old_price} ج.م
                    </span>
                  </>
                ) : (
                  <span className="font-black text-2xl text-brand-text leading-none group-hover:text-brand-accent transition-colors duration-500">
                    {price} <span className="text-[10px] font-bold uppercase text-brand-text/50">ج.م</span>
                  </span>
                )}
              </div>
              <span className="text-[10px] font-black text-brand-text/40 border-l-2 border-brand-accent/20 pl-2">
                {selectedSize || sizes[0] || "—"}
              </span>
            </div>
          </div>
        </div>
      </Link>

      {/* Add to Cart Section */}
      <div className="px-6 pb-6 pt-0 z-40 relative">
        {/* Size Picker Dropdown */}
        {showSizes && sizes.length > 1 && (
          <div className="mb-3 bg-brand-bg border-2 border-brand-accent/30 rounded-2xl p-3 flex flex-wrap gap-2 shadow-xl animate-in fade-in slide-in-from-bottom-2">
            <p className="w-full text-[9px] font-black text-brand-text/40 uppercase tracking-widest mb-1">اختر المقاس</p>
            {sizes.map(size => (
              <button
                key={size}
                onClick={(e) => handleSelectSize(e, size)}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border-2 transition-all hover:scale-105 active:scale-95
                  ${selectedSize === size
                    ? "bg-brand-accent text-brand-bg border-brand-accent"
                    : "bg-brand-card text-brand-text border-brand-border hover:border-brand-accent/50"
                  }`}
              >
                {size}
              </button>
            ))}
          </div>
        )}

        <button
          onClick={handleAddToCart}
          disabled={stock_count === 0}
          className={`w-full py-4 rounded-xl font-black uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-3
            opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 ease-out
            ${stock_count === 0 
              ? "bg-brand-text/10 text-brand-text/40 cursor-not-allowed"
              : added
                ? "bg-green-500/10 border-2 border-green-500/40 text-green-500"
                : "btn-melt aura-glow"
            }`}
        >
          {stock_count === 0 ? (
            <><ShoppingCart size={18} className="opacity-50" /> نفدت الكمية</>
          ) : added ? (
            <><Check size={18} /> تمت الإضافة</>
          ) : sizes.length > 1 && !selectedSize ? (
            <><ChevronDown size={18} /> اختر المقاس</>
          ) : (
            <><ShoppingCart size={18} /> إضافة إلى العربة</>
          )}
        </button>
      </div>
    </div>
  );
}
