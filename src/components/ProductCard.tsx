import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { ShoppingCart, Eye } from 'lucide-react';
import type { Database } from '../types/database.types';

type Product = Database['public']['Tables']['products']['Row'];

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { user } = useAuthStore();
  const { addToCart, isLoading } = useCartStore();
  const navigate = useNavigate();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate('/login');
      return;
    }

    try {
      addToCart(product.id, 1);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/products/${product.id}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col">
      <Link to={`/products/${product.id}`} className="block">
        <div className="relative h-48 sm:h-40 md:h-48 w-full overflow-hidden">
          <img 
            src={product.image_url} 
            alt={product.name} 
            className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="p-3 md:p-4 flex-grow">
          <h2 className="text-base md:text-lg font-semibold text-gray-800 mb-1">{product.name}</h2>
          <p className="text-gray-600 text-sm mb-2 line-clamp-2 hidden sm:block">{product.description}</p>
          <div className="flex items-center justify-between mt-4">
            <span className="text-xl font-bold text-gray-800">${product.price}</span>
            <div className="flex space-x-2">
              <button 
                onClick={handleViewDetails}
                className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition hidden sm:block"
              >
                <Eye size={18} />
              </button>
              <button 
                onClick={handleAddToCart}
                disabled={isLoading || product.stock <= 0}
                className={`p-2 rounded-full transition text-sm md:text-base flex items-center justify-center ${
                  product.stock > 0 
                    ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                    : 'bg-gray-300 cursor-not-allowed text-gray-500'
                }`}
              >
                {isLoading ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                ) : (
                  <>
                    <ShoppingCart size={16} className="sm:hidden" />
                    <span className="hidden sm:inline">Add to Cart</span>
                  </>
                )}
              </button>
            </div>
          </div>
          {product.stock <= 0 && (
            <p className="text-red-500 text-xs md:text-sm mt-2">Out of stock</p>
          )}
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;