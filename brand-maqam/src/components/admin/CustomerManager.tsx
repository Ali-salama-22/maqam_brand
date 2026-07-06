"use client";

import { useEffect, useState } from "react";
import { Users, BarChart3, Clock, Loader2, Search } from "lucide-react";
import { createClient } from "@/lib/supabaseBrowser";

export default function CustomerManager() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [stats, setStats] = useState({ today: 0, last7Days: 0, totalUsers: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const supabase = createClient();

  const fetchData = async () => {
    setLoading(true);

    // 1. Fetch Profiles
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (profilesData) {
      setProfiles(profilesData);
      setStats((prev) => ({ ...prev, totalUsers: profilesData.length }));
    }

    // 2. Fetch Stats
    const today = new Date().toISOString().split('T')[0];
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const last7Str = sevenDaysAgo.toISOString().split('T')[0];

    const { data: visitsData } = await supabase
      .from("site_visits")
      .select("*")
      .gte("visit_date", last7Str)
      .order("visit_date", { ascending: false });

    if (visitsData) {
      const todayVisit = visitsData.find((v) => v.visit_date === today);
      const todayCount = todayVisit ? todayVisit.visitors_count : 0;
      const last7Count = visitsData.reduce((acc, curr) => acc + curr.visitors_count, 0);
      setStats((prev) => ({ ...prev, today: todayCount, last7Days: last7Count }));
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredProfiles = profiles.filter(
    (p) =>
      (p.full_name && p.full_name.includes(searchTerm)) ||
      (p.email && p.email.includes(searchTerm)) ||
      (p.phone && p.phone.includes(searchTerm))
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-brand-pine uppercase tracking-tighter decoration-brand-pine/20 decoration-4 underline-offset-8 underline mb-2">
            العملاء والإحصائيات
          </h2>
          <p className="text-brand-pine/60 font-bold text-sm">
            متابعة نشاط الزوار وحسابات العملاء
          </p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 bg-brand-pine text-brand-ivory px-4 py-2 rounded-lg font-bold hover:bg-[#052b2a] transition-all text-sm"
        >
          <Clock size={16} /> تحديث البيانات
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-brand-card p-6 rounded-2xl border border-brand-border shadow-sm flex items-center justify-between group">
          <div>
            <p className="text-sm font-bold text-brand-text/50 uppercase tracking-widest mb-2">الزيارات اليوم</p>
            <p className="text-4xl font-black text-brand-text group-hover:text-brand-accent transition-colors">{stats.today}</p>
          </div>
          <div className="bg-brand-bg p-4 rounded-xl text-brand-accent">
            <BarChart3 size={32} />
          </div>
        </div>

        <div className="bg-brand-card p-6 rounded-2xl border border-brand-border shadow-sm flex items-center justify-between group">
          <div>
            <p className="text-sm font-bold text-brand-text/50 uppercase tracking-widest mb-2">زيارات آخر 7 أيام</p>
            <p className="text-4xl font-black text-brand-text group-hover:text-brand-accent transition-colors">{stats.last7Days}</p>
          </div>
          <div className="bg-brand-bg p-4 rounded-xl text-brand-accent">
            <BarChart3 size={32} />
          </div>
        </div>

        <div className="bg-brand-card p-6 rounded-2xl border border-brand-border shadow-sm flex items-center justify-between group">
          <div>
            <p className="text-sm font-bold text-brand-text/50 uppercase tracking-widest mb-2">إجمالي العملاء</p>
            <p className="text-4xl font-black text-brand-text group-hover:text-brand-accent transition-colors">{stats.totalUsers}</p>
          </div>
          <div className="bg-brand-bg p-4 rounded-xl text-brand-accent">
            <Users size={32} />
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-brand-card border border-brand-border p-4 rounded-2xl flex items-center gap-4 shadow-sm">
        <Search size={20} className="text-brand-text/40" />
        <input
          type="text"
          placeholder="ابحث بالاسم، البريد الإلكتروني، أو رقم الهاتف..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-transparent border-none outline-none text-brand-text font-bold placeholder:font-normal placeholder:text-brand-text/30"
        />
      </div>

      {/* Profiles Table */}
      <div className="bg-brand-card border border-brand-border rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center items-center">
            <Loader2 size={32} className="text-brand-pine animate-spin" />
          </div>
        ) : filteredProfiles.length === 0 ? (
          <div className="p-12 text-center text-brand-pine/50 font-bold">
            لا توجد حسابات مطابقة للبحث.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-brand-bg border-b border-brand-border text-brand-pine">
                  <th className="p-4 font-black tracking-widest text-sm w-1/4">الاسم</th>
                  <th className="p-4 font-black tracking-widest text-sm w-1/4">البريد الإلكتروني</th>
                  <th className="p-4 font-black tracking-widest text-sm w-1/4">رقم الهاتف</th>
                  <th className="p-4 font-black tracking-widest text-sm w-1/4">تاريخ الانضمام</th>
                </tr>
              </thead>
              <tbody>
                {filteredProfiles.map((p) => (
                  <tr key={p.id} className="border-b border-brand-border/50 hover:bg-brand-bg/50 transition-colors">
                    <td className="p-4 font-bold text-sm text-brand-text">
                      {p.full_name || <span className="opacity-40 italic">غير متوفر</span>}
                    </td>
                    <td className="p-4 text-xs font-bold font-mono text-brand-text/70" dir="ltr">
                      {p.email}
                    </td>
                    <td className="p-4 text-sm font-bold text-brand-text">
                      {p.phone ? <span dir="ltr">{p.phone}</span> : <span className="opacity-40 italic">غير متوفر</span>}
                    </td>
                    <td className="p-4 text-xs text-brand-text/50 font-bold" dir="ltr">
                      {new Date(p.created_at).toLocaleDateString('ar-EG')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
