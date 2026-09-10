import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import HeroBanner from "../components/HeroBanner";
import ProductSection from "../components/ProductSection";
import ProductCard from "../components/ProductCard";
import {
  getProducts,
  getProductsByCategory,
  getCategories,
  getTrendingProducts,
  getNewArrivals,
} from "../data/products";

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const selectedCategoryParam = searchParams.get("category") || "all";

  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [siteDown, setSiteDown] = useState(false);
  const [sortBy, setSortBy] = useState("featured");

  // Fetch all products and categories on mount
  useEffect(() => {
    setLoading(true);
    Promise.all([getProducts(), getCategories()])
      .then(([prods, cats]) => {
        setAllProducts(prods || []);
        setCategories(cats || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load store data:", err);
        setLoading(false);
        setSiteDown(true);
      });
  }, []);

  // Compute category counts
  const categoryCounts = useMemo(() => {
    const counts = {};
    for (const p of allProducts) {
      const cat = p.category?.toLowerCase() || "general";
      counts[cat] = (counts[cat] || 0) + 1;
    }
    return counts;
  }, [allProducts]);

  // Handle Category Select
  const handleCategorySelect = (catKey) => {
    const newParams = new URLSearchParams(searchParams);
    if (catKey === "all") {
      newParams.delete("category");
    } else {
      newParams.set("category", catKey);
    }
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Clear all filters
  const handleResetFilters = () => {
    setSearchParams({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Products filtered by search query
  const searchedProducts = useMemo(() => {
    if (!searchQuery) return [];
    const q = searchQuery.toLowerCase();
    return allProducts.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q)
    );
  }, [allProducts, searchQuery]);

  // Products for dedicated category view
  const categoryViewProducts = useMemo(() => {
    if (selectedCategoryParam === "all") return allProducts;

    let prods = [];
    if (selectedCategoryParam === "trending") {
      prods = allProducts.filter((p) => p.is_trending);
      if (prods.length === 0) prods = allProducts.slice(0, 8);
    } else if (selectedCategoryParam === "new") {
      prods = allProducts.filter((p) => p.is_new);
      if (prods.length === 0) prods = allProducts.slice(-8);
    } else {
      prods = allProducts.filter(
        (p) => p.category?.toLowerCase() === selectedCategoryParam.toLowerCase()
      );
    }

    // Sort
    const sorted = [...prods];
    if (sortBy === "price_asc") {
      sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === "price_desc") {
      sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sortBy === "rating") {
      sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === "discount") {
      sorted.sort((a, b) => (b.discount || 0) - (a.discount || 0));
    }

    return sorted;
  }, [allProducts, selectedCategoryParam, sortBy]);

  // Site Down fallback
  if (siteDown) {
    return (
      <div className="min-h-screen bg-surface-950 flex items-center justify-center px-4">
        <div className="text-center animate-fade-in">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Service Temporarily Unavailable</h1>
          <p className="text-white/50 text-base mb-6 max-w-md mx-auto">
            We are experiencing connectivity issues with the database. Please try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-500 transition-all shadow-lg shadow-brand-600/25"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  // 1. SEARCH RESULTS VIEW
  if (searchQuery) {
    return (
      <div className="min-h-screen bg-surface-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <nav className="flex items-center gap-2 text-xs text-surface-400 mb-2">
                <button onClick={handleResetFilters} className="hover:text-brand-600 transition-colors">Home</button>
                <span>/</span>
                <span className="text-surface-600">Search Results</span>
              </nav>
              <h1 className="text-2xl font-bold text-surface-900">
                Search Results for "{searchQuery}"
              </h1>
              <p className="text-surface-500 text-xs mt-1">
                {searchedProducts.length} product{searchedProducts.length !== 1 ? "s" : ""} found
              </p>
            </div>

            <button
              onClick={handleResetFilters}
              className="px-4 py-2 rounded-xl bg-white border border-surface-200 text-xs font-semibold text-surface-700 hover:bg-surface-50 transition-all self-start sm:self-auto"
            >
              Clear Search
            </button>
          </div>

          {searchedProducts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-surface-200 p-12 text-center my-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface-100 flex items-center justify-center text-surface-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-surface-800 mb-1">No products found</h2>
              <p className="text-surface-400 text-xs max-w-sm mx-auto mb-5">
                We couldn't find any products matching "{searchQuery}". Try exploring our categories below.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-5 py-2.5 rounded-xl bg-brand-600 text-white font-semibold text-xs hover:bg-brand-500 transition-all shadow-md shadow-brand-600/20"
              >
                Explore All Categories
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {searchedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // 2. DEDICATED CATEGORY VIEW (When a specific category is selected)
  if (selectedCategoryParam !== "all") {
    const isSpecialCategory = selectedCategoryParam === "trending" || selectedCategoryParam === "new";
    const categoryTitle = isSpecialCategory
      ? selectedCategoryParam === "trending"
        ? "Trending Products"
        : "New Arrivals"
      : selectedCategoryParam.charAt(0).toUpperCase() + selectedCategoryParam.slice(1);

    return (
      <div className="min-h-screen bg-surface-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
          {/* Breadcrumbs & Header */}
          <div className="mb-6">
            <nav className="flex items-center gap-2 text-xs text-surface-400 mb-3">
              <button
                onClick={() => handleCategorySelect("all")}
                className="hover:text-brand-600 transition-colors"
              >
                Home
              </button>
              <span>/</span>
              <span className="text-surface-500">Categories</span>
              <span>/</span>
              <span className="text-surface-800 font-semibold capitalize">{categoryTitle}</span>
            </nav>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-surface-200">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-surface-900 capitalize">
                  {categoryTitle}
                </h1>
                <p className="text-surface-500 text-xs sm:text-sm mt-1">
                  Showing all {categoryViewProducts.length} product{categoryViewProducts.length !== 1 ? "s" : ""} in this collection
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Sort Dropdown */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-surface-400 font-medium">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-1.5 rounded-lg bg-white border border-surface-200 text-xs font-semibold text-surface-700 focus:outline-none focus:border-brand-500 shadow-sm"
                  >
                    <option value="featured">Featured</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="rating">Top Rated</option>
                    <option value="discount">Highest Discount</option>
                  </select>
                </div>

                <button
                  onClick={() => handleCategorySelect("all")}
                  className="px-4 py-1.5 rounded-lg bg-surface-100 hover:bg-surface-200 text-xs font-semibold text-surface-700 transition-all flex items-center gap-1.5"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  All Categories
                </button>
              </div>
            </div>
          </div>

          {/* Quick Category Switcher Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-4 mb-6">
            <button
              onClick={() => handleCategorySelect("all")}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap bg-white border border-surface-200 text-surface-600 hover:border-brand-300 transition-all"
            >
              All Categories ({allProducts.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategorySelect(cat)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all capitalize ${
                  selectedCategoryParam === cat
                    ? "bg-brand-600 text-white shadow-md shadow-brand-600/25"
                    : "bg-white border border-surface-200 text-surface-600 hover:border-brand-300"
                }`}
              >
                {cat} ({categoryCounts[cat] || 0})
              </button>
            ))}
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="bg-white rounded-2xl border border-surface-200 overflow-hidden">
                  <div className="h-[260px] bg-surface-200 animate-pulse" />
                  <div className="p-5 space-y-3">
                    <div className="w-3/4 h-4 bg-surface-200 rounded animate-pulse" />
                    <div className="w-1/2 h-4 bg-surface-200 rounded animate-pulse" />
                    <div className="w-full h-10 bg-surface-200 rounded-xl animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : categoryViewProducts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-surface-200 p-12 text-center my-8">
              <h2 className="text-lg font-bold text-surface-800 mb-1">No products in this category yet</h2>
              <p className="text-surface-400 text-xs mb-5">Try viewing our other collections</p>
              <button
                onClick={() => handleCategorySelect("all")}
                className="px-5 py-2.5 rounded-xl bg-brand-600 text-white font-semibold text-xs hover:bg-brand-500 transition-all"
              >
                Back to All Categories
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {categoryViewProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // 3. CURATED HOME OVERVIEW (Categorized shelves with preview products only)
  return (
    <div className="min-h-screen bg-surface-50">
      {/* Hero Banner with category click link */}
      <HeroBanner onSelectCategory={(cat) => handleCategorySelect(cat)} />

      {/* Quick Category Navigation Bar */}
      <section id="category-navigation" className="bg-white border-y border-surface-200 sticky top-16 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            <span className="text-xs font-bold text-surface-400 uppercase tracking-wider mr-2 hidden sm:inline">
              Categories:
            </span>

            <button
              onClick={() => handleCategorySelect("all")}
              className="px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap bg-surface-900 text-white shadow-sm transition-all"
            >
              All Categories ({allProducts.length})
            </button>

            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategorySelect(cat)}
                className="px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap bg-surface-100 hover:bg-surface-200 text-surface-700 hover:text-surface-900 transition-all capitalize"
              >
                {cat} ({categoryCounts[cat] || 0})
              </button>
            ))}

            <button
              onClick={() => handleCategorySelect("trending")}
              className="px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition-all"
            >
              Trending Now
            </button>

            <button
              onClick={() => handleCategorySelect("new")}
              className="px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap bg-cyan-50 text-cyan-700 hover:bg-cyan-100 border border-cyan-200 transition-all"
            >
              New Arrivals
            </button>
          </div>
        </div>
      </section>

      {/* Main Categorized Shelves */}
      <div id="catalog-sections" className="space-y-2 py-4">
        {/* Trending Section (Top 4 preview) */}
        <ProductSection
          title="Trending Now"
          subtitle="Customer favorites & popular picks"
          fetchFn={() => getTrendingProducts(6)}
          maxDisplay={4}
          onViewAll={() => handleCategorySelect("trending")}
          viewAllText="View All Trending"
        />

        {/* Dynamic Category Shelves (Top 4 preview per category) */}
        {categories.map((cat) => {
          const catCount = categoryCounts[cat] || 0;
          return (
            <ProductSection
              key={cat}
              title={cat.charAt(0).toUpperCase() + cat.slice(1)}
              subtitle={`Showing 4 of ${catCount} products`}
              fetchFn={() => getProductsByCategory(cat)}
              maxDisplay={4}
              onViewAll={() => handleCategorySelect(cat)}
              viewAllText={`View All ${cat.charAt(0).toUpperCase() + cat.slice(1)} (${catCount})`}
            />
          );
        })}

        {/* New Arrivals Section (Top 4 preview) */}
        <ProductSection
          title="New Arrivals"
          subtitle="Freshly added to the catalog"
          fetchFn={() => getNewArrivals(6)}
          maxDisplay={4}
          onViewAll={() => handleCategorySelect("new")}
          viewAllText="View All New Arrivals"
        />
      </div>

      {/* Footer */}
      <footer className="bg-surface-950 text-white/60 py-12 mt-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold bg-gradient-to-r from-brand-400 to-purple-400 bg-clip-text text-transparent mb-4">
                ShopHub
              </h3>
              <p className="text-sm text-white/40">
                Premium shopping experience with curated categories and fast checkout.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white/80 mb-3 uppercase tracking-wider">Categories</h4>
              <ul className="space-y-2 text-sm">
                {categories.slice(0, 5).map((cat) => (
                  <li key={cat}>
                    <button
                      onClick={() => handleCategorySelect(cat)}
                      className="hover:text-white/80 transition-colors capitalize text-left"
                    >
                      {cat}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white/80 mb-3 uppercase tracking-wider">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><span className="hover:text-white/80 cursor-pointer transition-colors">Help Center</span></li>
                <li><span className="hover:text-white/80 cursor-pointer transition-colors">Returns & Refunds</span></li>
                <li><span className="hover:text-white/80 cursor-pointer transition-colors">Order Tracking</span></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white/80 mb-3 uppercase tracking-wider">Connect</h4>
              <div className="flex gap-3">
                {["Instagram", "Twitter", "Facebook"].map((social) => (
                  <span
                    key={social}
                    className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-xs text-white/40 hover:bg-white/10 hover:text-white/60 cursor-pointer transition-all"
                  >
                    {social[0]}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-white/5 mt-8 pt-8 text-center text-xs text-white/30">
            © 2026 ShopHub. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
