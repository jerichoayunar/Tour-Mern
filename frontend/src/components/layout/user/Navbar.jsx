import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { ChevronDown, User, LogOut, Settings, History, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
  };

  const navigation = [
    { to: "/packages", label: "Packages" },
    { to: "/destinations", label: "Destinations" },
    { to: "/inquiry", label: "Send Inquiry" }
  ];

  const isActiveRoute = (path) => location.pathname === path;

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-gray-200/80 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo - Enhanced with better styling */}
          <Link 
            to="/" 
            className="flex items-center space-x-3 group"
          >
            <div className="relative">
              <img
                src="/images/destinations/bukidnonupdates.jpg"
                alt="Bukidnon Tours"
                className="w-12 h-12 object-contain transform group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 rounded-xl bg-blue-400/10 blur-md group-hover:blur-lg transition-all duration-300 -z-10" />
            </div>
            {/* Hide text on smaller screens, show on larger */}
            <div className="hidden lg:flex flex-col">
              <span className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent tracking-tight">
                Bukidnon Tours
              </span>
              <span className="text-xs text-gray-500 font-medium -mt-1">
                Adventure Awaits
              </span>
            </div>
          </Link>

          {/* Desktop Navigation - Enhanced */}
          <div className="hidden md:flex items-center space-x-1">
            {navigation.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`
                  relative px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300
                  ${isActiveRoute(link.to)
                    ? "text-blue-600 bg-blue-50 shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }
                `}
              >
                {link.label}
                {isActiveRoute(link.to) && (
                  <motion.div
                    className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full"
                    layoutId="navbar-indicator"
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Desktop Account Dropdown - Enhanced */}
          <div className="hidden md:flex items-center">
            <div className="relative">
              <motion.button 
                className="flex items-center space-x-3 p-2 rounded-xl border-2 border-transparent hover:border-gray-200 transition-all duration-300 hover:bg-white hover:shadow-sm"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <img
                  src={user?.avatar || "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNGRkZGRkYiLz4KPGNpcmNsZSBjeD0iMjAiIGN5PSIxNSIgcj0iNSIgZmlsbD0iIzAwMDAwMCIvPgo8cGF0aCBkPSJNMTAgMzBDMTAgMjUuNTgyMiAxNC41ODIyIDIxIDIwIDIxQzI1LjQxNzggMjEgMzAgMjUuNTgyMiAzMCAzMEMzMCAzMS4xMDQ1IDI5LjEwNDUgMzIgMjggMzJIMTJDMTAuODk1NSAzMiAxMCAzMS4xMDQ1IDEwIDMwWiIgZmlsbD0iIzAwMDAwMCIvPgo8L3N2Zz4K"}
                  alt="Account"
                  className="w-8 h-8 rounded-full border-2 border-gray-200"
                />
                {user?.name && (
                  <span className="text-gray-700 font-semibold text-sm">
                    {user.name}
                  </span>
                )}
                <ChevronDown 
                  className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`} 
                />
              </motion.button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 backdrop-blur-sm"
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="p-2">
                      {isAuthenticated ? (
                        <>
                          <Link 
                            to="/dashboard" 
                            className="flex items-center gap-3 w-full px-4 py-3 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200 group"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            <User className="w-4 h-4 text-blue-500" />
                            <span>Dashboard</span>
                          </Link>
                          <Link 
                            to="/profile" 
                            className="flex items-center gap-3 w-full px-4 py-3 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200 group"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            <Settings className="w-4 h-4 text-blue-500" />
                            <span>My Profile</span>
                          </Link>
                          <Link 
                            to="/booking-history" 
                            className="flex items-center gap-3 w-full px-4 py-3 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200 group"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            <History className="w-4 h-4 text-blue-500" />
                            <span>Booking History</span>
                          </Link>
                          <div className="border-t border-gray-200 my-2" />
                          <button 
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-4 py-3 text-red-600 rounded-xl hover:bg-red-50 transition-colors duration-200 group"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Logout</span>
                          </button>
                        </>
                      ) : (
                        <Link 
                          to="/login" 
                          className="flex items-center gap-3 w-full px-4 py-3 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <User className="w-4 h-4 text-blue-500" />
                          <span>Sign In</span>
                        </Link>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors duration-200"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation - Enhanced */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              className="md:hidden absolute top-16 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-lg"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="px-4 py-4 space-y-2">
                {navigation.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`
                      block px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-300
                      ${isActiveRoute(link.to)
                        ? "text-blue-600 bg-blue-50"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      }
                    `}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                
                {/* Mobile auth section */}
                <div className="border-t border-gray-200 pt-4 mt-4">
                  {isAuthenticated ? (
                    <>
                      <div className="flex items-center space-x-3 px-4 py-3">
                        <img
                          src={user?.avatar || "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNGRkZGRkYiLz4KPGNpcmNsZSBjeD0iMjAiIGN5PSIxNSIgcj0iNSIgZmlsbD0iIzAwMDAwMCIvPgo8cGF0aCBkPSJNMTAgMzBDMTAgMjUuNTgyMiAxNC41ODIyIDIxIDIwIDIxQzI1LjQxNzggMjEgMzAgMjUuNTgyMiAzMCAzMEMzMCAzMS4xMDQ1IDI5LjEwNDUgMzIgMjggMzJIMTJDMTAuODk1NSAzMiAxMCAzMS4xMDQ1IDEwIDMwWiIgZmlsbD0iIzAwMDAwMCIvPgo8L3N2Zz4K"}
                          alt="Account"
                          className="w-8 h-8 rounded-full border-2 border-gray-200"
                        />
                        <span className="text-gray-700 font-semibold text-sm">
                          {user.name}
                        </span>
                      </div>
                      <button 
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-3 text-red-600 rounded-xl hover:bg-red-50 transition-colors duration-200"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <Link 
                      to="/login" 
                      className="block px-4 py-3 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}

export default Navbar;