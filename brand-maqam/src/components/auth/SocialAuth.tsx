"use client";

import { createClient } from "@/lib/supabaseBrowser";
import { UserCircle } from "lucide-react";

export default function SocialAuth({ title = "تسجيل الدخول / إنشاء حساب" }) {
  const supabase = createClient();

  const handleOAuth = async (provider: 'google' | 'facebook') => {
    // We haven't configured the keys on the dashboard yet, but the flow is ready!
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : "",
      }
    });
    
    if (error) {
      alert("حدث خطأ أثناء الاتصال: " + error.message);
    }
  };

  return (
    <div className="bg-brand-card border border-brand-border rounded-[3rem] p-10 lg:p-16 shadow-3xl flex flex-col items-center justify-center text-center w-full max-w-xl mx-auto relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-accent/30 to-transparent" />
      <UserCircle size={100} className="text-brand-accent/20 mb-8 " />
      
      <h2 className="text-4xl font-black text-brand-text mb-6 uppercase italic tracking-tighter leading-none">
        {title}
      </h2>
      
      <p className="text-brand-text/40 font-black text-[10px] mb-12 max-w-md uppercase tracking-[0.4em] leading-relaxed">
        ادخل إلى خزنتك الرقمية الآمنة لإدارة أرشيفك، تتبع شحناتك، واسترداد مزايا النخبة الحصرية.
      </p>

      <div className="flex flex-col w-full gap-6">
        {/* Google Login */}
        <button 
          onClick={() => handleOAuth('google')}
          className="w-full flex items-center justify-center gap-5 bg-white text-black font-black py-5 rounded-2xl shadow-xl hover:scale-[1.03] transition-all text-xs tracking-[0.3em] uppercase group/btn border-2 border-white"
        >
          <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
            <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
              <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
              <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
              <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
              <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
            </g>
          </svg>
           المزامنة مع جوجل
        </button>

        {/* Facebook Login */}
        <button 
          onClick={() => handleOAuth('facebook')}
          className="w-full flex items-center justify-center gap-5 bg-[#1877F2]/10 text-[#1877F2] font-black py-5 rounded-2xl border-2 border-[#1877F2]/20 hover:bg-[#1877F2] hover:text-white transition-all text-xs tracking-[0.3em] uppercase shadow-lg hover:scale-[1.03]"
        >
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          الاتصال بفيسبوك
        </button>
      </div>
      
      <div className="mt-12 flex flex-col items-center gap-2 opacity-20">
         <div className="w-1 h-8 bg-brand-accent/50 rounded-full mb-2" />
         <p className="text-[8px] font-black uppercase tracking-[0.6em] px-8">
            مؤمن بواسطة بروتوكول مقام للتشفير
         </p>
      </div>
    </div>
  );
}
