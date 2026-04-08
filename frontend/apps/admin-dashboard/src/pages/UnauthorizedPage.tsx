import React from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-xl font-medium text-slate-800 mb-6">
        Nhân viên không được quyền truy cập vào hệ thống
      </h1>
      <button
        onClick={handleLogout}
        className="px-6 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors font-medium text-sm"
      >
        Đăng xuất
      </button>
    </div>
  );
};

export default UnauthorizedPage;
