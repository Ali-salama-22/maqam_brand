const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://hubqkhkbppmzgkkbopmn.supabase.co',
  'sb_publishable_hOTy5SKavXQxNDnZ4tQ6nQ_skl7DPII'
);

async function syncDb() {
  console.log('Checking database table structures...');
  
  // 1. Check products for 'colors' column
  const { data: pData, error: pError } = await supabase.from('products').select('*').limit(1);
  if (pError) console.error('Error fetching products:', pError.message);
  else {
    const cols = Object.keys(pData[0] || {});
    console.log('Product Columns:', cols);
    if (!cols.includes('colors')) {
      console.log('WARNING: "colors" column missing in products table.');
    }
  }

  // 2. Check orders for customer fields
  const { data: oData, error: oError } = await supabase.from('orders').select('*').limit(1);
  if (oError) console.error('Error fetching orders:', oError.message);
  else {
    const cols = Object.keys(oData[0] || {});
    console.log('Order Columns:', cols);
    const required = ['customer_name', 'phone', 'address', 'total', 'items'];
    required.forEach(c => {
      if (!cols.includes(c)) console.log(`WARNING: "${c}" column missing in orders table.`);
    });
  }

  // 3. Check for store_settings table
  const { data: sData, error: sError } = await supabase.from('store_settings').select('*');
  if (sError) {
    console.log('store_settings table might be missing or inaccessible:', sError.message);
  } else {
    console.log('store_settings found:', sData);
  }
}

syncDb();
