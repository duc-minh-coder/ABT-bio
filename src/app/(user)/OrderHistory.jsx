import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Clock3,
  Loader2,
  PackageCheck,
  ReceiptText,
  ShoppingBag,
  X,
} from "lucide-react";
import { listAdminCompletedOrders, listMyCompletedOrders } from "../../api";

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

  if (normalized === "PENDING") {
    return {
      label: "PENDING",
      classes: "border-amber-200 bg-amber-50 text-amber-700",
    };
  }

  if (normalized === "CANCELLED") {
    return {
      label: "CANCELLED",
      classes: "border-red-200 bg-red-50 text-red-700",
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
  return `${date.toLocaleDateString("vi-VN")} ${date.toLocaleTimeString(
    "vi-VN",
    {
      hour: "2-digit",
      minute: "2-digit",
    },
  )}`;
}

export default function OrderHistory({ isAdmin = false, page = 0, size = 20 }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("paid");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const resolvedPage = Number(page ?? 0) || 0;
  const resolvedSize = Number(size ?? 20) || 20;

  useEffect(() => {
    let isMounted = true;

    const loadOrders = async () => {
      try {
        setLoading(true);
        setError("");

        let result = [];
        if (isAdmin) {
          result = await listAdminCompletedOrders(resolvedPage, resolvedSize);
        } else {
          result = await listMyCompletedOrders(resolvedPage, resolvedSize);
        }

        if (isMounted) {
          setOrders(result || []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.message || "Không thể tải đơn hàng.");
          setOrders([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadOrders();
    return () => {
      isMounted = false;
    };
  }, [isAdmin, resolvedPage, resolvedSize]);

  const visibleOrders = useMemo(() => {
    return (orders || []).filter((order) => {
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
  }, [orders, filter, isAdmin]);

  const openDetail = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

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

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-center gap-2 border-b border-slate-100 px-4 py-4 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin text-cyan-600" />
            Đang tải đơn hàng...
          </div>
          <div className="space-y-3 p-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-14 animate-pulse rounded-xl bg-slate-100"
              />
            ))}
          </div>
        </div>
      ) : visibleOrders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
            <ShoppingBag className="h-6 w-6 text-slate-400" />
          </div>
          <p>Không có đơn hàng phù hợp để hiển thị.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 font-semibold text-slate-700">
                    Mã đơn hàng
                  </th>
                  <th className="px-4 py-3 font-semibold text-slate-700">
                    Tổng tiền
                  </th>
                  <th className="px-4 py-3 font-semibold text-slate-700">
                    Trạng thái
                  </th>
                  <th className="px-4 py-3 font-semibold text-slate-700">
                    Ngày tạo
                  </th>
                  {isAdmin && (
                    <th className="px-4 py-3 font-semibold text-slate-700">
                      Khách hàng
                    </th>
                  )}
                  <th className="px-4 py-3 text-right font-semibold text-slate-700">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {visibleOrders.map((order) => {
                  const statusMeta = getStatusMeta(order?.status);
                  const orderCode = order?.orderCode || order?.id || "—";
                  const buyerEmail =
                    order?.buyerEmail ||
                    order?.customerEmail ||
                    order?.email ||
                    order?.contactEmail ||
                    order?.customer?.email ||
                    order?.user?.email ||
                    "—";

                  return (
                    <tr key={order.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        {orderCode}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {formatCurrency(order?.totalAmount ?? order?.total)} ₫
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusMeta.classes}`}
                        >
                          {statusMeta.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {formatDate(order?.date || order?.createdAt)}
                      </td>
                      {isAdmin && (
                        <td className="px-4 py-3 text-slate-700">
                          {buyerEmail}
                        </td>
                      )}
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => openDetail(order)}
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

      {showModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-6">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-900 p-5 text-slate-200 shadow-2xl">
            <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-cyan-400">
                  Chi tiết đơn hàng
                </p>
                <h3 className="text-lg font-semibold text-white">
                  {selectedOrder.orderCode || selectedOrder.id}
                </h3>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-full border border-slate-700 p-2 text-slate-400 transition hover:border-slate-500 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
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
                    <span className="font-semibold text-white">
                      {formatCurrency(
                        selectedOrder?.totalAmount ?? selectedOrder?.total,
                      )}{" "}
                      ₫
                    </span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span>Ngày tạo</span>
                    <span className="font-semibold text-white">
                      {formatDate(
                        selectedOrder?.date || selectedOrder?.createdAt,
                      )}
                    </span>
                  </div>
                  {isAdmin && (
                    <div className="flex justify-between gap-3">
                      <span>Khách hàng</span>
                      <span className="font-semibold text-white">
                        {selectedOrder?.buyerEmail ||
                          selectedOrder?.customerEmail ||
                          selectedOrder?.email ||
                          "—"}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                  <Box className="h-4 w-4 text-cyan-400" />
                  Danh sách sản phẩm
                </div>
                <div className="mt-3 space-y-2 text-sm text-slate-400">
                  {(selectedOrder?.items || []).length > 0 ? (
                    selectedOrder.items.map((item, index) => (
                      <div
                        key={`${selectedOrder.id}-${index}`}
                        className="flex items-center justify-between gap-3 rounded-lg bg-slate-900/70 px-3 py-2"
                      >
                        <span className="line-clamp-1">
                          {item?.product?.name || item?.name || "Sản phẩm"}
                        </span>
                        <span className="shrink-0 text-white">
                          x{item?.quantity || 1}
                        </span>
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
        </div>
      )}
    </div>
  );
}
