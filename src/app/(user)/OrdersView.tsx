import React, { useState } from 'react';
import { Order, OrderStatus } from '../../types';
import { 
  ShoppingBag, 
  Clock, 
  CheckCircle2, 
  Truck, 
  XOctagon, 
  AlertTriangle, 
  Receipt, 
  ArrowRight, 
  Sparkles, 
  HelpCircle,
  Activity,
  FileText
} from 'lucide-react';

interface OrdersViewProps {
  orders: Order[];
  onCancelOrder: (orderId: string) => void;
  onNavigateToTab: (tab: 'products' | 'home') => void;
}

export default function OrdersView({
  orders,
  onCancelOrder,
  onNavigateToTab
}: OrdersViewProps) {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const getStatusLabelAndColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending_payment':
        return { label: 'Chờ thanh toán qua mã QR/PayPal', color: 'bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-500/20', icon: Clock };
      case 'paid':
        return { label: 'Đã thanh toán (Chờ xác nhận)', color: 'bg-teal-100 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 border border-teal-500/20', icon: CheckCircle2 };
      case 'shipping':
        return { label: 'Đang vận chuyển & Lắp đặt', color: 'bg-sky-100 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 border border-sky-500/20', icon: Truck };
      case 'completed':
        return { label: 'Đã bàn giao SOP nghiệm thu thành công', color: 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20', icon: CheckCircle2 };
      case 'cancelled':
        return { label: 'Đã hủy đơn hàng y sinh', color: 'bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-500/20', icon: XOctagon };
      default:
        return { label: 'Đang xử lý', color: 'bg-slate-100 dark:bg-slate-900 text-slate-600 border border-slate-200', icon: Clock };
    }
  };

  const getTimelineSteps = (status: OrderStatus) => {
    const steps = [
      { id: 'pending_payment', label: 'Khởi tạo & Đợi tiền' },
      { id: 'paid', label: 'Đã thanh toán' },
      { id: 'shipping', label: 'Lắp đặt & Di chuyển' },
      { id: 'completed', label: 'Bàn giao nghiệm thu' }
    ];

    let activeIndex = 0;
    if (status === 'paid') activeIndex = 1;
    if (status === 'shipping') activeIndex = 2;
    if (status === 'completed') activeIndex = 3;
    if (status === 'cancelled') activeIndex = -1;

    return { steps, activeIndex };
  };

  if (orders.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center space-y-6">
        <div className="mx-auto w-16 h-16 rounded-full bg-slate-105 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 flex items-center justify-center">
          <ShoppingBag className="h-8 w-8 text-slate-400" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Bạn Chưa Có Đơn Hàng Nào</h2>
          <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
            Hệ thống đại lý ABT Corp chưa ghi nhận đơn mua sắm thiết bị y sinh hay vật tư lab nào thuộc email của bạn.
          </p>
        </div>
        <button
          id="orders-browse-now-btn"
          onClick={() => onNavigateToTab('products')}
          className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 text-white font-bold rounded-xl text-xs shadow-md"
        >
          Tham khảo danh mục sản phẩm của ABT
        </button>
      </div>
    );
  }

  const selectedOrder = orders.find(o => o.id === selectedOrderId) || null;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 space-y-8">
      {/* Page Header */}
      <div className="text-left space-y-2 border-b pb-4">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Đơn Hàng Của Tôi</h1>
        <p className="text-xs text-slate-500 font-mono">Quản lý trạng thái, tải hóa đơn VAT & tiến trình lắp đặt máy sinh học</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Order Listing Grid Cards */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="text-sm font-bold text-slate-500 text-left font-mono uppercase tracking-wide">Danh sách đơn hàng ({orders.length})</h3>
          
          <div className="space-y-4">
            {orders.map((order) => {
              const statusMeta = getStatusLabelAndColor(order.status);
              const StatusIcon = statusMeta.icon;
              const isSelected = order.id === selectedOrderId;

              return (
                <div
                  id={`order-row-card-${order.id}`}
                  key={order.id}
                  onClick={() => setSelectedOrderId(order.id)}
                  className={`p-5 rounded-2xl border text-left cursor-pointer transition duration-200 bg-white dark:bg-slate-900 ${
                    isSelected
                      ? 'border-cyan-500 ring-1 ring-cyan-500/20 shadow-md'
                      : 'border-slate-150 dark:border-slate-850 hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-850">
                    <div>
                      <span className="font-mono text-sm font-black text-slate-850 dark:text-slate-100 block">{order.id}</span>
                      <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">Ngày đặt: {new Date(order.date).toLocaleDateString("vi-VN")} {new Date(order.date).toLocaleTimeString("vi-VN", {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>

                    <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg ${statusMeta.color} flex items-center gap-1 shrink-0`}>
                      <StatusIcon className="h-3.5 w-3.5" />
                      {statusMeta.label}
                    </span>
                  </div>

                  <div className="pt-3 flex flex-col sm:flex-row justify-between sm:items-center gap-4 text-xs">
                    <div className="space-y-1">
                      <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs truncate max-w-sm">{order.organization}</span>
                      <p className="text-slate-500 text-[11px] line-clamp-1">Mẫu mua: {order.items.map(item => `${item.product.name} (x${item.quantity})`).join(", ")}</p>
                    </div>

                    <div className="text-left sm:text-right shrink-0">
                      <span className="text-[10px] text-slate-400 block font-mono">Dự kiến thanh toán:</span>
                      <span className="text-base font-black text-teal-615 text-teal-600 dark:text-teal-400 font-mono">
                        {order.total.toLocaleString("vi-VN")} đ
                      </span>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: High precision progress & surgical specs invoice */}
        <div className="lg:col-span-5 text-left">
          {selectedOrder ? (
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl text-slate-150 text-slate-300 space-y-6">
              
              {/* Header Title with print copy simulation */}
              <div className="border-b border-slate-800 pb-4 flex justify-between items-start gap-4">
                <div>
                  <span className="text-[10px] text-cyan-400 font-mono uppercase tracking-widest block font-bold">CHI TIẾT VẬN ĐƠN ABT</span>
                  <h3 className="text-base font-black text-white font-mono mt-1">{selectedOrder.id}</h3>
                </div>
                <button
                  id="print-invoice-btn-mock"
                  onClick={() => alert(`Mô phỏng: Đang tải hóa đơn thuế VAT cho đơn hàng ${selectedOrder.id}`)}
                  className="px-2.5 py-1 rounded bg-slate-950 hover:bg-slate-850 hover:text-white border border-slate-800 text-[10px] font-mono flex items-center gap-1.5"
                >
                  <Receipt className="h-3.5 w-3.5" /> VAT PDF
                </button>
              </div>

              {/* TIMELINE INDICATOR GRID */}
              {selectedOrder.status !== 'cancelled' ? (
                <div className="space-y-3 p-3.5 bg-slate-950/55 rounded-2xl border border-slate-850">
                  <h4 className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider block">Tiến trình bàn giao lắp đặt:</h4>
                  
                  {/* Timeline Node items */}
                  <div className="space-y-4 pt-2">
                    {getTimelineSteps(selectedOrder.status).steps.map((st, sIdx) => {
                      const isActive = sIdx <= getTimelineSteps(selectedOrder.status).activeIndex;
                      const isCurrent = sIdx === getTimelineSteps(selectedOrder.status).activeIndex;

                      return (
                        <div key={st.id} className="flex gap-3 items-start relative select-none">
                          {/* Left bullet dot */}
                          <div className="flex flex-col items-center">
                            <div className={`h-5.5 w-5.5 h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0 text-[10px] font-bold ${
                              isCurrent 
                                ? 'bg-cyan-500 text-slate-950 border-cyan-400 scale-110 animate-pulse'
                                : isActive 
                                  ? 'bg-teal-950 text-teal-400 border-teal-500'
                                  : 'bg-slate-900 text-slate-500 border-slate-800'
                            }`}>
                              {sIdx + 1}
                            </div>
                            {sIdx < 3 && (
                              <div className={`w-0.5 h-6 ${isActive ? 'bg-teal-500' : 'bg-slate-800'}`} />
                            )}
                          </div>

                          {/* Node Description Text */}
                          <div className="pt-0.5">
                            <span className={`text-xs font-bold block ${isActive ? 'text-white' : 'text-slate-500'}`}>{st.label}</span>
                            {isCurrent && (
                              <span className="text-[9px] text-cyan-400 font-mono font-bold uppercase tracking-wider">Trạng thái hiện thời • Kỹ sư ABT đang khớp</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                </div>
              ) : (
                <div className="p-3.5 bg-red-950/20 rounded-2xl border border-red-900/30 text-xs text-red-400 flex items-start gap-2">
                  <AlertTriangle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                  <span>Đơn y sinh này đã được phía khách hàng hủy. Vui lòng liên hệ Hotline ABT 1900-9899 nếu đây là sự nhầm lẫn ngoài ý muốn.</span>
                </div>
              )}

              {/* Institution and Customer information */}
              <div className="space-y-3 text-xs bg-slate-950/40 p-4 rounded-2xl border border-slate-850/60">
                <h4 className="text-[10px] text-slate-400 font-mono uppercase tracking-wider font-bold">Thụ nhận & Bàn giao:</h4>
                <div className="space-y-2">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Đơn vị yêu cầu máy:</span>
                    <span className="font-bold text-white text-xs">{selectedOrder.organization}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Người nhận bàn giao:</span>
                    <span className="font-semibold text-slate-350">{selectedOrder.customerName} | SĐT: {selectedOrder.phone}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Địa chỉ thực tế:</span>
                    <span className="text-slate-400 leading-normal block">{selectedOrder.address}</span>
                  </div>
                  {selectedOrder.notes && (
                    <div className="p-2 bg-slate-900 rounded-lg border border-slate-800 text-[11px] text-slate-400">
                      Ghi chú: {selectedOrder.notes}
                    </div>
                  )}
                </div>
              </div>

              {/* Item lists and cancellation trigger */}
              <div className="space-y-3">
                <h4 className="text-[10px] text-slate-400 font-mono uppercase tracking-wider font-bold">Sản phẩm chi tiết:</h4>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, idX) => (
                    <div key={idX} className="flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-white block line-clamp-1">{item.product.name}</span>
                        <span className="text-[10px] text-slate-400">Đơn vị: {item.quantity} {item.product.unit} • Bảo hành ủy quyền 2 năm</span>
                      </div>
                      <span className="font-bold font-mono text-cyan-400">{(item.priceAtOrder * item.quantity).toLocaleString("vi-VN")} đ</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fee total cost */}
              <div className="pt-4 border-t border-slate-800 flex justify-between items-baseline">
                <span className="text-xs text-slate-400 font-semibold font-mono">TỔNG GIÁ TRỊ TOÀN ĐƠN:</span>
                <span className="text-lg font-black text-cyan-400 font-mono">
                  {selectedOrder.total.toLocaleString("vi-VN")} đ
                </span>
              </div>

              {/* Order Cancellation option */}
              {selectedOrder.status !== 'cancelled' && selectedOrder.status !== 'completed' && selectedOrder.status !== 'shipping' && (
                <div className="pt-3 border-t border-slate-800">
                  <button
                    id={`cancel-order-action-${selectedOrder.id}`}
                    onClick={() => {
                      if (confirm('Bạn có chắc chắn muốn hủy đơn hàng thiết bị y sinh ABT này không?')) {
                        onCancelOrder(selectedOrder.id);
                      }
                    }}
                    className="w-full py-2.5 rounded-xl border border-rose-900 hover:bg-rose-950/20 text-xs font-bold text-rose-400 transition"
                  >
                    Yêu cầu hủy đơn hàng này
                  </button>
                </div>
              )}

            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-850 p-8 rounded-3xl text-center space-y-4 text-slate-350">
              <span className="flex h-12 w-12 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-500 animate-bounce items-center justify-center mx-auto">
                <Activity className="h-6 w-6" />
              </span>
              <p className="text-sm text-slate-600 dark:text-slate-400">Vui lòng nhấp chọn một đơn hàng cụ thể ở danh sách bên trái để kiểm tra trực tiếp mã vận đơn, tiến trình xử lý lắp đặt máy và tải tài liệu kỹ thuật SOP tương ứng.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
