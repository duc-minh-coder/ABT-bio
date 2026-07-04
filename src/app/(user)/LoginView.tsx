import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Activity, ShieldCheck, Mail, Lock, LogIn, UserPlus, Info, Terminal, Sparkles, User, ShieldAlert } from 'lucide-react';
import { UserAccount, AppRole } from '../../types';

interface LoginViewProps {
  users: UserAccount[];
  onAddUser: (u: UserAccount) => void;
  onLoginSuccess: (user: UserAccount) => void;
  onNavigate: (path: string) => void;
}

export default function LoginView({
  users,
  onAddUser,
  onLoginSuccess,
  onNavigate
}: LoginViewProps) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [reqRole, setReqRole] = useState<AppRole>('user');
  const [errorLocal, setErrorLocal] = useState('');

  // Simulating sign in action
  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorLocal('');

    if (!email) {
      setErrorLocal('Vui lòng cung cấp email đăng nhập.');
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();
    
    // Find inside mock DB
    const matched = users.find(u => u.email.toLowerCase() === trimmedEmail);
    if (!matched) {
      setErrorLocal('Không tìm thấy tài khoản tương ứng trên hệ thống ABT Cloud DB.');
      return;
    }

    if (matched.status === 'blocked') {
      setErrorLocal('Tài khoản này đã bị khóa bởi Giáo trình quản trị tối cao của ABT. Vui lòng chọn tài khoản khác!');
      return;
    }

    onLoginSuccess(matched);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorLocal('');

    if (!email || !name || !department) {
      setErrorLocal('Vui lòng điền đầy đủ tất cả thông tin đăng ký!');
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();
    if (users.some(u => u.email.toLowerCase() === trimmedEmail)) {
      setErrorLocal('Email này đã được đăng ký trước đó. Vui lòng đăng nhập.');
      return;
    }

    // Add user to database
    const newUser: UserAccount = {
      id: `USR-${Math.floor(100 + Math.random() * 900)}`,
      name,
      email: trimmedEmail,
      role: reqRole,
      status: 'active',
      department,
      createdAt: new Date().toISOString()
    };

    onAddUser(newUser);
    onLoginSuccess(newUser);
  };

  const fillQuickDemo = (demoEmail: string, role: string) => {
    setEmail(demoEmail);
    setPassword('demo123456');
    setErrorLocal('');
    setIsRegisterMode(false);
  };

  return (
    <div className="max-w-md w-full mx-auto my-12" id="login-view-container">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-150 dark:border-slate-850 shadow-2xl p-8 text-left relative overflow-hidden backdrop-blur-md">
        
        {/* Glow absolute decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center space-y-3 mb-8">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-gradient-to-tr from-cyan-400 to-teal-500 flex items-center justify-center shadow-lg shadow-teal-500/10">
            <Activity className="h-6 w-6 text-white animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white uppercase font-sans">
              Cổng Đăng Nhập Hệ Thống ABT
            </h2>
            <p className="text-xs text-slate-400 mt-1">Đăng nhập phân quyền để truy cập tính năng tương ứng</p>
          </div>
        </div>

        {errorLocal && (
          <motion.div 
            initial={{ opacity: 0, y: -5 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="mb-6 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-start gap-2.5"
            id="login-error-alert"
          >
            <ShieldAlert className="h-4.5 w-4.5 text-rose-500 shrink-0 mt-0.5" />
            <span>{errorLocal}</span>
          </motion.div>
        )}

        {!isRegisterMode ? (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-sans">
                Email Người Dùng / Nhân Viên
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  type="email"
                  id="email-input-field"
                  placeholder="name@abt-biomedical.vn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-cyan-500 dark:focus:border-cyan-400 transition"
                  required
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Sử dụng tài khoản mẫu bên dưới để đăng nhập tức thì.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-sans">
                Mật Khẩu Chứng Thực
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type="password"
                  id="password-input-field"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-cyan-500 dark:focus:border-cyan-400 transition"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              id="submit-login-btn"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white text-xs font-bold font-sans uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition"
            >
              <LogIn className="h-4 w-4" />
              Xác nhận đăng nhập
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-sans">
                Họ và tên người dùng
              </label>
              <input
                type="text"
                id="reg-name-field"
                placeholder="PGS.TS Vũ Đình Hoàng"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-cyan-500 transition"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-sans">
                Email liên hệ
              </label>
              <input
                type="email"
                id="reg-email-field"
                placeholder="hoang.vd@hust.edu.vn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-cyan-500 transition"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-sans">
                Chuyên khoa / Đơn vị công tác
              </label>
              <input
                type="text"
                id="reg-dept-field"
                placeholder="Phòng Lab Công nghệ Sinh học 2"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="block w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-cyan-500 transition"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-sans">
                Đăng ký vai trò hệ thống
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-850">
                <button
                  type="button"
                  id="reg-role-user-btn"
                  onClick={() => setReqRole('user')}
                  className={`py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    reqRole === 'user' ? 'bg-cyan-500 text-white shadow-sm' : 'text-slate-500'
                  }`}
                >
                  <User className="h-3.5 w-3.5" />
                  Khách hàng (User)
                </button>
                <button
                  type="button"
                  id="reg-role-admin-btn"
                  onClick={() => setReqRole('admin')}
                  className={`py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    reqRole === 'admin' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-500'
                  }`}
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Quản trị (Admin)
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Vai trò Admin cho phép chỉnh sửa danh sách sản phẩm, phê duyệt và quản lý toàn cơ sở dữ liệu.</p>
            </div>

            <button
              type="submit"
              id="submit-register-btn"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white text-xs font-bold font-sans uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition"
            >
              <UserPlus className="h-4 w-4" />
              Tạo tài khoản & Đăng nhập
            </button>
          </form>
        )}

        {/* Toggle Mode footer view */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-850 text-center">
          <button
            id="toggle-login-mode-btn"
            onClick={() => {
              setIsRegisterMode(!isRegisterMode);
              setErrorLocal('');
            }}
            className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline font-semibold"
          >
            {isRegisterMode 
              ? 'Đã có tài khoản hệ thống? Đăng nhập ngay' 
              : 'Chưa có tài khoản? Tạo tài khoản mới'}
          </button>
        </div>

        {/* QUICK DEMO CLICK PANEL */}
        <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-850 text-xs">
          <span className="font-extrabold text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-2.5 flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-amber-500" /> Click Đăng Nhập Nhanh Để Kiểm Thử Môn Học
          </span>
          <div className="space-y-2">
            <button
              type="button"
              id="quick-login-admin-btn"
              onClick={() => fillQuickDemo('admin@abt-biomedical.vn', 'admin')}
              className="w-full p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-200/40 dark:border-rose-900/30 flex items-center justify-between text-left transition"
            >
              <div>
                <span className="font-bold block text-[11px]">Tài khoản ADMIN QUẢN TRỊ</span>
                <span className="text-[10px] font-mono opacity-80">admin@abt-biomedical.vn</span>
              </div>
              <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded bg-rose-500 text-white">Chức năng Admin</span>
            </button>

            <button
              type="button"
              id="quick-login-user-btn"
              onClick={() => fillQuickDemo('user@abt-biomedical.vn', 'user')}
              className="w-full p-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-200/40 dark:border-cyan-900/30 flex items-center justify-between text-left transition"
            >
              <div>
                <span className="font-bold block text-[11px]">Tài khoản USER NGƯỜI DÙNG</span>
                <span className="text-[10px] font-mono opacity-80">user@abt-biomedical.vn</span>
              </div>
              <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded bg-cyan-500 text-white">Chức năng User</span>
            </button>

            <button
              type="button"
              id="quick-login-blocked-btn"
              onClick={() => fillQuickDemo('blocked@abt-biomedical.vn', 'user')}
              className="w-full p-2 rounded-xl bg-slate-200/40 hover:bg-slate-200 text-slate-500 dark:bg-slate-900 dark:hover:bg-slate-850 dark:text-slate-400 border border-slate-300 dark:border-slate-800 flex items-center justify-between text-left transition"
            >
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-slate-400">Tài khoản Bị Khóa Demo</span>
              </div>
              <span className="text-[9px] opacity-75">blocked@abt-biomedical.vn</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
