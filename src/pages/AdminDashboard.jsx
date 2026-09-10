import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAdmin } from "../context/AdminContext";
import {
  getProducts,
  getCategories,
  getProductCount,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
} from "../data/products";

export default function AdminDashboard() {
  const { isAdmin, adminLogout, adminToken, loading: authLoading } = useAdmin();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [productCount, setProductCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    price: "",
    discount: 0,
    image: "",
    description: "",
    category: "electronics",
    rating: 4.5,
    reviews_count: 50,
    stock: 50,
    featured: false,
    is_trending: false,
    is_new: false,
  });
  const [customCategory, setCustomCategory] = useState("");
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [formError, setFormError] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate("/admin");
    }
  }, [isAdmin, authLoading]);

  useEffect(() => {
    if (isAdmin) {
      refreshData();
    }
  }, [isAdmin]);

  const refreshData = async () => {
    setLoading(true);
    try {
      const [prods, cats, count] = await Promise.all([
        getProducts(),
        getCategories(),
        getProductCount(),
      ]);
      setProducts(prods);
      setCategories(cats);
      setProductCount(count);
    } catch (err) {
      console.error("Failed to load data:", err);
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : name === "price" || name === "discount" || name === "reviews_count" || name === "stock"
          ? Number(value)
          : name === "rating"
          ? parseFloat(value) || 0
          : value,
    }));
  };

  const handleCategorySelect = (e) => {
    const val = e.target.value;
    if (val === "__custom__") {
      setIsCustomCategory(true);
      setFormData((prev) => ({ ...prev, category: customCategory || "new_category" }));
    } else {
      setIsCustomCategory(false);
      setFormData((prev) => ({ ...prev, category: val }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);

    const payload = {
      ...formData,
      category: isCustomCategory && customCategory ? customCategory.trim().toLowerCase() : formData.category,
      price: Number(formData.price) || 0,
      discount: Number(formData.discount) || 0,
      rating: Math.min(5, Math.max(1, parseFloat(formData.rating) || 4.2)),
      reviews_count: Number(formData.reviews_count) || 0,
      stock: Number(formData.stock) || 0,
    };

    try {
      if (editingProduct) {
        await adminUpdateProduct(adminToken, editingProduct.id, payload);
      } else {
        await adminCreateProduct(adminToken, payload);
      }
      setShowForm(false);
      setEditingProduct(null);
      resetForm();
      await refreshData();
    } catch (err) {
      setFormError(err.message);
    }
    setFormLoading(false);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      brand: "",
      price: "",
      discount: 0,
      image: "",
      description: "",
      category: categories[0] || "electronics",
      rating: 4.5,
      reviews_count: 50,
      stock: 50,
      featured: false,
      is_trending: false,
      is_new: false,
    });
    setIsCustomCategory(false);
    setCustomCategory("");
    setFormError(null);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || "",
      brand: product.brand || "",
      price: product.price || 0,
      discount: product.discount || 0,
      image: product.image || "",
      description: product.description || "",
      category: product.category || "general",
      rating: product.rating ?? 4.2,
      reviews_count: product.reviews_count ?? 0,
      stock: product.stock ?? 50,
      featured: !!product.featured,
      is_trending: !!product.is_trending,
      is_new: !!product.is_new,
    });
    setIsCustomCategory(false);
    setShowForm(true);
    setFormError(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    setDeleteLoading(id);
    try {
      await adminDeleteProduct(adminToken, id);
      await refreshData();
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
    setDeleteLoading(null);
  };

  const handleQuickToggle = async (product, field) => {
    try {
      const updated = {
        ...product,
        [field]: !product[field],
      };
      await adminUpdateProduct(adminToken, product.id, updated);
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, [field]: !product[field] } : p))
      );
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  // Filtering
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      (p.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.brand || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.category || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(p.id).includes(searchQuery);

    const matchesCategory =
      selectedCategory === "all" || (p.category || "").toLowerCase() === selectedCategory.toLowerCase();

    const matchesStock =
      stockFilter === "all" ||
      (stockFilter === "out" && (p.stock || 0) <= 0) ||
      (stockFilter === "low" && (p.stock || 0) > 0 && (p.stock || 0) <= 10) ||
      (stockFilter === "in" && (p.stock || 0) > 10);

    return matchesSearch && matchesCategory && matchesStock;
  });

  // Calculate summary counts
  const inStockCount = products.filter((p) => (p.stock || 0) > 0).length;
  const totalStockUnits = products.reduce((acc, p) => acc + (p.stock || 0), 0);
  const totalReviews = products.reduce((acc, p) => acc + (p.reviews_count || 0), 0);
  const avgRating =
    products.length > 0
      ? (products.reduce((acc, p) => acc + (p.rating || 4.2), 0) / products.length).toFixed(1)
      : "0.0";

  if (authLoading) {
    return (
      <div className="min-h-screen bg-surface-950 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-surface-950 flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-surface-900 border-r border-white/5 min-h-screen">
        <div className="p-6 border-b border-white/5">
          <Link to="/" className="text-xl font-extrabold bg-gradient-to-r from-brand-400 to-purple-400 bg-clip-text text-transparent">
            ShopHub
          </Link>
          <p className="text-xs text-white/40 mt-1">Admin Command Center</p>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1">
          <div className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold bg-brand-600/20 text-brand-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            Products Management
          </div>
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-white/40">Logged in as</span>
            <span className="text-xs font-semibold text-brand-400">admin</span>
          </div>
          <button
            onClick={() => {
              adminLogout();
              navigate("/admin");
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Top bar */}
        <header className="sticky top-0 z-10 bg-surface-900/80 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-white">
              Product Catalog Control
            </h1>
            <span className="text-xs bg-brand-500/10 text-brand-400 font-semibold px-2.5 py-0.5 rounded-full border border-brand-500/20">
              {products.length} Products in Database
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="text-xs text-white/50 hover:text-white flex items-center gap-1 transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              View Storefront
            </Link>

            <button
              onClick={() => {
                resetForm();
                setEditingProduct(null);
                setShowForm(true);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-purple-600 text-white text-xs font-semibold hover:from-brand-500 hover:to-purple-500 transition-all shadow-lg shadow-brand-600/25"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add New Product
            </button>
          </div>
        </header>

        {/* Content body */}
        <div className="p-6 space-y-6">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* Card 1: Total Products */}
            <div className="bg-surface-900/60 border border-white/5 rounded-2xl p-4">
              <p className="text-xs text-white/40 mb-1">Total Products</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-black text-white">{productCount || products.length}</p>
                <span className="text-[11px] text-white/40">items</span>
              </div>
              <p className="text-[10px] text-brand-400 mt-1">Across {categories.length} categories</p>
            </div>

            {/* Card 2: In Stock Status */}
            <div className="bg-surface-900/60 border border-white/5 rounded-2xl p-4">
              <p className="text-xs text-white/40 mb-1">In Stock Products</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-black text-emerald-400">
                  {inStockCount}
                  <span className="text-xs text-white/40 font-normal"> / {products.length}</span>
                </p>
                <span className="text-[11px] text-emerald-400 font-semibold">Active</span>
              </div>
              <p className="text-[10px] text-white/40 mt-1">
                {totalStockUnits} total inventory units
              </p>
            </div>

            {/* Card 3: Avg Rating */}
            <div className="bg-surface-900/60 border border-white/5 rounded-2xl p-4">
              <p className="text-xs text-white/40 mb-1">Avg Store Rating</p>
              <div className="flex items-center gap-1.5">
                <p className="text-2xl font-black text-yellow-400">{avgRating}</p>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <p className="text-[10px] text-white/40 mt-1">{totalReviews} customer reviews</p>
            </div>

            {/* Card 4: Categories */}
            <div className="bg-surface-900/60 border border-white/5 rounded-2xl p-4">
              <p className="text-xs text-white/40 mb-1">Categories</p>
              <p className="text-2xl font-black text-purple-400">{categories.length}</p>
              <p className="text-[10px] text-white/40 mt-1">Active product groups</p>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-wrap items-center gap-3 bg-surface-900/60 border border-white/5 rounded-2xl p-4">
            {/* Search */}
            <div className="relative flex-1 min-w-[240px]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by name, brand, category, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-surface-800/80 border border-white/5 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-brand-500"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 bg-surface-800/80 border border-white/5 rounded-xl text-xs text-white/80 focus:outline-none focus:border-brand-500 capitalize"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat} className="capitalize">
                  {cat}
                </option>
              ))}
            </select>

            {/* Stock Filter */}
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="px-3 py-2 bg-surface-800/80 border border-white/5 rounded-xl text-xs text-white/80 focus:outline-none focus:border-brand-500"
            >
              <option value="all">All Stock Status</option>
              <option value="in">In Stock (&gt;10)</option>
              <option value="low">Low Stock (1-10)</option>
              <option value="out">Out of Stock (0)</option>
            </select>

            <button
              onClick={refreshData}
              className="p-2 text-white/50 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
              title="Refresh Catalog"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>

          {/* Products Table */}
          <div className="bg-surface-900/60 border border-white/5 rounded-2xl overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full" />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-white/40 text-sm">No products matching the criteria</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/[0.02] border-b border-white/5 text-white/40 uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Product</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Price & Discount</th>
                      <th className="py-3.5 px-4">Stock Quantity</th>
                      <th className="py-3.5 px-4">Rating & Reviews</th>
                      <th className="py-3.5 px-4">Flags (Click to Toggle)</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-white/70">
                    {filteredProducts.map((p) => {
                      const stockVal = p.stock ?? 50;
                      const ratingVal = p.rating ?? 4.2;
                      const reviewsVal = p.reviews_count ?? 0;
                      const discountVal = p.discount ?? 0;

                      return (
                        <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                          {/* Product Image & Info */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={p.image}
                                alt={p.name}
                                className="w-10 h-10 rounded-lg object-cover bg-surface-800 flex-shrink-0"
                                onError={(e) => {
                                  e.target.src = "https://picsum.photos/seed/placeholder/200/200";
                                }}
                              />
                              <div className="max-w-[180px]">
                                <p className="font-semibold text-white truncate">{p.name}</p>
                                <p className="text-[11px] text-white/40 truncate">
                                  {p.brand ? `${p.brand} • ` : ""}ID: #{p.id}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="py-3 px-4">
                            <span className="capitalize text-white/80">
                              {p.category || "general"}
                            </span>
                          </td>

                          {/* Price */}
                          <td className="py-3 px-4">
                            <div>
                              <span className="font-bold text-white">₹{p.price}</span>
                              {discountVal > 0 && (
                                <span className="ml-1.5 text-[10px] text-emerald-400 font-semibold">
                                  ({discountVal}% OFF)
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Stock (Pure clean text, no button look) */}
                          <td className="py-3 px-4">
                            {stockVal <= 0 ? (
                              <span className="text-red-400 font-semibold text-xs">
                                Out of Stock
                              </span>
                            ) : stockVal <= 10 ? (
                              <span className="text-yellow-400 font-medium text-xs">
                                Low: {stockVal} units left
                              </span>
                            ) : (
                              <span className="text-surface-300 font-normal text-xs">
                                {stockVal} units available
                              </span>
                            )}
                          </td>

                          {/* Rating & Reviews */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5">
                              <span className="text-emerald-400 font-bold flex items-center gap-1">
                                {ratingVal}
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-yellow-400 fill-current inline" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              </span>
                              <span className="text-[11px] text-white/40">({reviewsVal})</span>
                            </div>
                          </td>

                          {/* Flags */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleQuickToggle(p, "is_trending")}
                                title="Toggle Trending"
                                className={`px-2 py-0.5 rounded text-[10px] font-semibold border transition-all ${
                                  p.is_trending
                                    ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                                    : "bg-white/5 text-white/30 border-white/5 hover:text-white/60"
                                }`}
                              >
                                Trending
                              </button>
                              <button
                                onClick={() => handleQuickToggle(p, "featured")}
                                title="Toggle Featured"
                                className={`px-2 py-0.5 rounded text-[10px] font-semibold border transition-all ${
                                  p.featured
                                    ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
                                    : "bg-white/5 text-white/30 border-white/5 hover:text-white/60"
                                }`}
                              >
                                Featured
                              </button>
                              <button
                                onClick={() => handleQuickToggle(p, "is_new")}
                                title="Toggle New Arrival"
                                className={`px-2 py-0.5 rounded text-[10px] font-semibold border transition-all ${
                                  p.is_new
                                    ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
                                    : "bg-white/5 text-white/30 border-white/5 hover:text-white/60"
                                }`}
                              >
                                New
                              </button>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleEdit(p)}
                                className="p-1.5 rounded-lg bg-white/5 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                                title="Edit Product"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDelete(p.id)}
                                disabled={deleteLoading === p.id}
                                className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                                title="Delete Product"
                              >
                                {deleteLoading === p.id ? (
                                  <div className="w-3.5 h-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Product Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-surface-900 border border-white/10 rounded-2xl w-full max-w-2xl my-8 p-6 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-5">
              <div>
                <h2 className="text-lg font-bold text-white">
                  {editingProduct ? `Edit Product #${editingProduct.id}` : "Create New Product"}
                </h2>
                <p className="text-xs text-white/40">Control all parameters stored in Supabase database</p>
              </div>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingProduct(null);
                }}
                className="text-white/40 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {formError && (
              <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Product Name & Brand */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-medium text-white/60">Product Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Wireless Noise-Cancelling Headphones"
                    className="w-full px-3.5 py-2.5 bg-surface-800 border border-white/5 rounded-xl text-xs text-white placeholder-white/20 focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/60">Brand Name</label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    placeholder="e.g. Sony, Nike"
                    className="w-full px-3.5 py-2.5 bg-surface-800 border border-white/5 rounded-xl text-xs text-white placeholder-white/20 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              {/* Price, Discount, Stock */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/60">Price (₹) *</label>
                  <input
                    type="number"
                    name="price"
                    required
                    min="0"
                    step="1"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="e.g. 1999"
                    className="w-full px-3.5 py-2.5 bg-surface-800 border border-white/5 rounded-xl text-xs text-white placeholder-white/20 focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/60">Discount (%)</label>
                  <input
                    type="number"
                    name="discount"
                    min="0"
                    max="99"
                    value={formData.discount}
                    onChange={handleInputChange}
                    placeholder="e.g. 20"
                    className="w-full px-3.5 py-2.5 bg-surface-800 border border-white/5 rounded-xl text-xs text-white placeholder-white/20 focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/60">Stock Quantity</label>
                  <input
                    type="number"
                    name="stock"
                    min="0"
                    value={formData.stock}
                    onChange={handleInputChange}
                    placeholder="e.g. 50"
                    className="w-full px-3.5 py-2.5 bg-surface-800 border border-white/5 rounded-xl text-xs text-white placeholder-white/20 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              {/* Rating & Reviews Count */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-white/60">Rating (1.0 to 5.0)</label>
                    <span className="text-xs font-bold text-yellow-400">{formData.rating} / 5</span>
                  </div>
                  <input
                    type="number"
                    name="rating"
                    step="0.1"
                    min="1.0"
                    max="5.0"
                    value={formData.rating}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 bg-surface-800 border border-white/5 rounded-xl text-xs text-white placeholder-white/20 focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/60">Reviews Count</label>
                  <input
                    type="number"
                    name="reviews_count"
                    min="0"
                    value={formData.reviews_count}
                    onChange={handleInputChange}
                    placeholder="e.g. 128"
                    className="w-full px-3.5 py-2.5 bg-surface-800 border border-white/5 rounded-xl text-xs text-white placeholder-white/20 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/60">Category</label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={isCustomCategory ? "__custom__" : formData.category}
                    onChange={handleCategorySelect}
                    className="px-3.5 py-2.5 bg-surface-800 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500 capitalize"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c} className="capitalize">
                        {c}
                      </option>
                    ))}
                    <option value="__custom__">+ Add New Category...</option>
                  </select>

                  {isCustomCategory && (
                    <input
                      type="text"
                      placeholder="Type custom category name..."
                      value={customCategory}
                      onChange={(e) => {
                        setCustomCategory(e.target.value);
                        setFormData((prev) => ({ ...prev, category: e.target.value.toLowerCase() }));
                      }}
                      className="px-3.5 py-2.5 bg-surface-800 border border-brand-500 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none"
                    />
                  )}
                </div>
              </div>

              {/* Image URL with live preview */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/60">Product Image URL *</label>
                <div className="flex gap-3">
                  <input
                    type="url"
                    name="image"
                    required
                    value={formData.image}
                    onChange={handleInputChange}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 px-3.5 py-2.5 bg-surface-800 border border-white/5 rounded-xl text-xs text-white placeholder-white/20 focus:outline-none focus:border-brand-500"
                  />
                  {formData.image && (
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="w-10 h-10 rounded-lg object-cover bg-surface-800 border border-white/10 flex-shrink-0"
                      onError={(e) => e.target.classList.add("hidden")}
                    />
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/60">Product Description</label>
                <textarea
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Detailed description of the product features, specs..."
                  className="w-full px-3.5 py-2.5 bg-surface-800 border border-white/5 rounded-xl text-xs text-white placeholder-white/20 focus:outline-none focus:border-brand-500 resize-none"
                />
              </div>

              {/* Badges / Flags Checkboxes */}
              <div className="p-3 bg-surface-800/60 rounded-xl border border-white/5">
                <p className="text-[11px] font-semibold text-white/60 uppercase tracking-wider mb-2">Display Badges</p>
                <div className="grid grid-cols-3 gap-3">
                  <label className="flex items-center gap-2 text-xs text-white cursor-pointer select-none">
                    <input
                      type="checkbox"
                      name="is_trending"
                      checked={formData.is_trending}
                      onChange={handleInputChange}
                      className="rounded bg-surface-700 border-white/20 text-brand-600 focus:ring-0"
                    />
                    Trending
                  </label>

                  <label className="flex items-center gap-2 text-xs text-white cursor-pointer select-none">
                    <input
                      type="checkbox"
                      name="featured"
                      checked={formData.featured}
                      onChange={handleInputChange}
                      className="rounded bg-surface-700 border-white/20 text-brand-600 focus:ring-0"
                    />
                    Featured
                  </label>

                  <label className="flex items-center gap-2 text-xs text-white cursor-pointer select-none">
                    <input
                      type="checkbox"
                      name="is_new"
                      checked={formData.is_new}
                      onChange={handleInputChange}
                      className="rounded bg-surface-700 border-white/20 text-brand-600 focus:ring-0"
                    />
                    New Arrival
                  </label>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingProduct(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 text-xs font-semibold text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-purple-600 text-white text-xs font-semibold hover:from-brand-500 hover:to-purple-500 transition-all shadow-lg shadow-brand-600/25 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {formLoading && (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  {editingProduct ? "Save Changes" : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
