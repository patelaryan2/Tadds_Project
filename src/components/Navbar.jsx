import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useState } from "react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  return (
    <nav className="bg-surface-950 sticky top-0 z-50 shadow-lg shadow-black/10">
      {/* Top bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link
            to="/"
            className="flex-shrink-0 text-2xl font-extrabold tracking-tight bg-gradient-to-r from-brand-400 to-purple-400 bg-clip-text text-transparent hover:from-brand-300 hover:to-purple-300 transition-all duration-300"
          >
            ShopHub
          </Link>

          {/* Search Bar — Desktop */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-xl mx-8"
          >
            <div className="relative w-full group">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products, brands and more..."
                className="w-full h-10 pl-4 pr-12 rounded-lg bg-white/10 border border-white/10 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white/15 focus:border-transparent transition-all duration-200"
              />
              <button
                type="submit"
                className="absolute right-0 top-0 h-full px-3 text-white/50 hover:text-brand-400 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </form>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              to="/"
              className="px-3 py-2 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 transition-all duration-200"
            >
              Home
            </Link>
            <Link
              to="/checkout"
              className="relative px-3 py-2 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 transition-all duration-200 group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
              Cart
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse-soft">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Auth */}
            {!user ? (
              <Link
                to="/auth"
                className="ml-2 px-4 py-2 rounded-lg text-sm font-semibold bg-brand-600 text-white hover:bg-brand-500 active:bg-brand-700 transition-all duration-200 shadow-md shadow-brand-600/25"
              >
                Login
              </Link>
            ) : (
              <div className="flex items-center gap-3 ml-2">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
                <button
                  onClick={logout}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-white/60 border border-white/10 hover:text-white hover:border-white/30 transition-all duration-200"
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all"
          >
            {mobileOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-surface-900 border-t border-white/5 animate-slide-up">
          <div className="px-4 py-3 space-y-2">
            <form onSubmit={handleSearch} className="mb-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full h-10 px-4 rounded-lg bg-white/10 border border-white/10 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </form>
            <Link
              to="/"
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-white/5"
            >
              Home
            </Link>
            <Link
              to="/checkout"
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-white/5"
            >
              Cart {cartCount > 0 && `(${cartCount})`}
            </Link>
            {!user ? (
              <Link
                to="/auth"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-semibold bg-brand-600 text-white text-center"
              >
                Login / Sign Up
              </Link>
            ) : (
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-sm text-white/60">{user.email}</span>
                <button
                  onClick={() => { logout(); setMobileOpen(false); }}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
