import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Leaf, Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isSuperAdminLogin = location.pathname === '/super-admin/login';

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-green-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <Link to="/" className="flex items-center cursor-pointer">
            <div className="flex-shrink-0 flex items-center">
              <Leaf className="text-green-600 h-6 w-6" />
              <span className="ml-2 text-xl font-bold text-green-700">EcoFarming</span>
            </div>
          </Link>
          <div className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
            {isSuperAdminLogin ? (
              <Link
                to="/"
                className="text-gray-600 hover:text-green-600 font-medium px-4 py-2 transition-colors"
              >
                Back to Home
              </Link>
            ) : (
              <Link
                to="/super-admin/login"
                className="text-gray-600 hover:text-green-600 font-medium px-4 py-2 transition-colors"
              >
                Super Admin
              </Link>
            )}
            {!isSuperAdminLogin && (
              <Link
                to="/get-started"
                className="bg-green-600 text-white px-6 py-2.5 rounded-full font-medium hover:bg-green-700 transition-all shadow-lg hover:shadow-green-200 transform hover:-translate-y-0.5"
              >
                Get Started
              </Link>
            )}
          </div>
          <div className="-mr-2 flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500"
              aria-controls="mobile-menu"
              aria-expanded={isOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="pt-2 pb-3 space-y-1 px-2">
            {isSuperAdminLogin ? (
              <Link
                to="/"
                onClick={() => setIsOpen(false)}
                className="block w-full text-center px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-green-600 hover:bg-gray-50"
              >
                Back to Home
              </Link>
            ) : (
              <Link
                to="/super-admin/login"
                onClick={() => setIsOpen(false)}
                className="block w-full text-center px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-green-600 hover:bg-gray-50"
              >
                Super Admin
              </Link>
            )}
            {!isSuperAdminLogin && (
              <Link
                to="/get-started"
                onClick={() => setIsOpen(false)}
                className="block w-full text-center px-3 py-2 rounded-md text-base font-medium text-white bg-green-600 hover:bg-green-700"
              >
                Get Started
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
