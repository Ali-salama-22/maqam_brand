"use client";

import { useEffect, useState } from "react";
import ProfileForm from "@/components/profile/ProfileForm";
import OrderHistory from "@/components/profile/OrderHistory";
import LoyaltyCard from "@/components/profile/LoyaltyCard";
import FavoritesList from "@/components/profile/FavoritesList";
import SocialAuth from "@/components/auth/SocialAuth";
import { createClient } from "@/lib/supabaseBrowser";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-brand-bg text-brand-pine">جاري التحميل...</div>;

  return (
    <div className="w-full min-h-screen bg-brand-bg py-20 px-4 sm:px-6 lg:px-8 transition-colors duration-500">
      {!user ? (
        <div className="max-w-md mx-auto">
           <SocialAuth />
        </div>
      ) : (
        <div className="max-w-7xl mx-auto">
          {/* Members Lounge Header */}
          <div className="mb-20 text-center md:text-right border-b-2 border-brand-border pb-12 relative overflow-hidden group">
             <div className="absolute top-0 left-0 w-64 h-64 bg-brand-accent/5 rounded-full -ml-32 -mt-32 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
             <h1 className="text-6xl md:text-8xl font-black text-brand-text uppercase italic tracking-tighter leading-[0.8] mb-6">
                صالة <span className="text-brand-text/20 group-hover:text-brand-accent transition-colors duration-700">العضوية</span>
             </h1>
             <p className="text-brand-text/40 font-black tracking-[0.5em] text-[10px] uppercase">هوية موثقة: {user.email?.split('@')[0]}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            <div id="orders-section" className="lg:col-span-8 flex flex-col space-y-12 order-2 lg:order-1 scroll-mt-32">
              <OrderHistory />
              <div id="favorites-section" className="scroll-mt-32">
                <FavoritesList />
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col space-y-12 order-1 lg:order-2">
              <div className="bg-brand-card p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group border border-brand-border">
                 <div className="absolute inset-0 border-2 border-brand-accent/5 group-hover:border-brand-accent/20 transition-all rounded-[3rem] m-2 pointer-events-none" />
                 <ProfileForm />
              </div>
              
              <div id="loyalty-section" className="transform hover:scale-[1.02] transition-all duration-700 scroll-mt-32">
                 <LoyaltyCard />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
