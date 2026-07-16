import React, { useEffect, useState, useRef } from "react";
import { CartItem, Order, OrderStatus } from "../../types";
import {
  CreditCard,
  Wallet,
  MapPin,
  Globe,
  CheckCircle2,
  Building2,
  User,
  Mail,
  Phone,
  ShoppingBag,
  ChevronRight,
  HeartHandshake,
  CloudLightning,
  Loader2,
  Download,
  Copy,
  ShieldCheck,
} from "lucide-react";

interface CheckoutViewProps {
  cartItems: CartItem[];
  discountRate: number;
  onPlaceOrder: (order: Order) => Promise<void> | void;
  onClearCart: () => void;
  onNavigateToTab: (tab: "products" | "orders") => void;
  initialCustomerName?: string;
  initialEmail?: string;
  initialOrg?: string;
}

type ApiEnvelope<T> = {
  code?: number;
  result?: T;
  message?: string;
};

type CheckoutOrderResponse = {
  id?: string;
  totalAmount?: number;
};

type PayosCreateResponse = {
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

export default function CheckoutView({
  cartItems,
  discountRate,
  onPlaceOrder,
  onClearCart,
  onNavigateToTab,
  initialCustomerName = "",
  initialEmail = "",
  initialOrg = "",
}: CheckoutViewProps) {
  // Shipping Form State
  const [customerName, setCustomerName] = useState(initialCustomerName);
  const [email, setEmail] = useState(initialEmail);
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [organization, setOrganization] = useState(initialOrg);
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"payos" | "paypal">(
    "payos",
  );

  // Synchronize state when auth is fetched
  React.useEffect(() => {
    if (initialCustomerName) setCustomerName(initialCustomerName);
    if (initialEmail) setEmail(initialEmail);
    if (initialOrg) setOrganization(initialOrg);
  }, [initialCustomerName, initialEmail, initialOrg]);

  // Form Verification
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Payment Status Simulator Screen State
  const [gatewayStatus, setGatewayStatus] = useState<
    "form" | "processing" | "payos_screen" | "paypal_screen" | "success"
  >("form");
  const [generatedOrderId, setGeneratedOrderId] = useState("");
  const [paypalEmail, setPaypalEmail] = useState("");
  const [paypalPassword, setPaypalPassword] = useState("");
  const [paypalCardNo, setPaypalCardNo] = useState("");
  const [paypalCardExp, setPaypalCardExp] = useState("");
  const [paypalCardCvv, setPaypalCardCvv] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [payosQr, setPayosQr] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(300);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const countdownRef = useRef<number | null>(null);
  const pollingRef = useRef<number | null>(null);
  const expiredRef = useRef(false);

  // Calculations
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );
  const discountAmount = subtotal * discountRate;
  const shippingFee = 0;
  const total = subtotal - discountAmount + shippingFee;

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

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!customerName.trim()) newErrors.customerName = "Bắt buộc nhập họ tên.";
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = "Email không đúng định dạng.";
    if (!phone.trim() || phone.length < 9)
      newErrors.phone = "SĐT không hợp lệ (tối thiểu 9 số).";
    if (!address.trim())
      newErrors.address = "Địa chỉ bàn giao thiết bị là bắt buộc.";
    if (!organization.trim())
      newErrors.organization = "Vui lòng cung cấp tên Đơn vị/Bệnh viện.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const startPolling = (txId: string | null) => {
    clearTimers();

    countdownRef.current = window.setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearTimers();
          expiredRef.current = true;
          setPayosQr(null);
          setPaymentError("Đơn hàng đã hết hạn thanh toán.");
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
          setGatewayStatus("success");
        }
      } catch {
        // ignore polling errors
      }
    }, 5000);
  };

  const handleStartPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      setPaymentError(null);
      setGatewayStatus("processing");

      const data = await requestJson<CheckoutOrderResponse>("/cart/checkout", {
        method: "POST",
        body: JSON.stringify({
          customerName,
          email,
          phone,
          address,
          organization,
          paymentMethod: paymentMethod.toUpperCase(),
          items: cartItems.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            priceAtOrder: item.product.price,
          })),
          total,
          notes: notes.trim() !== "" ? notes : undefined,
          status: "pending_payment",
          paymentStatus: "unpaid",
        }),
      });

      const nextOrderId = data?.result?.id || "";
      if (!nextOrderId) {
        throw new Error("Backend không trả về orderId.");
      }

      setGeneratedOrderId(nextOrderId);

      if (paymentMethod === "payos") {
        const qrData = await requestJson<PayosCreateResponse>(
          "/payments/payos/create",
          {
            method: "POST",
            body: JSON.stringify({ orderId: nextOrderId }),
          },
        );

        const rawQr =
          qrData?.result?.qrCode || qrData?.result?.checkoutUrl || null;
        const txId = qrData?.result?.transactionId || null;
        setPayosQr(toQrImageUrl(rawQr));
        setTransactionId(txId);
        setCountdown(300);
        expiredRef.current = false;
        setGatewayStatus("payos_screen");
        startPolling(txId);
      } else {
        setGatewayStatus("paypal_screen");
      }
    } catch (err) {
      setPaymentError(
        err instanceof Error ? err.message : "Không thể khởi tạo thanh toán.",
      );
      setGatewayStatus("form");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmOrderSuccess = async () => {
    if (!generatedOrderId) return;

    const orderPayload: Order = {
      id: generatedOrderId,
      date: new Date().toISOString(),
      customerName,
      email,
      phone,
      address,
      organization,
      paymentMethod,
      items: cartItems.map((item) => ({
        product: item.product,
        quantity: item.quantity,
        priceAtOrder: item.product.price,
      })),
      status: "pending_payment",
      total,
      paymentStatus: "unpaid",
      notes: notes.trim() !== "" ? notes : undefined,
    };

    await onPlaceOrder(orderPayload);
    onClearCart();
    setGatewayStatus("success");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  useEffect(() => {
    if (gatewayStatus !== "success") return;
    void handleConfirmOrderSuccess();
  }, [gatewayStatus]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 space-y-8">
      {/* Dynamic Process Indicator breadcrumbs */}
      <div className="flex items-center text-xs text-slate-400 gap-1.5 font-mono mb-4">
        <span>Sản phẩm</span>
        <ChevronRight className="h-3.5 w-3.5" />
        <span>Giỏ hàng</span>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-cyan-400 font-semibold uppercase">
          Lập đơn & Thanh toán
        </span>
      </div>

      {/* 2. PROCESSING STATE (SPINNER VIEW) */}
      {gatewayStatus === "processing" && (
        <div className="p-16 text-center space-y-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col items-center">
          <Loader2 className="h-12 w-12 text-cyan-400 animate-spin" />
          <div className="space-y-1">
            <h3 className="font-bold text-lg text-white">
              Đang tạo đơn hàng và kết nối cổng thanh toán...
            </h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Hệ thống đang gọi API thật để tạo order và lấy QR PayOS.
            </p>
          </div>
        </div>
      )}

      {/* 3. SIMULATED FORM VIEW */}
      {paymentError && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">
          {paymentError}
        </div>
      )}

      {gatewayStatus === "form" && (
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Customer / Institution Form details */}
          <form
            id="shipping-and-billing-form"
            onSubmit={handleStartPayment}
            className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-6 sm:p-8 rounded-2xl shadow-sm text-left space-y-6"
          >
            <div className="border-b pb-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MapPin className="h-5.5 w-5.5 text-cyan-500" />
                Thông Tin Giao Hàng & Bệnh Viện
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Đầy đủ chứng từ CO, CQ và bàn giao kỹ thuật của chuyên viên ABT.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {/* Organization name */}
              <div className="sm:col-span-2 space-y-1">
                <label
                  htmlFor="input-org-name"
                  className="text-xs font-bold text-slate-700 dark:text-slate-350 block leading-tight"
                >
                  Tên Bệnh Viện / Viện Nghiên Cứu Co. / Phòng Lab{" "}
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                  <input
                    id="input-org-name"
                    required
                    type="text"
                    placeholder="Ví dụ: Bệnh viện Chợ Rẫy - Khoa Vi Sinh"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-sm placeholder-slate-400 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-cyan-550"
                  />
                </div>
                {errors.organization && (
                  <span className="text-[10px] text-red-550 block font-medium">
                    {errors.organization}
                  </span>
                )}
              </div>

              {/* Recipient Fullname */}
              <div className="space-y-1">
                <label
                  htmlFor="input-customer-name"
                  className="text-xs font-bold text-slate-700 dark:text-slate-350 block"
                >
                  Người Nhận Bàn Giao (Họ Tên){" "}
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                  <input
                    id="input-customer-name"
                    required
                    type="text"
                    placeholder="Ví dụ: PGS.TS Trần Văn A"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-sm placeholder-slate-400 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-cyan-550"
                  />
                </div>
                {errors.customerName && (
                  <span className="text-[10px] text-red-500 block">
                    {errors.customerName}
                  </span>
                )}
              </div>

              {/* SĐT */}
              <div className="space-y-1">
                <label
                  htmlFor="input-customer-phone"
                  className="text-xs font-bold text-slate-700 dark:text-slate-350 block"
                >
                  Số Điện Thoại Trưởng Lab/Khoa{" "}
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                  <input
                    id="input-customer-phone"
                    required
                    type="tel"
                    placeholder="Ví dụ: 0901234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-sm placeholder-slate-400 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-cyan-550"
                  />
                </div>
                {errors.phone && (
                  <span className="text-[10px] text-red-500 block">
                    {errors.phone}
                  </span>
                )}
              </div>

              {/* Email */}
              <div className="sm:col-span-2 space-y-1">
                <label
                  htmlFor="input-customer-email"
                  className="text-xs font-bold text-slate-700 dark:text-slate-350 block"
                >
                  Email Nhận Hồ Sơ / Hóa Đơn Khai Thuế{" "}
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                  <input
                    id="input-customer-email"
                    required
                    type="email"
                    placeholder="Ví dụ: lab-contact@choray.org.vn"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-sm placeholder-slate-400 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-cyan-550"
                  />
                </div>
                {errors.email && (
                  <span className="text-[10px] text-red-500 block">
                    {errors.email}
                  </span>
                )}
              </div>

              {/* Address delivery detail */}
              <div className="sm:col-span-2 space-y-1">
                <label
                  htmlFor="input-delivery-address"
                  className="text-xs font-bold text-slate-700 dark:text-slate-350 block"
                >
                  Địa Chỉ Giao Máy & Lắp Đặt{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  id="input-delivery-address"
                  required
                  type="text"
                  placeholder="Ghi rõ số phòng, số tầng tòa nhà, địa chỉ chính xác"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-sm placeholder-slate-400 text-slate-800 dark:text-slate-100 focus:outline-none"
                />
                {errors.address && (
                  <span className="text-[10px] text-red-500 block">
                    {errors.address}
                  </span>
                )}
              </div>

              {/* Notes */}
              <div className="sm:col-span-2 space-y-1">
                <label
                  htmlFor="input-order-notes"
                  className="text-xs font-bold text-slate-700 dark:text-slate-350 block"
                >
                  Ghi chú bàn giao kỹ thuật đặc biệt (Ví dụ giờ mở cửa Lab, quy
                  chuẩn phòng sạch)
                </label>
                <textarea
                  id="input-order-notes"
                  rows={2}
                  placeholder="Hỗ trợ lắp đặt phòng sạch, cung cấp chứng từ CO/CQ trước khi xe tải tới..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-sm placeholder-slate-400 text-slate-800 dark:text-slate-100 focus:outline-none"
                />
              </div>
            </div>

            {/* 4. PAYMENT METHOD IN-FORM SELECTOR */}
            <div className="pt-6 border-t space-y-4">
              <h3 className="text-sm font-bold text-slate-950 dark:text-slate-100">
                Chọn 1 trong 2 Phương thức thanh toán ủy quyền:
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {/* PayOS trigger */}
                <div
                  id="select-payos-option"
                  onClick={() => setPaymentMethod("payos")}
                  className={`border p-4 rounded-xl cursor-pointer select-none relative transition duration-200 flex items-start gap-4 ${
                    paymentMethod === "payos"
                      ? "border-cyan-500 bg-cyan-950/20 shadow-sm"
                      : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100"
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg bg-cyan-100 dark:bg-cyan-950 border border-cyan-200 dark:border-cyan-800 flex items-center justify-center shrink-0">
                    <CloudLightning className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <div>
                    <span className="font-bold text-sm block text-slate-900 dark:text-slate-200">
                      Cổng Chuyển Khoản PayOS
                    </span>
                    <p className="text-[11px] text-slate-500 leading-tight mt-1">
                      Sử dụng tài khoản ngân hàng Việt Nam quét mã QR VietQR tốc
                      độ cao. Cập nhật trạng thái chuyển tiền tự động 1 giây.
                    </p>
                  </div>
                  {paymentMethod === "payos" && (
                    <span className="absolute top-2.5 right-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-cyan-600 text-[10px] font-bold text-slate-950">
                      ✓
                    </span>
                  )}
                </div>

                {/* PayPal trigger */}
                <div
                  id="select-paypal-option"
                  onClick={() => setPaymentMethod("paypal")}
                  className={`border p-4 rounded-xl cursor-pointer select-none relative transition duration-200 flex items-start gap-4 ${
                    paymentMethod === "paypal"
                      ? "border-indigo-500 bg-indigo-950/20 shadow-sm"
                      : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100"
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center shrink-0">
                    <Globe className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <span className="font-bold text-sm block text-slate-900 dark:text-slate-200">
                      Ví Điện Tử PayPal
                    </span>
                    <p className="text-[11px] text-slate-500 leading-tight mt-1">
                      Thanh toán quốc tế bảo mật bằng số dư PayPal hoặc thẻ tín
                      dụng VISA/MasterCard. Đồng bảo chứng đô la Mỹ (USD).
                    </p>
                  </div>
                  {paymentMethod === "paypal" && (
                    <span className="absolute top-2.5 right-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
                      ✓
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Confirm submit */}
            <div className="pt-4 border-t flex justify-end">
              <button
                id="summit-payment-form-btn"
                type="submit"
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-550 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 font-bold text-sm text-white shadow-lg"
              >
                Xác nhận Lập đơn & Tiến hành trả tiền
              </button>
            </div>
          </form>

          {/* Right side: Receipt Overview specs */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4 text-slate-250 text-slate-200">
              <h3 className="font-bold text-sm text-white uppercase tracking-widest border-b border-slate-800 pb-3 block">
                Chi tiết đơn bâng
              </h3>

              <div className="divide-y divide-slate-850 max-h-56 overflow-y-auto pr-2 space-y-3">
                {cartItems.map((item) => (
                  <div
                    key={item.product.id}
                    className="pt-3 flex justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <span className="font-bold text-white block line-clamp-1">
                        {item.product.name}
                      </span>
                      <p className="text-[10px] text-slate-400 font-mono">
                        SL: {item.quantity} x{" "}
                        {item.product.price.toLocaleString("vi-VN")} đ
                      </p>
                    </div>
                    <span className="font-bold text-cyan-400 font-mono shrink-0">
                      {(item.product.price * item.quantity).toLocaleString(
                        "vi-VN",
                      )}{" "}
                      đ
                    </span>
                  </div>
                ))}
              </div>

              {/* Calcs */}
              <div className="pt-4 border-t border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span>Cộng gộp máy móc:</span>
                  <span className="font-semibold font-mono">
                    {subtotal.toLocaleString("vi-VN")} đ
                  </span>
                </div>
                {discountRate > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Áp dụng voucher ưu đãi:</span>
                    <span className="font-semibold font-mono">
                      -{discountAmount.toLocaleString("vi-VN")} đ
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Phí chuyên chở thiết bị:</span>
                  <span className="font-semibold">
                    {shippingFee === 0
                      ? "MIỄN PHÍ"
                      : `${shippingFee.toLocaleString("vi-VN")} đ`}
                  </span>
                </div>

                <div className="border-t border-slate-800 pt-3.5 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-white">
                    Tổng cộng cần thanh toán:
                  </span>
                  <span className="text-xl font-extrabold text-cyan-400 font-mono">
                    {total.toLocaleString("vi-VN")} đ
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-start gap-2 text-xs text-slate-400">
              <ShieldCheck className="h-5 w-5 text-teal-400 shrink-0" />
              <span>
                Cổng bảo mật SSL 256-bit được mã hóa. Mọi dữ liệu về tài chính
                của Bệnh viện được đảm bảo bí mật tuyệt đối theo Công ước lưu
                trữ y khoa Việt Nam.
              </span>
            </div>
          </div>
        </div>
      )}

      {gatewayStatus === "payos_screen" && (
        <div className="max-w-3xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl text-slate-200">
          <div className="bg-gradient-to-r from-cyan-900 via-sky-800 to-slate-900 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-cyan-800/10">
            <div className="flex items-center gap-3">
              <CloudLightning className="h-8 w-8 text-cyan-400 animate-pulse" />
              <div className="text-left">
                <span className="text-xs uppercase font-bold tracking-widest text-cyan-400 font-mono">
                  Cổng thanh toán PayOS
                </span>
                <h2 className="text-lg font-black text-white font-sans">
                  Quét mã QR để thanh toán
                </h2>
              </div>
            </div>

            <div className="bg-cyan-500/10 border border-cyan-400/50 px-3 py-1.5 rounded-xl font-mono text-xs text-cyan-400">
              ĐƠN HÀNG: {generatedOrderId}
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6 text-left">
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-300">
              Thời gian giữ QR: {formatTime(countdown)} • Hệ thống sẽ tự động
              xác nhận khi giao dịch được thanh toán.
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 flex flex-col md:flex-row gap-6 items-center justify-center">
              {payosQr ? (
                <img
                  src={payosQr}
                  alt="Mã QR PayOS"
                  className="w-60 h-60 rounded-2xl border border-slate-800 bg-white p-3 object-contain"
                />
              ) : (
                <div className="w-60 h-60 rounded-2xl border border-dashed border-slate-700 flex items-center justify-center text-sm text-slate-400">
                  QR đã hết hạn hoặc chưa được tạo.
                </div>
              )}

              <div className="space-y-4 max-w-md">
                <div className="rounded-2xl bg-slate-900 p-4">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-cyan-400">
                    Tổng tiền
                  </div>
                  <div className="text-xl font-bold mt-1 text-white">
                    {total.toLocaleString("vi-VN")} đ
                  </div>
                </div>

                <div className="text-sm text-slate-400 leading-relaxed">
                  Mở ứng dụng ngân hàng, quét mã QR bên trái và xác nhận giao
                  dịch. Hệ thống sẽ tự cập nhật trạng thái đơn hàng khi thanh
                  toán thành công.
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => copyToClipboard(generatedOrderId)}
                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-800"
                  >
                    <Copy className="h-4 w-4" />
                    {isCopied ? "Đã copy" : "Copy mã đơn"}
                  </button>
                  <button
                    onClick={() => {
                      clearTimers();
                      setGatewayStatus("form");
                    }}
                    className="rounded-2xl border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-800"
                  >
                    Quay lại
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. PORTAL_SIMULATOR PRE-PAGE: PayPal Gateway Sandbox Screen */}
      {gatewayStatus === "paypal_screen" && (
        <div className="max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl text-slate-200">
          <div className="bg-indigo-950 p-6 flex items-center justify-between border-b border-indigo-800/10 text-left">
            <div className="flex items-center gap-3">
              <Globe className="h-8 w-8 text-indigo-400" />
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400 font-mono">
                  PayPal Secure Sandbox Gateway
                </span>
                <h2 className="text-base font-black text-white">
                  INTERACTIVE PAYPAL CHECKOUT
                </h2>
              </div>
            </div>

            <div className="text-right text-xs bg-indigo-900/40 px-2.5 py-1 rounded-lg text-indigo-300 font-mono">
              USD Equivalent: ${(total / 25000).toFixed(2)}
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6 text-left">
            {/* Fast login simulation fields */}
            <div className="p-5 bg-slate-950 rounded-2xl border border-slate-850 space-y-4">
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-indigo-400 border-b border-slate-850 pb-2">
                LỰA CHỌN 1: Đăng nhập ví PayPal Sandbox
              </h3>

              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 block font-mono">
                    Email tài khoản kiểm thử:
                  </span>
                  <input
                    id="paypal-email-input"
                    type="email"
                    placeholder="sb-abt-buyer@personal.example.com"
                    value={paypalEmail}
                    onChange={(e) => setPaypalEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs placeholder-slate-505 text-white outline-none focus:border-indigo-505 focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 block font-mono">
                    Mật khẩu:
                  </span>
                  <input
                    id="paypal-pwd-input"
                    type="password"
                    placeholder="••••••••"
                    value={paypalPassword}
                    onChange={(e) => setPaypalPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs placeholder-slate-505 text-white outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Credit Card layout simulation */}
            <div className="p-5 bg-slate-950 rounded-2xl border border-slate-850 space-y-4">
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-indigo-400 border-b border-slate-850 pb-2">
                LỰA CHỌN 2: Điền thông số thẻ VISA/MasterCard trực tiếp
              </h3>

              <div className="space-y-3">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 block font-mono">
                    Số thẻ tín dụng ảo:
                  </span>
                  <input
                    id="paypal-card-no"
                    type="text"
                    maxLength={19}
                    placeholder="4242 •••• •••• 4242"
                    value={paypalCardNo}
                    onChange={(e) => setPaypalCardNo(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs placeholder-slate-505 text-white outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 block font-mono">
                      Ngày hết hạn (MM/YY):
                    </span>
                    <input
                      id="paypal-card-exp"
                      type="text"
                      maxLength={5}
                      placeholder="12/28"
                      value={paypalCardExp}
                      onChange={(e) => setPaypalCardExp(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs placeholder-slate-505 text-white outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 block font-mono">
                      CVC/CVV:
                    </span>
                    <input
                      id="paypal-card-cvv"
                      type="password"
                      maxLength={3}
                      placeholder="382"
                      value={paypalCardCvv}
                      onChange={(e) => setPaypalCardCvv(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs placeholder-slate-505 text-white outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-850 text-[10px] text-slate-400 leading-tight">
              Mã phân phối y sinh được tích hợp an toàn. Sandbox này mô phỏng
              luồng API Paypal v2, gửi trả thông báo hoàn tất giao dịch tự động
              sau khi được phê chuẩn.
            </div>
          </div>

          <div className="p-6 bg-slate-950 border-t border-slate-850 flex flex-col sm:flex-row justify-between items-center gap-4">
            <button
              id="paypal-simulate-fail-btn"
              onClick={() => handleSimulateSuccessfulPayment(false)}
              className="w-full sm:w-auto px-4 py-2.5 text-xs text-slate-400 hover:text-red-400 transition"
            >
              Hủy bỏ, thanh toán sau
            </button>
            <button
              id="paypal-simulate-success-btn"
              onClick={() => handleSimulateSuccessfulPayment(true)}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/20"
            >
              <CheckCircle2 className="h-4.5 w-4.5 animate-pulse" />
              Phê chuẩn thanh toán PayPal $ {(total / 25000).toFixed(2)}
            </button>
          </div>
        </div>
      )}

      {/* 7. CHEERFUL SUCCESS SCREEN */}
      {gatewayStatus === "success" && (
        <div className="max-w-xl mx-auto bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-3xl text-center space-y-6 shadow-2xl">
          <div className="mx-auto w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950 border border-emerald-100 flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              Lập Đơn Thành Công!
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-405 max-w-sm mx-auto leading-relaxed">
              Hệ thống xử lý đơn hàng ABT đã khởi tạo mã đơn của bạn:{" "}
              <span className="font-bold text-cyan-600 font-mono">
                {generatedOrderId}
              </span>
              . Email bàn giao chi tiết đã được gửi tới hòm thư của bạn.
            </p>
          </div>

          {/* Quick receipt statistics */}
          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-85 transition leading-snug space-y-2.5 text-xs text-slate-600 dark:text-slate-350 select-none text-left">
            <div className="flex justify-between">
              <span>Mã đơn:</span>
              <span className="font-bold text-slate-900 dark:text-slate-100 font-mono">
                {generatedOrderId}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Đơn vị:</span>
              <span className="font-bold text-slate-900 dark:text-slate-100 text-right">
                {organization}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Người thụ hưởng:</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">
                {customerName}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Tổng số tiền:</span>
              <span className="font-extrabold text-teal-600 font-mono">
                {total.toLocaleString("vi-VN")} đ
              </span>
            </div>
          </div>

          <div className="pt-4 border-t flex flex-wrap gap-3">
            <button
              id="success-back-to-products"
              onClick={() => onNavigateToTab("products")}
              className="flex-1 py-3 border border-slate-200 dark:border-slate-805 rounded-xl text-xs font-semibold hover:bg-slate-50 text-slate-700 dark:text-slate-300"
            >
              Tiếp tục mua hàng
            </button>
            <button
              id="success-go-to-orders"
              onClick={() => onNavigateToTab("orders")}
              className="flex-1 py-3 bg-gradient-to-r from-cyan-650 via-cyan-600 to-teal-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5"
            >
              <ShoppingBag className="h-4 w-4" />
              Kiểm tra đơn hàng của tôi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
