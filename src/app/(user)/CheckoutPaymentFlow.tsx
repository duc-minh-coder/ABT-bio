import React, { useEffect, useMemo, useRef, useState } from "react";

type CartItem = {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
};

type CheckoutPaymentFlowProps = {
  items: CartItem[];
  totalAmount: number;
  onBack: () => void;
  onSuccess?: () => void;
};

type Step = 1 | 2 | 3 | 4;

type ApiEnvelope<T> = {
  code?: number;
  result?: T;
  message?: string;
};

type OrderResponse = {
  id?: string;
  totalAmount?: number;
};

type QrResponse = {
  qrCode?: string;
  transactionId?: string;
  checkoutUrl?: string;
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

async function requestJson<T>(path: string, init: RequestInit = {}) {
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

  return data as ApiEnvelope<T>;
}

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function toQrImageUrl(rawValue?: string | null) {
  if (!rawValue) return null;
  if (/^https?:\/\//i.test(rawValue)) return rawValue;
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(rawValue)}`;
}

export default function CheckoutPaymentFlow({
  items,
  totalAmount,
  onBack,
  onSuccess,
}: CheckoutPaymentFlowProps) {
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(300);
  const [customerInfo, setCustomerInfo] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
  });

  const countdownRef = useRef<number | null>(null);
  const pollingRef = useRef<number | null>(null);
  const expiredRef = useRef(false);

  const canCheckout = useMemo(() => items.length > 0, [items.length]);

  const clearTimers = () => {
    if (countdownRef.current) {
      window.clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    if (pollingRef.current) {
      window.clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, []);

  const startCountdownAndPolling = (txId: string | null) => {
    clearTimers();

    countdownRef.current = window.setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearTimers();
          expiredRef.current = true;
          setQrCode(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    if (!txId) return;

    pollingRef.current = window.setInterval(async () => {
      if (expiredRef.current) return;

      try {
        const data = await requestJson<string>(`/payments/status/${txId}`);
        const status = (data?.result ?? "").toString().toUpperCase();
        if (status === "PAID") {
          clearTimers();
          setStep(4);
          if (onSuccess) onSuccess();
        }
      } catch {
        // keep polling silently
      }
    }, 5000);
  };

  const handleCreateOrder = async () => {
    if (!canCheckout) return;

    // Validate form
    if (
      !customerInfo.fullName ||
      !customerInfo.email ||
      !customerInfo.phone ||
      !customerInfo.address
    ) {
      setError(
        "Vui lòng điền đầy đủ thông tin giao hàng (Họ tên, Email, SĐT, Địa chỉ).",
      );
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await requestJson<OrderResponse>("/cart/checkout", {
        method: "POST",
        body: JSON.stringify({
          customerName: customerInfo.fullName,
          email: customerInfo.email,
          phone: customerInfo.phone,
          address: customerInfo.address,
          paymentMethod: "PAYOS", // Backend yêu cầu trường này
        }),
      });

      const nextOrder = {
        id: data?.result?.id || "",
        totalAmount: data?.result?.totalAmount ?? totalAmount,
      };

      setOrder(nextOrder);
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tạo đơn hàng.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQr = async () => {
    if (!order?.id) return;

    try {
      setLoading(true);
      setError(null);
      const data = await requestJson<QrResponse>("/payments/payos/create", {
        method: "POST",
        body: JSON.stringify({ orderId: order.id }),
      });

      const payload = data?.result ?? {};
      const rawQr = payload.qrCode || payload.checkoutUrl || null;
      setQrCode(toQrImageUrl(rawQr));
      setTransactionId(payload.transactionId || null);
      setCountdown(300);
      expiredRef.current = false;
      setStep(3);
      startCountdownAndPolling(payload.transactionId || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tạo mã QR.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (step !== 3) return;
    if (countdown === 0 && !expiredRef.current) {
      expiredRef.current = true;
      clearTimers();
      setQrCode(null);
      setError("Đơn hàng đã hết hạn thanh toán.");
    }
  }, [countdown, step]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-600">
            Checkout & PayOS
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
            {step === 1 && "Bước 1 • Tạo đơn hàng"}
            {step === 2 && "Bước 2 • Xác nhận & lấy QR"}
            {step === 3 && "Bước 3 • Quét QR & chờ thanh toán"}
            {step === 4 && "Bước 4 • Thành công"}
          </h1>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="rounded-2xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200"
        >
          Quay lại
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">
          {error}
        </div>
      )}

      {/* NHẬP THÔNG TIN & TẠO ĐƠN HÀNG */}
      {step === 1 && (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
            Thông tin giao hàng
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
              <span className="font-medium">Họ và tên *</span>
              <input
                value={customerInfo.fullName}
                onChange={(e) =>
                  setCustomerInfo((prev) => ({
                    ...prev,
                    fullName: e.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none dark:border-slate-800 dark:bg-slate-950"
                placeholder="Nguyễn Văn A"
              />
            </label>
            <label className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
              <span className="font-medium">Số điện thoại *</span>
              <input
                value={customerInfo.phone}
                onChange={(e) =>
                  setCustomerInfo((prev) => ({
                    ...prev,
                    phone: e.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none dark:border-slate-800 dark:bg-slate-950"
                placeholder="09xxxxxxxx"
              />
            </label>
            <label className="space-y-2 text-sm text-slate-700 dark:text-slate-300 md:col-span-2">
              <span className="font-medium">Email *</span>
              <input
                type="email"
                value={customerInfo.email}
                onChange={(e) =>
                  setCustomerInfo((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none dark:border-slate-800 dark:bg-slate-950"
                placeholder="example@gmail.com"
              />
            </label>
          </div>

          <label className="mt-4 block space-y-2 text-sm text-slate-700 dark:text-slate-300">
            <span className="font-medium">Địa chỉ nhận hàng *</span>
            <textarea
              value={customerInfo.address}
              onChange={(e) =>
                setCustomerInfo((prev) => ({
                  ...prev,
                  address: e.target.value,
                }))
              }
              className="min-h-[96px] w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none dark:border-slate-800 dark:bg-slate-950"
              placeholder="Số nhà, đường, phường/xã, thành phố"
            />
          </label>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
            <div className="mt-2 flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
              <span>Tổng tiền giỏ hàng</span>
              <span className="text-base font-semibold text-slate-900 dark:text-white">
                {totalAmount.toLocaleString("vi-VN")}₫
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCreateOrder}
            disabled={!canCheckout || loading}
            className="mt-6 inline-flex items-center rounded-2xl bg-cyan-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Đang tạo đơn hàng..." : "Tạo đơn hàng"}
          </button>
        </div>
      )}

      {/* XÁC NHẬN CHUYỂN KHOẢN PAYOS */}
      {step === 2 && (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Xác nhận thanh toán
          </h2>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
              <span>Mã đơn hàng</span>
              <span className="font-mono font-medium">{order?.id || "--"}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
              <span>Tổng cần thanh toán</span>
              <span className="font-semibold text-rose-600 dark:text-rose-400">
                {(order?.totalAmount ?? totalAmount).toLocaleString("vi-VN")}₫
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCreateQr}
            disabled={loading}
            className="mt-6 inline-flex w-full justify-center items-center rounded-2xl bg-cyan-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Đang kết nối PayOS..." : "Tiến hành lấy mã QR PayOS"}
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-6 flex flex-col items-center justify-center gap-4 rounded-3xl border border-amber-200 bg-amber-50 p-6 text-center dark:border-amber-900 dark:bg-amber-950/30">
            <div className="text-5xl font-semibold tracking-[0.2em] text-amber-600">
              {formatTime(countdown)}
            </div>
            <div className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">
              Thời gian còn lại
            </div>
            <div className="rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
              Lưu ý: Đơn hàng sẽ bị hủy và hoàn trả sản phẩm về kho sau 5 phút.
              Vui lòng không chuyển khoản khi thời gian đếm ngược đã kết thúc để
              tránh mất tiền oan!
            </div>
          </div>

          {qrCode ? (
            <div className="flex justify-center">
              <img
                src={qrCode}
                alt="QR PayOS"
                className="max-h-[360px] w-full max-w-[320px] rounded-2xl border border-slate-200 object-contain bg-white p-4 shadow-sm"
              />
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950">
              Đơn hàng đã hết hạn thanh toán.
            </div>
          )}
        </div>
      )}

      {step === 4 && (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-8 text-center shadow-sm dark:border-emerald-900 dark:bg-emerald-950/30">
          <h2 className="text-xl font-semibold text-emerald-700 dark:text-emerald-300">
            Thanh toán thành công!
          </h2>
          <p className="mt-3 text-sm text-emerald-700/80 dark:text-emerald-300/80">
            Đơn hàng của bạn đã được xác nhận.
          </p>
          <a
            href="/thanh-toan-thanh-cong"
            className="mt-6 inline-flex rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500"
          >
            Đi tới trang xác nhận
          </a>
        </div>
      )}
    </div>
  );
}
