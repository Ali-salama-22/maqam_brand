const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkData() {
  const { data: categories } = await supabase.from('categories').select('*');
  console.log('Categories:', categories);

  const { data: newProducts } = await supabase.from('products').select('id, name, is_new_collection, is_offer').eq('is_new_collection', true);
  console.log('New Collection Products:', newProducts?.length || 0);

  const { data: offerProducts } = await supabase.from('products').select('id, name, is_new_collection, is_offer').eq('is_offer', true);
  console.log('Offer Products:', offerProducts?.length || 0);
}

checkData();
