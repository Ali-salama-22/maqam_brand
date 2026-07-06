import Link from "next/link";
import CategoryCircle from "@/components/home/CategoryCircle";
import NewCollection from "@/components/home/NewCollection";
import OffersSection from "@/components/home/OffersSection";
import CategoryCarousels from "@/components/home/CategoryCarousels";

export default function Home() {
  return (
    <div className="w-full flex flex-col items-center bg-brand-bg">

      {/* ── Banner / Offers Section (Replaced Hero) ── */}
      <OffersSection />

      {/* Category Navigation (Restored to page) */}
      <CategoryCircle />

      {/* Secondary Categories (Showcase Carousels) */}
      <CategoryCarousels />

      {/* Collections */}
      <div className="w-full space-y-0 relative z-10">
        <NewCollection />
      </div>
    </div>
  );
}
