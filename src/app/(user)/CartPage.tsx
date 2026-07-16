import React, { useEffect, useMemo, useState } from "react";
import CheckoutPayment from "./CheckoutPayment";

type CartItem = {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
};

type CartPageProps = {
  className?: string;
};

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

async function requestJson(path: string, init: RequestInit = {}) {
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

function normalizeCart(payload: unknown): CartItem[] {
  if (Array.isArray(payload)) {
    return payload as CartItem[];
  }

  if (payload && typeof payload === "object") {
    const maybe = payload as { items?: CartItem[]; result?: unknown };
    if (Array.isArray(maybe.items)) {
      return maybe.items;
    }
    if (Array.isArray(maybe.result)) {
      return maybe.result as CartItem[];
    }
  }

  return [];
}

export default function CartPage({ className = "" }: CartPageProps) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    void loadCart();
  }, []);

  async function loadCart() {
    try {
      setLoading(true);
      setError(null);
      const data = await requestJson("/cart");
      setItems(normalizeCart(data));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải giỏ hàng.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove(productId: string) {
    try {
      setRemovingId(productId);
      await requestJson(`/cart/product/${productId}`, { method: "DELETE" });
      setItems((prev) => prev.filter((item) => item.productId !== productId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể xóa sản phẩm.");
    } finally {
      setRemovingId(null);
    }
  }

  const totalAmount = useMemo(() => {
    return items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  }, [items]);

  if (isCheckoutOpen) {
    return (
      <CheckoutPayment
        items={items}
        totalAmount={totalAmount}
        onBack={() => setIsCheckoutOpen(false)}
      />
    );
  }

  return (
    <div className={`mx-auto max-w-6xl px-4 py-8 ${className}`}>
      <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-600">
              Giỏ hàng
            </p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
              Sản phẩm đã chọn
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Kiểm tra sản phẩm, số lượng và tổng tiền trước khi tiến hành thanh
              toán.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="text-slate-500 dark:text-slate-400">Tổng tiền</div>
            <div className="text-xl font-semibold text-slate-900 dark:text-white">
              {totalAmount.toLocaleString("vi-VN")}₫
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          Đang tải giỏ hàng...
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          Giỏ hàng hiện đang trống.
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.6fr_0.8fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      {item.productName}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {item.unitPrice.toLocaleString("vi-VN")}₫ / sản phẩm
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                      SL: {item.quantity}
                    </div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">
                      {(item.unitPrice * item.quantity).toLocaleString("vi-VN")}
                      ₫
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemove(item.productId)}
                      disabled={removingId === item.productId}
                      className="rounded-2xl border border-rose-300 px-3 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {removingId === item.productId ? "Đang xóa..." : "Xóa"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Tóm tắt đơn hàng
            </h2>
            <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <div className="flex items-center justify-between">
                <span>Tạm tính</span>
                <span>{totalAmount.toLocaleString("vi-VN")}₫</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Phí vận chuyển</span>
                <span>Miễn phí</span>
              </div>
              <div className="mt-4 border-t border-slate-200 pt-3 dark:border-slate-800">
                <div className="flex items-center justify-between text-base font-semibold text-slate-900 dark:text-white">
                  <span>Tổng thanh toán</span>
                  <span>{totalAmount.toLocaleString("vi-VN")}₫</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsCheckoutOpen(true)}
              disabled={items.length === 0 || loading}
              className="mt-6 w-full rounded-2xl bg-cyan-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Tiến hành thanh toán
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
