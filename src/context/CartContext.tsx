import { createContext, useState, useEffect, useContext, ReactNode } from "react";
import { getProducts } from "../data/products";
import type { Product, CartItem, CartItemWithProduct } from "../types";

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (productId: number) => void;
  getCartItemsWithProducts: () => CartItemWithProduct[];
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  getCartTotal: () => number;
  clearCart: () => void;
  refreshCache: () => Promise<void>;
  loading: boolean;
}

const CartContext = createContext<CartContextType | null>(null);

const CART_STORAGE_KEY = "shophub_cart_items";

export default function CartProvider({ children }: { children: ReactNode }) {
  // Initialize cart from localStorage if available
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [productsCache, setProductsCache] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Persist cart to localStorage on changes
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch {
      // Ignore storage errors
    }
  }, [cartItems]);

  const refreshCache = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProductsCache(data);
    } catch (e) {
      console.error("Failed to load products cache:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshCache();
  }, []);

  function getCachedProductById(id: number): Product | undefined {
    return productsCache.find((p) => p.id === Number(id));
  }

  function addToCart(productId: number): void {
    const pId = Number(productId);
    const existing = cartItems.find((item) => item.id === pId);
    if (existing) {
      const currentQuantity = existing.quantity;
      const updatedCartItems = cartItems.map((item) =>
        item.id === pId ? { id: pId, quantity: currentQuantity + 1 } : item
      );
      setCartItems(updatedCartItems);
    } else {
      setCartItems([...cartItems, { id: pId, quantity: 1 }]);
    }
  }

  function getCartItemsWithProducts(): CartItemWithProduct[] {
    return cartItems
      .map((item) => ({
        ...item,
        product: getCachedProductById(item.id),
      }))
      .filter((item): item is CartItemWithProduct => item.product !== undefined);
  }

  function removeFromCart(productId: number): void {
    setCartItems(cartItems.filter((item) => item.id !== Number(productId)));
  }

  function updateQuantity(productId: number, quantity: number): void {
    const pId = Number(productId);
    if (quantity <= 0) {
      removeFromCart(pId);
      return;
    }
    setCartItems(
      cartItems.map((item) =>
        item.id === pId ? { ...item, quantity } : item
      )
    );
  }

  function getCartTotal(): number {
    return cartItems.reduce((total, item) => {
      const product = getCachedProductById(item.id);
      return total + (product ? product.price * item.quantity : 0);
    }, 0);
  }

  function clearCart(): void {
    setCartItems([]);
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch {
      // Ignore
    }
  }

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        getCartItemsWithProducts,
        removeFromCart,
        updateQuantity,
        getCartTotal,
        clearCart,
        refreshCache,
        loading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
