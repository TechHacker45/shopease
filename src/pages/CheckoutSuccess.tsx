import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, ShoppingBag } from 'lucide-react';

const CheckoutSuccess: React.FC = () => {
  useEffect(() => {
    // Any post-payment logic can go here
    // For example, clearing local cart state if it wasn't already done
  }, []);

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-lg mx-auto bg-white shadow-md rounded-lg p-8 text-center">
        <div className="bg-green-100 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="text-green-600" size={40} />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Payment Successful!</h1>
        <p className="text-gray-600 mb-8">
          Thank you for your purchase. Your order has been processed successfully.
        </p>
        
        <div className="mb-8 p-4 bg-gray-50 rounded-md text-left">
          <h3 className="font-semibold mb-2 text-gray-700">Order Summary</h3>
          <p className="text-gray-600 text-sm">
            Order #: {Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}
            <br />
            Date: {new Date().toLocaleDateString()}
          </p>
          
          <p className="mt-4 text-sm text-gray-500">
            A confirmation email has been sent to your email address.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <Link
            to="/"
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-4 rounded-md transition flex items-center justify-center"
          >
            Return to Home
          </Link>
          <Link
            to="/products"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-md transition flex items-center justify-center"
          >
            <ShoppingBag className="mr-2" size={18} />
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccess;