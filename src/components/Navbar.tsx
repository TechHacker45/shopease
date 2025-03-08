import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { ShoppingCart, User, LogOut, LogIn, Settings, Loader2, Menu, X, Home, Package } from 'lucide-react'; 
import { useState } from 'react';

const Navbar: React.FC = () => {
  const { user, signOut, isLoading } = useAuthStore();
  const { items } = useCartStore();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsDropdownOpen(false);
      await signOut();
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const cartItemsCount = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <nav className="bg-gray-800 text-white fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-xl font-bold flex items-center">
              <Package className="w-6 h-6 mr-2" />
              ShopEase
            </Link>
            <div className="hidden md:flex space-x-6">
              <Link to="/" className="hover:text-gray-300 transition flex items-center">
                <Home className="w-4 h-4 mr-1" />
                Home
              </Link>
              <Link to="/products" className="hover:text-gray-300 transition flex items-center">
                <Package className="w-4 h-4 mr-1" />
                Products
              </Link>
              {user?.user_metadata?.is_admin && (
                <Link to="/admin" className="hover:text-gray-300 transition flex items-center">
                  <Settings className="w-4 h-4 mr-1" />
                  Admin Panel
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Desktop Navigation */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link to="/cart" className="relative hover:text-gray-300 transition p-2 hover:bg-gray-700 rounded-lg">
                  <ShoppingCart className="w-6 h-6" />
                  {cartItemsCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {cartItemsCount}
                    </span>
                  )}
                </Link>
                <div className="flex items-center relative">
                  <button 
                    onClick={() => {setIsDropdownOpen(!isDropdownOpen); setIsMobileMenuOpen(false);}}
                    className="flex items-center hover:text-gray-300 transition p-2 hover:bg-gray-700 rounded-lg"
                  >
                    <User className="w-6 h-6 mr-1" />
                    <span className="hidden md:inline">{user.email?.split('@')[0]}</span>
                  </button>
                  <div className={`${isDropdownOpen ? 'block' : 'hidden'} absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10`}>
                    <button 
                      onClick={handleSignOut}
                      disabled={isLoading}
                      className="w-full text-left block px-4 py-2 text-gray-800 hover:bg-gray-100 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Signing out...
                        </>
                      ) : (
                        <>
                          <LogOut className="w-4 h-4 mr-2" />
                          Sign Out
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <Link 
                to="/login" 
                className="flex items-center hover:text-gray-300 transition p-2 hover:bg-gray-700 rounded-lg"
              >
                <LogIn className="w-6 h-6 mr-1" />
                <span className="hidden md:inline">Sign In</span>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:hidden fixed top-[72px] left-0 right-0 bottom-0 bg-gray-800 shadow-lg z-50 border-t border-gray-700 overflow-y-auto`}>
          <div className="px-4 py-3 space-y-3">
            <Link 
              to="/" 
              className="flex items-center hover:bg-gray-700 px-3 py-2 rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Home className="w-5 h-5 mr-2" />
              Home
            </Link>
            <Link 
              to="/products" 
              className="flex items-center hover:bg-gray-700 px-3 py-2 rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Package className="w-5 h-5 mr-2" />
              Products
            </Link>
            {user?.user_metadata?.is_admin && (
              <Link 
                to="/admin" 
                className="flex items-center hover:bg-gray-700 px-3 py-2 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Settings className="w-5 h-5 mr-2" />
                Admin Panel
              </Link>
            )}
            {!user && (
              <div className="border-t border-gray-700 pt-3">
                <Link 
                  to="/login" 
                  className="flex items-center hover:bg-gray-700 px-3 py-2 rounded-lg transition-colors" 
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <LogIn className="w-5 h-5 mr-2" />
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;