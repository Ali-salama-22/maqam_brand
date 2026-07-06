import { createClient } from '@supabase/supabase-js';

// We rely on Node 20's --env-file flag to inject the variables into process.env!
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ ERROR: the keys did not load into process.env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('🔄 Testing Supabase Connection to ->', supabaseUrl);
  try {
    const { data, error } = await supabase.from('categories').select('*').limit(1);
    
    if (error) {
      console.error('❌ Supabase Error:', error.message);
      process.exit(1);
    }
    
    console.log('✅ Connection Successful! Verified the "categories" table exists and is accessible.');
    console.log('Rows found:', data.length);
  } catch (err) {
    console.error('❌ Connection Failed:', err);
    process.exit(1);
  }
}

testConnection();
