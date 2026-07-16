import React from "react";
import OrderHistory from "./OrderHistory";

interface OrdersViewProps {
  orders?: unknown[];
  onCancelOrder?: (orderId: string) => void;
  onNavigateToTab?: (tab: "products" | "home") => void;
}

export default function OrdersView(_props: OrdersViewProps) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
      <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Đơn hàng của tôi</h1>
        <p className="mt-1 text-sm text-slate-500">
          Theo dõi các đơn hàng đã hoàn tất và xem chi tiết sản phẩm trong từng đơn.
        </p>
      </div>
      <OrderHistory isAdmin={false} />
    </div>
  );
}
