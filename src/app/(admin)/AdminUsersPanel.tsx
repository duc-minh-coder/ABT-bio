import React, { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Search, UserPlus, Lock, Unlock } from "lucide-react";
import { UserAccount } from "../../types";

interface AdminUsersPanelProps {
  users: UserAccount[];
  onUpdateUserRole: (userId: string, role: "user" | "admin") => void;
  onUpdateUserStatus: (userId: string, status: "active" | "blocked") => void;
  onAddNewUser: (newUser: UserAccount) => void;
}

export default function AdminUsersPanel({
  users,
  onUpdateUserRole,
  onUpdateUserStatus,
  onAddNewUser,
}: AdminUsersPanelProps) {
  const [userQuery, setUserQuery] = useState("");
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState<"user" | "admin">("user");
  const [newUserDept, setNewUserDept] = useState("");

  const filteredUsers = users.filter((usr) => {
    const q = userQuery.trim().toLowerCase();
    return (
      usr.name.toLowerCase().includes(q) ||
      usr.email.toLowerCase().includes(q) ||
      usr.department.toLowerCase().includes(q)
    );
  });

  const handleCreateUser = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newUserName || !newUserEmail || !newUserDept) return;

    onAddNewUser({
      id: `USR-${Math.floor(100 + Math.random() * 900)}`,
      name: newUserName,
      email: newUserEmail.trim().toLowerCase(),
      role: newUserRole,
      status: "active",
      department: newUserDept,
      createdAt: new Date().toISOString(),
    });

    setNewUserName("");
    setNewUserEmail("");
    setNewUserRole("user");
    setNewUserDept("");
    setShowAddUserModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 p-5 rounded-3xl shadow-sm">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase">
            Quản lý người dùng
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Quản lý vai trò, trạng thái và tài khoản thử nghiệm.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-2xl border border-slate-200 dark:border-slate-850 text-xs w-full sm:max-w-xs">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm người dùng, email..."
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-[11px] text-slate-900 dark:text-slate-200 w-full"
            />
          </div>
          <button
            onClick={() => setShowAddUserModal(true)}
            className="inline-flex items-center gap-2 rounded-2xl bg-rose-600 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-white hover:bg-rose-500 transition"
          >
            <UserPlus className="h-4 w-4" />
            Thêm tài khoản
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto max-w-[80vw] md:max-w-none">
          <table className="w-full table-auto text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-400 uppercase tracking-[0.18em] text-[10px] font-bold">
              <tr>
                <th className="py-3 px-4 text-left">ID</th>
                <th className="py-3 px-4 text-left">Người dùng</th>
                <th className="py-3 px-4 text-left">Email</th>
                <th className="py-3 px-4 text-center">Vai trò</th>
                <th className="py-3 px-4 text-center">Trạng thái</th>
                <th className="py-3 px-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-slate-700 dark:text-slate-300">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-8 text-center text-slate-400 text-xs"
                  >
                    Không có kết quả phù hợp.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((usr) => (
                  <tr
                    key={usr.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-950/50"
                  >
                    <td className="py-3.5 px-4 font-mono text-[11px] font-bold text-slate-600 dark:text-slate-300">
                      {usr.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {usr.name}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {usr.department}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                      {usr.email}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-semibold ${
                          usr.role === "admin"
                            ? "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-500/10"
                            : "bg-cyan-100 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-400 border border-cyan-500/10"
                        }`}
                      >
                        {usr.role === "admin" ? "ADMIN" : "USER"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-bold ${
                          usr.status === "blocked"
                            ? "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400"
                            : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                        }`}
                      >
                        {usr.status === "blocked" ? (
                          <Lock className="h-3 w-3" />
                        ) : (
                          <Unlock className="h-3 w-3" />
                        )}
                        {usr.status === "blocked" ? "Khóa" : "Hoạt động"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() =>
                          onUpdateUserRole(
                            usr.id,
                            usr.role === "admin" ? "user" : "admin",
                          )
                        }
                        className="px-2 py-1 rounded-2xl border border-slate-200 dark:border-slate-800 text-[10px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-950 transition"
                      >
                        Đổi vai trò
                      </button>
                      <button
                        onClick={() =>
                          onUpdateUserStatus(
                            usr.id,
                            usr.status === "active" ? "blocked" : "active",
                          )
                        }
                        className={`px-2 py-1 rounded-2xl text-[10px] font-semibold border transition ${
                          usr.status === "active"
                            ? "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300"
                            : "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300"
                        }`}
                      >
                        {usr.status === "active" ? "Khóa" : "Mở"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {showAddUserModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-800 p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase">
                    Tạo tài khoản mới
                  </h3>
                  <p className="text-xs text-slate-500">
                    Thêm người dùng mới cho hệ thống.
                  </p>
                </div>
                <button
                  className="text-slate-400 hover:text-slate-600"
                  onClick={() => setShowAddUserModal(false)}
                >
                  Đóng
                </button>
              </div>
              <form
                onSubmit={handleCreateUser}
                className="space-y-4 text-xs text-slate-800 dark:text-slate-200"
              >
                <div>
                  <label className="block uppercase tracking-[0.2em] text-slate-500 text-[10px] mb-1">
                    Tên người dùng
                  </label>
                  <input
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="TS. Nguyễn Văn A"
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 outline-none text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block uppercase tracking-[0.2em] text-slate-500 text-[10px] mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="abc@example.com"
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 outline-none text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block uppercase tracking-[0.2em] text-slate-500 text-[10px] mb-1">
                    Đơn vị
                  </label>
                  <input
                    value={newUserDept}
                    onChange={(e) => setNewUserDept(e.target.value)}
                    placeholder="Phòng thí nghiệm y sinh"
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 outline-none text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block uppercase tracking-[0.2em] text-slate-500 text-[10px] mb-1">
                    Vai trò
                  </label>
                  <select
                    value={newUserRole}
                    onChange={(e) =>
                      setNewUserRole(e.target.value as "user" | "admin")
                    }
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 outline-none text-sm"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <button className="w-full rounded-2xl bg-rose-600 px-4 py-3 text-xs font-bold uppercase tracking-[0.2em] text-white hover:bg-rose-500 transition">
                  Tạo tài khoản
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
