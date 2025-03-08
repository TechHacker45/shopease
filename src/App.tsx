import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Register from './pages/Register';
import Admin from './pages/Admin';
import CheckoutSuccess from './pages/CheckoutSuccess';
import { useAuthStore } from './store/authStore';
import { useCartStore } from './store/cartStore';

function App() {
  const { initialize: initializeAuth } = useAuthStore();
  const { fetchCartItems } = useCartStore();

  useEffect(() => {
    // Initialize authentication
    initializeAuth().then(() => {
      // Fetch cart items once auth is initialized
      fetchCartItems();
    });
  }, [initializeAuth, fetchCartItems]);

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow bg-gray-50 pt-[72px]">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/checkout/success" element={<CheckoutSuccess />} />
          </Routes>
        </main>
        <footer className="bg-gray-800 text-white py-6">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <h3 className="text-lg font-semibold">ShopEase</h3>
                <p className="text-sm text-gray-400">The best shopping experience</p>
              </div>
              <div className="flex space-x-4">
                <a href="#" className="hover:text-gray-300 transition">Terms</a>
                <a href="#" className="hover:text-gray-300 transition">Privacy</a>
                <a href="#" className="hover:text-gray-300 transition">Contact</a>
              </div>
            </div>
            <div className="mt-4 text-center text-sm text-gray-400">
              &copy; {new Date().getFullYear()} ShopEase. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;