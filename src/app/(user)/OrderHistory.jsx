import React, { useMemo, useState } from "react";
import { PackageCheck, ReceiptText, Clock3 } from "lucide-react";

const STATUS_FILTERS = [
  { value: "all", label: "Tất cả" },
  { value: "unpaid", label: "Chưa thanh toán" },
  { value: "paid", label: "Đã thanh toán (PAID/COMPLETED)" },
];

function normalizeStatus(status) {
  return String(status ?? "").toUpperCase();
}

function getStatusMeta(status) {
  const normalized = normalizeStatus(status);

  if (normalized === "PAID") {
    return {
      label: "PAID",
      classes: "border-blue-200 bg-blue-50 text-blue-700",
    };
  }

  if (normalized === "COMPLETED") {
    return {
      label: "COMPLETED",
      classes: "border-green-200 bg-green-50 text-green-700",
    };
  }

  return {
    label: normalized || "Đang xử lý",
    classes: "border-slate-200 bg-slate-100 text-slate-700",
  };
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("vi-VN");
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return `${date.toLocaleDateString("vi-VN")} ${date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

export default function OrderHistory({ orders = [], isAdmin = false }) {
  const [filter, setFilter] = useState("paid");
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const visibleOrders = useMemo(() => {
    const normalizedOrders = (orders || []).filter((order) => {
      const status = normalizeStatus(order?.status);
      const isPaidLike = status === "PAID" || status === "COMPLETED";

      if (!isAdmin) {
        return isPaidLike;
      }

      if (filter === "unpaid") {
        return !isPaidLike;
      }

      if (filter === "paid") {
        return isPaidLike;
      }

      return true;
    });

    return normalizedOrders;
  }, [orders, filter, isAdmin]);

  const selectedOrder =
    visibleOrders.find((order) => order.id === selectedOrderId) ||
    visibleOrders[0] ||
    null;

  return (
    <div className="space-y-6">
      {isAdmin && (
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((option) => {
            const isActive = filter === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setFilter(option.value)}
                className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                  isActive
                    ? "border-cyan-500 bg-cyan-600 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:border-cyan-300 hover:text-cyan-700"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      )}

      {visibleOrders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
          Bạn chưa có đơn hàng nào đã thanh toán
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 font-semibold text-slate-700">Mã đơn hàng</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">Tổng tiền</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">Trạng thái</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">Ngày tạo</th>
                  <th className="px-4 py-3 font-semibold text-slate-700 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {visibleOrders.map((order) => {
                  const statusMeta = getStatusMeta(order?.status);
                  const orderCode = order?.orderCode || order?.id || "—";

                  return (
                    <tr key={order.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-semibold text-slate-900">{orderCode}</td>
                      <td className="px-4 py-3 text-slate-700">{formatCurrency(order?.totalAmount ?? order?.total)} ₫</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusMeta.classes}`}>
                          {statusMeta.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{formatDate(order?.date || order?.createdAt)}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedOrderId(order.id)}
                          className="inline-flex items-center gap-1 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-sm font-medium text-cyan-700 transition hover:bg-cyan-100"
                        >
                          <ReceiptText className="h-4 w-4" />
                          Chi tiết
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedOrder && (
        <div className="rounded-2xl border border-slate-200 bg-slate-900 p-5 text-slate-200 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-cyan-400">Chi tiết đơn hàng</p>
              <h3 className="text-lg font-semibold text-white">{selectedOrder.orderCode || selectedOrder.id}</h3>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-sm text-slate-300">
              <PackageCheck className="h-4 w-4" />
              {getStatusMeta(selectedOrder?.status).label}
            </div>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                <Clock3 className="h-4 w-4 text-cyan-400" />
                Thông tin đơn hàng
              </div>
              <div className="mt-3 space-y-2 text-sm text-slate-400">
                <div className="flex justify-between gap-3">
                  <span>Tổng tiền</span>
                  <span className="font-semibold text-white">{formatCurrency(selectedOrder?.totalAmount ?? selectedOrder?.total)} ₫</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span>Ngày tạo</span>
                  <span className="font-semibold text-white">{formatDate(selectedOrder?.date || selectedOrder?.createdAt)}</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
              <div className="text-sm font-semibold text-slate-300">Danh sách sản phẩm</div>
              <div className="mt-3 space-y-2 text-sm text-slate-400">
                {(selectedOrder?.items || []).length > 0 ? (
                  selectedOrder.items.map((item, index) => (
                    <div key={`${selectedOrder.id}-${index}`} className="flex items-center justify-between gap-3 rounded-lg bg-slate-900/70 px-3 py-2">
                      <span className="line-clamp-1">{item?.product?.name || item?.name || "Sản phẩm"}</span>
                      <span className="shrink-0 text-white">x{item?.quantity || 1}</span>
                    </div>
                  ))
                ) : (
                  <div className="rounded-lg border border-dashed border-slate-700 px-3 py-2 text-slate-500">
                    Không có sản phẩm trong đơn hàng này.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
