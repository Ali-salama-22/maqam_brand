import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ ERROR: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined in the environment.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFavorites() {
  console.log('🔄 Checking favorites table and join...');
  const { data, error } = await supabase
    .from("favorites")
    .select("*, product:products(*)")
    .limit(1);

  if (error) {
    console.error('❌ Favorites join failed:', error.message, 'Code:', error.code);
  } else {
    console.log('✅ Favorites join succeeded! Found rows:', data.length);
  }
}

testFavorites();
