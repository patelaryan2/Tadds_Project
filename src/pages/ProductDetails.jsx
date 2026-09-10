import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { getProductById, getProductsByCategory } from "../data/products";
import { useCart } from "../context/CartContext";
import ProductCard from "../components/ProductCard";

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const navigate = useNavigate();
  const { addToCart, cartItems } = useCart();

  useEffect(() => {
    setLoading(true);
    getProductById(id).then((foundProduct) => {
      if (!foundProduct) {
        navigate("/");
        return;
      }
      setProduct(foundProduct);
      setLoading(false);

      // Fetch related products
      if (foundProduct.category) {
        getProductsByCategory(foundProduct.category).then((related) => {
          setRelatedProducts(related.filter((p) => p.id !== foundProduct.id).slice(0, 4));
        }).catch(() => {});
      }
    });
  }, [id]);

  const isOutOfStock = product?.stock !== undefined && product?.stock !== null && product?.stock <= 0;
  const isLowStock = product?.stock !== undefined && product?.stock !== null && product?.stock > 0 && product?.stock <= 10;

  const handleAddToCart = () => {
    if (isOutOfStock || !product) return;
    setIsAdding(true);
    addToCart(product.id);
    setTimeout(() => setIsAdding(false), 800);
  };

  if (loading || !product) {
    return (
      <div className="min-h-screen bg-surface-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="bg-white rounded-2xl h-[500px] animate-pulse" />
            <div className="space-y-4">
              <div className="h-4 w-40 bg-surface-200 rounded animate-pulse" />
              <div className="h-8 w-3/4 bg-surface-200 rounded animate-pulse" />
              <div className="h-6 w-32 bg-surface-200 rounded animate-pulse" />
              <div className="h-20 w-full bg-surface-200 rounded animate-pulse" />
              <div className="h-12 w-full bg-surface-200 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const productInCart = cartItems.find((item) => item.id === product.id);
  const discount = product.discount || (product.price ? 15 : 0);
  const originalPrice = discount > 0 
    ? Math.round(product.price / (1 - discount / 100)) 
    : Math.ceil(product.price * 1.25);
  const rating = product.rating !== undefined && product.rating !== null ? Number(product.rating) : 4.2;
  const reviewsCount = product.reviews_count !== undefined && product.reviews_count !== null ? product.reviews_count : 45;

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-surface-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-sm text-surface-400">
            <Link to="/" className="hover:text-brand-600 transition-colors">Home</Link>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            {product.category && (
              <>
                <Link
                  to={`/?category=${encodeURIComponent(product.category)}`}
                  className="hover:text-brand-600 transition-colors capitalize font-medium"
                >
                  {product.category}
                </Link>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </>
            )}
            <span className="text-surface-600 truncate max-w-[200px]">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Image Section */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden shadow-sm">
              <div className="relative group">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-[400px] sm:h-[500px] object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.target.src = "https://picsum.photos/seed/product/600/500";
                  }}
                />
                {discount > 0 && (
                  <span className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-lg shadow-lg">
                    {discount}% OFF
                  </span>
                )}
                {/* Badges */}
                <div className="absolute top-4 right-4 flex flex-col gap-1.5 items-end">
                  {product.is_trending && (
                    <span className="bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-lg">
                      Trending
                    </span>
                  )}
                  {product.is_new && (
                    <span className="bg-cyan-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-lg">
                      New Arrival
                    </span>
                  )}
                  {product.featured && (
                    <span className="bg-purple-600 text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-lg">
                      Featured
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Category & Brand */}
            <div className="flex items-center gap-3">
              {product.category && product.category !== 'general' && (
                <Link
                  to={`/?category=${encodeURIComponent(product.category)}`}
                  className="inline-block text-xs font-semibold uppercase tracking-wider text-brand-600 bg-brand-50 hover:bg-brand-100 px-3 py-1 rounded-lg transition-colors"
                >
                  {product.category}
                </Link>
              )}
              {product.brand && (
                <span className="text-xs font-bold text-surface-500 uppercase tracking-wider bg-surface-100 px-3 py-1 rounded-lg">
                  Brand: {product.brand}
                </span>
              )}
            </div>

            {/* Name */}
            <h1 className="text-2xl sm:text-3xl font-bold text-surface-900 leading-tight">
              {product.name}
            </h1>

            {/* Dynamic Rating */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-green-600 text-white text-sm font-bold px-2.5 py-1 rounded-md">
                {rating}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <span className="text-sm text-surface-500 font-medium">
                {reviewsCount} Verified Ratings & Reviews
              </span>
            </div>

            {/* Price */}
            <div className="bg-surface-50 rounded-xl p-4 border border-surface-200">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-surface-900">₹{product.price}</span>
                {discount > 0 && (
                  <>
                    <span className="text-lg text-surface-400 line-through">₹{originalPrice}</span>
                    <span className="text-sm font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded">
                      {discount}% off
                    </span>
                  </>
                )}
              </div>
              <p className="text-xs text-surface-400 mt-1">Inclusive of all taxes</p>
            </div>

            {/* Stock Availability (Pure clean text, no button/pill appearance) */}
            <div className="flex items-center gap-2 text-sm">
              <span className="font-semibold text-surface-700">Availability:</span>
              {isOutOfStock ? (
                <span className="font-semibold text-red-600">
                  Out of Stock
                </span>
              ) : isLowStock ? (
                <span className="font-medium text-amber-600">
                  Only {product.stock} left in stock - order soon
                </span>
              ) : (
                <span className="font-normal text-surface-600">
                  <span className="text-emerald-600 font-semibold">In Stock</span> ({product.stock ?? 50} units available)
                </span>
              )}
            </div>

            {/* Description */}
            <div>
              <h3 className="text-sm font-semibold text-surface-700 mb-2 uppercase tracking-wider">Description</h3>
              <p className="text-surface-600 leading-relaxed text-sm">{product.description}</p>
            </div>

            {/* Delivery info */}
            <div className="flex flex-wrap gap-4 pt-2 border-t border-surface-200">
              <div className="flex items-center gap-2 text-sm text-surface-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                Free Delivery
              </div>
              <div className="flex items-center gap-2 text-sm text-surface-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                7 Day Return Policy
              </div>
              <div className="flex items-center gap-2 text-sm text-surface-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                100% Authentic Product
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex-1 py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  isOutOfStock
                    ? 'bg-surface-200 text-surface-400 cursor-not-allowed'
                    : isAdding
                    ? 'bg-green-500 text-white scale-95'
                    : 'bg-brand-600 text-white hover:bg-brand-500 active:scale-[0.98] shadow-lg shadow-brand-600/25'
                }`}
              >
                {isOutOfStock
                  ? 'Currently Out of Stock'
                  : isAdding
                  ? 'Added to Cart!'
                  : `Add to Cart ${productInCart ? `(${productInCart.quantity})` : ''}`}
              </button>
              <button
                onClick={() => {
                  if (isOutOfStock) return;
                  handleAddToCart();
                  navigate('/checkout');
                }}
                disabled={isOutOfStock}
                className={`flex-1 py-3.5 rounded-xl text-sm font-semibold transition-all shadow-lg ${
                  isOutOfStock
                    ? 'bg-surface-200 text-surface-400 cursor-not-allowed'
                    : 'bg-amber-500 text-white hover:bg-amber-400 active:scale-[0.98] shadow-amber-500/25'
                }`}
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-xl font-bold text-surface-800">Related Products</h2>
              <div className="h-0.5 flex-1 bg-gradient-to-r from-surface-200 to-transparent rounded-full" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
