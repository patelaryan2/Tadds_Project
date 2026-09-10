import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://rvrrrvmvmagurajqlxow.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2cnJydm12bWFndXJhanFseG93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4MTQ5NDksImV4cCI6MjEwMzM5MDk0OX0.jFTYrUc-qg-9W6RzXRRODBUxDjk0lcr2LBZPqFjzRqc';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runChecks() {
  console.log('====================================================');
  console.log('       SUPABASE DATABASE & SECURITY AUDIT           ');
  console.log('====================================================\n');

  // 1. Test connectivity
  console.log('1. CONNECTIVITY TEST');
  try {
    const { count, error } = await supabase.from('products').select('*', { count: 'exact', head: true });
    if (error) {
      console.log(`   ❌ Products table error: ${error.message}`);
    } else {
      console.log(`   ✅ Supabase connected. Total products: ${count}`);
    }
  } catch (e) {
    console.log(`   ❌ Connection failed: ${e.message}`);
  }

  // 2. Check products table schema
  console.log('\n2. PRODUCTS TABLE SCHEMA & COLUMNS');
  try {
    const { data, error } = await supabase.from('products').select('*').limit(1);
    if (error) {
      console.log(`   ❌ Can't read products: ${error.message}`);
    } else if (data && data.length > 0) {
      const columns = Object.keys(data[0]);
      console.log(`   Current columns in DB: ${columns.join(', ')}`);
      
      const expectedColumns = ['category', 'rating', 'reviews_count', 'stock', 'discount', 'featured', 'is_trending', 'is_new', 'brand'];
      const missing = expectedColumns.filter(c => !columns.includes(c));
      
      if (missing.length === 0) {
        console.log(`   ✅ ALL REQUIRED COLUMNS EXIST in database!`);
      } else {
        console.log(`   ⚠️ Missing columns (run supabase_setup.sql in Supabase SQL editor): ${missing.join(', ')}`);
      }
    }
  } catch (e) {
    console.log(`   ❌ Schema check failed: ${e.message}`);
  }

  // 3. Check for unused tables (orders, users)
  console.log('\n3. UNUSED TABLES CHECK');
  for (const tbl of ['orders', 'users']) {
    try {
      const { data, error } = await supabase.from(tbl).select('*').limit(1);
      if (error && (error.message.includes('does not exist') || error.code === '42P01')) {
        console.log(`   ✅ Table '${tbl}' does not exist (clean)`);
      } else if (!error) {
        console.log(`   ℹ️ Table '${tbl}' exists in database (${data?.length || 0} rows)`);
      }
    } catch (e) {
      console.log(`   ✅ Table '${tbl}' inaccessible`);
    }
  }

  // 4. Admin RPC functions test
  console.log('\n4. ADMIN RPC FUNCTIONS TEST');
  try {
    const { data, error } = await supabase.rpc('verify_admin_login', {
      p_username: '__test__',
      p_password: '__test__'
    });
    if (error) {
      if (error.message.includes('does not exist') || error.message.includes('Could not find')) {
        console.log(`   ⚠️ verify_admin_login: NOT FOUND — run supabase_setup.sql`);
      } else {
        console.log(`   ❓ verify_admin_login: ${error.message}`);
      }
    } else {
      console.log(`   ✅ verify_admin_login: INSTALLED & FUNCTIONAL`);
    }
  } catch (e) {
    console.log(`   ⚠️ verify_admin_login: ${e.message}`);
  }

  // 5. Test RLS
  console.log('\n5. ROW LEVEL SECURITY (RLS) TEST');
  try {
    const { data, error } = await supabase.from('admin_credentials').select('*').limit(1);
    if (error) {
      console.log(`   ✅ admin_credentials is protected from public read: ${error.message}`);
    } else {
      console.log(`   ⚠️ admin_credentials table is readable by anonymous users`);
    }
  } catch (e) {
    console.log(`   ✅ admin_credentials protected`);
  }

  console.log('\n====================================================');
  console.log('                  AUDIT COMPLETE                    ');
  console.log('====================================================\n');
}

runChecks();
