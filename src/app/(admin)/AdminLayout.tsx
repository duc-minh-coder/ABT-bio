import React, { ReactNode, useState } from 'react';
import {
  ShieldAlert,
  ShoppingBag,
  Users,
  BookOpen,
  Layers,
  CheckCircle2,
  TrendingUp
} from 'lucide-react';

interface AdminLayoutProps {
  currentSection: 'orders' | 'users' | 'posts' | 'stock';
  orderCount: number;
  userCount: number;
  postCount: number;
  productCount: number;
  onNavigate: (path: string) => void;
  children: ReactNode;
}

const menuItems = [
  { id: 'orders', label: 'Duyệt Đơn Hàng', path: '/admin/dashboard/orders', icon: ShoppingBag },
  { id: 'users', label: 'Quản Lý Người Dùng', path: '/admin/dashboard/users', icon: Users },
  { id: 'posts', label: 'Bài Viết & SOP', path: '/admin/dashboard/posts', icon: BookOpen },
  { id: 'stock', label: 'Kho & Nhập Hàng', path: '/admin/dashboard/stock', icon: Layers },
];

export default function AdminLayout({
  currentSection,
  orderCount,
  userCount,
  postCount,
  productCount,
  onNavigate,
  children,
}: AdminLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 space-y-6">
      <div className="rounded-3xl bg-slate-950 border border-slate-800 p-5 shadow-xl overflow-hidden">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-rose-600/10 px-3 py-1 text-xs uppercase tracking-[0.25em] font-semibold text-rose-200">
              <ShieldAlert className="h-4 w-4 text-rose-300" />
              Admin Center
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Bảng điều khiển quản trị ABT</h1>
            <p className="max-w-2xl text-sm text-slate-400">Menu điều phối riêng biệt, tách các chức năng thành nhiều trang con giúp quản lý dễ dàng và rõ ràng hơn.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 w-full xl:w-auto">
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-4 text-white">
              <span className="text-[10px] uppercase tracking-[0.24em] text-slate-400 block">Đơn hàng</span>
              <div className="mt-3 text-2xl font-black flex items-center gap-2 text-cyan-300">
                <ShoppingBag className="h-5 w-5" />
                {orderCount}
              </div>
            </div>
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-4 text-white">
              <span className="text-[10px] uppercase tracking-[0.24em] text-slate-400 block">Người dùng</span>
              <div className="mt-3 text-2xl font-black flex items-center gap-2 text-emerald-300">
                <Users className="h-5 w-5" />
                {userCount}
              </div>
            </div>
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-4 text-white">
              <span className="text-[10px] uppercase tracking-[0.24em] text-slate-400 block">Bài viết</span>
              <div className="mt-3 text-2xl font-black flex items-center gap-2 text-violet-300">
                <BookOpen className="h-5 w-5" />
                {postCount}
              </div>
            </div>
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-4 text-white">
              <span className="text-[10px] uppercase tracking-[0.24em] text-slate-400 block">Mẫu máy</span>
              <div className="mt-3 text-2xl font-black flex items-center gap-2 text-amber-300">
                <Layers className="h-5 w-5" />
                {productCount}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[260px_1fr]">
        <aside className="relative rounded-3xl border border-slate-800 bg-slate-950 p-5 shadow-sm lg:sticky lg:top-4 lg:self-start">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500 font-semibold">Chức năng admin</p>
              <h2 className="mt-3 text-lg font-bold text-white">Menu điều hành</h2>
            </div>
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-900 p-2 text-slate-200 hover:bg-slate-800 lg:hidden"
            >
              <span>{mobileOpen ? 'Đóng' : 'Mở'}</span>
            </button>
          </div>

          <nav className={`${mobileOpen ? 'block' : 'hidden'} lg:block space-y-2`} aria-expanded={mobileOpen} aria-label="Admin navigation">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.path);
                    setMobileOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                    isActive
                      ? 'bg-rose-600 text-white shadow-lg shadow-rose-500/20'
                      : 'text-slate-300 hover:bg-slate-900/70 hover:text-white'
                  }`}
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-cyan-300">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="mt-8 rounded-3xl bg-slate-900 border border-slate-800 p-4">
            <div className="flex items-center justify-between text-slate-400 text-xs uppercase tracking-[0.24em] font-semibold">
              <span>Thanh tra hệ thống</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="mt-3 text-sm text-slate-300 leading-relaxed">
              Mọi chức năng quản trị được tách riêng theo mỗi trang để giảm độ phức tạp và tăng khả năng mở rộng UI.
            </div>
          </div>
        </aside>

        <div className="space-y-6">{children}</div>
      </div>
    </div>
  );
}
