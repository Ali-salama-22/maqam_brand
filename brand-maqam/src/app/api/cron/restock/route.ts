import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// We use the regular supabase-js client because this might run in a background context without cookies
// If SUPABASE_SERVICE_ROLE_KEY is provided, it will bypass RLS.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: Request) {
  // Optional: check for a cron secret to protect the route
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data, error } = await supabase.rpc('restock_abandoned_orders');

    if (error) {
      console.error('Error executing restock RPC:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      restocked_count: data, 
      message: `Successfully restocked ${data} abandoned orders.` 
    });
  } catch (err: any) {
    console.error('Unexpected error in restock cron:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
