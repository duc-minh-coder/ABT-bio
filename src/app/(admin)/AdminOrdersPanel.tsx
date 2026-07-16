import React, { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Search,
  DollarSign,
  ShoppingBag,
  Clock,
  Truck,
  TrendingUp,
} from "lucide-react";
import { Order, OrderStatus } from "../../types";

interface AdminOrdersPanelProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
}

const getStatusBadgeClassAndLabel = (status: OrderStatus) => {
  switch (status) {
    case "pending_payment":
      return {
        label: "Chờ QR/Code PayOS",
        bg: "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-500/20",
      };
    case "paid":
      return {
        label: "Đã thanh toán",
        bg: "bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border-teal-500/20",
      };
    case "shipping":
      return {
        label: "Kỹ sư Đang lắp đặt",
        bg: "bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border-sky-500/20",
      };
    case "completed":
      return {
        label: "Nghiệm thu hoàn tất",
        bg: "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
      };
    case "cancelled":
      return {
        label: "Đơn đã hủy",
        bg: "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-500/20",
      };
    default:
      return { label: "N/A", bg: "bg-slate-100 text-slate-700" };
  }
};

export default function AdminOrdersPanel({
  orders,
  onUpdateOrderStatus,
}: AdminOrdersPanelProps) {
  const [orderQuery, setOrderQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | OrderStatus>("all");
  const [selectedAdminOrderId, setSelectedAdminOrderId] = useState<
    string | null
  >(null);

  const totalRevenue = orders
    .filter(
      (o) =>
        o.status === "paid" ||
        o.status === "shipping" ||
        o.status === "completed",
    )
    .reduce((sum, o) => sum + o.total, 0);
  const pendingOrdersCount = orders.filter(
    (o) => o.status === "pending_payment",
  ).length;
  const activeDeliveriesCount = orders.filter(
    (o) => o.status === "shipping",
  ).length;

  const categorySales = orders.reduce((acc, order) => {
    if (order.status === "cancelled") {
      return acc;
    }

    order.items.forEach((item) => {
      const categoryName = item.product.category || "Khác";
      const existingCat = acc.find((c) => c.name === categoryName);
      const revenue = item.priceAtOrder * item.quantity;
      const count = item.quantity;

      if (existingCat) {
        existingCat.revenue += revenue;
        existingCat.count += count;
      } else {
        acc.push({ name: categoryName, revenue, count });
      }
    });

    return acc;
  }, [] as { name: string; revenue: number; count: number }[]);

  const highestCatRevenue = Math.max(...categorySales.map((c) => c.revenue), 1);

  const filteredOrders = orders.filter((order) => {
    const matchStatus = filterStatus === "all" || order.status === filterStatus;
    const query = orderQuery.toLowerCase();
    const matchSearch =
      order.id.toLowerCase().includes(query) ||
      order.customerName.toLowerCase().includes(query) ||
      order.organization.toLowerCase().includes(query);
    return matchStatus && matchSearch;
  });

  const selectedAdminOrder =
    orders.find((o) => o.id === selectedAdminOrderId) || null;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900 flex items-center justify-center text-emerald-600">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase tracking-[0.15em] font-semibold">
              Doanh thu đã ghi nhận
            </span>
            <span className="text-base font-black text-slate-900 dark:text-white block">
              {totalRevenue.toLocaleString("vi-VN")}đ
            </span>
            <span className="text-[9px] text-emerald-600 block">
              Đơn đặt hàng thành công
            </span>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-100 dark:border-cyan-900/35 flex items-center justify-center text-cyan-600">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase tracking-[0.15em] font-semibold">
              Tổng đơn
            </span>
            <span className="text-base font-black text-slate-900 dark:text-white block">
              {orders.length} đơn
            </span>
            <span className="text-[9px] text-slate-400 block">
              Theo dõi và xử lý
            </span>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/35 border border-amber-100 dark:border-amber-900 flex items-center justify-center text-amber-600">
            <Clock className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase tracking-[0.15em] font-semibold">
              Đang chờ
            </span>
            <span className="text-base font-black text-slate-900 dark:text-white block">
              {pendingOrdersCount} đơn
            </span>
            <span className="text-[9px] text-amber-600 block">
              Chờ xác nhận VietQR
            </span>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/35 flex items-center justify-center text-sky-650">
            <Truck className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase tracking-[0.15em] font-semibold">
              Đang xử lý
            </span>
            <span className="text-base font-black text-slate-900 dark:text-white block">
              {activeDeliveriesCount} đơn
            </span>
            <span className="text-[9px] text-sky-600 block">
              Bàn giao kỹ sư
            </span>
          </div>
        </div>
      </div>

      <section className="bg-slate-950 border border-slate-850 p-5 rounded-3xl text-slate-200 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-cyan-300 mb-4">
          <TrendingUp className="h-4 w-4" />
          Biểu đồ doanh số theo danh mục
        </div>
        <div className="space-y-3">
          {categorySales.map((cat, idx) => {
            const percentage = Math.round(
              (cat.revenue / highestCatRevenue) * 100,
            );
            return (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-[11px] font-semibold text-slate-300">
                  <span>
                    {cat.name} ({cat.count} bộ)
                  </span>
                  <span className="text-cyan-300">
                    {cat.revenue.toLocaleString("vi-VN")} đ
                  </span>
                </div>
                <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-teal-400 h-full rounded-full"
                    style={{ width: `${Math.max(percentage, 5)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="grid lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 p-5 rounded-3xl shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 dark:border-slate-800 pb-4 mb-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase">
                Danh sách đơn hàng
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Tìm kiếm theo mã đơn, đơn vị hoặc người liên hệ.
              </p>
            </div>
            <div className="flex items-center gap-2 w-full lg:w-auto bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-2xl border border-slate-200 dark:border-slate-850">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={orderQuery}
                onChange={(e) => setOrderQuery(e.target.value)}
                placeholder="Tìm kiếm mã đơn, bệnh viện..."
                className="bg-transparent border-none outline-none text-[11px] text-slate-900 dark:text-slate-200 w-full"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
            {[
              "all",
              "pending_payment",
              "paid",
              "shipping",
              "completed",
              "cancelled",
            ].map((status) => {
              const label =
                status === "all"
                  ? "Tất cả"
                  : status === "pending_payment"
                    ? "Chờ QR"
                    : status === "paid"
                      ? "Đã thu"
                      : status === "shipping"
                        ? "Vận chuyển"
                        : status === "completed"
                          ? "Hoàn tất"
                          : "Đã hủy";
              return (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status as "all" | OrderStatus)}
                  className={`px-3 py-1 rounded-full text-[10px] font-semibold transition ${
                    filterStatus === status
                      ? "bg-rose-600 text-white border border-rose-500"
                      : "bg-slate-50 dark:bg-slate-950 text-slate-500 border border-slate-200 dark:border-slate-850 hover:bg-slate-100"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <div className="overflow-x-auto max-w-[80vw] md:max-w-none">
            <table className="w-full table-auto text-xs text-slate-700 dark:text-slate-300">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-850 text-[10px] uppercase text-slate-400">
                  <th className="py-3 px-3 text-left">Mã đơn</th>
                  <th className="py-3 px-3 text-left">Cơ sở</th>
                  <th className="py-3 px-3 text-right">Giá trị</th>
                  <th className="py-3 px-3 text-center">Trạng thái</th>
                  <th className="py-3 px-3 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-8 text-center text-slate-400 text-xs"
                    >
                      Không có đơn hàng phù hợp với điều kiện tìm kiếm.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                    const badge = getStatusBadgeClassAndLabel(order.status);
                    return (
                      <tr
                        key={order.id}
                        onClick={() => setSelectedAdminOrderId(order.id)}
                        className={`hover:bg-slate-50 dark:hover:bg-slate-950/50 cursor-pointer ${
                          order.id === selectedAdminOrderId
                            ? "bg-rose-500/10 dark:bg-rose-500/5"
                            : ""
                        }`}
                      >
                        <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-white">
                          {order.id}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-800 dark:text-slate-100">
                            {order.organization}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {order.customerName}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-slate-800 dark:text-white">
                          {order.total.toLocaleString("vi-VN")}đ
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`px-2 py-1 rounded-full text-[10px] font-semibold border ${badge.bg}`}
                          >
                            {badge.label}
                          </span>
                        </td>
                        <td
                          className="py-3 px-3 text-center"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <select
                            value={order.status}
                            onChange={(e) =>
                              onUpdateOrderStatus(
                                order.id,
                                e.target.value as OrderStatus,
                              )
                            }
                            className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2 py-1 text-[10px] text-slate-700 dark:text-slate-200 outline-none"
                          >
                            <option value="pending_payment">Chờ QR</option>
                            <option value="paid">Đã thu tiền</option>
                            <option value="shipping">Đang vận chuyển</option>
                            <option value="completed">Đã nghiệm thu</option>
                            <option value="cancelled">Hủy</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-4">
          {selectedAdminOrder ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 p-5 rounded-3xl shadow-sm">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
                <span className="text-[10px] uppercase tracking-[0.22em] text-cyan-500 font-semibold">
                  Chi tiết đơn
                </span>
                <h3 className="mt-3 text-sm font-extrabold text-slate-900 dark:text-white">
                  {selectedAdminOrder.id}
                </h3>
              </div>

              <div className="space-y-4 text-sm text-slate-700 dark:text-slate-200">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.28em] text-slate-400 mb-1">
                    Tên cơ sở
                  </p>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {selectedAdminOrder.organization}
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    {selectedAdminOrder.address}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.28em] text-slate-400 mb-1">
                    Người liên hệ
                  </p>
                  <p className="font-semibold">
                    {selectedAdminOrder.customerName} •{" "}
                    {selectedAdminOrder.phone}
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    {selectedAdminOrder.email}
                  </p>
                </div>
                <div className="rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4">
                  <p className="text-[10px] text-cyan-500 uppercase font-semibold tracking-[0.24em] mb-3">
                    Hành động nhanh
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
                    <button
                      onClick={() =>
                        onUpdateOrderStatus(selectedAdminOrder.id, "paid")
                      }
                      className="rounded-2xl bg-emerald-500/15 text-emerald-700 border border-emerald-300 py-2 hover:bg-emerald-500/25"
                    >
                      Xác nhận thanh toán
                    </button>
                    <button
                      onClick={() =>
                        onUpdateOrderStatus(selectedAdminOrder.id, "shipping")
                      }
                      className="rounded-2xl bg-sky-500/15 text-sky-700 border border-sky-300 py-2 hover:bg-sky-500/25"
                    >
                      Chuyển kỹ sư lắp đặt
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.28em] text-slate-400 mb-2">
                    Danh sách thiết bị
                  </p>
                  <div className="space-y-2">
                    {selectedAdminOrder.items.map((item, index) => (
                      <div
                        key={index}
                        className="rounded-2xl bg-slate-50 dark:bg-slate-950 p-3 flex justify-between items-start text-[11px]"
                      >
                        <span className="font-semibold text-slate-900 dark:text-white truncate">
                          {item.product.name}
                        </span>
                        <span className="font-semibold text-cyan-600 dark:text-cyan-300">
                          x{item.quantity} {item.product.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-6 text-center text-slate-500 text-sm">
              Bấm vào một đơn hàng để xem chi tiết và thao tác nhanh.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
