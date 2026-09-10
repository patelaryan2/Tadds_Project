import { supabase } from "../lib/supabase";
import type { Product } from "../types";

export async function getProducts(from?: number, to?: number): Promise<Product[]> {
  let query = supabase
    .from("products")
    .select("*")
    .order("id", { ascending: true });

  if (from !== undefined && to !== undefined) {
    query = query.range(from, to);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching products:", error);
    throw new Error(error.message);
  }

  return (data || []) as Product[];
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("category", category)
    .order("id", { ascending: true });

  if (error) {
    console.error("Error fetching products by category:", error);
    throw new Error(error.message);
  }

  return (data || []) as Product[];
}

export async function getTrendingProducts(limit = 8): Promise<Product[]> {
  // Try to fetch products flagged as trending, fallback to top rated/highest price
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_trending", true)
    .limit(limit);

  if (!error && data && data.length > 0) {
    return data as Product[];
  }

  // Fallback to latest products
  const { data: fallbackData } = await supabase
    .from("products")
    .select("*")
    .order("id", { ascending: false })
    .limit(limit);

  return (fallbackData || []) as Product[];
}

export async function getNewArrivals(limit = 8): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_new", true)
    .limit(limit);

  if (!error && data && data.length > 0) {
    return data as Product[];
  }

  const { data: fallbackData } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  return (fallbackData || []) as Product[];
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("featured", true)
    .limit(limit);

  if (!error && data && data.length > 0) {
    return data as Product[];
  }

  const { data: fallbackData } = await supabase
    .from("products")
    .select("*")
    .limit(limit);

  return (fallbackData || []) as Product[];
}

export async function getCategories(): Promise<string[]> {
  const { data, error } = await supabase
    .from("products")
    .select("category");

  if (error) {
    console.error("Error fetching categories:", error);
    throw new Error(error.message);
  }

  const categories = [...new Set((data || []).map((p: { category: string }) => p.category).filter(Boolean))];
  return (categories.length > 0 ? categories : ["electronics", "clothing", "footwear", "accessories", "home"]) as string[];
}

export async function getProductById(id: number | string): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", Number(id))
    .single();

  if (error) {
    console.error("Error fetching product:", error);
    return null;
  }

  return data as Product;
}

export async function getProductCount(): Promise<number> {
  const { count, error } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true });

  if (error) {
    console.error("Error fetching product count:", error);
    return 0;
  }

  return count || 0;
}

// Admin-only operations (Supports all fields with RPC and direct fallback)
export interface AdminProductPayload {
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
  rating?: number;
  reviews_count?: number;
  stock?: number;
  discount?: number;
  featured?: boolean;
  is_trending?: boolean;
  is_new?: boolean;
  brand?: string;
}

export async function adminCreateProduct(token: string, product: AdminProductPayload) {
  // 1. Try secure RPC
  try {
    const { data, error } = await supabase.rpc("admin_create_product", {
      p_token: token,
      p_name: product.name,
      p_price: product.price,
      p_image: product.image,
      p_description: product.description,
      p_category: product.category || "general",
      p_rating: product.rating ?? 4.2,
      p_reviews_count: product.reviews_count ?? 0,
      p_stock: product.stock ?? 50,
      p_discount: product.discount ?? 0,
      p_featured: product.featured ?? false,
      p_is_trending: product.is_trending ?? false,
      p_is_new: product.is_new ?? false,
      p_brand: product.brand ?? "",
    });

    if (!error && data?.success) {
      return data.product;
    }
  } catch {
    // RPC not available, fallback to direct insert
  }

  // 2. Direct Supabase insert fallback
  const { data, error } = await supabase
    .from("products")
    .insert([product])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function adminUpdateProduct(token: string, id: number, product: AdminProductPayload) {
  // 1. Try secure RPC
  try {
    const { data, error } = await supabase.rpc("admin_update_product", {
      p_token: token,
      p_id: id,
      p_name: product.name,
      p_price: product.price,
      p_image: product.image,
      p_description: product.description,
      p_category: product.category || "general",
      p_rating: product.rating ?? 4.2,
      p_reviews_count: product.reviews_count ?? 0,
      p_stock: product.stock ?? 50,
      p_discount: product.discount ?? 0,
      p_featured: product.featured ?? false,
      p_is_trending: product.is_trending ?? false,
      p_is_new: product.is_new ?? false,
      p_brand: product.brand ?? "",
    });

    if (!error && data?.success) {
      return data.product;
    }
  } catch {
    // RPC not available, fallback to direct update
  }

  // 2. Direct Supabase update fallback
  const updatePayload: Record<string, any> = {};
  if (product.name !== undefined) updatePayload.name = product.name;
  if (product.price !== undefined) updatePayload.price = Number(product.price);
  if (product.image !== undefined) updatePayload.image = product.image;
  if (product.description !== undefined) updatePayload.description = product.description;
  if (product.category !== undefined) updatePayload.category = product.category;
  if (product.rating !== undefined) updatePayload.rating = Number(product.rating);
  if (product.reviews_count !== undefined) updatePayload.reviews_count = Number(product.reviews_count);
  if (product.stock !== undefined) updatePayload.stock = Number(product.stock);
  if (product.discount !== undefined) updatePayload.discount = Number(product.discount);
  if (product.featured !== undefined) updatePayload.featured = Boolean(product.featured);
  if (product.is_trending !== undefined) updatePayload.is_trending = Boolean(product.is_trending);
  if (product.is_new !== undefined) updatePayload.is_new = Boolean(product.is_new);
  if (product.brand !== undefined) updatePayload.brand = product.brand;

  const { data, error } = await supabase
    .from("products")
    .update(updatePayload)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function adminDeleteProduct(token: string, id: number) {
  // 1. Try secure RPC
  try {
    const { data, error } = await supabase.rpc("admin_delete_product", {
      p_token: token,
      p_id: id,
    });

    if (!error && data?.success) {
      return true;
    }
  } catch {
    // RPC not available, fallback to direct delete
  }

  // 2. Direct Supabase delete fallback
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
  return true;
}
