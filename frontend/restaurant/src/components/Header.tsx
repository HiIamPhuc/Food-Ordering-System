
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import AuthModal from './auth/AuthModal';

const Header = () => {
  const location = useLocation();
  const { state } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; mode: 'login' | 'register' | 'change-password' }>({
    isOpen: false,
    mode: 'login'
  });
  
  // Mock authentication state - replace with real auth logic later
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const openAuthModal = (mode: 'login' | 'register' | 'change-password') => {
    setAuthModal({ isOpen: true, mode });
  };

  const closeAuthModal = () => {
    setAuthModal({ isOpen: false, mode: 'login' });
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    console.log('User logged out');
  };

  return (
    <>
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">R</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Restaurant</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link
                to="/"
                className={`text-sm font-medium transition-colors hover:text-orange-600 ${
                  isActive('/') ? 'text-orange-600' : 'text-gray-700'
                }`}
              >
                Home
              </Link>
              <Link
                to="/menu"
                className={`text-sm font-medium transition-colors hover:text-orange-600 ${
                  isActive('/menu') ? 'text-orange-600' : 'text-gray-700'
                }`}
              >
                Menu
              </Link>
              <Link
                to="/orders"
                className={`text-sm font-medium transition-colors hover:text-orange-600 relative ${
                  isActive('/orders') ? 'text-orange-600' : 'text-gray-700'
                }`}
              >
                Orders
                {state.items.length > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[20px] h-5 flex items-center justify-center">
                    {state.items.reduce((sum, item) => sum + item.quantity, 0)}
                  </Badge>
                )}
              </Link>
              {isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    className={`text-sm font-medium transition-colors hover:text-orange-600 ${
                      isActive('/profile') ? 'text-orange-600' : 'text-gray-700'
                    }`}
                  >
                    Profile
                  </Link>
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    size="sm"
                    className="text-gray-700 hover:text-orange-600"
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => openAuthModal('login')}
                    variant="ghost"
                    size="sm"
                    className="text-gray-700 hover:text-orange-600"
                  >
                    Sign In
                  </Button>
                  <Button
                    onClick={() => openAuthModal('register')}
                    size="sm"
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    Sign Up
                  </Button>
                </div>
              )}
            </nav>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2"
              >
                <div className="w-6 h-6 flex flex-col justify-center items-center">
                  <span className={`bg-gray-600 block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${isMenuOpen ? 'rotate-45 translate-y-1' : '-translate-y-0.5'}`}></span>
                  <span className={`bg-gray-600 block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm my-0.5 ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
                  <span className={`bg-gray-600 block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${isMenuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-0.5'}`}></span>
                </div>
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
                <Link
                  to="/"
                  className={`block px-3 py-2 text-base font-medium transition-colors hover:text-orange-600 ${
                    isActive('/') ? 'text-orange-600 bg-orange-50' : 'text-gray-700'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  to="/menu"
                  className={`block px-3 py-2 text-base font-medium transition-colors hover:text-orange-600 ${
                    isActive('/menu') ? 'text-orange-600 bg-orange-50' : 'text-gray-700'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Menu
                </Link>
                <Link
                  to="/orders"
                  className={`block px-3 py-2 text-base font-medium transition-colors hover:text-orange-600 relative ${
                    isActive('/orders') ? 'text-orange-600 bg-orange-50' : 'text-gray-700'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Orders
                  {state.items.length > 0 && (
                    <Badge className="absolute top-2 right-3 bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                      {state.items.reduce((sum, item) => sum + item.quantity, 0)}
                    </Badge>
                  )}
                </Link>
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/profile"
                      className={`block px-3 py-2 text-base font-medium transition-colors hover:text-orange-600 ${
                        isActive('/profile') ? 'text-orange-600 bg-orange-50' : 'text-gray-700'
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <Button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      variant="ghost"
                      className="w-full justify-start px-3 py-2 text-base font-medium text-gray-700 hover:text-orange-600"
                    >
                      Logout
                    </Button>
                  </>
                ) : (
                  <div className="px-3 py-2 space-y-2">
                    <Button
                      onClick={() => {
                        openAuthModal('login');
                        setIsMenuOpen(false);
                      }}
                      variant="ghost"
                      className="w-full justify-start text-gray-700 hover:text-orange-600"
                    >
                      Sign In
                    </Button>
                    <Button
                      onClick={() => {
                        openAuthModal('register');
                        setIsMenuOpen(false);
                      }}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                    >
                      Sign Up
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      <AuthModal
        isOpen={authModal.isOpen}
        onClose={closeAuthModal}
        initialMode={authModal.mode}
      />
    </>
  );
};

export default Header;
