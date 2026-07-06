"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabaseBrowser";

export default function SiteTracker() {
  useEffect(() => {
    const trackVisit = async () => {
      const today = new Date().toISOString().split('T')[0];
      const visited = localStorage.getItem(`maqam_visited_${today}`);
      
      if (!visited) {
        try {
          const supabase = createClient();
          // Call the RPC function defined in phase5_schema.sql
          await supabase.rpc('increment_daily_visit');
          localStorage.setItem(`maqam_visited_${today}`, "true");
        } catch (error) {
          console.error("Failed to track visit", error);
        }
      }
    };
    
    // Slight delay to not block main thread on load
    setTimeout(trackVisit, 2000);
  }, []);

  return null;
}
