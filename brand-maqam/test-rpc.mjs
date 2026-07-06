import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ ERROR: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined in the environment.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testVisitsRPC() {
  console.log('🔄 Testing increment_daily_visit RPC...');
  const { data, error } = await supabase.rpc('increment_daily_visit');

  if (error) {
    console.error('❌ increment_daily_visit RPC Error:', error.message, error.details, error.hint, error.code);
  } else {
    console.log('✅ increment_daily_visit RPC Success! Result:', data);
  }
}

testVisitsRPC();
