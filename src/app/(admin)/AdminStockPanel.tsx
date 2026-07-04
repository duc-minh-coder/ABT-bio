import React from "react";
import { Plus, AlertTriangle } from "lucide-react";
import { Product } from "../../types";

interface AdminStockPanelProps {
  products: Product[];
  onRestockProduct: (productId: string, amount: number) => void;
}

export default function AdminStockPanel({
  products,
  onRestockProduct,
}: AdminStockPanelProps) {
  return (
    <section className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 p-6 rounded-3xl shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase">
            Kho hàng và nhập bổ sung
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Giám sát tồn kho mẫu máy và bổ sung nhanh khi cần.
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
        {products.map((product) => {
          const isLow = product.stock <= 3;
          return (
            <div
              key={product.id}
              className={`rounded-3xl border p-4 transition ${
                isLow
                  ? "border-amber-300 bg-amber-50/10 dark:border-amber-900/80 dark:bg-amber-950/20"
                  : "border-slate-150 bg-slate-50/10 dark:border-slate-850 dark:bg-slate-950/40"
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-3">
                <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-slate-500">
                  {product.id}
                </span>
                {isLow ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-700 px-3 py-1 text-[10px] font-bold uppercase">
                    <AlertTriangle className="h-3.5 w-3.5" /> Thiếu hàng
                  </span>
                ) : (
                  <span className="rounded-full bg-emerald-100 text-emerald-700 px-3 py-1 text-[10px] font-bold uppercase">
                    Ổn định
                  </span>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2">
                    {product.name}
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-1">
                    {product.unit} khả dụng
                  </p>
                </div>

                <div className="flex items-center justify-between gap-3 text-[10px] font-semibold text-slate-700 dark:text-slate-200">
                  <span>Tồn kho:</span>
                  <span>{product.stock}</span>
                </div>

                <button
                  onClick={() => onRestockProduct(product.id, 5)}
                  className="w-full rounded-3xl bg-slate-900 text-white py-2 text-[11px] font-semibold hover:bg-slate-800 transition flex items-center justify-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Nhập +5
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
