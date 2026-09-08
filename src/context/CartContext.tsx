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
}

const CartContext = createContext<CartContextType | null>(null);

export default function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]); // {id: 2, quantity: 7}
  const [productsCache, setProductsCache] = useState<Product[]>([]); // cached from Supabase

  // Fetch all products once and cache for cart lookups
  useEffect(() => {
    getProducts().then((data) => {
      setProductsCache(data);
    });
  }, []);

  function getCachedProductById(id: number): Product | undefined {
    return productsCache.find((p) => p.id === Number(id));
  }

  function addToCart(productId: number): void {
    const existing = cartItems.find((item) => item.id === productId);
    if (existing) {
      const currentQuantity = existing.quantity;
      const updatedCartItems = cartItems.map((item) =>
        item.id === productId
          ? { id: productId, quantity: currentQuantity + 1 }
          : item
      );
      setCartItems(updatedCartItems);
    } else {
      setCartItems([...cartItems, { id: productId, quantity: 1 }]);
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
    setCartItems(cartItems.filter((item) => item.id !== productId));
  }

  function updateQuantity(productId: number, quantity: number): void {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems(
      cartItems.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  }

  function getCartTotal(): number {
    const total = cartItems.reduce((total, item) => {
      const product = getCachedProductById(item.id);
      return total + (product ? product.price * item.quantity : 0);
    }, 0);
    return total;
  }

  function clearCart(): void {
    setCartItems([]);
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
