import React, { useEffect, useMemo, useRef, useState } from "react";

type CartItem = {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
};

type CheckoutPaymentProps = {
  items: CartItem[];
  totalAmount: number;
  onBack: () => void;
};

type Step = 1 | 2 | 3 | 4;

type OrderResponse = {
  id?: string;
  orderId?: string;
  totalAmount?: number;
  orderCode?: string;
};

type CreateQrResponse = {
  qrCode?: string;
  transactionId?: string;
  paymentUrl?: string;
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

export default function CheckoutPayment({
  items,
  totalAmount,
  onBack,
}: CheckoutPaymentProps) {
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(300);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const countdownRef = useRef<number | null>(null);
  const pollingRef = useRef<number | null>(null);
  const expiredRef = useRef(false);

  const canSubmit = useMemo(() => items.length > 0, [items.length]);

  const stopTimers = () => {
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
      stopTimers();
    };
  }, []);

  const createOrder = async () => {
    if (!canSubmit) return;

    try {
      setLoading(true);
      setError(null);
      const data = await requestJson("/cart/checkout", {
        method: "POST",
        body: JSON.stringify({
          customerName: customerInfo.fullName,
          email: customerInfo.email,
          phone: customerInfo.phone,
          address: customerInfo.address,
          organization: customerInfo.organization,
          paymentMethod: paymentMethod.toUpperCase(),
          items: items.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            priceAtOrder: item.product.price,
          })),
          total: totalAmount,
          notes: notes?.trim() ? notes : undefined,
          status: "pending_payment",
          paymentStatus: "unpaid",
        }),
      });
      const nextOrder = {
        id: data?.id || data?.orderId || "",
        totalAmount: data?.totalAmount ?? totalAmount,
        orderCode: data?.orderCode,
      };
      setOrder(nextOrder);
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tạo đơn hàng.");
    } finally {
      setLoading(false);
    }
  };

  const createQr = async () => {
    if (!order?.id) return;

    try {
      setLoading(true);
      setError(null);
      const data = await requestJson("/payments/payos/create", {
        method: "POST",
        body: JSON.stringify({ orderId: order.id }),
      });

      const payload = data?.result ?? data;
      const rawQr =
        payload?.qrCode || payload?.paymentUrl || payload?.checkoutUrl || null;
      const nextQrUrl = toQrImageUrl(rawQr);
      const nextTransactionId = payload?.transactionId || null;

      setQrUrl(nextQrUrl);
      setTransactionId(nextTransactionId);
      setStep(3);
      setCountdown(300);
      setPaymentStatus(null);
      expiredRef.current = false;

      startCountdownAndPolling(nextTransactionId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tạo mã QR.");
    } finally {
      setLoading(false);
    }
  };

  const startCountdownAndPolling = (txId: string | null) => {
    stopTimers();

    countdownRef.current = window.setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          window.clearInterval(countdownRef.current!);
          countdownRef.current = null;
          expiredRef.current = true;
          setPaymentStatus("EXPIRED");
          setQrUrl(null);
          stopTimers();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    if (txId) {
      pollingRef.current = window.setInterval(async () => {
        if (expiredRef.current) {
          stopTimers();
          return;
        }

        try {
          const data = await requestJson(`/payments/status/${txId}`);
          const status = data?.status || data?.result || data;
          if (status?.toUpperCase() === "PAID") {
            setPaymentStatus("PAID");
            stopTimers();
            setStep(4);
          }
        } catch {
          // ignore polling error
        }
      }, 5000);
    }
  };

  useEffect(() => {
    if (step !== 3) return;
    if (countdown === 0 && !expiredRef.current) {
      expiredRef.current = true;
      setPaymentStatus("EXPIRED");
      setQrUrl(null);
      stopTimers();
    }
  }, [countdown, step]);

  const handleSuccess = () => {
    stopTimers();
    setPaymentStatus("PAID");
    setStep(4);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-600">
            Thanh toán PayOS
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
            {step === 1 && "Tạo đơn hàng"}
            {step === 2 && "Xác nhận thanh toán"}
            {step === 3 && "Quét mã QR"}
            {step === 4 && "Thanh toán thành công"}
          </h1>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="rounded-2xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200"
        >
          Quay lại giỏ hàng
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">
          {error}
        </div>
      )}

      {step === 1 && (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Xác nhận đơn hàng
            </h2>
            <div className="mt-3 flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
              <span>Số sản phẩm</span>
              <span>{items.length}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
              <span>Tổng tiền cần thanh toán</span>
              <span className="text-base font-semibold text-slate-900 dark:text-white">
                {totalAmount.toLocaleString("vi-VN")}₫
              </span>
            </div>
          </div>

          <button
            type="button"
            disabled={!canSubmit || loading}
            onClick={createOrder}
            className="rounded-2xl bg-cyan-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Đang tạo đơn hàng..." : "Thanh toán giỏ hàng"}
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Đơn hàng đã được tạo
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Mã đơn hàng:{" "}
              <span className="font-semibold">
                {order?.id || order?.orderCode || "--"}
              </span>
            </p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Tổng cần thanh toán:{" "}
              <span className="font-semibold">
                {(order?.totalAmount ?? totalAmount).toLocaleString("vi-VN")}₫
              </span>
            </p>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={createQr}
            className="rounded-2xl bg-cyan-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Đang tạo QR..." : "Xác nhận thanh toán"}
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

          {qrUrl ? (
            <div className="flex justify-center">
              <img
                src={qrUrl}
                alt="QR PayOS"
                className="max-h-[360px] w-full max-w-[320px] rounded-2xl border border-slate-200 object-contain bg-white p-4 shadow-sm"
              />
            </div>
          ) : (
            <div className="flex justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950">
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
            Đơn hàng của bạn đã được xác nhận. Bạn sẽ được chuyển sang trang
            thanh toán thành công.
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
