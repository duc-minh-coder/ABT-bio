import type { CartItem, Order, OrderStatus, Product, AppRole } from "./types";

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
  category?: string;
  price?: number | string;
  unit?: string;
  image?: string;
  description?: string;
  specs?: string[];
  stock?: number | string;
  featured?: boolean;
  slug?: string;
};

type CartPayload = {
  product?: ProductPayload;
  quantity?: number | string;
};

type OrderPayload = {
  id?: string;
  date?: string;
  customerName?: string;
  email?: string;
  phone?: string;
  address?: string;
  organization?: string;
  paymentMethod?: "payos" | "paypal";
  items?: Array<{
    product?: ProductPayload;
    quantity?: number | string;
    priceAtOrder?: number | string;
  }>;
  status?: string;
  total?: number | string;
  paymentStatus?: string;
  notes?: string;
};

const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? "/api").replace(
  /\/$/,
  "",
);

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

  if (!response.ok || (data && data.code !== 0)) {
    const message = data?.message || "Yêu cầu API thất bại.";
    throw new Error(message);
  }

  return data as ApiResponse<T>;
}

function toProduct(payload?: ProductPayload | null): Product {
  return {
    id: String(payload?.id ?? ""),
    name: payload?.name ?? "Sản phẩm",
    category: payload?.category ?? "Khác",
    price: Number(payload?.price ?? 0),
    unit: payload?.unit ?? "thiết bị",
    image: payload?.image ?? "",
    description: payload?.description ?? "",
    specs: Array.isArray(payload?.specs) ? payload.specs : [],
    stock: Number(payload?.stock ?? 0),
    featured: Boolean(payload?.featured),
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
  return {
    id: payload?.id ?? `DH-${Date.now()}`,
    date: payload?.date ?? new Date().toISOString(),
    customerName: payload?.customerName ?? "",
    email: payload?.email ?? "",
    phone: payload?.phone ?? "",
    address: payload?.address ?? "",
    organization: payload?.organization ?? "",
    paymentMethod: payload?.paymentMethod === "paypal" ? "paypal" : "payos",
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

export async function listProducts() {
  const response = await requestJson<unknown>("/products?page=0&size=20");
  return normalizePage<ProductPayload>(response.result, toProduct);
}

export async function getProductById(id: string | number) {
  const response = await requestJson<unknown>(`/products/${id}`);
  return toProduct((response.result as ProductPayload) ?? null);
}

export async function getCart() {
  const response = await requestJson<unknown>("/cart");
  return normalizePage<CartPayload>(response.result, toCartItem);
}

export async function addCartItem(
  productId: number | string,
  quantity: number,
) {
  const response = await requestJson<unknown>("/cart", {
    method: "POST",
    body: JSON.stringify({ productId: Number(productId), quantity }),
  });
  return normalizePage<CartPayload>(response.result, toCartItem);
}

export async function removeCartItem(itemIndex: number) {
  const response = await requestJson<unknown>(`/cart/${itemIndex}`, {
    method: "DELETE",
  });
  return normalizePage<CartPayload>(response.result, toCartItem);
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
}) {
  const response = await requestJson<unknown>("/cart/checkout", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return toOrder((response.result as OrderPayload) ?? null);
}

export async function listOrders() {
  const response = await requestJson<unknown>("/orders?page=0&size=20");
  return normalizePage<OrderPayload>(response.result, toOrder);
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
