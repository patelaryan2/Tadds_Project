import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Checkout from "./pages/Checkout";
import Navbar from "./components/Navbar";
import AuthProvider from "./context/AuthContext";
import ProductDetails from "./pages/ProductDetails";
import CartProvider from "./context/CartContext";
import AdminProvider from "./context/AdminContext";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AdminProvider>
          <Routes>
            {/* Admin routes — no navbar */}
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />

            {/* Public routes — with navbar */}
            <Route
              path="*"
              element={
                <div className="min-h-screen flex flex-col">
                  <Navbar />
                  <main className="flex-1">
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/checkout" element={<Checkout />} />
                      <Route path="/products/:id" element={<ProductDetails />} />
                    </Routes>
                  </main>
                </div>
              }
            />
          </Routes>
        </AdminProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
