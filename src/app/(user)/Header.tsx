import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ShoppingCart,
  User,
  ShieldCheck,
  ShieldAlert,
  Award,
  LogOut,
  Menu,
  X,
  Activity,
  BookOpen,
  ShoppingBag,
  LogIn,
} from "lucide-react";
import { UserAccount } from "../../types";

interface HeaderProps {
  currentUser: UserAccount | null;
  onLogout: () => void;
  currentPath: string;
  onNavigate: (path: string) => void;
  cartCount: number;
}

export default function Header({
  currentUser,
  onLogout,
  currentPath,
  onNavigate,
  cartCount,
}: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  // General user navigation items
  const navigationItems = [
    { id: "/home", label: "Trang Chủ" },
    { id: "/products", label: "Sản Phẩm" },
    { id: "/posts", label: "Cổng Tri Thức & SOP" },
  ];

  const handleLinkClick = (path: string) => {
    onNavigate(path);
    setIsOpen(false);
  };

  return (
    <header
      className="sticky top-0 z-50 bg-slate-900/95 text-slate-100 border-b border-rose-500/10 shadow-lg backdrop-blur-md"
      id="app-global-header"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div
            className="flex items-center gap-3 cursor-pointer select-none shrink-0"
            onClick={() => onNavigate("/home")}
            id="header-brand-logo"
          >
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-400 to-teal-500 shadow-teal-500/20 shadow-md">
              <Activity className="h-5.5 w-5.5 text-white animate-pulse" />
              <div className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-500"></span>
              </div>
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 via-teal-300 to-white bg-clip-text text-transparent">
                ABT BIOMEDICAL
              </span>
              <p className="text-[9px] text-slate-400 tracking-widest font-mono uppercase">
                Thiết bị y sinh cao cấp
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navigationItems.map((item) => {
              const isActive = currentPath === item.id;
              return (
                <button
                  id={`nav-item-${item.id}`}
                  key={item.id}
                  onClick={() => handleLinkClick(item.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative ${
                    isActive
                      ? "text-cyan-400 font-semibold"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-cyan-400 to-teal-400 rounded-full"
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 30,
                      }}
                    />
                  )}
                </button>
              );
            })}

            {/* Own Orders Nav Link - visible if logged in */}
            {currentUser && (
              <button
                id="nav-item-my-orders"
                onClick={() => handleLinkClick("/orders")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative ${
                  currentPath === "/orders"
                    ? "text-cyan-400 font-semibold"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                Đơn Hàng Của Tôi
              </button>
            )}
          </nav>

          {/* Right Controls (Cart & Authentication info) */}
          <div className="hidden md:flex items-center gap-3">
            {/* Cart Button */}
            <button
              id="header-cart-btn"
              onClick={() => onNavigate("/cart")}
              className={`relative p-2.5 rounded-xl border transition-all duration-200 ${
                currentPath === "/cart"
                  ? "bg-cyan-500/20 border-cyan-400/50 text-cyan-300"
                  : "bg-slate-850 border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white"
              }`}
              title="Giỏ hàng thí nghiệm"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-md ring-2 ring-slate-900 animate-bounce">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Admin Dashboard portal key - visible to Admin role */}
            {currentUser?.role === "admin" && (
              <button
                id="header-admin-portal-btn"
                onClick={() => onNavigate("/admin/dashboard")}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider border transition-all duration-200 ${
                  currentPath.startsWith("/admin/dashboard")
                    ? "bg-rose-500 text-white border-transparent"
                    : "bg-rose-950/30 border-rose-900/50 text-rose-400 hover:bg-rose-900/20 hover:text-white"
                }`}
              >
                <ShieldAlert className="h-3.5 w-3.5" />
                Quản trị Admin
              </button>
            )}

            {/* Session State Segment */}
            {currentUser ? (
              <div className="flex items-center gap-3 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                <div className="text-left shrink-0 max-w-[150px]">
                  <span className="text-[11px] font-bold text-slate-205 leading-none block truncate">
                    {currentUser.name}
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono block tracking-tight truncate">
                    {currentUser.role === "admin"
                      ? "🛡️ Quản trị viên"
                      : "🧪 Thí nghiệm viên"}
                  </span>
                </div>

                <button
                  id="btn-header-logout"
                  onClick={onLogout}
                  className="p-1.5 rounded-lg bg-slate-850 hover:bg-rose-950 hover:text-rose-450 border border-slate-800 text-slate-400 transition"
                  title="Đăng xuất"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                id="btn-header-login-redirect"
                onClick={() => onNavigate("/login")}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white text-xs font-bold uppercase tracking-wider transition shadow-md shadow-cyan-950/10"
              >
                <LogIn className="h-3.5 w-3.5" />
                Đăng Nhập
              </button>
            )}
          </div>

          {/* Mobile Menu Controls */}
          <div className="flex md:hidden items-center gap-2">
            {/* Cart Button Mobile */}
            <button
              id="header-cart-btn-mobile"
              onClick={() => onNavigate("/cart")}
              className="relative p-2 rounded-lg bg-slate-800 text-slate-300"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-md">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              id="mobile-menu-toggle"
              onClick={toggleMenu}
              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer view */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="mobile-drawer"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-slate-800 bg-slate-900 text-slate-200 px-4 py-4 space-y-4"
          >
            <div className="flex flex-col gap-2">
              {navigationItems.map((item) => (
                <button
                  id={`mobile-nav-${item.id}`}
                  key={item.id}
                  onClick={() => handleLinkClick(item.id)}
                  className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium ${
                    currentPath === item.id
                      ? "bg-cyan-900/30 text-cyan-400 border-l-2 border-cyan-400"
                      : "hover:bg-slate-800"
                  }`}
                >
                  {item.label}
                </button>
              ))}

              {currentUser && (
                <button
                  id="mobile-nav-my-orders"
                  onClick={() => handleLinkClick("/orders")}
                  className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium ${
                    currentPath === "/orders"
                      ? "bg-cyan-900/30 text-cyan-400 border-l-2 border-cyan-400"
                      : "hover:bg-slate-800"
                  }`}
                >
                  Đơn Hàng Của Tôi
                </button>
              )}

              {currentUser?.role === "admin" && (
                <button
                  id="mobile-nav-admin"
                  onClick={() => handleLinkClick("/admin/dashboard")}
                  className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 ${
                    currentPath.startsWith("/admin/dashboard")
                      ? "bg-rose-955 bg-rose-600 text-white border-l-2 border-rose-500"
                      : "text-rose-450 hover:bg-slate-850"
                  }`}
                >
                  <ShieldAlert className="h-4 w-4" />
                  Khu Vực Quản Trị Admin
                </button>
              )}
            </div>

            {/* Profile signout button inside mobile drawer */}
            <div className="pt-4 border-t border-slate-800 text-left">
              {currentUser ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <div className="flex-1">
                      <span className="text-xs font-bold text-white block truncate">
                        {currentUser.name}
                      </span>
                      <span className="text-[10px] text-slate-400 block truncate">
                        {currentUser.email}
                      </span>
                      <span className="text-[9px] text-cyan-400 font-bold tracking-wider uppercase inline-block mt-1">
                        {currentUser.role === "admin"
                          ? "🛡️ Admin"
                          : "🔬 User Clientele"}
                      </span>
                    </div>
                  </div>

                  <button
                    id="mobile-logout-btn"
                    onClick={() => {
                      onLogout();
                      setIsOpen(false);
                    }}
                    className="w-full py-2 bg-rose-900/20 text-rose-300 font-bold border border-rose-800 text-xs rounded-xl flex items-center justify-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Đăng Xuất Tài Khoản
                  </button>
                </div>
              ) : (
                <button
                  id="mobile-login-btn"
                  onClick={() => {
                    onNavigate("/login");
                    setIsOpen(false);
                  }}
                  className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-teal-600 text-white text-xs font-bold uppercase rounded-xl flex items-center justify-center gap-2"
                >
                  <LogIn className="h-4 w-4" />
                  Đăng Nhập Ngay
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
