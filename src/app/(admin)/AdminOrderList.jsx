import React from "react";
import OrderHistory from "../(user)/OrderHistory";

export default function AdminOrderList() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900">
          Quản lý đơn hàng
        </h3>
        <p className="text-sm text-slate-500">
          Danh sách đơn hàng theo endpoint riêng cho admin, hiển thị khách hàng
          và chi tiết sản phẩm.
        </p>
      </div>
      <OrderHistory isAdmin />
    </div>
  );
}
