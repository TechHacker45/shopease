import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProductStore } from '../store/productStore';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { ShoppingCart, ChevronLeft } from 'lucide-react';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { singleProduct, fetchProductById, isLoading, error } = useProductStore();
  const { addToCart, isLoading: cartLoading } = useCartStore();
  const { user } = useAuthStore();
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (id) {
      fetchProductById(id);
    }
  }, [id, fetchProductById]);

  const handleAddToCart = () => {
    if (!user) {
      alert('Please sign in to add items to your cart');
      return;
    }
    
    if (singleProduct) {
      addToCart(singleProduct.id, quantity);
    }
  };

  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decrementQuantity = () => {
    setQuantity(prev => (prev > 1 ? prev - 1 : 1));
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !singleProduct) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <p className="text-red-700">{error || "Product not found"}</p>
        </div>
        <Link to="/products" className="flex items-center text-blue-600 hover:text-blue-800">
          <ChevronLeft className="mr-1" size={20} />
          Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-4 md:py-8">
      <Link to="/products" className="flex items-center text-blue-600 hover:text-blue-800 mb-6">
        <ChevronLeft className="mr-1" size={20} />
        Back to Products
      </Link>

      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-1/2">
            <img
              src={singleProduct.image_url}
              alt={singleProduct.name}
              className="w-full h-64 md:h-96 object-cover object-center"
            />
          </div>
          <div className="w-full md:w-1/2 p-4 md:p-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">{singleProduct.name}</h1>
            <p className="text-gray-600 mb-6">{singleProduct.description}</p>
            
            <div className="flex items-center mb-6">
              <span className="text-2xl md:text-3xl font-bold text-gray-800">${singleProduct.price}</span>
              {singleProduct.stock > 0 ? (
                <span className="ml-4 px-2 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                  In Stock ({singleProduct.stock})
                </span>
              ) : (
                <span className="ml-4 px-2 py-1 bg-red-100 text-red-800 text-sm rounded-full">
                  Out of Stock
                </span>
              )}
            </div>

            {singleProduct.stock > 0 && (
              <>
                <div className="flex items-center mb-6">
                  <label htmlFor="quantity" className="mr-4 text-gray-700">Quantity:</label>
                  <div className="flex items-center border rounded">
                    <button
                      type="button"
                      onClick={decrementQuantity}
                      className="px-4 py-2 md:px-3 md:py-1 text-gray-600 hover:text-gray-800"
                    >
                      -
                    </button>
                    <span className="px-4 py-2 md:px-3 md:py-1 text-gray-800">{quantity}</span>
                    <button
                      type="button"
                      onClick={incrementQuantity}
                      className="px-4 py-2 md:px-3 md:py-1 text-gray-600 hover:text-gray-800"
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={cartLoading}
                  className="flex items-center justify-center w-full bg-blue-600 text-white py-3 md:py-2 px-4 rounded-md hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-70 text-base md:text-sm"
                >
                  {cartLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                      </svg>
                      Adding...
                    </span>
                  ) : (
                    <>
                      <ShoppingCart className="mr-2" size={20} />
                      Add to Cart
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;