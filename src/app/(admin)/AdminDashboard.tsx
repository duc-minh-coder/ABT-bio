import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Order, OrderStatus, Product, UserAccount, Post } from '../../types';
import { BIOMEDICAL_PRODUCTS } from '../../data';
import { 
  ShieldAlert, 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  DollarSign, 
  RefreshCw, 
  Layers, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Truck, 
  XOctagon, 
  Plus, 
  FileText,
  Search,
  Trash2,
  Lock,
  Unlock,
  BookOpen,
  UserPlus,
  Compass,
  Check
} from 'lucide-react';

interface AdminDashboardProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  products: Product[];
  onRestockProduct: (productId: string, amount: number) => void;
  users: UserAccount[];
  onUpdateUserRole: (userId: string, role: 'user' | 'admin') => void;
  onUpdateUserStatus: (userId: string, status: 'active' | 'blocked') => void;
  onAddNewUser: (newUser: UserAccount) => void;
  posts: Post[];
  onAddNewPost: (newPost: Post) => void;
  onDeletePost: (postId: string) => void;
}

export default function AdminDashboard({
  orders,
  onUpdateOrderStatus,
  products,
  onRestockProduct,
  users,
  onUpdateUserRole,
  onUpdateUserStatus,
  onAddNewUser,
  posts,
  onAddNewPost,
  onDeletePost
}: AdminDashboardProps) {
  // Navigation inside administration cabinet
  const [adminTab, setAdminTab] = useState<'orders' | 'users' | 'posts' | 'stock'>('orders');
  
  // Search state variables
  const [userQuery, setUserQuery] = useState('');
  const [postQuery, setPostQuery] = useState('');
  const [orderQuery, setOrderQuery] = useState('');

  // Creation State - New User
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'user' | 'admin'>('user');
  const [newUserDept, setNewUserDept] = useState('');
  const [showAddUserModal, setShowAddUserModal] = useState(false);

  // Creation State - New Post
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostCategory, setNewPostCategory] = useState('An toàn phòng thí nghiệm');
  const [newPostSummary, setNewPostSummary] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostAuthor, setNewPostAuthor] = useState('');
  const [showAddPostModal, setShowAddPostModal] = useState(false);

  // Filter & Order tables variables
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedAdminOrderId, setSelectedAdminOrderId] = useState<string | null>(null);

  // Statistics calculations
  const totalRevenue = orders
    .filter(o => o.status === 'paid' || o.status === 'shipping' || o.status === 'completed')
    .reduce((sum, o) => sum + o.total, 0);

  const pendingOrdersCount = orders.filter(o => o.status === 'pending_payment').length;
  const activeDeliveriesCount = orders.filter(o => o.status === 'shipping').length;
  
  // Group sales by category for analytical bar chart
  const categorySales = BIOMEDICAL_PRODUCTS.reduce((acc, prod) => {
    const count = orders
      .filter(o => o.status !== 'cancelled')
      .flatMap(o => o.items)
      .filter(item => item.product.id === prod.id)
      .reduce((sum, item) => sum + item.quantity, 0);
    
    const revenue = count * prod.price;

    const existingCat = acc.find(c => c.name === prod.category);
    if (existingCat) {
      existingCat.revenue += revenue;
      existingCat.count += count;
    } else {
      acc.push({ name: prod.category, revenue, count });
    }
    return acc;
  }, [] as { name: string; revenue: number; count: number }[]);

  const highestCatRevenue = Math.max(...categorySales.map(c => c.revenue), 1);

  // Filtered orders list by search query & badge status
  const filteredOrders = orders.filter(order => {
    const matchStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchSearch = order.id.toLowerCase().includes(orderQuery.toLowerCase()) ||
                        order.customerName.toLowerCase().includes(orderQuery.toLowerCase()) ||
                        order.organization.toLowerCase().includes(orderQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  // Filter users by search
  const filteredUsers = users.filter(usr => {
    const q = userQuery.toLowerCase();
    return usr.name.toLowerCase().includes(q) || 
           usr.email.toLowerCase().includes(q) || 
           usr.department.toLowerCase().includes(q);
  });

  // Filter posts by search / category
  const filteredPosts = posts.filter(p => {
    const q = postQuery.toLowerCase();
    return p.title.toLowerCase().includes(q) || 
           p.summary.toLowerCase().includes(q) || 
           p.category.toLowerCase().includes(q);
  });

  const getStatusBadgeClassAndLabel = (status: OrderStatus) => {
    switch (status) {
      case 'pending_payment':
        return { label: 'Chờ QR/Code PayOS', bg: 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-500/20' };
      case 'paid':
        return { label: 'Đã thanh toán', bg: 'bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border-teal-500/20' };
      case 'shipping':
        return { label: 'Kỹ sư Đang lắp đặt', bg: 'bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border-sky-500/20' };
      case 'completed':
        return { label: 'Nghiệm thu hoàn tất', bg: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border-emerald-500/20' };
      case 'cancelled':
        return { label: 'Đơn đã hủy', bg: 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-500/20' };
      default:
        return { label: 'N/A', bg: 'bg-slate-100 text-slate-705 text-slate-700' };
    }
  };

  const selectedAdminOrder = orders.find(o => o.id === selectedAdminOrderId) || null;

  // Handles adding new user from Admin modal
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail || !newUserDept) return;

    const newUserObj: UserAccount = {
      id: `USR-${Math.floor(100 + Math.random() * 900)}`,
      name: newUserName,
      email: newUserEmail.trim().toLowerCase(),
      role: newUserRole,
      status: 'active',
      department: newUserDept,
      createdAt: new Date().toISOString()
    };

    onAddNewUser(newUserObj);
    
    // Reset fields
    setNewUserName('');
    setNewUserEmail('');
    setNewUserDept('');
    setNewUserRole('user');
    setShowAddUserModal(false);
  };

  // Handles submitting new post
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle || !newPostSummary || !newPostContent) return;

    const newPostObj: Post = {
      id: `POST-${Math.floor(100 + Math.random() * 900)}`,
      title: newPostTitle,
      category: newPostCategory,
      summary: newPostSummary,
      content: newPostContent,
      author: newPostAuthor || "Hội đồng Kỹ thuật ABT",
      date: new Date().toISOString(),
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500&auto=format&fit=crop&q=80",
      readTime: "5 phút đọc"
    };

    onAddNewPost(newPostObj);

    // Reset input fields
    setNewPostTitle('');
    setNewPostSummary('');
    setNewPostContent('');
    setNewPostAuthor('');
    setNewPostCategory('An toàn phòng thí nghiệm');
    setShowAddPostModal(false);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 space-y-8 text-left" id="admin-dashboard-root">
      
      {/* Dashboard Custom Role Information Warning Header */}
      <div className="bg-gradient-to-r from-red-950/20 via-slate-900/40 to-rose-950/20 border border-rose-500/20 p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500 border border-rose-500/20 shrink-0">
            <ShieldAlert className="h-6 w-6 text-rose-450" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-rose-200 tracking-wider font-sans uppercase">Hệ Thống Quản Trị ABT BIOMEDICAL</h4>
            <p className="text-[11px] text-slate-400 leading-normal mt-0.5">Trình điều khiển chuyên nghiệp dành riêng cho giảng viên và thanh tra thiết bị y sinh.</p>
          </div>
        </div>

        {/* Admin Navigation Cabinet switches */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-xl">
          <button
            id="admin-tab-orders-btn"
            onClick={() => setAdminTab('orders')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              adminTab === 'orders' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            Duyệt Đơn Hàng
          </button>
          
          <button
            id="admin-tab-users-btn"
            onClick={() => setAdminTab('users')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              adminTab === 'users' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            Quản Lý Người Dùng ({users.length})
          </button>

          <button
            id="admin-tab-posts-btn"
            onClick={() => setAdminTab('posts')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              adminTab === 'posts' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            Bài Đăng Khoa Học
          </button>

          <button
            id="admin-tab-stock-btn"
            onClick={() => setAdminTab('stock')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              adminTab === 'stock' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            Định Mức Kho
          </button>
        </div>
      </div>

      {/* ======================= SUB-TAB: ORDERS REGULATION ======================= */}
      {adminTab === 'orders' && (
        <div className="space-y-8">
          {/* Key metrics cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Total Revenue */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900 flex items-center justify-center text-emerald-600">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-mono font-bold uppercase tracking-wider">Doanh thu đạt:</span>
                <span className="text-base font-black text-slate-900 dark:text-white block font-mono">
                  {totalRevenue.toLocaleString("vi-VN")}đ
                </span>
                <span className="text-[9px] text-emerald-600 font-semibold block">Đơn đã thanh toán trực tuyến</span>
              </div>
            </div>

            {/* Total count */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-100 dark:border-cyan-900/35 flex items-center justify-center text-cyan-600">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-mono font-bold uppercase tracking-wider">Tổng Đơn Đăng Ký:</span>
                <span className="text-base font-black text-slate-900 dark:text-white block font-mono">
                  {orders.length} đơn
                </span>
                <span className="text-[9px] text-slate-400 block">Duyệt nhanh và hủy lập tức</span>
              </div>
            </div>

            {/* Pending VietQR */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/35 border border-amber-100 dark:border-amber-900 flex items-center justify-center text-amber-600">
                <Clock className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-mono font-bold uppercase tracking-wider">Chờ quét VietQR / PayPal:</span>
                <span className="text-base font-black text-slate-900 dark:text-white block font-mono">
                  {pendingOrdersCount} đơn chờ
                </span>
                <span className="text-[9px] text-amber-600 font-bold block">Chờ xác nhận giao dịch</span>
              </div>
            </div>

            {/* Engineer deployments */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-sky-50 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/35 flex items-center justify-center text-sky-650">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-404 text-slate-400 block font-mono font-bold uppercase tracking-wider">Nghiệm thu lắp đặt:</span>
                <span className="text-base font-black text-slate-900 dark:text-white block font-mono">
                  {activeDeliveriesCount} điểm máy
                </span>
                <span className="text-[9px] text-sky-600 font-medium block">Đội ngũ kỹ sư y sinh</span>
              </div>
            </div>

          </div>

          {/* Bar Chart section */}
          <section className="bg-slate-950 border border-slate-850 p-5 rounded-2xl space-y-4 shadow-sm text-slate-200">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-cyan-400" />
              Biểu đồ doanh số theo nhóm thiết bị y sinh ABT
            </h3>
            <div className="space-y-3.5 pt-1">
              {categorySales.map((cat, idx) => {
                const percentage = Math.round((cat.revenue / highestCatRevenue) * 100);
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-[11px] font-semibold">
                      <span className="text-slate-300">{cat.name} ({cat.count} bộ)</span>
                      <span className="font-mono text-cyan-400 font-bold">{cat.revenue.toLocaleString("vi-VN")} đ</span>
                    </div>
                    <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="bg-gradient-to-r from-cyan-500 to-teal-400 h-full rounded-full transition-all duration-700"
                        style={{ width: `${Math.max(percentage, 5)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Active Orders List with Search */}
          <div className="grid lg:grid-cols-12 gap-6 items-start">
            
            {/* Left table view */}
            <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 p-5 rounded-2xl shadow-sm text-left space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase leading-none">Danh sách đơn hàng</h3>
                  <p className="text-[10px] text-slate-400 mt-1">Tìm kiếm theo mã đơn, đơn vị hoặc người liên hệ.</p>
                </div>

                {/* Filter and Query controls */}
                <div className="flex items-center gap-2 max-w-xs w-full bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-850">
                  <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    id="order-search-input"
                    placeholder="Mã đơn, Tên bệnh viện..."
                    value={orderQuery}
                    onChange={(e) => setOrderQuery(e.target.value)}
                    className="bg-transparent border-none text-[11px] text-slate-800 dark:text-slate-205 outline-none w-full"
                  />
                </div>
              </div>

              {/* Status Filters badges bar */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {['all', 'pending_payment', 'paid', 'shipping', 'completed', 'cancelled'].map((st) => (
                  <button
                    id={`order-filter-status-${st}`}
                    key={st}
                    onClick={() => setFilterStatus(st)}
                    className={`px-3 py-1 text-[10px] font-semibold rounded-lg border transition ${
                      filterStatus === st
                        ? 'bg-rose-955 bg-rose-600 text-white border-rose-500'
                        : 'bg-slate-50 dark:bg-slate-950 text-slate-500 border-slate-200 dark:border-slate-850 hover:bg-slate-100'
                    }`}
                  >
                    {st === 'all' && 'Tất cả'}
                    {st === 'pending_payment' && 'Chờ CQ'}
                    {st === 'paid' && 'Đã thu tiền'}
                    {st === 'shipping' && 'Vận chuyển'}
                    {st === 'completed' && 'Đã xong'}
                    {st === 'cancelled' && 'Đã hủy'}
                  </button>
                ))}
              </div>

              {/* Table rendering */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-slate-700 dark:text-slate-300">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-850 text-[10px] font-mono uppercase text-slate-400">
                      <th className="py-2 px-3 text-left">Mã đơn</th>
                      <th className="py-2 px-3 text-left">Bệnh viện & Lab nhận</th>
                      <th className="py-2 px-3 text-right">Giá trị</th>
                      <th className="py-2 px-3 text-center">Trạng thái</th>
                      <th className="py-2 px-3 text-center">Tùy biến nhanh</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400">Không tìm thấy bản ghi đơn hàng nào khớp.</td>
                      </tr>
                    ) : (
                      filteredOrders.map((o) => {
                        const stBadge = getStatusBadgeClassAndLabel(o.status);
                        return (
                          <tr
                            id={`order-row-${o.id}`}
                            key={o.id}
                            onClick={() => setSelectedAdminOrderId(o.id)}
                            className={`hover:bg-slate-50 dark:hover:bg-slate-950/50 cursor-pointer ${
                              o.id === selectedAdminOrderId ? 'bg-rose-500/10 dark:bg-rose-500/5' : ''
                            }`}
                          >
                            <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-white text-left">{o.id}</td>
                            <td className="py-3 px-3 text-left">
                              <span className="font-bold text-slate-820 text-slate-800 dark:text-slate-100 block truncate max-w-[200px]">{o.organization}</span>
                              <span className="text-[10px] text-slate-400 font-mono block">{o.customerName}</span>
                            </td>
                            <td className="py-3 px-3 text-right font-bold text-slate-800 dark:text-white font-mono">{o.total.toLocaleString("vi-VN")}đ</td>
                            <td className="py-3 px-3 text-center">
                              <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold border ${stBadge.bg}`}>
                                {stBadge.label}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                              <select
                                id={`select-status-${o.id}`}
                                value={o.status}
                                onChange={(e) => onUpdateOrderStatus(o.id, e.target.value as OrderStatus)}
                                className="bg-slate-105 border border-slate-200 dark:border-slate-800 rounded bg-slate-105 dark:bg-slate-950 text-[10px] px-1.5 py-1 text-slate-700 dark:text-slate-300 outline-none"
                              >
                                <option value="pending_payment">Chờ VietQR</option>
                                <option value="paid">Duyệt đã chuyển khoản</option>
                                <option value="shipping">Bàn giao vận chuyển</option>
                                <option value="completed">Đã nghiệm thu máy</option>
                                <option value="cancelled">Hủy đơn hàng</option>
                              </select>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right details drawer preview */}
            <div className="lg:col-span-4">
              {selectedAdminOrder ? (
                <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 p-5 rounded-2xl shadow-md space-y-4 text-left">
                  <div className="border-b border-slate-150 dark:border-slate-800 pb-3">
                    <span className="text-[9px] font-mono text-cyan-500 font-extrabold uppercase">Thống kê chi tiết đơn đăng ký:</span>
                    <h4 className="font-mono text-xs font-black text-slate-900 dark:text-white mt-0.5">{selectedAdminOrder.id}</h4>
                  </div>

                  <div className="space-y-3.5 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Tên đơn vị tiếp nhận:</span>
                      <span className="font-extrabold text-slate-900 dark:text-white leading-tight block">{selectedAdminOrder.organization}</span>
                      <span className="text-[10px] text-slate-404 block">{selectedAdminOrder.address}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px]">Người chịu trách nhiệm kỹ thuật:</span>
                      <span className="font-semibold block text-slate-704 block">{selectedAdminOrder.customerName} - {selectedAdminOrder.phone}</span>
                      <span className="text-[10px] text-slate-404 font-mono block">{selectedAdminOrder.email}</span>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-150 dark:border-slate-850 space-y-2">
                      <span className="text-[9px] text-cyan-600 block font-bold tracking-widest font-mono uppercase">HÀNH ĐỘNG DUYỆT NHANH SOP:</span>
                      <div className="grid grid-cols-2 gap-2 text-[9px]">
                        <button
                          id="btn-quick-paid"
                          onClick={() => onUpdateOrderStatus(selectedAdminOrder.id, 'paid')}
                          className="py-1 px-2 font-black rounded bg-emerald-500/20 text-emerald-600 border border-emerald-500/20 hover:bg-emerald-500/30"
                        >
                          Xác nhận Tiền mặt
                        </button>
                        <button
                          id="btn-quick-ship"
                          onClick={() => onUpdateOrderStatus(selectedAdminOrder.id, 'shipping')}
                          className="py-1 px-2 font-black rounded bg-blue-500/20 text-blue-500 border border-blue-500/20 hover:bg-blue-500/30"
                        >
                          Bàn giao lắp đặt
                        </button>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                      <span className="text-[9px] font-mono text-slate-400 block mb-2 uppercase font-bold">Danh sách mẫu máy mua sắm:</span>
                      <div className="space-y-2">
                        {selectedAdminOrder.items.map((it, idx) => (
                          <div key={idx} className="flex justify-between items-start text-[11px] font-mono bg-slate-50 dark:bg-slate-950 p-2 rounded-lg">
                            <span className="max-w-[140px] truncate leading-tight font-bold">{it.product.name}</span>
                            <span className="font-extrabold text-cyan-600 shrink-0 select-none">x{it.quantity} {it.product.unit}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>
              ) : (
                <div className="p-6 bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center text-xs text-slate-400">
                  Mẹo: Click vào hàng tương ứng trong bảng để xem chi tiết mẫu máy, hóa đơn đỏ, địa chỉ bệnh viện phụ trách.
                </div>
              )}
            </div>

          </div>
        </div>
      )}


      {/* ======================= SUB-TAB: ACADEMIC USER MANAGEMENT ======================= */}
      {adminTab === 'users' && (
        <div className="space-y-6" id="user-management-panel">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 p-5 rounded-2xl shadow-sm">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase leading-none">Danh sách người dùng & Tài khoản</h3>
              <p className="text-[10px] text-slate-400 mt-1">Trình quản lý cơ sở dữ liệu người dùng tham gia vận hành và mua sắm giả lập.</p>
            </div>

            <div className="flex gap-2.5 w-full sm:w-auto">
              {/* Search user list */}
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-850 text-xs w-full sm:max-w-xs">
                <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  id="user-search-input"
                  placeholder="Tìm người dùng, Email..."
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  className="bg-transparent border-none outline-none text-[11px] text-slate-800 dark:text-slate-200 w-full"
                />
              </div>

              <button
                id="btn-trigger-add-user"
                onClick={() => setShowAddUserModal(true)}
                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-extrabold font-sans flex items-center gap-1 shrink-0 uppercase tracking-wider"
              >
                <UserPlus className="h-3.5 w-3.5" />
                Thêm người dùng
              </button>
            </div>
          </div>

          {/* User Entry Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-2xl shadow-sm overflow-hidden text-left">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-850 font-mono text-[10px] uppercase text-slate-400 font-bold">
                    <td className="py-3 px-4 text-left">ID</td>
                    <td className="py-3 px-4 text-left">Tên Người Dùng / Đơn vị</td>
                    <td className="py-3 px-4 text-left">Email liên hệ</td>
                    <td className="py-3 px-4 text-center">Vai Trò</td>
                    <td className="py-3 px-4 text-center">Trạng Thái</td>
                    <td className="py-3 px-4 text-right">Thao tác</td>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-slate-700 dark:text-slate-300">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">Không có tài khoản nào khớp với tìm kiếm.</td>
                    </tr>
                  ) : (
                    filteredUsers.map((usr) => (
                      <tr key={usr.id} id={`user-row-${usr.id}`} className="hover:bg-slate-50 dark:hover:bg-slate-950/40">
                        <td className="py-3.5 px-4 font-mono text-[11px] font-bold text-slate-440">{usr.id}</td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-900 dark:text-white block">{usr.name}</span>
                          <span className="text-[10px] text-slate-400 block">{usr.department}</span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-500 dark:text-slate-400 text-xs">{usr.email}</td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-extrabold font-sans uppercase ${
                            usr.role === 'admin'
                              ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-500/10'
                              : 'bg-cyan-100 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 border border-cyan-500/10'
                          }`}>
                            {usr.role === 'admin' ? 'ADMIN QUẢN TRỊ' : 'USER NGƯỜI DÙNG'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold rounded ${
                            usr.status === 'blocked' ? 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                          }`}>
                            {usr.status === 'blocked' ? <Lock className="h-2.5 w-2.5" /> : <Unlock className="h-2.5 w-2.5" />}
                            {usr.status === 'active' ? 'Đang hoạt động' : 'Đã bị khóa'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-2">
                          <button
                            id={`btn-toggle-role-${usr.id}`}
                            onClick={() => onUpdateUserRole(usr.id, usr.role === 'admin' ? 'user' : 'admin')}
                            className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 border border-slate-200 dark:border-slate-850 text-[10px] font-bold text-slate-600 dark:text-slate-300 transition"
                          >
                            Đổi Vai Trò
                          </button>

                          <button
                            id={`btn-toggle-status-${usr.id}`}
                            onClick={() => onUpdateUserStatus(usr.id, usr.status === 'active' ? 'blocked' : 'active')}
                            className={`px-2 py-1 rounded text-[10px] font-bold border transition ${
                              usr.status === 'active'
                                ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-450 border-amber-500/20 hover:bg-amber-200'
                                : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-450 border-emerald-500/20 hover:bg-emerald-200'
                            }`}
                          >
                            {usr.status === 'active' ? 'Khóa TK' : 'Mở Khóa'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Backstage Add User Modal overlay window */}
          {showAddUserModal && (
            <div className="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full text-left space-y-4 shadow-2xl relative"
                id="add-user-modal-box"
              >
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase">Cấp Tài Khoản Mới Thử Nghiệm</h4>
                  <button
                    id="close-add-user-modal"
                    onClick={() => setShowAddUserModal(false)}
                    className="text-slate-400 hover:text-slate-200 font-bold"
                  >
                    Đóng
                  </button>
                </div>

                <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Họ tên người dùng:</label>
                    <input
                      type="text"
                      className="w-full bg-slate-50 dark:bg-slate-950 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-850 outline-none text-slate-800 dark:text-slate-100 font-sans"
                      placeholder="TS. Trần Quốc Tuấn"
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Email người dùng:</label>
                    <input
                      type="email"
                      className="w-full bg-slate-50 dark:bg-slate-950 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-850 outline-none text-slate-800 dark:text-slate-100 font-mono"
                      placeholder="quantuan@abt-biomedical.vn"
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Đơn vị y tế / Trường học:</label>
                    <input
                      type="text"
                      className="w-full bg-slate-50 dark:bg-slate-950 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-850 outline-none text-slate-800 dark:text-slate-100 font-sans"
                      placeholder="Khoa Sinh học - Đại học Quốc gia"
                      value={newUserDept}
                      onChange={(e) => setNewUserDept(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Chọn vai trò hệ thống:</label>
                    <select
                      value={newUserRole}
                      onChange={(e) => setNewUserRole(e.target.value as 'user' | 'admin')}
                      className="w-full bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-850 outline-none text-slate-800 dark:text-slate-200 font-sans"
                    >
                      <option value="user">User Người Dùng (Chỉ mua sắm & đọc sách)</option>
                      <option value="admin">Admin Quản trị (Toàn quyền hệ thống)</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    id="submit-add-user-btn"
                    className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 font-black text-white uppercase tracking-wider text-xs transition"
                  >
                    Tạo Tài Khoản
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </div>
      )}


      {/* ======================= SUB-TAB: SCIENTIFIC ARTICLES CONTROL ======================= */}
      {adminTab === 'posts' && (
        <div className="space-y-6" id="post-management-panel">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 p-5 rounded-2xl shadow-sm">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase leading-none">Quản lý bài viết & Hướng dẫn kỹ thuật</h3>
              <p className="text-[10px] text-slate-400 mt-1">Nơi biên soạn tài liệu vận hành phòng Lab, SOP an toàn y sinh hoặc tin tức công nghệ phân tử mới.</p>
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-850 text-xs w-full sm:max-w-xs">
                <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  id="post-search-input"
                  placeholder="Tìm kiếm tiêu đề, bài viết..."
                  value={postQuery}
                  onChange={(e) => setPostQuery(e.target.value)}
                  className="bg-transparent border-none outline-none text-[11px] text-slate-800 dark:text-slate-200 w-full"
                />
              </div>

              <button
                id="btn-trigger-add-post"
                onClick={() => setShowAddPostModal(true)}
                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-extrabold flex items-center gap-1 shrink-0 uppercase tracking-wider"
              >
                <Plus className="h-3.5 w-3.5" />
                Soạn bài đăng viết mới
              </button>
            </div>
          </div>

          {/* Cards of Posts in DB */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            {filteredPosts.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-400 text-xs">Không bộc lộ kết quả bài viết y sinh tương ứng nào.</div>
            ) : (
              filteredPosts.map((p) => (
                <div 
                  id={`article-mgmt-card-${p.id}`}
                  key={p.id} 
                  className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between"
                >
                  <div className="relative h-40 bg-slate-900">
                    <img 
                      src={p.image} 
                      alt={p.title} 
                      className="w-full h-full object-cover opacity-85"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute top-3 left-3 bg-rose-600 text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-lg">
                      {p.category}
                    </span>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between gap-4">
                    <div className="space-y-1.5">
                      <span className="font-mono text-[9px] text-slate-400 font-bold block">{p.id} • {p.readTime}</span>
                      <h4 className="font-extrabold text-xs text-slate-900 dark:text-white leading-normal line-clamp-2">{p.title}</h4>
                      <p className="text-[10px] text-slate-500 line-clamp-3 leading-relaxed">{p.summary}</p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
                      <span className="text-[10px] font-sans text-slate-400 block truncate max-w-[130px]">Tác giả: <span className="font-bold text-slate-300">{p.author}</span></span>
                      
                      <button
                        id={`btn-delete-post-${p.id}`}
                        onClick={() => onDeletePost(p.id)}
                        className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-955 hover:bg-rose-100 text-rose-600 hover:text-rose-500 transition border border-rose-500/10 flex items-center justify-center"
                        title="Xóa bài viết"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Backstage Add Post Modal overlay window */}
          {showAddPostModal && (
            <div className="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-4 overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full text-left space-y-4 shadow-2xl relative my-8"
                id="add-post-modal-box"
              >
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase flex items-center gap-2">
                    <BookOpen className="h-4.5 w-4.5 text-rose-500" />
                    Biên soạn bài viết khoa học mới
                  </h4>
                  <button
                    id="close-add-post-modal"
                    onClick={() => setShowAddPostModal(false)}
                    className="text-slate-400 hover:text-slate-200 font-bold"
                  >
                    Đóng
                  </button>
                </div>

                <form onSubmit={handleCreatePost} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-450 text-slate-400 mb-1">Tiêu đề bài viết bản vẽ:</label>
                    <input
                      type="text"
                      className="w-full bg-slate-50 dark:bg-slate-950 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-850 outline-none text-slate-800 dark:text-slate-100 font-bold"
                      placeholder="vd: Hướng dẫn an toàn tủ cấy vi sinh BioSafe II"
                      value={newPostTitle}
                      onChange={(e) => setNewPostTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Chuyên mục:</label>
                      <select
                        value={newPostCategory}
                        onChange={(e) => setNewPostCategory(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-850 outline-none text-slate-800 dark:text-slate-200"
                      >
                        <option value="An toàn phòng thí nghiệm">An toàn phòng thí nghiệm</option>
                        <option value="Công nghệ mới">Công nghệ mới</option>
                        <option value="Hướng dẫn sử dụng">Hướng dẫn sử dụng</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Tác giả biên soạn:</label>
                      <input
                        type="text"
                        className="w-full bg-slate-50 dark:bg-slate-950 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-850 outline-none text-slate-800 dark:text-slate-100"
                        placeholder="ThS. Nguyễn Văn Sơn"
                        value={newPostAuthor}
                        onChange={(e) => setNewPostAuthor(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Tóm tắt ngắn (Summary):</label>
                    <textarea
                      rows={2}
                      className="w-full bg-slate-50 dark:bg-slate-950 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-850 outline-none text-slate-800 dark:text-slate-100 leading-normal"
                      placeholder="Mô tả nội dung bài viết dưới 3 dòng..."
                      value={newPostSummary}
                      onChange={(e) => setNewPostSummary(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Nội dung chi tiết (Sử dụng tiêu đề để phân tách):</label>
                    <textarea
                      rows={6}
                      className="w-full bg-slate-50 dark:bg-slate-950 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-850 outline-none text-slate-800 dark:text-slate-100 font-mono leading-normal"
                      placeholder="### Hướng dẫn lắp đặt...\n1. Cân bằng chân đế chống rung cơ hóc\n2. Cắm điện lưới xoay chiều 220V chuẩn y khoa..."
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    id="submit-add-post-btn"
                    className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 font-bold text-white uppercase text-xs transition uppercase tracking-wider"
                  >
                    Xuất bản tin tức
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </div>
      )}


      {/* ======================= SUB-TAB: STOCK/INVENTORY CONTROL ======================= */}
      {adminTab === 'stock' && (
        <section className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 p-6 rounded-3xl space-y-5 text-left" id="inventory-management-panel">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase flex items-center gap-2">
              <Layers className="h-5 w-5 text-cyan-600" />
              Kiểm kê định mức tồn kho & Đặt hàng dự án
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Sự ổn định của phòng R&D nằm ở trữ lượng thiết bị. Tăng dự trù bằng cách Restock nhanh.</p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
            {products.map((p) => {
              const isLow = p.stock <= 3;
              return (
                <div 
                  id={`stock-card-${p.id}`}
                  key={p.id} 
                  className={`p-4 rounded-xl border transition ${
                    isLow 
                      ? 'border-amber-300 dark:border-amber-955 bg-amber-50/10' 
                      : 'border-slate-150 dark:border-slate-850 bg-slate-50/10 dark:bg-slate-950/40'
                  }`}
                >
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="font-mono text-[9px] text-slate-400 font-extrabold">{p.id}</span>
                    {isLow ? (
                      <span className="px-2 py-0.5 rounded text-[8px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3 animate-ping" /> Tiếp tế gấp
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[8px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-450">An toàn</span>
                    )}
                  </div>

                  <div className="py-2.5">
                    <span className="font-bold text-xs text-slate-800 dark:text-slate-100 block line-clamp-1 select-none">{p.name}</span>
                    <p className="text-slate-404 text-slate-400 text-[10px] font-mono mt-1">Trọng số khả dụng: <span className="font-bold text-slate-800 dark:text-slate-100 text-xs">{p.stock}</span> {p.unit}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                    <button
                      id={`btn-quick-restock-${p.id}`}
                      onClick={() => onRestockProduct(p.id, 5)}
                      className="px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 hover:bg-slate-850 text-[9px] font-bold text-slate-300 hover:text-white flex items-center gap-1 shadow-sm transition"
                    >
                      <Plus className="h-3 w-3" />
                      Nhập tiếp tế +5 {p.unit}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

    </div>
  );
}
