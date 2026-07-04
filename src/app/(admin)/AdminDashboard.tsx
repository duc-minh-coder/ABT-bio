import React from 'react';
import AdminLayout from './AdminLayout';
import AdminOrdersPanel from './AdminOrdersPanel';
import AdminUsersPanel from './AdminUsersPanel';
import AdminPostsPanel from './AdminPostsPanel';
import AdminStockPanel from './AdminStockPanel';
import { Order, OrderStatus, Product, UserAccount, Post } from '../../types';

interface AdminDashboardProps {
  currentPath: string;
  onNavigate: (path: string) => void;
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

type AdminSection = 'orders' | 'users' | 'posts' | 'stock';

function parseAdminSection(path: string): AdminSection {
  if (path === '/admin/dashboard') return 'orders';
  const suffix = path.replace('/admin/dashboard/', '');
  if (suffix === 'users' || suffix === 'posts' || suffix === 'stock') {
    return suffix;
  }
  return 'orders';
}

export default function AdminDashboard({
  currentPath,
  onNavigate,
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
  onDeletePost,
}: AdminDashboardProps) {
  const section = parseAdminSection(currentPath);

  return (
    <AdminLayout
      currentSection={section}
      orderCount={orders.length}
      userCount={users.length}
      postCount={posts.length}
      productCount={products.length}
      onNavigate={onNavigate}
    >
      {section === 'orders' && (
        <AdminOrdersPanel orders={orders} onUpdateOrderStatus={onUpdateOrderStatus} />
      )}
      {section === 'users' && (
        <AdminUsersPanel
          users={users}
          onUpdateUserRole={onUpdateUserRole}
          onUpdateUserStatus={onUpdateUserStatus}
          onAddNewUser={onAddNewUser}
        />
      )}
      {section === 'posts' && (
        <AdminPostsPanel posts={posts} onAddNewPost={onAddNewPost} onDeletePost={onDeletePost} />
      )}
      {section === 'stock' && (
        <AdminStockPanel products={products} onRestockProduct={onRestockProduct} />
      )}
    </AdminLayout>
  );
}
