import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Heart,
  Plus,
  UserPlus,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { LogoIcon } from "./LogoIcon";
import { useAuth } from "../contexts/AuthContext";

export const Navigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { path: "/", label: "Dashboard", icon: LayoutDashboard },
    { path: "/children", label: "Children", icon: Users },
    { path: "/sponsors", label: "Sponsors", icon: Heart },
    { path: "/register-child", label: "Add Child", icon: Plus },
    { path: "/register-sponsor", label: "Add Sponsor", icon: UserPlus },
  ];

  return (
    <nav className="relative">
      {/* Desktop Navigation */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center py-4">
              <Link to="/" className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <LogoIcon className="text-white" size={24} />
                </div>
                <div>
                  <div className="text-xl font-bold text-white">
                    Children Sponsorship
                  </div>
                  <div className="text-xs text-blue-100">Management System</div>
                </div>
              </Link>
            </div>

            {/* Desktop Menu */}
            <div className="hidden lg:block">
              <div className="flex items-center space-x-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? "bg-white/20 text-white shadow-lg backdrop-blur-sm"
                          : "text-blue-100 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <Icon size={18} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}

                {/* User info and Logout */}
                <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-white/20">
                  <span className="text-sm text-blue-100">
                    {user?.fullName || user?.username}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium text-blue-100 hover:bg-white/10 hover:text-white transition-all duration-200"
                  >
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-3 rounded-xl text-blue-100 hover:text-white hover:bg-white/10 transition-colors duration-200"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation — full-screen overlay */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 bg-gradient-to-b from-blue-700 to-blue-900 z-50 flex flex-col">
            {/* Header row */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center space-x-3"
              >
                <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                  <LogoIcon className="text-white" size={20} />
                </div>
                <span className="text-white font-bold text-lg">Children Sponsorship</span>
              </Link>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-xl text-blue-100 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close menu"
              >
                <X size={24} />
              </button>
            </div>

            {/* Nav items */}
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-4 px-5 py-4 rounded-2xl font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "text-blue-100 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Icon size={24} />
                    <span className="text-lg">{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* User info + logout pinned to bottom */}
            <div className="px-4 py-6 border-t border-white/10 space-y-2">
              <div className="px-5 py-2 text-sm text-blue-200">
                Signed in as <span className="text-white font-medium">{user?.fullName || user?.username}</span>
              </div>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center space-x-4 px-5 py-4 rounded-2xl font-medium text-blue-100 hover:bg-white/10 hover:text-white transition-all duration-200"
              >
                <LogOut size={24} />
                <span className="text-lg">Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
