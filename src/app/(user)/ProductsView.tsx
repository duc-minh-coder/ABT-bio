import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Product } from "../../types";
import {
  Search,
  SlidersHorizontal,
  Check,
  CheckCircle2,
  ShieldAlert,
  Award,
  FileText,
  ShoppingCart,
  Truck,
  RefreshCw,
  X,
} from "lucide-react";

interface ProductsViewProps {
  products: Product[];
  categories: string[];
  onAddToCart: (product: Product) => void;
  selectedProductDetail: Product | null;
  onSetSelectedProductDetail: (product: Product | null) => void;
}

type PricePreset = "all" | "under_50m" | "50m_150m" | "above_150m";

export default function ProductsView({
  products,
  categories,
  onAddToCart,
  selectedProductDetail,
  onSetSelectedProductDetail,
}: ProductsViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả sản phẩm");
  const [selectedPricePreset, setSelectedPricePreset] =
    useState<PricePreset>("all");
  const [sortBy, setSortBy] = useState<
    "default" | "price_asc" | "price_desc" | "stock_desc"
  >("default");

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // 1. Search Query
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q),
      );
    }

    // 2. Category Filter
    if (selectedCategory !== "Tất cả sản phẩm") {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // 3. Price Preset Filter
    if (selectedPricePreset === "under_50m") {
      result = result.filter((p) => p.price < 50000000);
    } else if (selectedPricePreset === "50m_150m") {
      result = result.filter(
        (p) => p.price >= 50000000 && p.price <= 150000000,
      );
    } else if (selectedPricePreset === "above_150m") {
      result = result.filter((p) => p.price > 150000000);
    }

    // 4. Sort
    if (sortBy === "price_asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price_desc") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "stock_desc") {
      result.sort((a, b) => b.stock - a.stock);
    }

    return result;
  }, [searchQuery, selectedCategory, selectedPricePreset, sortBy]);

  const availableCategories = useMemo(() => {
    const unique = new Set<string>(["Tất cả sản phẩm"]);
    categories.forEach((category) => unique.add(category));
    products.forEach((product) => unique.add(product.category));
    return Array.from(unique);
  }, [categories, products]);

  const pricePresets = [
    { value: "all", label: "Mọi mức giá" },
    { value: "under_50m", label: "Dưới 50 Triệu" },
    { value: "50m_150m", label: "Từ 50M - 150 Triệu" },
    { value: "above_150m", label: "Trên 150 Triệu" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 space-y-8">
      {/* Page Header */}
      <div className="text-left space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Danh Mục Thiết Bị Y Sinh
        </h1>
        <p className="text-xs text-slate-500 font-mono tracking-widest uppercase">
          Trữ lượng sẵn có • Bảo hành 24 tháng chính hãng ABT • Chuyên nghiệp &
          Chuẩn xác
        </p>
      </div>

      {/* SEARCH AND FILTERS TOOLBAR */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg space-y-4 text-slate-200">
        <div className="grid md:grid-cols-12 gap-4 items-center">
          {/* Live Search */}
          <div className="md:col-span-5 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              id="search-input"
              type="text"
              placeholder="Tìm theo tên máy, mã thiết bị (ABT...), từ khóa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-850 hover:border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm placeholder-slate-500 text-slate-100 transition duration-200 outline-none"
            />
          </div>

          {/* Pricing Filters Preset */}
          <div className="md:col-span-4 flex flex-wrap gap-2">
            {pricePresets.map((preset) => (
              <button
                id={`price-filter-${preset.value}`}
                key={preset.value}
                onClick={() =>
                  setSelectedPricePreset(preset.value as PricePreset)
                }
                className={`px-3 py-2 rounded-lg text-xs font-semibold border transition duration-200 ${
                  selectedPricePreset === preset.value
                    ? "bg-cyan-550 bg-cyan-600 text-slate-950 border-cyan-400"
                    : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-250 hover:border-slate-700"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Sorting */}
          <div className="md:col-span-3 flex items-center gap-2">
            <span className="text-xs text-slate-405 text-slate-400 inline-block shrink-0 font-mono">
              Sắp xếp:
            </span>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-850 hover:border-slate-700 px-3 py-2 rounded-xl text-xs text-slate-300 focus:border-cyan-500 outline-none"
            >
              <option value="default">Mặc định mã lực</option>
              <option value="price_asc">Giá từ thấp đến cao</option>
              <option value="price_desc">Giá từ cao đến thấp</option>
              <option value="stock_desc">Số lượng kho lớn</option>
            </select>
          </div>
        </div>

        {/* Categories Horizontal Navigation */}
        <div className="pt-4 border-t border-slate-800 flex flex-wrap gap-2 items-center">
          <span className="text-xs text-slate-400 font-mono inline-block mr-2 uppercase tracking-wide">
            Phân nhóm:
          </span>
          {availableCategories.map((cat) => (
            <button
              id={`cat-filter-${cat}`}
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ${
                selectedCategory === cat
                  ? "bg-cyan-950 text-cyan-300 border-cyan-500/50 shadow-md shadow-cyan-950"
                  : "bg-slate-950 text-slate-400 border-slate-850 hover:text-slate-200 hover:border-slate-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* RESULTS GRID */}
      {filteredProducts.length === 0 ? (
        <div className="p-12 text-center bg-slate-50 dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-850 space-y-3">
          <p className="text-slate-600 dark:text-slate-400 font-medium">
            Không tìm thấy thiết bị y sinh nào khớp với bộ lọc hiện tại.
          </p>
          <button
            id="reset-filters-btn"
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("Tất cả sản phẩm");
              setSelectedPricePreset("all");
              setSortBy("default");
            }}
            className="px-4 py-2 bg-cyan-600 text-slate-950 rounded-xl text-xs font-bold"
          >
            Reset bộ lọc thiết bị
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => (
            <div
              id={`product-card-${product.id}`}
              key={product.id}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              <div className="relative aspect-video overflow-hidden border-b border-slate-100 dark:border-slate-850 bg-slate-950">
                <img
                  src={product.image}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  className="object-cover w-full h-full group-hover:scale-102 transition-transform duration-300"
                />

                {/* Stock Warning Badge */}
                <span
                  className={`absolute bottom-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm flex items-center gap-1 ${
                    product.stock <= 3
                      ? "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300"
                      : "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${product.stock <= 3 ? "bg-amber-500 animate-pulse" : "bg-emerald-500"}`}
                  />
                  {product.stock <= 3
                    ? `Chỉ còn ${product.stock} ${product.unit}`
                    : `Mẫu sẵn hàng (${product.stock} ${product.unit})`}
                </span>

                {/* Category label */}
                <span className="absolute top-3 right-3 bg-slate-900/80 text-cyan-400 text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded backdrop-blur">
                  {product.category}
                </span>
              </div>

              {/* Technical Description & Cost details */}
              <div className="p-6 flex-1 flex flex-col justify-between text-left">
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-1">
                    <span className="text-slate-400 text-[11px] font-mono">
                      {product.id}
                    </span>
                    <span className="text-xs text-sky-600 font-medium">
                      Bảo hành 2 năm
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 min-h-12 line-clamp-2 leading-snug hover:text-cyan-600 transition">
                    {product.name}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-xs line-clamp-3 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                <div className="pt-5 mt-5 border-t border-slate-100 dark:border-slate-850 space-y-4">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-slate-500">
                      Giá phân phối:
                    </span>
                    <span className="text-lg font-extrabold text-teal-600 dark:text-teal-400">
                      {product.price.toLocaleString("vi-VN")} đ
                      <span className="text-xs font-normal text-slate-400 block sm:inline">
                        {" "}
                        /{product.unit}
                      </span>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      id={`prod-detail-btn-${product.id}`}
                      onClick={() => onSetSelectedProductDetail(product)}
                      className="py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300 transition"
                    >
                      Thông số máy
                    </button>
                    <button
                      id={`prod-add-cart-btn-${product.id}`}
                      onClick={() => onAddToCart(product)}
                      className="py-2 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 font-bold text-xs text-white rounded-xl shadow-sm transition"
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

      {/* DETAIL DIALOG MODAL (Surgical accuracy specs) */}
      <AnimatePresence>
        {selectedProductDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop layer */}
            <motion.div
              id="product-detail-modal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => onSetSelectedProductDetail(null)}
              className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              id="product-detail-modal-body"
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full max-h-[88vh] sm:max-h-[90vh] overflow-y-auto p-5 sm:p-7 shadow-2xl z-10 text-left space-y-5"
            >
              {/* Close Button */}
              <button
                id="close-modal-detail-btn"
                onClick={() => onSetSelectedProductDetail(null)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white transition duration-200 z-20"
                title="Đóng"
              >
                <X className="h-4 sm:h-5 w-4 sm:w-5" />
              </button>

              <div className="space-y-5">
                <div className="pr-12">
                  <span className="text-xs text-sky-600 dark:text-sky-400 font-semibold font-mono tracking-widest block uppercase mb-1">
                    Mã máy: {selectedProductDetail.id}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black font-sans text-slate-900 dark:text-white leading-tight">
                    {selectedProductDetail.name}
                  </h2>
                  <p className="text-xs text-slate-400 font-mono mt-1">
                    Hãng ABT Corp • Tiêu chuẩn Y tế Việt Nam
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 sm:gap-6">
                  {/* Photo Thumbnail */}
                  <div className="sm:col-span-5 rounded-2xl overflow-hidden border border-slate-150 dark:border-slate-800 bg-slate-950 h-40 sm:h-auto sm:min-h-[160px] md:min-h-[180px]">
                    <img
                      src={selectedProductDetail.image}
                      alt={selectedProductDetail.name}
                      referrerPolicy="no-referrer"
                      className="object-cover w-full h-full"
                    />
                  </div>

                  {/* Pricing and Core Specs highlights */}
                  <div className="sm:col-span-7 space-y-3.5">
                    <div className="p-4 bg-cyan-50/55 dark:bg-cyan-950/20 border border-cyan-100/65 dark:border-cyan-900/40 rounded-2xl">
                      <span className="text-[10px] text-slate-400 uppercase block font-bold leading-none mb-1">
                        Yêu cầu báo giá chính thức:
                      </span>
                      <span className="text-xl sm:text-2xl font-black text-teal-600 dark:text-teal-400 tracking-tight block">
                        {selectedProductDetail.price.toLocaleString("vi-VN")} đ
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono block mt-1">
                        / {selectedProductDetail.unit} (lắp đặt tận phòng sạch
                        Lab)
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-100 dark:border-slate-850">
                        <span className="text-slate-400 block font-mono text-[9px] sm:text-[10px] uppercase">
                          Trạng thái:
                        </span>
                        <span className="font-extrabold text-teal-600 dark:text-teal-400">
                          Còn {selectedProductDetail.stock} chiếc
                        </span>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-100 dark:border-slate-850">
                        <span className="text-slate-400 block font-mono text-[9px] sm:text-[10px] uppercase">
                          Vận chuyển:
                        </span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">
                          Hoàn toàn miễn phí
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Highly structured biomedical specs checklist */}
                <div className="space-y-2.5">
                  <h4 className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 pb-1.5 font-sans">
                    Thông Số Kỹ Thuật Chi Tiết (Surgical Specs)
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                    {selectedProductDetail.specs.map((spec, i) => (
                      <li
                        key={i}
                        className="flex gap-2 items-start leading-relaxed"
                      >
                        <Check className="h-4 w-4 shrink-0 text-cyan-500 mt-0.5" />
                        <span>{spec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Warning message related to medical clearance */}
                <div className="p-3.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/30 text-[11px] text-rose-700 dark:text-rose-300 rounded-xl flex items-start gap-2.5 leading-relaxed">
                  <ShieldAlert className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
                  <span>
                    Sản phẩm này là trang thiết bị y học đặc thù, kỹ sư ABT sẽ
                    bàn giao kèm Hồ sơ chất lượng CO/CQ, Phiếu kiểm định đo
                    lường hiệu chuẩn quốc gia và Bộ hướng dẫn kỹ thuật SOP.
                  </span>
                </div>

                {/* Final Interactive elements */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-3">
                  <button
                    id="modal-close-generic-btn"
                    onClick={() => onSetSelectedProductDetail(null)}
                    className="flex-1 py-3 border border-slate-205 dark:border-slate-800 rounded-xl text-center text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-850 dark:hover:text-slate-200 transition duration-200 min-h-[44px]"
                  >
                    Đóng cửa sổ
                  </button>
                  <button
                    id={`modal-add-cart-btn-${selectedProductDetail.id}`}
                    onClick={() => {
                      onAddToCart(selectedProductDetail);
                      onSetSelectedProductDetail(null);
                    }}
                    className="flex-1 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 transition duration-250 min-h-[44px]"
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
