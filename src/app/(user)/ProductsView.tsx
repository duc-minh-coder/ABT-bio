import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Product } from "../../types";
import { listCategories, listProducts } from "../../api";
import {
  Search,
  SlidersHorizontal,
  Check,
  ShieldAlert,
  ShoppingCart,
  X,
} from "lucide-react";

interface ProductsViewProps {
  products: Product[];
  categories?: Array<string | { id: string; name: string }>;
  onAddToCart: (product: Product) => void;
  selectedProductDetail: Product | null;
  onSetSelectedProductDetail: (product: Product | null) => void;
}

export default function ProductsView({
  products,
  categories,
  onAddToCart,
  selectedProductDetail,
  onSetSelectedProductDetail,
}: ProductsViewProps) {
  const [productList, setProductList] = useState<Product[]>(products);
  const [keyword, setKeyword] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [page] = useState(0);
  const [loading, setLoading] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState<
    Array<{ id: string; name: string }>
  >([]);

  useEffect(() => {
    let isMounted = true;

    const loadCategories = async () => {
      try {
        const result = await listCategories();
        if (isMounted) {
          setCategoryOptions(
            result.map((category) => ({
              id: String(category.id),
              name: category.name,
            })),
          );
        }
      } catch {
        if (isMounted) {
          setCategoryOptions([]);
        }
      }
    };

    void loadCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      let isCancelled = false;
      const loadProducts = async () => {
        setLoading(true);
        try {
          const result = await listProducts({
            keyword: keyword.trim(),
            categoryId: categoryId || undefined,
            page,
            size: 20,
          });
          if (!isCancelled) {
            setProductList(result);
          }
        } catch {
          if (!isCancelled) {
            setProductList([]);
          }
        } finally {
          if (!isCancelled) {
            setLoading(false);
          }
        }
      };

      void loadProducts();
      return () => {
        isCancelled = true;
      };
    }, 500);

    return () => window.clearTimeout(timer);
  }, [categoryId, keyword, page]);

  const handleClearFilters = () => {
    setKeyword("");
    setCategoryId("");
  };

  const selectOptions = useMemo(() => {
    if (categoryOptions.length > 0) {
      return categoryOptions;
    }

    return (categories ?? [])
      .filter((item): item is string => typeof item === "string")
      .map((name) => ({ id: name, name }));
  }, [categories, categoryOptions]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 space-y-8">
      <div className="text-left space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Danh Mục Thiết Bị Y Sinh
        </h1>
        <p className="text-xs text-slate-500 font-mono tracking-widest uppercase">
          Trữ lượng sẵn có • Bảo hành 24 tháng chính hãng ABT • Chuyên nghiệp &
          Chuẩn xác
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="search-input"
              type="text"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Tìm theo tên sản phẩm..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-700 outline-none transition focus:border-cyan-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
            />
          </div>

          <div className="relative lg:w-72">
            <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <select
              id="category-select"
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-700 outline-none transition focus:border-cyan-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
            >
              <option value="">Tất cả danh mục</option>
              {selectOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleClearFilters}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Xóa bộ lọc
          </button>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
          <span>
            {loading
              ? "Đang tải dữ liệu..."
              : `Hiển thị ${productList.length} sản phẩm`}
          </span>
          {(keyword || categoryId) && (
            <span className="font-medium text-cyan-600">
              Đang áp dụng bộ lọc
            </span>
          )}
        </div>
      </div>

      {productList.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center dark:border-slate-800 dark:bg-slate-900">
          <p className="font-medium text-slate-600 dark:text-slate-400">
            Không tìm thấy thiết bị y sinh nào phù hợp với điều kiện hiện tại.
          </p>
        </div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {productList.map((product) => (
            <div
              id={`product-card-${product.id}`}
              key={product.id}
              className="flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:shadow-xl dark:border-slate-850 dark:bg-slate-900"
            >
              <div className="relative aspect-video overflow-hidden border-b border-slate-100 bg-slate-950 dark:border-slate-850">
                <img
                  src={product.image}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                />

                <span className="absolute bottom-3 left-3 rounded px-2 py-0.5 text-[10px] font-bold shadow-sm" />
                <span className="absolute right-3 top-3 rounded bg-slate-900/80 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-cyan-400 backdrop-blur">
                  {product.category}
                </span>
              </div>

              <div className="flex flex-1 flex-col justify-between p-6 text-left">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-1">
                    <span className="text-[11px] font-mono text-slate-400">
                      {product.id}
                    </span>
                    <span className="text-xs font-medium text-sky-600">
                      Bảo hành 2 năm
                    </span>
                  </div>
                  <h3 className="min-h-12 text-base font-bold leading-snug text-slate-900 transition hover:text-cyan-600 dark:text-slate-100">
                    {product.name}
                  </h3>
                  <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                    {product.description}
                  </p>
                </div>

                <div className="mt-5 space-y-4 border-t border-slate-100 pt-5 dark:border-slate-850">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-slate-500">
                      Giá phân phối:
                    </span>
                    <span className="text-lg font-extrabold text-teal-600 dark:text-teal-400">
                      {product.price.toLocaleString("vi-VN")} đ
                      <span className="block text-xs font-normal text-slate-400 sm:inline">
                        {" "}
                        /{product.unit}
                      </span>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      id={`prod-detail-btn-${product.id}`}
                      onClick={() => onSetSelectedProductDetail(product)}
                      className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-850"
                    >
                      Thông số máy
                    </button>
                    <button
                      id={`prod-add-cart-btn-${product.id}`}
                      onClick={() => onAddToCart(product)}
                      className="rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 px-3 py-2 text-xs font-bold text-white transition hover:from-cyan-700 hover:to-teal-700"
                    >
                      Bỏ giỏ hàng
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {selectedProductDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              id="product-detail-modal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => onSetSelectedProductDetail(null)}
              className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm"
            />

            <motion.div
              id="product-detail-modal-body"
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative z-10 w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-5 text-left shadow-2xl dark:border-slate-800 dark:bg-slate-900 sm:max-h-[90vh] sm:p-7"
            >
              <button
                id="close-modal-detail-btn"
                onClick={() => onSetSelectedProductDetail(null)}
                className="absolute right-4 top-4 z-20 rounded-full bg-slate-50 p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:bg-slate-950 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                title="Đóng"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>

              <div className="space-y-5 pr-12">
                <div>
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-widest text-sky-600 dark:text-sky-400">
                    Mã máy: {selectedProductDetail.id}
                  </span>
                  <h2 className="text-xl font-black leading-tight text-slate-900 dark:text-white sm:text-2xl">
                    {selectedProductDetail.name}
                  </h2>
                  <p className="mt-1 text-xs text-slate-400">
                    Hãng ABT Corp • Tiêu chuẩn Y tế Việt Nam
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-12 sm:gap-6">
                  <div className="sm:col-span-5 h-40 overflow-hidden rounded-2xl border border-slate-150 bg-slate-950 sm:min-h-[160px] md:min-h-[180px] dark:border-slate-800">
                    <img
                      src={selectedProductDetail.image}
                      alt={selectedProductDetail.name}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="space-y-3.5 sm:col-span-7">
                    <div className="rounded-2xl border border-cyan-100 bg-cyan-50/55 p-4 dark:border-cyan-900/40 dark:bg-cyan-950/20">
                      <span className="mb-1 block text-[10px] font-bold uppercase leading-none text-slate-400">
                        Yêu cầu báo giá chính thức:
                      </span>
                      <span className="block text-xl font-black tracking-tight text-teal-600 dark:text-teal-400 sm:text-2xl">
                        {selectedProductDetail.price.toLocaleString("vi-VN")} đ
                      </span>
                      <span className="mt-1 block text-[10px] text-slate-400">
                        / {selectedProductDetail.unit} (lắp đặt tận phòng sạch
                        Lab)
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5 dark:border-slate-850 dark:bg-slate-950">
                        <span className="block text-[9px] uppercase text-slate-400 sm:text-[10px]">
                          Trạng thái:
                        </span>
                        <span className="font-extrabold text-teal-600 dark:text-teal-400">
                          Còn {selectedProductDetail.stock} chiếc
                        </span>
                      </div>
                      <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5 dark:border-slate-850 dark:bg-slate-950">
                        <span className="block text-[9px] uppercase text-slate-400 sm:text-[10px]">
                          Vận chuyển:
                        </span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">
                          Hoàn toàn miễn phí
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <h4 className="border-b border-slate-100 pb-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:text-slate-500">
                    Thông Số Kỹ Thuật Chi Tiết (Surgical Specs)
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                    {selectedProductDetail.specs.map((spec, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 leading-relaxed"
                      >
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-cyan-500" />
                        <span>{spec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-start gap-2.5 rounded-xl border border-rose-100 bg-rose-50 p-3.5 text-[11px] leading-relaxed text-rose-700 dark:border-rose-900/30 dark:bg-rose-950/30 dark:text-rose-300">
                  <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
                  <span>
                    Sản phẩm này là trang thiết bị y học đặc thù, kỹ sư ABT sẽ
                    bàn giao kèm Hồ sơ chất lượng CO/CQ, Phiếu kiểm định đo
                    lường hiệu chuẩn quốc gia và Bộ hướng dẫn kỹ thuật SOP.
                  </span>
                </div>

                <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 dark:border-slate-800 sm:flex-row">
                  <button
                    id="modal-close-generic-btn"
                    onClick={() => onSetSelectedProductDetail(null)}
                    className="flex-1 min-h-[44px] rounded-xl border border-slate-205 px-3 py-3 text-center text-xs font-bold text-slate-600 transition hover:bg-slate-50 hover:text-slate-850 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-850 dark:hover:text-slate-200"
                  >
                    Đóng cửa sổ
                  </button>
                  <button
                    id={`modal-add-cart-btn-${selectedProductDetail.id}`}
                    onClick={() => {
                      onAddToCart(selectedProductDetail);
                      onSetSelectedProductDetail(null);
                    }}
                    className="flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 px-3 py-3 text-xs font-extrabold text-white transition duration-250 hover:from-cyan-700 hover:to-teal-700"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Thêm vào Giỏ hàng
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
