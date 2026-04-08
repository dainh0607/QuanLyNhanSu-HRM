import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

const AuthLandingPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const dispatchUser = async () => {
      const user = authService.getCurrentUser();
      
      if (!user) {
        // Double check if context was lost, try to re-validate session
        const validatedUser = await authService.checkAuth();
        if (!validatedUser) {
          navigate('/login', { replace: true });
          return;
        }
        handleRedirection(validatedUser);
      } else {
        handleRedirection(user);
      }
    };

    const handleRedirection = (user: any) => {
      const roles = user.roles || [];
      const isAdmin = roles.includes('Admin') || roles.includes('Manager');

      if (isAdmin) {
        navigate('/personnel/employees', { replace: true });
      } else {
        navigate('/unauthorized', { replace: true });
      }
    };

    void dispatchUser();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-[#134BBA] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 text-sm font-medium">Đang xác thực quyền truy cập...</p>
      </div>
    </div>
  );
};

export default AuthLandingPage;
