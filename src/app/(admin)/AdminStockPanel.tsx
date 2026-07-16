import React, { useMemo, useState } from "react";
import {
  Plus,
  AlertTriangle,
  PackagePlus,
  Tags,
  PencilLine,
  Trash2,
} from "lucide-react";
import { Category, Product } from "../../types";

interface AdminStockPanelProps {
  products: Product[];
  categories: Category[];
  onRestockProduct: (productId: string, amount: number) => void;
  onCreateProduct: (payload: {
    name: string;
    slug: string;
    detailedDescription: string;
    thumbnailUrl: string;
    galleryUrls: string[];
    categoryId: number;
    inventoryCount: number;
    amount: number;
    originalAmount: number;
    currency: string;
    supportEmail: string;
    supportTelegram: string;
  }) => Promise<void> | void;
  onCreateCategory: (payload: {
    name: string;
    slug: string;
    image?: string;
    description?: string;
    status?: string;
  }) => Promise<void> | void;
  onUpdateCategory: (
    id: string | number,
    payload: {
      name: string;
      slug: string;
      image?: string;
      description?: string;
      status?: string;
    },
  ) => Promise<void> | void;
  onDeleteCategory: (id: string | number) => Promise<void> | void;
}

export default function AdminStockPanel({
  products,
  categories,
  onRestockProduct,
  onCreateProduct,
  onCreateCategory,
  onUpdateCategory,
  onDeleteCategory,
}: AdminStockPanelProps) {
  const [form, setForm] = useState({
    name: "",
    slug: "",
    detailedDescription: "",
    thumbnailUrl: "",
    galleryUrls: "",
    categoryId: categories[0]?.id ?? "1",
    inventoryCount: 10,
    amount: 1000000,
    originalAmount: 1200000,
    currency: "VND",
    supportEmail: "support@example.com",
    supportTelegram: "@support",
  });

  const [categoryForm, setCategoryForm] = useState({
    id: "",
    name: "",
    slug: "",
    image: "",
    description: "",
    status: "ACTIVE",
  });
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null,
  );

  const canSubmit = useMemo(() => {
    return Boolean(
      form.name.trim() &&
      form.slug.trim() &&
      form.detailedDescription.trim() &&
      form.categoryId,
    );
  }, [form]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;

    await onCreateProduct({
      name: form.name.trim(),
      slug: form.slug.trim(),
      detailedDescription: form.detailedDescription.trim(),
      thumbnailUrl: form.thumbnailUrl.trim(),
      galleryUrls: form.galleryUrls
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
      categoryId: Number(form.categoryId),
      inventoryCount: Number(form.inventoryCount),
      amount: Number(form.amount),
      originalAmount: Number(form.originalAmount),
      currency: form.currency.trim() || "VND",
      supportEmail: form.supportEmail.trim(),
      supportTelegram: form.supportTelegram.trim(),
    });

    setForm((prev) => ({
      ...prev,
      name: "",
      slug: "",
      detailedDescription: "",
      thumbnailUrl: "",
      galleryUrls: "",
      inventoryCount: 10,
      amount: 1000000,
      originalAmount: 1200000,
      supportEmail: "support@example.com",
      supportTelegram: "@support",
    }));
  };

  const handleCategorySubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!categoryForm.name.trim() || !categoryForm.slug.trim()) {
      return;
    }

    const payload = {
      name: categoryForm.name.trim(),
      slug: categoryForm.slug.trim(),
      image: categoryForm.image.trim(),
      description: categoryForm.description.trim(),
      status: categoryForm.status.trim() || "ACTIVE",
    };

    if (editingCategoryId) {
      await onUpdateCategory(editingCategoryId, payload);
    } else {
      await onCreateCategory(payload);
    }

    setCategoryForm({
      id: "",
      name: "",
      slug: "",
      image: "",
      description: "",
      status: "ACTIVE",
    });
    setEditingCategoryId(null);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategoryId(String(category.id));
    setCategoryForm({
      id: String(category.id),
      name: category.name,
      slug: category.slug,
      image: category.image ?? "",
      description: category.description ?? "",
      status: category.status,
    });
  };

  const handleDeleteCategory = async (category: Category) => {
    if (!window.confirm(`Xóa danh mục ${category.name}?`)) {
      return;
    }
    await onDeleteCategory(category.id);
  };

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

      <form
        onSubmit={handleSubmit}
        className="mb-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 p-5 space-y-4"
      >
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white uppercase">
          <PackagePlus className="h-4 w-4 text-cyan-600" />
          Tạo hàng hóa mới
        </div>
        <div className="grid md:grid-cols-2 gap-4 text-xs text-slate-700 dark:text-slate-300">
          <label className="space-y-1">
            <span className="block font-semibold">Tên sản phẩm</span>
            <input
              value={form.name}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, name: event.target.value }))
              }
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 outline-none"
              placeholder="Sản phẩm A"
              required
            />
          </label>
          <label className="space-y-1">
            <span className="block font-semibold">Slug</span>
            <input
              value={form.slug}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, slug: event.target.value }))
              }
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 outline-none"
              placeholder="san-pham-a"
              required
            />
          </label>
          <label className="space-y-1 md:col-span-2">
            <span className="block font-semibold">Mô tả chi tiết</span>
            <textarea
              value={form.detailedDescription}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  detailedDescription: event.target.value,
                }))
              }
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 outline-none min-h-[90px]"
              placeholder="Mô tả sản phẩm"
              required
            />
          </label>
          <label className="space-y-1">
            <span className="block font-semibold">Thumbnail URL</span>
            <input
              value={form.thumbnailUrl}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  thumbnailUrl: event.target.value,
                }))
              }
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 outline-none"
              placeholder="https://..."
            />
          </label>
          <label className="space-y-1">
            <span className="block font-semibold">Danh mục</span>
            <select
              value={form.categoryId}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, categoryId: event.target.value }))
              }
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 outline-none"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1">
            <span className="block font-semibold">Tồn kho</span>
            <input
              type="number"
              min="0"
              value={form.inventoryCount}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  inventoryCount: Number(event.target.value),
                }))
              }
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 outline-none"
            />
          </label>
          <label className="space-y-1">
            <span className="block font-semibold">Giá</span>
            <input
              type="number"
              min="0"
              value={form.amount}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  amount: Number(event.target.value),
                }))
              }
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 outline-none"
            />
          </label>
          <label className="space-y-1">
            <span className="block font-semibold">Giá gốc</span>
            <input
              type="number"
              min="0"
              value={form.originalAmount}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  originalAmount: Number(event.target.value),
                }))
              }
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 outline-none"
            />
          </label>
          <label className="space-y-1">
            <span className="block font-semibold">Currency</span>
            <input
              value={form.currency}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, currency: event.target.value }))
              }
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 outline-none"
              placeholder="VND"
            />
          </label>
          <label className="space-y-1">
            <span className="block font-semibold">Email hỗ trợ</span>
            <input
              value={form.supportEmail}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  supportEmail: event.target.value,
                }))
              }
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 outline-none"
              placeholder="support@example.com"
            />
          </label>
          <label className="space-y-1">
            <span className="block font-semibold">Telegram hỗ trợ</span>
            <input
              value={form.supportTelegram}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  supportTelegram: event.target.value,
                }))
              }
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 outline-none"
              placeholder="@support"
            />
          </label>
          <label className="space-y-1 md:col-span-2">
            <span className="block font-semibold">
              Gallery URLs (mỗi dòng 1 URL)
            </span>
            <textarea
              value={form.galleryUrls}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  galleryUrls: event.target.value,
                }))
              }
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 outline-none min-h-[80px]"
              placeholder="https://..."
            />
          </label>
        </div>
        <button
          type="submit"
          disabled={!canSubmit}
          className="rounded-2xl bg-cyan-600 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-white hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Tạo sản phẩm
        </button>
      </form>

      <form
        onSubmit={handleCategorySubmit}
        className="mb-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 p-5 space-y-4"
      >
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white uppercase">
          <Tags className="h-4 w-4 text-cyan-600" />
          {editingCategoryId ? "Chỉnh sửa danh mục" : "Tạo danh mục mới"}
        </div>
        <div className="grid md:grid-cols-2 gap-4 text-xs text-slate-700 dark:text-slate-300">
          <label className="space-y-1">
            <span className="block font-semibold">Tên danh mục</span>
            <input
              value={categoryForm.name}
              onChange={(event) =>
                setCategoryForm((prev) => ({
                  ...prev,
                  name: event.target.value,
                }))
              }
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 outline-none"
              placeholder="Máy PCR"
              required
            />
          </label>
          <label className="space-y-1">
            <span className="block font-semibold">Slug</span>
            <input
              value={categoryForm.slug}
              onChange={(event) =>
                setCategoryForm((prev) => ({
                  ...prev,
                  slug: event.target.value,
                }))
              }
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 outline-none"
              placeholder="may-pcr"
              required
            />
          </label>
          <label className="space-y-1">
            <span className="block font-semibold">Image URL</span>
            <input
              value={categoryForm.image}
              onChange={(event) =>
                setCategoryForm((prev) => ({
                  ...prev,
                  image: event.target.value,
                }))
              }
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 outline-none"
              placeholder="https://..."
            />
          </label>
          <label className="space-y-1">
            <span className="block font-semibold">Status</span>
            <input
              value={categoryForm.status}
              onChange={(event) =>
                setCategoryForm((prev) => ({
                  ...prev,
                  status: event.target.value,
                }))
              }
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 outline-none"
              placeholder="ACTIVE"
            />
          </label>
          <label className="space-y-1 md:col-span-2">
            <span className="block font-semibold">Mô tả</span>
            <textarea
              value={categoryForm.description}
              onChange={(event) =>
                setCategoryForm((prev) => ({
                  ...prev,
                  description: event.target.value,
                }))
              }
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 outline-none min-h-[90px]"
              placeholder="Mô tả nhóm sản phẩm"
            />
          </label>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            className="rounded-2xl bg-cyan-600 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-white hover:bg-cyan-500"
          >
            {editingCategoryId ? "Cập nhật danh mục" : "Tạo danh mục"}
          </button>
          {editingCategoryId && (
            <button
              type="button"
              onClick={() => {
                setEditingCategoryId(null);
                setCategoryForm({
                  id: "",
                  name: "",
                  slug: "",
                  image: "",
                  description: "",
                  status: "ACTIVE",
                });
              }}
              className="rounded-2xl border border-slate-300 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-700 dark:border-slate-700 dark:text-slate-300"
            >
              Hủy
            </button>
          )}
        </div>
      </form>

      <div className="mb-8 grid gap-3">
        {categories.map((category) => (
          <div
            key={category.id}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 p-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {category.name}
                  </span>
                  <span className="rounded-full bg-cyan-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-cyan-700">
                    {category.status}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  /{category.slug} • {category.productCount} sản phẩm
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleEditCategory(category)}
                  className="flex items-center gap-1 rounded-2xl border border-slate-300 px-3 py-2 text-[11px] font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-300"
                >
                  <PencilLine className="h-3.5 w-3.5" /> Sửa
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteCategory(category)}
                  className="flex items-center gap-1 rounded-2xl border border-rose-300 px-3 py-2 text-[11px] font-semibold text-rose-600"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Xóa
                </button>
              </div>
            </div>

            {(category.products ?? []).length > 0 ? (
              <div className="mt-3 grid gap-2 md:grid-cols-2">
                {category.products?.map((product) => (
                  <div
                    key={product.id}
                    className="rounded-xl border border-slate-200 bg-white/80 p-3 text-[11px] text-slate-600 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {product.name}
                      </span>
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-emerald-700">
                        {product.stock} tồn kho
                      </span>
                    </div>
                    <p className="mt-1 text-[10px] text-slate-500">
                      {product.description ||
                        "Sản phẩm đang được liên kết với danh mục này."}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-[11px] text-slate-500">
                Chưa có sản phẩm nào trong danh mục này.
              </p>
            )}
          </div>
        ))}
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
