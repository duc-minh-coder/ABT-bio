import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  AppRole,
  Category,
  Product,
  CartItem,
  Order,
  OrderStatus,
  UserAccount,
  Post,
} from "./types";
import { MOCK_POSTS } from "./data";
import {
  addCartItem,
  checkoutCart,
  clearStoredAuthTokens,
  createAdminProduct,
  createCategory,
  deleteCategory,
  getCurrentUser,
  getStoredAuthTokens,
  getCart,
  listAdminUsers,
  listCategories,
  listOrders,
  listProducts,
  loginUser,
  registerUser,
  removeCartItem,
  setStoredAuthTokens,
  updateCategory,
} from "./api";
import Header from "./app/(user)/Header";
import HomeView from "./app/(user)/HomeView";
import ProductsView from "./app/(user)/ProductsView";
import CartView from "./app/(user)/CartView";
import CheckoutView from "./app/(user)/CheckoutView";
import OrdersView from "./app/(user)/OrdersView";
import AdminDashboard from "./app/(admin)/AdminDashboard";
import AdminLayout from "./app/(admin)/AdminLayout";
import AdminOrdersPanel from "./app/(admin)/AdminOrdersPanel";
import AdminUsersPanel from "./app/(admin)/AdminUsersPanel";
import AdminPostsPanel from "./app/(admin)/AdminPostsPanel";
import AdminStockPanel from "./app/(admin)/AdminStockPanel";
import LoginView from "./app/(user)/LoginView";
import PostsView from "./app/(user)/PostsView";
import {
  CheckCircle2,
  ShieldAlert,
  Phone,
  Mail,
  MapPin,
  Activity,
  HeartHandshake,
  Info,
  Clock,
  X,
  Lock,
  ArrowRight,
  BookOpen,
  UserCheck,
} from "lucide-react";

export default function App() {
  // 1. Session State Variables
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const saved = localStorage.getItem("abt_current_user");
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [users, setUsers] = useState<UserAccount[]>(() => {
    try {
      const saved = localStorage.getItem("abt_users");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [posts, setPosts] = useState<Post[]>(() => {
    try {
      const saved = localStorage.getItem("abt_posts");
      return saved ? JSON.parse(saved) : MOCK_POSTS;
    } catch (e) {
      return MOCK_POSTS;
    }
  });

  // 2. Simulated Routing paths
  const [currentPath, setCurrentPath] = useState<string>(() => {
    const path = window.location.pathname;
    return path === "/" || path === "" ? "/home" : path;
  });

  // Safe navigation function
  const onNavigate = (path: string) => {
    const target = path.startsWith("/") ? path : "/" + path;
    setCurrentPath(target);

    // Attempt standard history push
    try {
      window.history.pushState({ path: target }, "", target);
    } catch (e) {
      // ignore security restrictions
    }
  };

  // Sync state with browser navigate back / forwards
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      const path = window.location.pathname;
      setCurrentPath(path === "/" ? "/home" : path);
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  // 3. E-commerce Stock, Cart & Orders States
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem("abt_products");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [categories, setCategories] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("abt_categories");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [categoryOptions, setCategoryOptions] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem("abt_category_options");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem("abt_cart_items");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem("abt_orders");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Keep states synchronized with localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("abt_current_user", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("abt_current_user");
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem("abt_users", JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem("abt_posts", JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem("abt_products", JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem("abt_categories", JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(
      "abt_category_options",
      JSON.stringify(categoryOptions),
    );
  }, [categoryOptions]);

  useEffect(() => {
    localStorage.setItem("abt_cart_items", JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem("abt_orders", JSON.stringify(orders));
  }, [orders]);
  const [discountRate, setDiscountRate] = useState<number>(0);
  const [selectedProductDetail, setSelectedProductDetail] =
    useState<Product | null>(null);

  // Dynamic Toast Notifications State
  const [toast, setToast] = useState<{
    id: number;
    message: string;
    type: "success" | "info" | "error";
  } | null>(null);

  const showToast = (
    message: string,
    type: "success" | "info" | "error" = "success",
  ) => {
    const id = Date.now();
    setToast({ id, message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.id === id ? null : prev));
    }, 4000);
  };

  useEffect(() => {
    const hydrateCurrentUser = async () => {
      if (currentUser) {
        return;
      }
      const { token } = getStoredAuthTokens();
      if (!token) {
        return;
      }
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
      } catch {
        clearStoredAuthTokens();
      }
    };
    hydrateCurrentUser();
  }, [currentUser]);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [apiProducts, apiCategories, apiUsers] = await Promise.all([
          listProducts(),
          listCategories(),
          currentUser?.role === "admin"
            ? listAdminUsers()
            : Promise.resolve([]),
        ]);

        if (apiProducts.length > 0) {
          setProducts(apiProducts);
        }
        if (apiCategories.length > 0) {
          const categoryNames = apiCategories.map((category) => category.name);
          setCategories(categoryNames);
          setCategoryOptions(apiCategories);
        }
        if (apiUsers.length > 0) {
          setUsers(apiUsers);
        }
      } catch {
        // ignore if API is unavailable
      }

      if (!currentUser) {
        return;
      }

      try {
        const [serverCart, serverOrders] = await Promise.all([
          getCart(),
          listOrders(),
        ]);
        if (serverCart.length > 0) {
          setCartItems(serverCart);
        }
        if (serverOrders.length > 0) {
          setOrders(serverOrders);
        }
      } catch {
        // ignore if API is unavailable
      }
    };

    loadInitialData();
  }, [currentUser]);

  // Add Item to Lab Cart
  const handleAddToCart = async (product: Product) => {
    const existing = cartItems.find((item) => item.product.id === product.id);
    const count = existing ? existing.quantity : 0;

    if (count >= product.stock) {
      showToast(
        `Không thể chọn thêm. Ưu trữ lượng của mã thiết bị này tối đa là ${product.stock} ${product.unit}.`,
        "error",
      );
      return;
    }

    try {
      const nextCart = await addCartItem(product.id, 1);
      setCartItems(nextCart);
      showToast(`Đã thêm máy vào giỏ hàng: ${product.name}`, "success");
    } catch (error) {
      if (existing) {
        setCartItems(
          cartItems.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          ),
        );
      } else {
        setCartItems([...cartItems, { product, quantity: 1 }]);
      }
      showToast(`Đã thêm máy vào giỏ hàng: ${product.name}`, "success");
    }
  };

  // Update Cart quantities
  const handleUpdateQuantity = async (productId: string, delta: number) => {
    const targetItem = cartItems.find((item) => item.product.id === productId);
    if (!targetItem) {
      return;
    }

    const nextVal = targetItem.quantity + delta;
    const maxVal = targetItem.product.stock;
    if (nextVal > maxVal) {
      showToast(
        `Vượt quá trữ lượng khả dụng (${maxVal} ${targetItem.product.unit})`,
        "error",
      );
      return;
    }

    if (delta > 0) {
      try {
        const nextCart = await addCartItem(productId, 1);
        setCartItems(nextCart);
        return;
      } catch {
        setCartItems(
          cartItems.map((item) => {
            if (item.product.id === productId) {
              return { ...item, quantity: Math.max(1, nextVal) };
            }
            return item;
          }),
        );
      }
    }

    if (nextVal <= 0) {
      const index = cartItems.findIndex(
        (item) => item.product.id === productId,
      );
      if (index >= 0) {
        try {
          const nextCart = await removeCartItem(index);
          setCartItems(nextCart);
          showToast(`Đã xóa thiết bị ra khỏi giỏ hàng`, "info");
          return;
        } catch {
          setCartItems(
            cartItems.filter((item) => item.product.id !== productId),
          );
          showToast(`Đã xóa thiết bị ra khỏi giỏ hàng`, "info");
          return;
        }
      }
    }

    setCartItems(
      cartItems.map((item) => {
        if (item.product.id === productId) {
          return { ...item, quantity: Math.max(1, nextVal) };
        }
        return item;
      }),
    );
  };

  // Remove Item
  const handleRemoveItem = async (productId: string) => {
    const index = cartItems.findIndex((item) => item.product.id === productId);
    if (index < 0) {
      return;
    }

    try {
      const nextCart = await removeCartItem(index);
      setCartItems(nextCart);
    } catch {
      setCartItems(cartItems.filter((item) => item.product.id !== productId));
    }
    showToast(`Đã xóa thiết bị ra khỏi giỏ hàng`, "info");
  };

  // Confirm order & sync to local state
  const handlePlaceOrder = async (newOrder: Order) => {
    try {
      const createdOrder = await checkoutCart({
        customerName: newOrder.customerName,
        email: newOrder.email,
        phone: newOrder.phone,
        address: newOrder.address,
        organization: newOrder.organization,
        paymentMethod: newOrder.paymentMethod,
        items: newOrder.items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          priceAtOrder: item.priceAtOrder,
        })),
        total: newOrder.total,
        notes: newOrder.notes,
      });
      setOrders([createdOrder, ...orders]);

      const updatedProducts = products.map((prod) => {
        const orderItem = createdOrder.items.find(
          (it) => it.product.id === prod.id,
        );
        if (orderItem) {
          return {
            ...prod,
            stock: Math.max(0, prod.stock - orderItem.quantity),
          };
        }
        return prod;
      });

      setProducts(updatedProducts);
      setSelectedProductDetail(null);
      setCartItems([]);
      showToast(
        `Đơn hàng ${createdOrder.id} đã hoàn thành thủ tục đăng ký!`,
        "success",
      );
      onNavigate("/orders");
    } catch (error) {
      setOrders([newOrder, ...orders]);
      const updatedProducts = products.map((prod) => {
        const orderItem = newOrder.items.find(
          (it) => it.product.id === prod.id,
        );
        if (orderItem) {
          return {
            ...prod,
            stock: Math.max(0, prod.stock - orderItem.quantity),
          };
        }
        return prod;
      });
      setProducts(updatedProducts);
      setSelectedProductDetail(null);
      setCartItems([]);
      showToast(
        error instanceof Error ? error.message : "Tạo đơn hàng thất bại.",
        "error",
      );
      onNavigate("/orders");
    }
  };

  // Admin routing updates
  const handleUpdateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(
      orders.map((o) => {
        if (o.id === orderId) {
          const paymentStatus =
            status === "paid" || status === "shipping" || status === "completed"
              ? "paid"
              : o.paymentStatus;
          return { ...o, status, paymentStatus };
        }
        return o;
      }),
    );
    showToast(
      `Đã cập nhật trạng thái đơn ${orderId} sang trạng thái mới thành công!`,
      "success",
    );
  };

  // User request cancel order
  const handleCancelOrder = (orderId: string) => {
    setOrders(
      orders.map((o) => (o.id === orderId ? { ...o, status: "cancelled" } : o)),
    );
    showToast(
      `Đơn hàng ${orderId} đã được hủy bỏ thành công theo yêu cầu`,
      "info",
    );
  };

  const handleCreateProduct = async (payload: {
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
  }) => {
    try {
      const createdProduct = await createAdminProduct(payload);
      setProducts((prev) => [createdProduct, ...prev]);
      const matchedCategory = categoryOptions.find(
        (category) => category.id === String(payload.categoryId),
      );
      if (matchedCategory && !categories.includes(matchedCategory.name)) {
        setCategories((prev) => [...prev, matchedCategory.name]);
        setCategoryOptions((prev) =>
          prev.some((category) => category.id === matchedCategory.id)
            ? prev
            : [...prev, matchedCategory],
        );
      }
      showToast(`Đã tạo sản phẩm mới: ${createdProduct.name}`, "success");
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Tạo sản phẩm thất bại.",
        "error",
      );
    }
  };

  const handleCreateCategory = async (payload: {
    name: string;
    slug: string;
    image?: string;
    description?: string;
    status?: string;
  }) => {
    try {
      const createdCategory = await createCategory(payload);
      const nextCategoryOptions = [createdCategory, ...categoryOptions];
      setCategoryOptions(nextCategoryOptions);
      setCategories(nextCategoryOptions.map((category) => category.name));
      showToast(`Đã tạo danh mục mới: ${createdCategory.name}`, "success");
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Tạo danh mục thất bại.",
        "error",
      );
    }
  };

  const handleUpdateCategory = async (
    id: string | number,
    payload: {
      name: string;
      slug: string;
      image?: string;
      description?: string;
      status?: string;
    },
  ) => {
    try {
      const updatedCategory = await updateCategory(id, payload);
      const nextCategoryOptions = categoryOptions.map((category) =>
        category.id === String(id) ? updatedCategory : category,
      );
      setCategoryOptions(nextCategoryOptions);
      setCategories(nextCategoryOptions.map((category) => category.name));
      showToast(`Đã cập nhật danh mục: ${updatedCategory.name}`, "success");
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Cập nhật danh mục thất bại.",
        "error",
      );
    }
  };

  const handleDeleteCategory = async (id: string | number) => {
    try {
      await deleteCategory(id);
      const nextCategoryOptions = categoryOptions.filter(
        (category) => category.id !== String(id),
      );
      setCategoryOptions(nextCategoryOptions);
      setCategories(nextCategoryOptions.map((category) => category.name));
      showToast("Đã xóa danh mục thành công.", "info");
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Xóa danh mục thất bại.",
        "error",
      );
    }
  };

  // Admin restock simulation
  const handleRestockProduct = (productId: string, amount: number) => {
    setProducts(
      products.map((p) =>
        p.id === productId ? { ...p, stock: p.stock + amount } : p,
      ),
    );
    showToast(
      `Đã nhập thêm +${amount} thiết bị cho mẫu ${productId}`,
      "success",
    );
  };

  const handleApplyPromoCode = (rate: number, code: string) => {
    setDiscountRate(rate);
    showToast(`Đã áp dụng thành công mã ưu đãi giáo trình: ${code}`, "success");
  };

  // Clear Cart helper
  const handleClearCart = () => {
    setCartItems([]);
    setDiscountRate(0);
  };

  // Auth/Session action triggers
  const handleLoginSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    showToast(`Đăng nhập thành công! Xin chào ${user.name}`, "success");

    if (user.role === "admin") {
      onNavigate("/admin/dashboard");
    } else {
      onNavigate("/products");
    }
  };

  const handleAddUser = (newUser: UserAccount) => {
    setUsers([newUser, ...users]);
    showToast(
      `Đã cấp thành công tài khoản người dùng cho ${newUser.name}`,
      "success",
    );
  };

  const handleLogout = () => {
    setCurrentUser(null);
    clearStoredAuthTokens();
    showToast(`Đã đăng xuất khỏi hệ thống ABT.`, "info");
    onNavigate("/login");
  };

  // Admin: Update user role
  const handleUpdateUserRole = (userId: string, role: "user" | "admin") => {
    setUsers(users.map((u) => (u.id === userId ? { ...u, role } : u)));
    showToast(
      `Đã cập nhật phân quyền thành viên thành ${role === "admin" ? "ADMIN" : "USER"}`,
      "success",
    );
  };

  // Admin: Block / Unblock user accounts
  const handleUpdateUserStatus = (
    userId: string,
    status: "active" | "blocked",
  ) => {
    setUsers(users.map((u) => (u.id === userId ? { ...u, status } : u)));
    showToast(
      status === "blocked"
        ? `Đã khóa tài khoản thành viên thành công!`
        : `Đã mở khóa tài khoản thành viên thành công!`,
      "info",
    );
  };

  // Admin: Blogs management
  const handleAddNewPost = (newPost: Post) => {
    setPosts([newPost, ...posts]);
    showToast(`Đã xuất bản bài báo khoa học y sinh mới thành công!`, "success");
  };

  const handleDeletePost = (postId: string) => {
    setPosts(posts.filter((p) => p.id !== postId));
    showToast(`Đã loại bỏ bài viết ${postId} khỏi trang nhất`, "info");
  };

  // Filter personal orders
  // "còn user sẽ có các chức năng... xem orders của bản thân"
  const personalOrders = orders.filter((o) => {
    if (!currentUser) return false;
    // Match by email
    return o.email.toLowerCase() === currentUser.email.toLowerCase();
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-150 font-sans antialiased">
      {/* 1. Header Navigation */}
      <Header
        currentUser={currentUser}
        onLogout={handleLogout}
        currentPath={currentPath}
        onNavigate={onNavigate}
        cartCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
      />

      {/* 2. Main content router */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPath}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.18 }}
            className="w-full animate-fade"
          >
            {/* PATH: /login */}
            {currentPath === "/login" && (
              <LoginView
                users={users}
                onAddUser={handleAddUser}
                onLoginSuccess={handleLoginSuccess}
                onNavigate={onNavigate}
              />
            )}

            {/* PATH: /home */}
            {currentPath === "/home" && (
              <HomeView
                products={products}
                onExploreProducts={() => onNavigate("/products")}
                onAddToCart={handleAddToCart}
                onViewProductDetail={(p) => {
                  setSelectedProductDetail(p);
                  onNavigate("/products");
                }}
              />
            )}

            {/* PATH: /products */}
            {currentPath === "/products" && (
              <ProductsView
                products={products}
                categories={categories}
                onAddToCart={handleAddToCart}
                selectedProductDetail={selectedProductDetail}
                onSetSelectedProductDetail={setSelectedProductDetail}
              />
            )}

            {/* PATH: /cart */}
            {currentPath === "/cart" && (
              <CartView
                cartItems={cartItems}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveItem}
                onClearCart={handleClearCart}
                onNavigateToTab={(tab) => {
                  const pathMap: Record<string, string> = {
                    products: "/products",
                    checkout: "/checkout",
                    home: "/home",
                  };
                  onNavigate(pathMap[tab] || "/home");
                }}
                discountRate={discountRate}
                onApplyPromoCode={handleApplyPromoCode}
              />
            )}

            {/* PATH: /checkout */}
            {currentPath === "/checkout" &&
              (currentUser ? (
                <CheckoutView
                  cartItems={cartItems}
                  discountRate={discountRate}
                  onPlaceOrder={handlePlaceOrder}
                  onClearCart={handleClearCart}
                  onNavigateToTab={(tab) => {
                    const pathMap: Record<string, string> = {
                      products: "/products",
                      cart: "/cart",
                      orders: "/orders",
                      home: "/home",
                    };
                    onNavigate(pathMap[tab] || "/home");
                  }}
                  // Prefilling with customer credentials
                  initialCustomerName={currentUser.name}
                  initialEmail={currentUser.email}
                  initialOrg={currentUser.department}
                />
              ) : (
                <div className="max-w-md mx-auto bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 p-8 rounded-3xl text-center space-y-4 shadow-xl">
                  <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
                    <Lock className="h-6 w-6" />
                  </div>
                  <h3 className="text-sm font-extrabold uppercase text-slate-800 dark:text-white">
                    Yêu cầu đăng ký tài khoản
                  </h3>
                  <p className="text-xs text-slate-500">
                    Vui lòng đăng nhập hoặc đăng ký tài khoản người dùng ABT để
                    tiến hành lưu trữ thanh toán, theo dõi quy định xuất xưởng.
                  </p>
                  <button
                    id="checkout-login-redirect"
                    onClick={() => onNavigate("/login")}
                    className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition"
                  >
                    Đăng Nhập/Đăng ký Ngay
                  </button>
                </div>
              ))}

            {/* PATH: /orders */}
            {currentPath === "/orders" &&
              (currentUser ? (
                <div className="space-y-6">
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-left">
                    <span className="text-[10px] font-mono text-cyan-400 font-bold block uppercase">
                      Bảng điều phối cá nhân:
                    </span>
                    <h3 className="text-xs font-bold text-white mt-1">
                      Đơn hàng đã ký của người dùng: {currentUser.name} (
                      {currentUser.email})
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Hệ thống chỉ hiển thị các đơn hàng do chính bạn gửi lên
                      theo tinh thần an toàn SOP.
                    </p>
                  </div>
                  <OrdersView
                    orders={personalOrders}
                    onCancelOrder={handleCancelOrder}
                    onNavigateToTab={(tab) => {
                      const pathMap: Record<string, string> = {
                        products: "/products",
                        home: "/home",
                      };
                      onNavigate(pathMap[tab] || "/home");
                    }}
                  />
                </div>
              ) : (
                <div className="max-w-md mx-auto bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 p-8 rounded-3xl text-center space-y-4 shadow-xl">
                  <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
                    <Lock className="h-6 w-6" />
                  </div>
                  <h3 className="text-sm font-extrabold uppercase text-slate-800 dark:text-white">
                    Sổ liên lạc đơn hàng bảo mật
                  </h3>
                  <p className="text-xs text-slate-500">
                    Vui lòng đăng nhập tài khoản người dùng trước khi xem lại
                    lịch sử mua sắm, trạng thái VietQR hoặc tiến hành hủy đơn.
                  </p>
                  <button
                    id="orders-login-redirect"
                    onClick={() => onNavigate("/login")}
                    className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-teal-600 text-white font-black text-xs uppercase tracking-wider rounded-xl transition"
                  >
                    Đăng Nhập Để Xem Đơn Hàng
                  </button>
                </div>
              ))}

            {/* PATH: /posts */}
            {currentPath === "/posts" && <PostsView posts={posts} />}

            {/* PATH: /admin/dashboard and subpages - Guarded by Role */}
            {currentPath.startsWith("/admin/dashboard") &&
              (currentUser?.role === "admin" ? (
                <AdminDashboard
                  currentPath={currentPath}
                  onNavigate={onNavigate}
                  orders={orders}
                  onUpdateOrderStatus={handleUpdateOrderStatus}
                  products={products}
                  categories={categoryOptions}
                  onRestockProduct={handleRestockProduct}
                  onCreateProduct={handleCreateProduct}
                  onCreateCategory={handleCreateCategory}
                  onUpdateCategory={handleUpdateCategory}
                  onDeleteCategory={handleDeleteCategory}
                  users={users}
                  onUpdateUserRole={handleUpdateUserRole}
                  onUpdateUserStatus={handleUpdateUserStatus}
                  onAddNewUser={handleAddUser}
                  posts={posts}
                  onAddNewPost={handleAddNewPost}
                  onDeletePost={handleDeletePost}
                />
              ) : (
                <div
                  className="max-w-md mx-auto bg-slate-900 border border-slate-850 p-8 rounded-3xl text-center space-y-5 shadow-2xl relative overflow-hidden"
                  id="admin-access-denied"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl" />

                  <div className="h-14 w-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mx-auto">
                    <ShieldAlert className="h-7 w-7" />
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-xs font-black uppercase tracking-widest text-rose-450 text-rose-400">
                      KHU VỰC CẤM TRUY CẬP TRÁI PHÉP
                    </h3>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      Đường dẫn{" "}
                      <span className="font-mono text-white bg-slate-950 px-1 py-0.5 rounded">
                        /admin/dashboard
                      </span>{" "}
                      yêu cầu tài khoản Ban kỹ thuật ABT có thẩm quyền cao nhất
                      để phê duyệt đơn hàng hoặc quản lý người dùng.
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800 space-y-3">
                    <span className="text-[10px] text-slate-500 block uppercase font-mono font-bold tracking-wider">
                      Họ tên hiện tại:{" "}
                      <span className="text-cyan-400">
                        {currentUser ? currentUser.name : "Khách vãng lai"}
                      </span>
                    </span>

                    <button
                      id="access-denied-login-btn"
                      onClick={() => onNavigate("/login")}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 text-white text-xs font-extrabold uppercase tracking-widest hover:brightness-110 active:scale-[0.98] transition flex items-center justify-center gap-1.5"
                    >
                      <UserCheck className="h-4 w-4" />
                      Đổi sang tài khoản Admin
                    </button>
                  </div>
                </div>
              ))}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* 3. Toast Notifications overlay panel */}
      <AnimatePresence>
        {toast && (
          <motion.div
            id="global-toast-container"
            initial={{ opacity: 0, y: 35, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 max-w-sm rounded-2xl p-4 shadow-2xl flex items-start gap-3 border text-left text-xs text-white bg-slate-900 border-slate-850"
          >
            {toast.type === "success" && (
              <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
            )}
            {toast.type === "info" && (
              <Info className="h-5 w-5 text-cyan-400 shrink-0" />
            )}
            {toast.type === "error" && (
              <ShieldAlert className="h-5 w-5 text-rose-500 shrink-0" />
            )}

            <div className="flex-1 space-y-1">
              <span className="font-extrabold block text-slate-100 font-sans uppercase tracking-widest text-[9px]">
                {toast.type === "success"
                  ? "Thông báo thành công"
                  : toast.type === "error"
                    ? "Cảnh báo lỗi"
                    : "Thông báo hệ thống"}
              </span>
              <p className="text-slate-300 leading-normal">{toast.message}</p>
            </div>

            <button
              id="close-toast-btn"
              onClick={() => setToast(null)}
              className="text-slate-500 hover:text-slate-300 transition shrink-0 p-0.5 rounded-full"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. Elegant Corporate Medical Footer */}
      <footer className="bg-slate-950 text-slate-400 py-10 border-t border-slate-900 mt-16 text-xs text-left">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Intro info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-cyan-400 to-teal-500 flex items-center justify-center">
                <Activity className="h-4.5 w-4.5 text-white" />
              </div>
              <span className="text-sm font-bold text-white tracking-widest">
                ABT BIOMEDICAL
              </span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-500">
              Chuyên gia cung cấp giải pháp máy vi sinh, tủ CO2, phòng tế bào
              hạt và các hệ thống chẩn đoán phân tử Real-time PCR ủy quyền cao
              cấp tại Việt Nam.
            </p>
          </div>

          {/* Contact coordinates */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-white text-[11px] tracking-wider uppercase font-mono">
              Trụ sở liên hệ
            </h4>
            <div className="space-y-2 text-slate-500">
              <div className="flex gap-2 items-start">
                <MapPin className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>
                  Số 45, Đường Số 3, Khu công nghệ phần mềm Quang Trung, Quận
                  12, TP.HCM
                </span>
              </div>
              <div className="flex gap-2 items-center">
                <Phone className="h-4 w-4 text-cyan-400 shrink-0" />
                <span>Hotline: 1900-9899 | Điện thoại: 028-2234-5678</span>
              </div>
              <div className="flex gap-2 items-center">
                <Mail className="h-4 w-4 text-cyan-400 shrink-0" />
                <span>Email: technical-support@abt-biomedical.vn</span>
              </div>
            </div>
          </div>

          {/* Academic features info */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-white text-[11px] tracking-wider uppercase font-mono">
              Phiên bản thử nghiệm BTL
            </h4>
            <div className="space-y-1 text-slate-500">
              <p>• Thiết kế giao diện y sinh hiện đại</p>
              <p>• Đồng bộ hóa định mức qua Java Spring Boot</p>
              <p>• Tích hợp giả lập PayOS & PayPal QR Code</p>
              <p>• Tương thích 100% tài liệu thuyết trình BTL</p>
            </div>
          </div>

          {/* Legal references */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-white text-[11px] tracking-wider uppercase font-mono">
              Cam kết và chất lượng
            </h4>
            <div className="space-y-2 text-slate-500">
              <div className="flex gap-1.5 items-center">
                <HeartHandshake className="h-4 w-4 text-teal-400" />
                <span>Chính sách một đổi một trong 30 ngày</span>
              </div>
              <p className="text-[10px] text-slate-600">
                ABT cam kết hoàn trả 100% giá thành nếu xảy ra sai lệch về chỉ
                số kỹ thuật hoặc CO/CQ không rõ ràng từ đối tác y học.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom copyright segment */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 mt-8 border-t border-slate-900/40 text-center text-[10px] text-slate-600 flex flex-col sm:flex-row justify-between gap-4">
          <p>
            © 2026 Bản quyền thuộc về Đồ Án Tốt Nghiệp / Bài Tập Lớn Thiết bị Y
            Sinh ABT. All rights reserved.
          </p>
          <div className="flex gap-4 justify-center">
            <span className="hover:text-slate-400 cursor-pointer">
              Bảo mật thông tin bệnh nhân
            </span>
            <span className="hover:text-slate-400 cursor-pointer">
              Chính sách hiệu chuẩn chất lượng
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
