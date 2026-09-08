import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rvrrrvmvmagurajqlxow.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2cnJydm12bWFndXJhanFseG93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4MTQ5NDksImV4cCI6MjEwMzM5MDk0OX0.jFTYrUc-qg-9W6RzXRRODBUxDjk0lcr2LBZPqFjzRqc';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  const { data, error } = await supabase.from('products').update({ image: "https://imgs.search.brave.com/YxgtwdxNy2yYuqRTstyv_NEb8hoUodQV581UF48qds0/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9zdGF0/aWMudmVjdGVlenku/Y29tL3N5c3RlbS9y/ZXNvdXJjZXMvdGh1/bWJuYWlscy8wMjkv/NTQ1LzA5MC9zbWFs/bC9waGFybWFjZXV0/aWNhbC1tZWRpY2lu/ZS1waWxscy1hbmQt/Y2Fwc3VsZXMtb24t/d29vZGVuLXRhYmxl/LWluLWRhcmstcm9v/bS1haS1nZW5lcmF0/ZWQtcHJvLXBob3Rv/LmpwZw" }).eq("id", 1).select();
  if (error) console.error("Error:", error);
  console.log("Updated:", data);
}

check();
