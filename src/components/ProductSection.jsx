import { useState, useEffect, useRef } from "react";
import ProductCard from "./ProductCard";

export default function ProductSection({
  title,
  subtitle,
  fetchFn,
  onViewAll,
  viewAllText = "View All",
  maxDisplay = 4,
}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchFn()
      .then((data) => {
        if (!cancelled) {
          setProducts(data || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || "Failed to load");
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const amount = 320;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -amount : amount,
        behavior: "smooth",
      });
    }
  };

  if (error) {
    return (
      <section className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-xl font-bold text-surface-800">{title}</h2>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-500 text-sm font-medium">Could not load this section right now</p>
            <p className="text-red-400 text-xs mt-1">Please try again later</p>
          </div>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-4">
            <div className="w-44 h-6 rounded-lg bg-surface-200 animate-pulse" />
            <div className="w-20 h-6 rounded-lg bg-surface-200 animate-pulse" />
          </div>
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex-shrink-0 w-[240px]">
                <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
                  <div className="w-full h-[240px] bg-surface-200 animate-pulse" />
                  <div className="p-4 space-y-3">
                    <div className="w-3/4 h-4 bg-surface-200 rounded animate-pulse" />
                    <div className="w-1/2 h-4 bg-surface-200 rounded animate-pulse" />
                    <div className="w-full h-9 bg-surface-200 rounded-lg animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  const displayProducts = maxDisplay ? products.slice(0, maxDisplay) : products;
  const hasMore = products.length > displayProducts.length || Boolean(onViewAll);

  return (
    <section className="py-7 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-baseline gap-3">
            <h2 className="text-xl sm:text-2xl font-bold text-surface-800 tracking-tight">
              {title}
            </h2>
            {subtitle ? (
              <span className="text-xs text-surface-400 hidden sm:inline">{subtitle}</span>
            ) : products.length > 0 ? (
              <span className="text-xs text-surface-400 font-medium hidden sm:inline">
                {products.length} item{products.length !== 1 ? "s" : ""}
              </span>
            ) : null}
          </div>

          <div className="flex items-center gap-3">
            {onViewAll && (
              <button
                onClick={onViewAll}
                className="text-xs sm:text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 group/btn px-3 py-1.5 rounded-lg hover:bg-brand-50 transition-all"
              >
                <span>{viewAllText}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}

            {/* Scroll Navigation */}
            <div className="hidden sm:flex items-center gap-1.5">
              <button
                onClick={() => scroll("left")}
                aria-label="Scroll left"
                className="p-1.5 rounded-lg bg-white border border-surface-200 text-surface-600 hover:bg-surface-50 hover:border-surface-300 transition-all shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => scroll("right")}
                aria-label="Scroll right"
                className="p-1.5 rounded-lg bg-white border border-surface-200 text-surface-600 hover:bg-surface-50 hover:border-surface-300 transition-all shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Product Row / Preview Grid */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory"
        >
          {displayProducts.map((product) => (
            <div key={product.id} className="flex-shrink-0 w-[240px] snap-start">
              <ProductCard product={product} compact />
            </div>
          ))}

          {/* More in this category card */}
          {hasMore && onViewAll && (
            <div className="flex-shrink-0 w-[200px] snap-start flex items-stretch">
              <button
                onClick={onViewAll}
                className="w-full h-full min-h-[340px] rounded-xl border-2 border-dashed border-surface-200 hover:border-brand-400 bg-white/60 hover:bg-brand-50/50 flex flex-col items-center justify-center p-6 text-center transition-all group/card cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-brand-50 group-hover/card:bg-brand-600 text-brand-600 group-hover/card:text-white flex items-center justify-center mb-3 transition-all duration-300 shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover/card:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
                <span className="text-sm font-bold text-surface-800 group-hover/card:text-brand-600 transition-colors">
                  View More
                </span>
                <span className="text-xs text-surface-400 mt-1">
                  Explore all {products.length > 0 ? `${products.length} ` : ""}{title}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
