"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseBrowser";
import Link from "next/link";
import Image from "next/image";
import { TicketPercent, ArrowLeft } from "lucide-react";

type Offer = {
  id: string;
  title: string;
  description: string;
  discount_code: string;
  image_url: string;
};

type BannerSettings = {
  showOffers: boolean;
  bannerMode: boolean;
  bannerMediaType: "image" | "video";
  bannerMediaUrl: string;
  bannerTitle: string;
  bannerSubtitle: string;
};

export default function OffersSection() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [settings, setSettings] = useState<BannerSettings>({
    showOffers: true,
    bannerMode: false,
    bannerMediaType: "image",
    bannerMediaUrl: "",
    bannerTitle: "",
    bannerSubtitle: "",
  });
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const { data: settingsData } = await supabase
        .from("store_settings")
        .select("banner_text")
        .eq("id", 1)
        .single();

      if (settingsData?.banner_text) {
        try {
          const parsed = JSON.parse(settingsData.banner_text);
          setSettings({
            showOffers: parsed.showOffers ?? true,
            bannerMode: parsed.bannerMode ?? false,
            bannerMediaType: parsed.bannerMediaType || "image",
            bannerMediaUrl: parsed.bannerMediaUrl || "",
            bannerTitle: parsed.bannerTitle || "",
            bannerSubtitle: parsed.bannerSubtitle || "",
          });
        } catch { /* noop */ }
      }

      const { data } = await supabase.from("offers").select("*").limit(2);
      if (data) setOffers(data);
    };
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!settings.showOffers) return null;

  // ── Premium Banner Mode ─────────────────────────────────────────────────
  if (settings.bannerMode) {
    const hasMedia = !!settings.bannerMediaUrl;
    const isVideo = settings.bannerMediaType === "video";

    return (
      <section className="py-12 w-full relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative w-full h-[340px] md:h-[480px] rounded-[2.5rem] overflow-hidden shadow-2xl border border-brand-border group cursor-pointer">

            {/* Background Media */}
            {hasMedia && isVideo ? (
              <video
                src={settings.bannerMediaUrl}
                autoPlay
                muted
                loop
                playsInline
                className="absolute inset-0 w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-[2s]"
              />
            ) : hasMedia ? (
              <Image
                src={settings.bannerMediaUrl}
                alt={settings.bannerTitle || "Banner"}
                fill
                className="object-cover scale-105 group-hover:scale-100 transition-transform duration-[2s]"
                priority
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-brand-text via-brand-text/90 to-brand-card" />
            )}

            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-l from-black/70 via-black/30 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            {/* Content */}
            <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-14">
              <div className="max-w-xl">
                {settings.bannerTitle && (
                  <div className="mb-4">
                    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-accent bg-brand-accent/10 border border-brand-accent/30 px-4 py-2 rounded-full backdrop-blur-sm">
                      MAQAM COLLECTION
                    </span>
                  </div>
                )}
                {settings.bannerTitle && (
                  <h2 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter leading-tight mb-4 drop-shadow-2xl">
                    {settings.bannerTitle}
                  </h2>
                )}
                {settings.bannerSubtitle && (
                  <p className="text-sm md:text-base font-bold text-white/70 mb-8 leading-relaxed max-w-md">
                    {settings.bannerSubtitle}
                  </p>
                )}
                <Link
                  href="/products"
                  className="inline-flex items-center gap-3 bg-white text-brand-text px-8 py-4 rounded-full font-black text-sm uppercase tracking-widest hover:bg-brand-accent hover:text-brand-text transition-all shadow-2xl hover:scale-105 active:scale-95"
                >
                  تسوق الآن <ArrowLeft size={16} />
                </Link>
              </div>
            </div>

            {/* Decorative corner accent */}
            <div className="absolute top-6 left-6 w-12 h-12 border-2 border-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <span className="text-white font-black text-[10px] tracking-widest">MQ</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ── Standard Offers Cards Mode ──────────────────────────────────────────
  if (offers.length === 0) return null;

  return (
    <section className="py-24 w-full relative overflow-hidden bg-brand-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-16 gap-6">
          <div className="text-center md:text-right">
            <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter text-brand-text">
              عروض <span className="text-brand-accent">خاصة</span>
            </h2>
            <div className="h-[4px] w-40 mt-4 rounded-full mx-auto md:mx-0 bg-brand-accent/20" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="group relative h-[450px] md:h-[600px] rounded-[3rem] overflow-hidden border border-brand-border bg-brand-card shadow-2xl flex flex-col justify-end p-10"
            >
              {offer.image_url && (
                <Image
                  src={offer.image_url}
                  alt={offer.title}
                  fill
                  className="object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
                />
              )}
              <div className="relative z-10 flex flex-col gap-6">
                <div className="flex items-center gap-4">
                  <div className="bg-brand-accent text-white p-3 rounded-2xl shadow-xl">
                    <TicketPercent size={28} />
                  </div>
                  <span className="text-xs font-black uppercase tracking-[0.5em] text-brand-accent">عرض محدود الكمية</span>
                </div>
                <h3 className="text-4xl md:text-5xl font-black text-brand-text uppercase italic tracking-tighter leading-tight">
                  {offer.title}
                </h3>
                <p className="text-sm font-bold opacity-60 text-brand-text max-w-sm mb-6">{offer.description}</p>
                <div className="flex flex-col sm:flex-row gap-6 items-center">
                  <div className="bg-brand-bg border border-brand-border px-8 py-5 rounded-2xl flex flex-col items-center justify-center min-w-[180px] shadow-sm">
                    <span className="text-[10px] font-black uppercase opacity-20 mb-1">كود الخصم</span>
                    <span className="text-2xl font-black tracking-widest text-brand-accent select-all uppercase">{offer.discount_code}</span>
                  </div>
                  <Link
                    href="/products"
                    className="btn-melt px-10 py-5 rounded-full font-black text-[10px] uppercase tracking-[0.4em] transition-all flex items-center justify-center w-full sm:w-auto"
                  >
                    تسوق الآن
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
