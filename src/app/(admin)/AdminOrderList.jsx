import React, { useEffect, useMemo, useState } from "react";
import { CheckCircle2, PackageCheck, Loader2, RefreshCw } from "lucide-react";

const API_BASE = "/api";

function getAuthHeaders(includeJson = true) {
  const headers = new Headers();
  if (includeJson) {
    headers.set("Content-Type", "application/json");
  }
  const token = localStorage.getItem("abt_access_token");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  return headers;
}

async function requestJson(path, init = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      ...Object.fromEntries(getAuthHeaders(Boolean(init.body)).entries()),
      ...(init.headers || {}),
    },
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(data?.message || "Yêu cầu thất bại.");
  }

  return data;
}

function getStatusMeta(status) {
  const normalized = String(status || "").toUpperCase();

  switch (normalized) {
    case "PAID":
      return {
        label: "PAID",
        classes: "border-blue-200 bg-blue-50 text-blue-700",
      };
    case "COMPLETED":
      return {
        label: "COMPLETED",
        classes: "border-green-200 bg-green-50 text-green-700",
      };
    case "PENDING":
      return {
        label: "PENDING",
        classes: "border-yellow-200 bg-yellow-50 text-yellow-700",
      };
    case "CANCELLED":
      return {
        label: "CANCELLED",
        classes: "border-red-200 bg-red-50 text-red-700",
      };
    default:
      return {
        label: normalized || "UNKNOWN",
        classes: "border-slate-200 bg-slate-100 text-slate-700",
      };
  }
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("vi-VN");
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return `${date.toLocaleDateString("vi-VN")} ${date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}`;
}

export default function AdminOrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deliveringId, setDeliveringId] = useState(null);
  const [error, setError] = useState("");

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await requestJson("/orders/completed?page=0&size=20");
      const result = response?.result ?? response?.content ?? response?.items ?? [];
      const normalized = Array.isArray(result) ? result : [];
      setOrders(normalized);
    } catch (err) {
      setError(err?.message || "Không thể tải danh sách đơn hàng.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleConfirmDelivery = async (orderId) => {
    if (!orderId) return;

    try {
      setDeliveringId(orderId);
      setError("");
      await requestJson(`/admin/orders/${orderId}/deliver`, {
        method: "PUT",
      });

      window.dispatchEvent(new CustomEvent("toast", { detail: { message: "Giao hàng thành công", type: "success" } }));
      await loadOrders();
    } catch (err) {
      setError(err?.message || "Xác nhận giao hàng thất bại.");
    } finally {
      setDeliveringId(null);
    }
  };

  const visibleOrders = useMemo(() => orders || [], [orders]);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Quản lý đơn hàng</h3>
          <p className="text-sm text-slate-500">Danh sách tất cả đơn hàng từ API và thao tác xác nhận giao hàng.</p>
        </div>
        <button
          type="button"
          onClick={loadOrders}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Tải lại
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Mã đơn</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Khách hàng</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Tổng tiền</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Trạng thái</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Ngày tạo</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-700">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {visibleOrders.length === 0 && !loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500">
                  Không có đơn hàng nào.
                </td>
              </tr>
            ) : (
              visibleOrders.map((order) => {
                const statusMeta = getStatusMeta(order?.status);
                const isPaid = String(order?.status || "").toUpperCase() === "PAID";
                return (
                  <tr key={order.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold text-slate-900">{order?.orderCode || order?.id || "—"}</td>
                    <td className="px-4 py-3 text-slate-700">{order?.customerName || "—"}</td>
                    <td className="px-4 py-3 text-slate-700">{formatCurrency(order?.totalAmount ?? order?.total)} ₫</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusMeta.classes}`}>
                        {statusMeta.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(order?.date || order?.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      {isPaid ? (
                        <button
                          type="button"
                          onClick={() => handleConfirmDelivery(order.id)}
                          disabled={deliveringId === order.id || loading}
                          className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {deliveringId === order.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4" />
                          )}
                          Xác nhận giao hàng
                        </button>
                      ) : (
                        <span className="text-sm text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
