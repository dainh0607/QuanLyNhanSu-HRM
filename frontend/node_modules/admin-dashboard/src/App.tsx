import React, { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { EmployeeList } from './features/employees';
import { authService } from './services/authService';
import type { User } from './services/authService';
import './index.css';

const Header = ({ user, onLogout }: { user: User | null; onLogout: () => void }) => (
  <header className="h-16 bg-[#0a0f23] border-b border-white/10 flex items-center justify-between px-8 sticky top-0 z-50">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-emerald-400 rounded-lg flex items-center justify-center">
        <span className="material-symbols-outlined text-[#0a0f23] text-xl font-bold">group</span>
      </div>
      <span className="text-white font-bold text-xl tracking-tight">NexaHR</span>
    </div>
    
    <div className="flex items-center gap-6">
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-white text-xs font-semibold">{user?.fullName || 'Người dùng'}</p>
          <p className="text-white/50 text-[10px] uppercase tracking-wider">{user?.role === 'admin' ? 'Quản trị viên' : 'Nhân viên'}</p>
        </div>
        <div className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white font-bold">
          {user?.fullName?.charAt(0) || 'U'}
        </div>
      </div>
      <button 
        onClick={onLogout}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium transition-all"
      >
        <span className="material-symbols-outlined text-sm">logout</span>
        <span>Đăng xuất</span>
      </button>
    </div>
  </header>
);

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<'login' | 'register'>('login');
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = await authService.checkAuth();
        if (currentUser) {
          setIsAuthenticated(true);
          setUser(currentUser);
        }
      } finally {
        setIsInitializing(false);
      }
    };
    
    initAuth();
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setUser(authService.getCurrentUser());
  };

  const handleLogout = async () => {
    await authService.logout();
    setIsAuthenticated(false);
    setUser(null);
    setCurrentPage('login');
  };

  // Màn hình loading khi khởi tạo ứng dụng (kiểm tra session)
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[#0a0f23] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/60 text-sm font-medium">Đang khởi động hệ thống...</p>
        </div>
      </div>
    );
  }

  return (
    <div id="app-root-container">
      {isAuthenticated ? (
        <div className="min-h-screen bg-[#f8fafc]">
          <Header user={user} onLogout={handleLogout} />
          <EmployeeList />
        </div>
      ) : (
        currentPage === 'login' ? (
          <LoginPage 
            onNavigateToRegister={() => setCurrentPage('register')} 
            onLoginSuccess={handleLoginSuccess}
          />
        ) : (
          <RegisterPage 
            onNavigateToLogin={() => setCurrentPage('login')} 
            onRegisterSuccess={() => setCurrentPage('login')}
          />
        )
      )}
    </div>
  );
}

export default App;
