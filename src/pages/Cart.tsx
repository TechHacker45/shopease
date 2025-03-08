import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CartItem from '../components/CartItem';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { ShoppingBag, ChevronLeft, CreditCard } from 'lucide-react';

const Cart: React.FC = () => {
  const { items, fetchCartItems, clearCart, isLoading, error } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [checkoutMode, setCheckoutMode] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    fetchCartItems();
  }, [user, fetchCartItems, navigate]);

  const calculateTotal = () => {
    return items.reduce((total, item) => {
      // Safely access product price with null check
      if (!item.product) return total;
      return total + (item.product.price * item.quantity);
    }, 0);
  };

  const handleCheckout = async () => {
    if (items.length === 0) {
      alert('Your cart is empty');
      return;
    }
    
    setCheckoutMode(true);
  };

  const handlePayment = () => {
    setProcessingPayment(true);
    
    // Simulate payment processing
    setTimeout(() => {
      clearCart();
      setProcessingPayment(false);
      navigate('/checkout/success');
    }, 2000);
  };

  const handleCancelCheckout = () => {
    setCheckoutMode(false);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Your Cart</h1>
        <Link to="/products" className="flex items-center text-blue-600 hover:text-blue-800">
          <ChevronLeft className="mr-1" size={20} />
          Continue Shopping
        </Link>
      </div>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {items.length === 0 ? (
        <div className="bg-white shadow-md rounded-lg p-6 text-center">
          <ShoppingBag className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Looks like you haven't added any products to your cart yet.</p>
          <Link 
            to="/products" 
            className="inline-flex items-center bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="lg:flex lg:space-x-6">
          <div className="lg:w-2/3">
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <div className="divide-y">
                {items.map((item) => (
                  // Only render CartItem if product exists
                  item.product && <CartItem key={item.id} {...item} />
                ))}
              </div>
              <div className="p-4 border-t">
                <button
                  onClick={() => clearCart()}
                  disabled={isLoading}
                  className="text-sm text-red-600 hover:text-red-800 transition focus:outline-none"
                >
                  Clear Cart
                </button>
              </div>
            </div>
          </div>
          
          <div className="lg:w-1/3 mt-6 lg:mt-0">
            <div className="bg-white shadow-md rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({items.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="border-t pt-3 flex justify-between font-semibold text-gray-800">
                  <span>Total</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
              </div>
              
              {checkoutMode ? (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <CreditCard className="mr-2" size={20} />
                    Payment Details
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="border rounded-md p-3">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-gray-600">Credit Card</span>
                        <div className="flex space-x-1">
                          <div className="w-6 h-4 bg-blue-500 rounded"></div>
                          <div className="w-6 h-4 bg-yellow-500 rounded"></div>
                          <div className="w-6 h-4 bg-red-500 rounded"></div>
                          <div className="w-6 h-4 bg-gray-500 rounded"></div>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <label className="block text-sm text-gray-600 mb-1">Card Number</label>
                        <input
                          type="text"
                          placeholder="4242 4242 4242 4242"
                          className="w-full px-3 py-2 border rounded-md"
                        />
                      </div>
                      
                      <div className="flex space-x-3">
                        <div className="w-1/2">
                          <label className="block text-sm text-gray-600 mb-1">Expiry Date</label>
                          <input
                            type="text"
                            placeholder="MM/YY"
                            className="w-full px-3 py-2 border rounded-md"
                          />
                        </div>
                        <div className="w-1/2">
                          <label className="block text-sm text-gray-600 mb-1">CVC</label>
                          <input
                            type="text"
                            placeholder="123"
                            className="w-full px-3 py-2 border rounded-md"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-3">
                      <button
                        onClick={handleCancelCheckout}
                        className="w-1/3 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handlePayment}
                        disabled={processingPayment}
                        className="w-2/3 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-70"
                      >
                        {processingPayment ? (
                          <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                            </svg>
                            Processing...
                          </span>
                        ) : (
                          `Pay $${calculateTotal().toFixed(2)}`
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleCheckout}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                >
                  Proceed to Checkout
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;