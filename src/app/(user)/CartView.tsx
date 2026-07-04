import React, { useState } from 'react';
import { CartItem } from '../../types';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, ShieldCheck, Ticket, RotateCcw, AlertCircle } from 'lucide-react';

interface CartViewProps {
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onNavigateToTab: (tab: 'products' | 'checkout') => void;
  discountRate: number;
  onApplyPromoCode: (rate: number, code: string) => void;
}

export default function CartView({
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onNavigateToTab,
  discountRate,
  onApplyPromoCode
}: CartViewProps) {
  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');

  // Calculations
  const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const discountAmount = subtotal * discountRate;
  const shippingFee = subtotal > 100000000 ? 0 : 500000; // Free shipping above 100M VND
  const total = subtotal - discountAmount + shippingFee;

  const handleApplyPromo = () => {
    setPromoError('');
    setPromoSuccess('');
    const code = promoInput.trim().toUpperCase();

    if (code === 'ABT10') {
      onApplyPromoCode(0.1, 'ABT10'); // 10% discount
      setPromoSuccess('Áp dụng thành công mã giảm 10% đối với thiết bị y tế ABT!');
    } else if (code === 'BIOLAB') {
      onApplyPromoCode(0.15, 'BIOLAB'); // 15% discount for academic laboratory
      setPromoSuccess('Kích hoạt mã ưu đãi 15% dành cho Phòng nghiên cứu học thuật!');
    } else if (code === '') {
      setPromoError('Vui lòng nhập mã ưu đãi.');
    } else {
      setPromoError('Mã ưu đãi không chính xác hoặc đã hết hạn.');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center space-y-6">
        <div className="mx-auto w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-205 dark:border-slate-800 flex items-center justify-center text-slate-400">
          <ShoppingCart className="h-8 w-8 text-slate-300" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Giỏ Hàng Chưa Có Thiết Bị</h2>
          <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
            Vui lòng tham khảo danh mục sản phẩm y sinh của chúng tôi và lựa chọn thiết bị chẩn đoán phù hợp.
          </p>
        </div>
        <button
          id="back-to-products-btn"
          onClick={() => onNavigateToTab('products')}
          className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white font-bold rounded-xl text-xs transition shadow-md"
        >
          Xem danh mục sản phẩm ngay
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 space-y-8">
      {/* Title */}
      <div className="text-left space-y-2 border-b pb-4">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Giỏ Hàng Thiết Bị</h1>
        <p className="text-xs text-slate-505 text-slate-500 font-mono">Bảng báo giá dự kiến & Kiểm tra thông số thanh toán</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Table of Items */}
        <div className="lg:col-span-8 space-y-4">
          <div className="overflow-hidden bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-2xl shadow-sm">
            {/* Header row desktop */}
            <div className="hidden sm:grid grid-cols-12 gap-4 p-4 bg-slate-50 dark:bg-slate-850/50 text-slate-500 text-xs font-mono font-bold border-b">
              <span className="col-span-6 text-left">THIẾT BỊ Y SINH ABT</span>
              <span className="col-span-2 text-center">ĐƠN GIÁ</span>
              <span className="col-span-2 text-center">SỐ LƯỢNG</span>
              <span className="col-span-2 text-right">TẠM TÍNH</span>
            </div>

            {/* List items */}
            <div className="divide-y divide-slate-100 dark:divide-slate-850">
              {cartItems.map((item) => (
                <div key={item.product.id} className="grid sm:grid-cols-12 gap-4 p-4 sm:items-center text-left">
                  
                  {/* Photo & Name */}
                  <div className="col-span-12 sm:col-span-6 flex gap-3.5 items-center">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      referrerPolicy="no-referrer"
                      className="w-16 h-12 object-cover rounded-lg border dark:border-slate-800 shrink-0 bg-slate-950"
                    />
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 font-mono block leading-none">{item.product.id} • {item.product.category}</span>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100 leading-snug line-clamp-2">
                        {item.product.name}
                      </h4>
                      <button
                        id={`remove-item-${item.product.id}`}
                        onClick={() => onRemoveItem(item.product.id)}
                        className="text-[10px] font-semibold text-red-500 hover:text-red-600 flex items-center gap-1.5 pt-0.5"
                      >
                        <Trash2 className="h-3 w-3" />
                        Xóa khỏi giỏ
                      </button>
                    </div>
                  </div>

                  {/* Pricing mobile view is hidden in desktop */}
                  <div className="col-span-12 sm:col-span-2 text-left sm:text-center mt-2 sm:mt-0">
                    <span className="text-xs text-slate-400 sm:hidden block font-mono">Đơn giá:</span>
                    <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {item.product.price.toLocaleString("vi-VN")} đ
                    </span>
                  </div>

                  {/* Quantity adjustment */}
                  <div className="col-span-12 sm:col-span-2 flex justify-start sm:justify-center items-center mt-1 sm:mt-0">
                    <div className="flex items-center bg-slate-50 dark:bg-slate-950 p-1 rounded-xl border border-slate-205 dark:border-slate-850">
                      <button
                        id={`dec-qty-${item.product.id}`}
                        onClick={() => onUpdateQuantity(item.product.id, -1)}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="px-3 text-xs font-bold text-slate-800 dark:text-slate-100 font-mono">
                        {item.quantity}
                      </span>
                      <button
                        id={`inc-qty-${item.product.id}`}
                        onClick={() => onUpdateQuantity(item.product.id, 1)}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200"
                        disabled={item.quantity >= item.product.stock}
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  {/* Item Total */}
                  <div className="col-span-12 sm:col-span-2 text-left sm:text-right mt-1 sm:mt-0">
                    <span className="text-xs text-slate-400 sm:hidden block font-mono">Tạm tính:</span>
                    <span className="text-xs sm:text-sm font-extrabold text-teal-600 dark:text-teal-400 font-mono">
                      {(item.product.price * item.quantity).toLocaleString("vi-VN")} đ
                    </span>
                  </div>

                </div>
              ))}
            </div>

            {/* Clear Cart panel footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border-t flex flex-wrap justify-between items-center gap-4">
              <button
                id="continue-shopping-btn"
                onClick={() => onNavigateToTab('products')}
                className="text-xs font-bold text-cyan-600 dark:text-cyan-400 flex items-center gap-1 hover:underline"
              >
                <RotateCcw className="h-4 w-4" />
                Tiếp tục thêm thiết bị khác
              </button>
              <button
                id="clear-all-cart-btn"
                onClick={onClearCart}
                className="text-xs font-semibold text-slate-400 hover:text-red-500 hover:underline"
              >
                Xóa sạch giỏ hàng ({cartItems.length})
              </button>
            </div>

          </div>

          {/* Secure warranty banner snippet */}
          <div className="p-4 rounded-xl bg-cyan-950/10 border border-cyan-800/10 text-slate-600 dark:text-slate-350 text-xs flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-cyan-500 shrink-0 mt-0.5 animate-pulse" />
            <div className="space-y-1">
              <span className="font-bold text-slate-800 dark:text-slate-200 block">Cam kết chính sách ủy quyền từ ABT Corp:</span>
              <p className="leading-relaxed">100% linh kiện thay thế chuẩn CO/CQ gốc. Chuyên viên y sinh bảo dưỡng tận nơi nhanh chóng trong vòng 8-24 tiếng sau khi nhận thông báo sự cố kỹ thuật.</p>
            </div>
          </div>
        </div>

        {/* Right: Order Summary Calculations */}
        <div className="lg:col-span-4 space-y-6 text-left">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-6 rounded-2xl shadow-sm space-y-6">
            <h3 className="font-bold text-base text-slate-900 dark:text-white border-b pb-3">Chi tiết giá thành</h3>
            
            <div className="space-y-3.5 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex justify-between">
                <span>Tổng giá thiết bị:</span>
                <span className="font-semibold text-slate-850 dark:text-slate-200 font-mono">{subtotal.toLocaleString("vi-VN")} đ</span>
              </div>

              {discountRate > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                  <span>Khấu trừ voucher ưu đãi:</span>
                  <span className="font-mono">-{discountAmount.toLocaleString("vi-VN")} đ</span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span>Phí vận chuyển hỗ trợ:</span>
                <span className="font-semibold font-mono">
                  {shippingFee === 0 ? "MIỄN PHÍ" : `${shippingFee.toLocaleString("vi-VN")} đ`}
                </span>
              </div>

              {shippingFee > 0 && (
                <p className="text-[10px] text-slate-400 leading-tight">Mẹo: Đơn hàng thiết bị y sinh trên 100 Triệu đ sẽ được ABT miễn phí vận chuyển & hỗ trợ lắp đặt phòng thí nghiệm.</p>
              )}

              <div className="border-t pt-4 flex justify-between items-baseline">
                <span className="text-sm font-bold text-slate-800 dark:text-white">Thành tiền dự kiến:</span>
                <span className="text-xl font-black text-teal-615 text-teal-600 dark:text-teal-400 font-mono">
                  {total.toLocaleString("vi-VN")} đ
                </span>
              </div>
            </div>

            {/* PROMO INLET */}
            <div className="pt-4 border-t space-y-2.5">
              <div className="flex items-center gap-2">
                <Ticket className="h-4 w-4 text-cyan-400" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-300">Nhập mã giảm giá (Mã BTL)</span>
              </div>
              <div className="flex gap-2">
                <input
                  id="promo-input"
                  type="text"
                  placeholder="Ví dụ: ABT10, BIOLAB"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-xs placeholder-slate-400 focus:outline-none focus:border-cyan-500 uppercase font-mono text-slate-800 dark:text-slate-100"
                />
                <button
                  id="apply-promo-btn"
                  onClick={handleApplyPromo}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white rounded-lg transition"
                >
                  Áp dụng
                </button>
              </div>

              {promoSuccess && (
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 leading-relaxed font-sans">{promoSuccess}</p>
              )}
              {promoError && (
                <p className="text-[10px] text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3 shrink-0" />{promoError}</p>
              )}
            </div>

            {/* Checkout Action Button */}
            <button
              id="proceed-checkout-btn"
              onClick={() => onNavigateToTab('checkout')}
              className="w-full py-4.5 py-3.5 bg-gradient-to-r from-teal-500 to-cyan-550 bg-gradient-to-r from-cyan-600 to-teal-650 hover:from-cyan-700 hover:to-teal-700 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg transition-transform hover:-translate-y-0.5 duration-200 cursor-pointer"
            >
              Tiến hành Lập đơn hàng
              <ArrowRight className="h-4.5 w-4.5" />
            </button>

          </div>
        </div>

      </div>

    </div>
  );
}
