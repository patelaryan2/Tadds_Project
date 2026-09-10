import { useCart } from "../context/CartContext";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function Checkout() {
  const {
    getCartItemsWithProducts,
    updateQuantity,
    removeFromCart,
    getCartTotal,
    clearCart,
    loading,
    cartItems: rawCartItems,
  } = useCart();
  const cartItems = getCartItemsWithProducts();
  const total = getCartTotal();
  const [orderError, setOrderError] = useState(null);
  const [orderSuccess, setOrderSuccess] = useState(false);

  function placeOrder() {
    setOrderError(null);
    setOrderSuccess(false);

    if (cartItems.length === 0) {
      setOrderError("Your cart is empty. Add some products before placing an order.");
      return;
    }

    setOrderSuccess(true);
    clearCart();
  }

  // Order success screen
  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center px-4">
        <div className="text-center animate-fade-in">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-surface-900 mb-2">Order Placed Successfully!</h1>
          <p className="text-surface-500 mb-6">Thank you for your purchase. Your order is being processed.</p>
          <Link
            to="/"
            className="inline-block px-8 py-3 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-500 transition-all shadow-lg shadow-brand-600/25"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-surface-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-sm text-surface-400">
            <Link to="/" className="hover:text-brand-600 transition-colors">Home</Link>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            <span className="text-surface-600">Cart</span>
          </nav>
        </div>
      </div>

      {/* Step indicator */}
      <div className="bg-white border-b border-surface-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-center gap-4">
            {["Cart", "Address", "Payment", "Confirm"].map((step, idx) => (
              <div key={step} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  idx === 0
                    ? 'bg-brand-600 text-white'
                    : 'bg-surface-200 text-surface-400'
                }`}>
                  {idx + 1}
                </div>
                <span className={`text-sm font-medium hidden sm:block ${
                  idx === 0 ? 'text-brand-600' : 'text-surface-400'
                }`}>
                  {step}
                </span>
                {idx < 3 && (
                  <div className="w-8 sm:w-16 h-px bg-surface-200 mx-1" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {orderError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 animate-slide-up">
            <p className="text-red-600 text-sm font-medium">{orderError}</p>
          </div>
        )}

        {loading && rawCartItems.length > 0 && cartItems.length === 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-2xl border border-surface-200 p-6 space-y-4 animate-pulse">
                <div className="h-6 w-48 bg-surface-200 rounded" />
                <div className="h-20 bg-surface-100 rounded-xl" />
                <div className="h-20 bg-surface-100 rounded-xl" />
              </div>
            </div>
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-surface-200 p-6 space-y-3 animate-pulse">
                <div className="h-6 w-32 bg-surface-200 rounded" />
                <div className="h-24 bg-surface-100 rounded" />
              </div>
            </div>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-surface-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-surface-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-surface-700 mb-2">Your cart is empty</h2>
            <p className="text-surface-400 mb-6">Looks like you haven't added anything yet.</p>
            <Link
              to="/"
              className="inline-block px-8 py-3 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-500 transition-all shadow-lg shadow-brand-600/25"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-surface-100">
                  <h2 className="text-lg font-bold text-surface-800">
                    Shopping Cart ({cartItems.length} item{cartItems.length !== 1 ? 's' : ''})
                  </h2>
                </div>

                <div className="divide-y divide-surface-100">
                  {cartItems.map((item) => (
                    <div key={item.id} className="px-6 py-5 flex gap-4 animate-fade-in">
                      {/* Image */}
                      <Link to={`/products/${item.product.id}`} className="flex-shrink-0">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl border border-surface-200"
                        />
                      </Link>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <Link to={`/products/${item.product.id}`}>
                          <h3 className="text-sm sm:text-base font-semibold text-surface-800 truncate hover:text-brand-600 transition-colors">
                            {item.product.name}
                          </h3>
                        </Link>
                        <p className="text-xs text-surface-400 mt-0.5">₹{item.product.price} each</p>

                        {/* Quantity controls */}
                        <div className="flex items-center gap-3 mt-3">
                          <div className="flex items-center border border-surface-200 rounded-lg overflow-hidden">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-8 h-8 flex items-center justify-center text-surface-600 hover:bg-surface-50 transition-colors text-lg"
                            >
                              −
                            </button>
                            <span className="w-10 h-8 flex items-center justify-center text-sm font-semibold bg-surface-50 border-x border-surface-200">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-8 flex items-center justify-center text-surface-600 hover:bg-surface-50 transition-colors text-lg"
                            >
                              +
                            </button>
                          </div>

                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-xs text-red-500 hover:text-red-600 font-medium transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="text-right flex-shrink-0">
                        <p className="text-base font-bold text-surface-900">
                          ₹{(item.product.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden shadow-sm sticky top-20">
                <div className="px-6 py-4 border-b border-surface-100">
                  <h2 className="text-lg font-bold text-surface-800">Price Details</h2>
                </div>

                <div className="px-6 py-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-surface-500">Price ({cartItems.length} items)</span>
                    <span className="text-surface-800">₹{total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-surface-500">Delivery Charges</span>
                    <span className="text-green-600 font-medium">FREE</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-surface-500">Discount</span>
                    <span className="text-green-600 font-medium">-₹{(total * 0.05).toFixed(2)}</span>
                  </div>

                  <div className="border-t border-dashed border-surface-200 pt-3 mt-3">
                    <div className="flex justify-between">
                      <span className="text-base font-bold text-surface-800">Total Amount</span>
                      <span className="text-xl font-bold text-surface-900">₹{(total * 0.95).toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-green-600 font-medium mt-1">
                      You save ₹{(total * 0.05).toFixed(2)} on this order
                    </p>
                  </div>
                </div>

                <div className="px-6 pb-6">
                  <button
                    onClick={placeOrder}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-white font-bold text-sm hover:from-amber-400 hover:to-amber-300 active:scale-[0.98] transition-all shadow-lg shadow-amber-500/25"
                  >
                    Place Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
