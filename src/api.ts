import type {
  CartItem,
  Category,
  Order,
  OrderStatus,
  Product,
  UserAccount,
} from "./types";

type ApiResponse<T> = {
  code: number;
  message?: string;
  result?: T;
};

type LoginResult = {
  token: string;
  refreshToken: string;
  isAuthenticated: boolean;
};

type MePayload = {
  id?: string;
  contactEmail?: string;
  contactPhone?: string;
  fullName?: string;
  avatarUrl?: string;
  lastTimeChange?: string;
  verified?: boolean;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  role?: string;
};

type ProductPayload = {
  id?: number | string;
  name?: string;
  category?: string | { name?: string } | null;
  price?: number | string;
  unit?: string;
  image?: string;
  description?: string;
  detailedDescription?: string;
  thumbnailUrl?: string;
  galleryUrls?: string[];
  specs?: string[];
  stock?: number | string;
  inventoryCount?: number | string;
  featured?: boolean;
  isPopular?: boolean;
  slug?: string;
  amount?: number | string;
  originalAmount?: number | string;
  prices?: Array<{
    amount?: number | string;
    originalAmount?: number | string;
    currency?: string;
  }>;
};

type CartPayload = {
  product?: ProductPayload;
  quantity?: number | string;
};

type OrderPayload = {
  id?: string;
  date?: string;
  customerName?: string;
  customerEmail?: string;
  contactEmail?: string;
  email?: string;
  phone?: string;
  address?: string;
  organization?: string;
  paymentMethod?: "payos" | "paypal" | "COD" | string;
  items?: Array<{
    product?: ProductPayload;
    quantity?: number | string;
    priceAtOrder?: number | string;
  }>;
  status?: string;
  total?: number | string;
  paymentStatus?: string;
  notes?: string;
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
    organization?: string;
  };
  user?: {
    name?: string;
    email?: string;
    phone?: string;
    organization?: string;
  };
};

type CategoryPayload = {
  id?: number | string;
  name?: string;
  slug?: string;
  image?: string;
  description?: string;
  status?: string;
  productCount?: number | string;
  products?: ProductPayload[];
};

type CreateProductPayload = {
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
};

const API_BASE = (
  (import.meta as ImportMeta & { env?: { VITE_API_BASE_URL?: string } }).env
    ?.VITE_API_BASE_URL ?? "/api"
).replace(/\/$/, "");

function getStoredToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("abt_access_token");
}

function getHeaders(includeJson = true) {
  const headers = new Headers();
  if (includeJson) {
    headers.set("Content-Type", "application/json");
  }
  const token = getStoredToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  return headers;
}

async function requestJson<T>(
  path: string,
  init: RequestInit = {},
): Promise<ApiResponse<T>> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      ...Object.fromEntries(getHeaders(Boolean(init.body)).entries()),
      ...(init.headers || {}),
    },
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = data?.message || "Yêu cầu API thất bại.";
    throw new Error(message);
  }

  const wrappedResult =
    data && typeof data === "object" && "result" in data ? data.result : data;
  const hasErrorCode =
    data && typeof data === "object" && "code" in data && data.code !== 0;

  if (hasErrorCode) {
    const message = data?.message || "Yêu cầu API thất bại.";
    throw new Error(message);
  }

  return {
    code: data?.code ?? 0,
    message: data?.message,
    result: wrappedResult as T,
  };
}

function toCategory(payload?: CategoryPayload | null): Category {
  return {
    id: String(payload?.id ?? ""),
    name: payload?.name ?? "Khác",
    slug: payload?.slug ?? "",
    image: payload?.image ?? "",
    description: payload?.description ?? "",
    status: payload?.status ?? "ACTIVE",
    productCount: Number(payload?.productCount ?? 0),
    products: Array.isArray(payload?.products)
      ? payload.products.map((item) => toProduct(item))
      : [],
  };
}

function toProduct(payload?: ProductPayload | null): Product {
  const rawCategory = payload?.category;
  const categoryName =
    typeof rawCategory === "object" ? rawCategory?.name : rawCategory;
  const pricePayload = Array.isArray(payload?.prices)
    ? payload.prices[0]
    : null;

  return {
    id: String(payload?.id ?? ""),
    name: payload?.name ?? "Sản phẩm",
    category: categoryName || "Khác",
    price: Number(
      pricePayload?.amount ?? payload?.amount ?? payload?.price ?? 0,
    ),
    unit: payload?.unit ?? "thiết bị",
    image: payload?.thumbnailUrl ?? payload?.image ?? "",
    description: payload?.detailedDescription ?? payload?.description ?? "",
    specs: Array.isArray(payload?.galleryUrls)
      ? payload.galleryUrls
      : Array.isArray(payload?.specs)
        ? payload.specs
        : [],
    stock: Number(payload?.inventoryCount ?? payload?.stock ?? 0),
    featured: Boolean(payload?.isPopular ?? payload?.featured),
    slug: payload?.slug,
  };
}

function toCartItem(payload?: CartPayload | null): CartItem {
  return {
    product: toProduct(payload?.product),
    quantity: Number(payload?.quantity ?? 1),
  };
}

function toUserAccount(payload?: MePayload | null): UserAccount {
  return {
    id: String(payload?.id ?? ""),
    name: payload?.fullName ?? payload?.contactEmail ?? "Người dùng",
    email: payload?.contactEmail ?? "",
    role: payload?.role?.toLowerCase() === "admin" ? "admin" : "user",
    status: payload?.status === "BANNED" ? "blocked" : "active",
    department: "",
    createdAt: payload?.createdAt ?? new Date().toISOString(),
    avatarUrl: payload?.avatarUrl,
    verified: Boolean(payload?.verified),
    lastTimeChange: payload?.lastTimeChange,
    updatedAt: payload?.updatedAt,
    contactPhone: payload?.contactPhone,
  };
}

function toOrderStatus(status?: string): OrderStatus {
  switch (status) {
    case "paid":
    case "shipping":
    case "completed":
    case "cancelled":
      return status;
    default:
      return "pending_payment";
  }
}

function toPaymentStatus(status?: string): Order["paymentStatus"] {
  switch (status) {
    case "paid":
    case "refunded":
      return status;
    default:
      return "unpaid";
  }
}

function toOrder(payload?: OrderPayload | null): Order {
  const normalizedEmail =
    payload?.email ??
    payload?.customerEmail ??
    payload?.contactEmail ??
    payload?.customer?.email ??
    payload?.user?.email ??
    "";
  const normalizedCustomerName =
    payload?.customerName ??
    payload?.customer?.name ??
    payload?.user?.name ??
    "";
  const normalizedPhone =
    payload?.phone ?? payload?.customer?.phone ?? payload?.user?.phone ?? "";
  const normalizedOrganization =
    payload?.organization ??
    payload?.customer?.organization ??
    payload?.user?.organization ??
    "";

  return {
    id: payload?.id ?? `DH-${Date.now()}`,
    date: payload?.date ?? new Date().toISOString(),
    customerName: normalizedCustomerName,
    email: normalizedEmail,
    phone: normalizedPhone,
    address: payload?.address ?? "",
    organization: normalizedOrganization,
    paymentMethod:
      payload?.paymentMethod === "paypal"
        ? "paypal"
        : payload?.paymentMethod === "COD"
          ? "payos"
          : "payos",
    items: (payload?.items ?? []).map((item) => ({
      product: toProduct(item.product),
      quantity: Number(item.quantity ?? 0),
      priceAtOrder: Number(item.priceAtOrder ?? item.product?.price ?? 0),
    })),
    status: toOrderStatus(payload?.status),
    total: Number(payload?.total ?? 0),
    paymentStatus: toPaymentStatus(payload?.paymentStatus),
    notes: payload?.notes,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizePage<T>(payload: unknown, mapper: (item: any) => T): T[] {
  if (Array.isArray(payload)) {
    return payload.map(mapper);
  }
  if (payload && typeof payload === "object") {
    const maybeContent = payload as Record<string, unknown>;
    if (Array.isArray(maybeContent.content)) {
      return maybeContent.content.map(mapper);
    }
    if (Array.isArray(maybeContent.items)) {
      return maybeContent.items.map(mapper);
    }
    if (Array.isArray(maybeContent.result)) {
      return maybeContent.result.map(mapper);
    }
  }
  return [];
}

export async function loginUser(email: string, password: string) {
  const response = await requestJson<LoginResult>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  if (!response.result) {
    throw new Error(response.message || "Không nhận được thông tin đăng nhập.");
  }
  return response.result;
}

export async function registerUser(
  fullName: string,
  email: string,
  password: string,
) {
  await requestJson<null>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ fullName, email, password }),
  });
}

export async function getCurrentUser() {
  const response = await requestJson<MePayload>("/auth/me");
  return toUserAccount(response.result ?? null);
}

export async function listProducts(params?: {
  keyword?: string;
  categoryId?: number | string | null;
  page?: number;
  size?: number;
}) {
  const query = new URLSearchParams();
  if (params?.keyword) {
    query.set("keyword", params.keyword);
  }
  if (params?.categoryId != null && params.categoryId !== "") {
    query.set("categoryId", String(params.categoryId));
  }
  if (params?.page !== undefined) {
    query.set("page", String(params.page));
  }
  if (params?.size !== undefined) {
    query.set("size", String(params.size));
  }

  const queryString = query.toString();
  const response = await requestJson<unknown>(
    `/products${queryString ? `?${queryString}` : ""}`,
  );
  return normalizePage(response.result, toProduct);
}

export async function getBestSellingProducts() {
  const response = await requestJson<unknown>("/products/best-selling");
  return normalizePage(response.result, toProduct);
}

export async function getProductById(id: string | number) {
  const response = await requestJson<unknown>(`/products/${id}`);
  return toProduct((response.result as ProductPayload) ?? null);
}

export async function listCategories() {
  const response = await requestJson<unknown>("/categories?page=0&size=20");
  return normalizePage(response.result, toCategory);
}

export async function createCategory(payload: {
  name: string;
  slug: string;
  image?: string;
  description?: string;
  status?: string;
}) {
  const response = await requestJson<unknown>("/admin/categories", {
    method: "POST",
    body: JSON.stringify({
      name: payload.name,
      slug: payload.slug,
      image: payload.image ?? "",
      description: payload.description ?? "",
      status: payload.status ?? "ACTIVE",
    }),
  });
  return toCategory((response.result as CategoryPayload) ?? null);
}

export async function updateCategory(
  id: string | number,
  payload: {
    name: string;
    slug: string;
    image?: string;
    description?: string;
    status?: string;
  },
) {
  const response = await requestJson<unknown>(`/admin/categories/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      name: payload.name,
      slug: payload.slug,
      image: payload.image ?? "",
      description: payload.description ?? "",
      status: payload.status ?? "ACTIVE",
    }),
  });
  return toCategory((response.result as CategoryPayload) ?? null);
}

export async function deleteCategory(id: string | number) {
  await requestJson<unknown>(`/admin/categories/${id}`, {
    method: "DELETE",
  });
}

export async function createAdminProduct(payload: CreateProductPayload) {
  const response = await requestJson<unknown>("/admin/products", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return toProduct((response.result as ProductPayload) ?? null);
}

export async function updateAdminProduct(
  id: string | number,
  payload: CreateProductPayload,
) {
  const response = await requestJson<unknown>(`/admin/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return toProduct((response.result as ProductPayload) ?? null);
}

export async function getCart() {
  const response = await requestJson<unknown>("/cart");
  return normalizePage(response.result, toCartItem);
}

export async function addCartItem(
  productId: number | string,
  quantity: number,
) {
  const response = await requestJson<unknown>("/cart", {
    method: "POST",
    body: JSON.stringify({ productId: Number(productId), quantity }),
  });
  return normalizePage(response.result, toCartItem);
}

export async function removeCartItem(productId: number | string) {
  const response = await requestJson<unknown>(`/cart/product/${productId}`, {
    method: "DELETE",
  });
  return normalizePage(response.result, toCartItem);
}

export async function checkoutCart(payload: {
  customerName: string;
  email: string;
  phone: string;
  address: string;
  organization?: string;
  paymentMethod: "payos" | "paypal";
  items: Array<{
    productId: number | string;
    quantity: number;
    priceAtOrder: number;
  }>;
  total: number;
  notes?: string;
  status?: string;
  paymentStatus?: string;
}) {
  const normalizedPayload = {
    ...payload,
    paymentMethod: payload.paymentMethod?.toUpperCase() ?? "PAYOS",
    status: payload.status ?? "pending_payment",
    paymentStatus: payload.paymentStatus ?? "unpaid",
  };

  const response = await requestJson<unknown>("/cart/checkout", {
    method: "POST",
    body: JSON.stringify(normalizedPayload),
  });
  return toOrder((response.result as OrderPayload) ?? null);
}

export async function listOrders() {
  const response = await requestJson<unknown>(
    "/orders/completed?page=0&size=20",
  );
  return normalizePage(response.result, toOrder);
}

export async function listMyCompletedOrders(page = 0, size = 20) {
  const response = await requestJson<unknown>(
    `/my-completed?page=${page}&size=${size}`,
  );
  return normalizePage(response.result, toOrder);
}

export async function listAdminCompletedOrders(page = 0, size = 20) {
  const response = await requestJson<unknown>(
    `/admin/completed?page=${page}&size=${size}`,
  );
  return normalizePage(response.result, toOrder);
}

export async function listAdminUsers() {
  const response = await requestJson<unknown>("/admin/users?page=0&size=20");
  return normalizePage(response.result, (payload) =>
    toUserAccount(payload as MePayload),
  );
}

export function getStoredAuthTokens() {
  if (typeof window === "undefined") {
    return {
      token: null as string | null,
      refreshToken: null as string | null,
    };
  }
  return {
    token: localStorage.getItem("abt_access_token"),
    refreshToken: localStorage.getItem("abt_refresh_token"),
  };
}

export function setStoredAuthTokens(token: string, refreshToken: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("abt_access_token", token);
    localStorage.setItem("abt_refresh_token", refreshToken);
  }
}

export function clearStoredAuthTokens() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("abt_access_token");
    localStorage.removeItem("abt_refresh_token");
  }
}
