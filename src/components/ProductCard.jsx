import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useState } from "react";

export default function ProductCard({ product, compact = false }) {
  const { addToCart, cartItems } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const productInCart = cartItems.find((item) => item.id === product.id);
  const productQuantityLabel = productInCart ? `(${productInCart.quantity})` : "";

  const isOutOfStock = (product.stock !== undefined && product.stock !== null) && product.stock <= 0;
  const isLowStock = (product.stock !== undefined && product.stock !== null) && product.stock > 0 && product.stock <= 10;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    setIsAdding(true);
    addToCart(product.id);
    setTimeout(() => setIsAdding(false), 600);
  };

  // Dynamic discount & price calculation from database
  const discount = product.discount || (product.price ? 15 : 0);
  const originalPrice = discount > 0 
    ? Math.round(product.price / (1 - discount / 100)) 
    : Math.ceil(product.price * 1.25);
  const rating = product.rating !== undefined && product.rating !== null ? Number(product.rating) : 4.2;
  const reviewsCount = product.reviews_count !== undefined && product.reviews_count !== null ? product.reviews_count : 45;

  if (compact) {
    return (
      <div className="group bg-white rounded-xl border border-surface-200 overflow-hidden hover:shadow-lg hover:shadow-surface-200/50 hover:border-surface-300 transition-all duration-300">
        <Link to={`/products/${product.id}`} className="block">
          <div className="relative overflow-hidden bg-surface-100">
            {!imgLoaded && (
              <div className="absolute inset-0 bg-surface-200 animate-pulse" />
            )}
            <img
              src={product.image}
              alt={product.name}
              onLoad={() => setImgLoaded(true)}
              className={`w-full h-[240px] object-cover group-hover:scale-110 transition-transform duration-500 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
              onError={(e) => {
                e.target.src = "https://picsum.photos/seed/product/300/300";
              }}
            />
            {discount > 0 && (
              <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow">
                {discount}% OFF
              </span>
            )}
            {product.is_trending && (
              <span className="absolute top-2 right-2 bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                Trending
              </span>
            )}
          </div>
        </Link>
        <div className="p-3">
          {product.brand && (
            <p className="text-[10px] font-semibold text-brand-600 uppercase tracking-wider mb-0.5">
              {product.brand}
            </p>
          )}
          <Link to={`/products/${product.id}`}>
            <h3 className="text-sm font-semibold text-surface-800 truncate hover:text-brand-600 transition-colors">
              {product.name}
            </h3>
          </Link>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-base font-bold text-surface-900">₹{product.price}</span>
            {discount > 0 && (
              <span className="text-xs text-surface-400 line-through">₹{originalPrice}</span>
            )}
          </div>
          {/* Dynamic Rating */}
          <div className="flex items-center gap-1 mt-1.5">
            <div className="flex items-center gap-1 bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
              <span>{rating}</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5 fill-current" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <span className="text-[10px] text-surface-400 ml-1">({reviewsCount})</span>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`w-full mt-3 py-2 rounded-lg text-xs font-semibold transition-all duration-300 ${
              isOutOfStock
                ? 'bg-surface-200 text-surface-400 cursor-not-allowed'
                : isAdding
                ? 'bg-green-500 text-white scale-95'
                : 'bg-brand-600 text-white hover:bg-brand-500 active:scale-95'
            }`}
          >
            {isOutOfStock ? 'Out of Stock' : isAdding ? 'Added to Cart' : `Add to Cart ${productQuantityLabel}`}
          </button>
        </div>
      </div>
    );
  }

  // Full-size card for grid view
  return (
    <div className="group bg-white rounded-2xl border border-surface-200 overflow-hidden hover:shadow-xl hover:shadow-surface-200/50 hover:border-surface-300 transition-all duration-300 animate-fade-in flex flex-col justify-between">
      <div>
        <Link to={`/products/${product.id}`} className="block">
          <div className="relative overflow-hidden bg-surface-100">
            {!imgLoaded && (
              <div className="absolute inset-0 bg-surface-200 animate-pulse" />
            )}
            <img
              src={product.image}
              alt={product.name}
              onLoad={() => setImgLoaded(true)}
              className={`w-full h-[260px] object-cover group-hover:scale-105 transition-transform duration-500 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
              onError={(e) => {
                e.target.src = "https://picsum.photos/seed/product/400/300";
              }}
            />
            {discount > 0 && (
              <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-lg">
                {discount}% OFF
              </span>
            )}

            {/* Badges */}
            <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
              {product.is_trending && (
                <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md">
                  Trending
                </span>
              )}
              {product.is_new && (
                <span className="bg-cyan-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md">
                  New
                </span>
              )}
              {product.featured && (
                <span className="bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md">
                  Featured
                </span>
              )}
            </div>

            {/* Quick view overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center">
              <span className="opacity-0 group-hover:opacity-100 bg-white/90 backdrop-blur-sm text-surface-800 text-xs font-semibold px-4 py-2 rounded-full transition-all duration-300 translate-y-2 group-hover:translate-y-0 shadow-lg">
                Quick View →
              </span>
            </div>
          </div>
        </Link>

        <div className="p-5">
          {/* Brand & Category */}
          <div className="flex items-center justify-between mb-2">
            {product.category && product.category !== 'general' && (
              <Link
                to={`/?category=${encodeURIComponent(product.category)}`}
                className="text-[10px] font-semibold uppercase tracking-wider text-brand-600 bg-brand-50 hover:bg-brand-100 px-2 py-0.5 rounded-md transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                {product.category}
              </Link>
            )}
            {product.brand && (
              <span className="text-[10px] font-bold text-surface-400 uppercase tracking-wider">
                {product.brand}
              </span>
            )}
          </div>

          <Link to={`/products/${product.id}`}>
            <h3 className="text-base font-semibold text-surface-800 mb-1 line-clamp-2 hover:text-brand-600 transition-colors">
              {product.name}
            </h3>
          </Link>

          <p className="text-xs text-surface-400 mb-3 line-clamp-2">{product.description}</p>

          {/* Price */}
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-xl font-bold text-surface-900">₹{product.price}</span>
            {discount > 0 && (
              <>
                <span className="text-sm text-surface-400 line-through">₹{originalPrice}</span>
                <span className="text-xs font-semibold text-green-600">{discount}% off</span>
              </>
            )}
          </div>

          {/* Rating & Stock */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-0.5 bg-green-600 text-white text-xs font-bold px-1.5 py-0.5 rounded">
                {rating}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <span className="text-xs text-surface-400">({reviewsCount} reviews)</span>
            </div>

            {isOutOfStock ? (
              <span className="text-[11px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded">
                Out of Stock
              </span>
            ) : isLowStock ? (
              <span className="text-[11px] font-semibold text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded">
                Only {product.stock} left
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-5 pb-5">
        <div className="flex gap-2">
          <Link
            to={`/products/${product.id}`}
            className="flex-1 py-2.5 rounded-xl border border-surface-200 text-center text-sm font-medium text-surface-700 hover:bg-surface-50 hover:border-surface-300 transition-all duration-200"
          >
            View Details
          </Link>
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
              isOutOfStock
                ? 'bg-surface-200 text-surface-400 cursor-not-allowed'
                : isAdding
                ? 'bg-green-500 text-white scale-95'
                : 'bg-brand-600 text-white hover:bg-brand-500 active:scale-95 shadow-md shadow-brand-600/20'
            }`}
          >
            {isOutOfStock ? 'Sold Out' : isAdding ? 'Added to Cart' : `Add to Cart ${productQuantityLabel}`}
          </button>
        </div>
      </div>
    </div>
  );
}
