import { useState, useEffect, useRef, useCallback } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { EmployeeList } from './features/employees';
import { ContractsManagementPage } from './features/employees-contracts';
import { EmployeeDetail } from './features/employee-detail/EmployeeDetailViewIntegrated';
import type { PersonalTabKey } from './features/employee-detail/edit-modal/types';
import type { Employee } from './features/employees/types';
import { authService } from './services/authService';
import type { User } from './services/authService';
import { employeeService } from './services/employeeService';
import './index.css';

// Mock data mẫu để test khi chưa đăng nhập (user === null)
const MOCK_USER: User = {
  userId: 1,
  employeeId: 101,
  email: 'nguyendinh@nexahr.vn',
  fullName: 'Nguyễn Đình',
  employeeCode: 'NV-001',
  phoneNumber: '0912 345 678',
  isActive: true,
  roles: ['Admin'],
  role: 'admin',
};

const getInitials = (fullName: string | undefined) => {
  if (!fullName) return 'NĐ';
  const names = fullName.trim().split(' ');
  if (names.length >= 2) {
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  }
  return names[0].charAt(0).toUpperCase();
};

const getRoleLabel = (user: User) => {
  if (user.roles?.includes('Admin')) return 'Quản trị viên';
  if (user.roles?.includes('Manager')) return 'Quản lý';
  return 'Nhân viên';
};

const Header = ({ user, onLogout }: { user: User | null; onLogout: () => void }) => {
  // Sử dụng mock data nếu user chưa đăng nhập
  const displayUser = user ?? MOCK_USER;

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Click outside → đóng dropdown
  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
      setIsProfileOpen(false);
    }
  }, []);

  useEffect(() => {
    if (isProfileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileOpen, handleClickOutside]);

  const navItems = [
    { name: 'Lịch', active: false },
    { name: 'Tuyển dụng', active: false },
    { name: 'Nhân sự', active: true },
    { name: 'Chấm công', active: false },
    { name: 'Yêu cầu', active: false },
    { name: 'Tiền lương', active: false },
    { name: 'Đào tạo', active: false },
    { name: 'Giao việc', active: false },
    { name: 'Thêm', active: false, hasDropdown: true },
  ];

  const profileMenuItems = [
    { label: 'Tài khoản', icon: 'person' },
    { label: 'Tích hợp', icon: 'widgets' },
    { label: 'Cài đặt', icon: 'settings' },
    { label: 'Trung tâm bảo mật', icon: 'shield' },
  ];

  return (
    <header className="h-16 bg-[#FFFFFF] border-b border-[#E5E7EB] flex items-center justify-between px-6 sticky top-0 z-[200]">
      <div className="flex items-center gap-8">
        {/* Logo Section */}
        <div className="flex items-center gap-2.5 group cursor-pointer">
          <div className="w-12 h-12 bg-gray-200 rounded-xl overflow-hidden flex items-center justify-center">
            <img 
              src="/LogoNexaHRNoText.png" 
              alt="Logo NexaHR" 
              className="w-full h-full object-contain scale-[2]"
            />
          </div>
          <span className="text-[#192841] font-bold text-2xl tracking-tighter">NexaHR</span>
        </div>

        {/* Navigation Menu */}
        <nav className="hidden lg:flex items-center gap-6">
          {navItems.map((item) => (
            <button
              key={item.name}
              className={`h-16 flex items-center gap-1 text-sm font-medium transition-colors relative ${
                item.active 
                  ? 'text-[#134BBA] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#134BBA]' 
                  : 'text-[#64748b] hover:text-[#111827]'
              }`}
            >
              {item.name}
              {item.hasDropdown && (
                <span className="material-symbols-outlined text-lg leading-none">expand_more</span>
              )}
            </button>
          ))}
        </nav>
      </div>
      
      <div className="flex items-center gap-5">
        {/* Language & Actions */}
        <div className="flex items-center gap-4 border-r border-gray-100 pr-5">
          <button className="px-3 py-1 border border-gray-200 rounded text-sm font-bold text-[#111827] hover:bg-gray-50 transition-colors">
            VI
          </button>
          <button className="relative p-1 text-[#64748b] hover:text-[#111827] transition-colors">
            <span className="material-symbols-outlined text-[24px]">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
          </button>
        </div>

        {/* Profile Section with Dropdown */}
        <div className={`relative ${isProfileOpen ? 'z-[210]' : ''}`} ref={profileRef}>
          {/* Trigger: Avatar + Chevron */}
          <button
            id="profile-trigger"
            onClick={() => setIsProfileOpen((prev) => !prev)}
            className="flex items-center gap-2 pl-1 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-full bg-[#f97316] flex items-center justify-center text-white text-sm font-bold group-hover:opacity-90 transition-opacity">
              {getInitials(displayUser.fullName)}
            </div>
            <span className={`material-symbols-outlined text-xl text-[#111827] transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`}>
              expand_more
            </span>
          </button>

          {/* Dropdown Card */}
          {isProfileOpen && (
            <div
              id="profile-dropdown"
              className="absolute right-0 top-[calc(100%+8px)] w-72 bg-white rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.12)] border border-gray-100 overflow-hidden z-[220] animate-[fadeSlideDown_0.2s_ease-out]"
            >
              {/* Header: User Info */}
              <div className="flex items-center gap-3 px-5 py-4">
                <div className="w-11 h-11 rounded-full bg-[#f97316] flex items-center justify-center text-white text-base font-bold flex-shrink-0">
                  {getInitials(displayUser.fullName)}
                </div>
                <div className="min-w-0">
                  <p className="text-[#1e293b] text-sm font-semibold truncate">{displayUser.fullName}</p>
                  <p className="text-[#94a3b8] text-xs truncate">
                    {getRoleLabel(displayUser)} · {displayUser.phoneNumber}
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-gray-100 mx-4"></div>

              {/* Menu List */}
              <div className="py-2 px-2">
                {profileMenuItems.map((item) => (
                  <button
                    key={item.label}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#475569] hover:bg-[#f1f5f9] hover:text-[#1e293b] transition-colors text-sm font-medium"
                  >
                    <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Divider */}
              <div className="h-px bg-gray-100 mx-4"></div>

              {/* Footer: Logout Button */}
              <div className="flex justify-center py-3 px-4">
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    onLogout();
                  }}
                  className="w-[90%] py-2 rounded-full border border-red-400 text-red-500 text-sm font-medium bg-white hover:bg-red-50 transition-colors"
                >
                  Thoát
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

function LegacyStateApp() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<'login' | 'register'>('login');
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  
  // Navigation state
  const [currentView, setCurrentView] = useState<'list' | 'detail'>('list');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

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
    setCurrentView('list');
  };

  const handleSelectEmployee = (emp: Employee) => {
    setSelectedEmployee(emp);
    setCurrentView('detail');
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
          {/* Ẩn Header nếu đang ở trang Detail */}
          {currentView === 'list' && <Header user={user} onLogout={handleLogout} />}
          
          {currentView === 'list' ? (
            <EmployeeList onSelectEmployee={handleSelectEmployee} />
          ) : (
            selectedEmployee && (
              <EmployeeDetail 
                employee={selectedEmployee} 
                onBack={() => setCurrentView('list')} 
              />
            )
          )}
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

void LegacyStateApp;

type AuthRedirectState = {
  from?: string;
};

type EmployeeRouteState = {
  employee?: Employee;
};

const LoadingScreen = ({ message }: { message: string }) => (
  <div className="min-h-screen bg-[#0a0f23] flex items-center justify-center">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-white/60 text-sm font-medium">{message}</p>
    </div>
  </div>
);

const EmployeeListRoute = ({
  user,
  onLogout,
}: {
  user: User | null;
  onLogout: () => Promise<void>;
}) => {
  const navigate = useNavigate();

  const handleSelectEmployee = (employee: Employee) => {
    navigate(`/personnel/employees/${employee.id}`, {
      state: { employee },
    });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Header
        user={user}
        onLogout={() => {
          void onLogout();
        }}
      />
      <EmployeeList onSelectEmployee={handleSelectEmployee} />
    </div>
  );
};

const EmployeeDetailRoute = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { employeeId } = useParams();
  const searchParams = new URLSearchParams(location.search);
  const routeState = location.state as EmployeeRouteState | null;
  const employeeFromRouteState = routeState?.employee ?? null;
  const parsedEmployeeId = Number(employeeId);
  const isValidEmployeeId = Number.isInteger(parsedEmployeeId) && parsedEmployeeId > 0;
  const returnPath =
    searchParams.get('from') === 'contracts' ? '/personnel/contracts' : '/personnel/employees';
  const editTabQuery = searchParams.get('edit');
  const initialEditPersonalTab: PersonalTabKey =
    editTabQuery === 'contact' ||
    editTabQuery === 'emergencyContact' ||
    editTabQuery === 'permanentAddress' ||
    editTabQuery === 'education' ||
    editTabQuery === 'identity' ||
    editTabQuery === 'bankAccount' ||
    editTabQuery === 'health' ||
    editTabQuery === 'dependents' ||
    editTabQuery === 'additionalInfo'
      ? editTabQuery
      : 'basicInfo';
  const openEditOnLoad = searchParams.has('edit');
  const hasStateEmployee =
    employeeFromRouteState !== null && employeeFromRouteState.id === parsedEmployeeId;
  const [employee, setEmployee] = useState<Employee | null>(
    hasStateEmployee ? employeeFromRouteState : null,
  );
  const [isLoading, setIsLoading] = useState<boolean>(!hasStateEmployee);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState<number>(0);

  useEffect(() => {
    if (!isValidEmployeeId) {
      setEmployee(null);
      setLoadError('Employee id is invalid.');
      setIsLoading(false);
      return;
    }

    if (employeeFromRouteState && employeeFromRouteState.id === parsedEmployeeId) {
      setEmployee(employeeFromRouteState);
      setLoadError(null);
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const loadEmployee = async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const data = await employeeService.getEmployeeById(parsedEmployeeId);
        if (isMounted) {
          setEmployee(data);
        }
      } catch (error) {
        console.error(`Failed to load employee ${parsedEmployeeId}:`, error);
        if (isMounted) {
          setEmployee(null);
          setLoadError('Khong the tai thong tin nhan su. Vui long thu lai.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadEmployee();

    return () => {
      isMounted = false;
    };
  }, [employeeFromRouteState, isValidEmployeeId, parsedEmployeeId, reloadToken]);

  if (!isValidEmployeeId) {
    return <Navigate to="/personnel/employees" replace />;
  }

  if (isLoading) {
    return <LoadingScreen message="Dang tai ho so nhan su..." />;
  }

  if (!employee) {
    return (
      <div className="min-h-screen bg-[#f8fafc] px-6 py-10">
        <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <button
            type="button"
            onClick={() => navigate(returnPath)}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Quay lai danh sach
          </button>

          <h1 className="text-xl font-semibold text-slate-900">Khong mo duoc ho so nhan su</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            {loadError ?? 'Khong the tai du lieu cho trang chi tiet nay.'}
          </p>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={() => setReloadToken((prev) => prev + 1)}
              className="rounded-lg bg-[#134BBA] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0f3f9f]"
            >
              Thu lai
            </button>
            <button
              type="button"
              onClick={() => navigate(returnPath)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              Ve danh sach
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <EmployeeDetail
      employee={employee}
      onBack={() => navigate(returnPath)}
      openEditOnLoad={openEditOnLoad}
      initialEditPersonalTab={initialEditPersonalTab}
      highlightWorkTypeNotice={searchParams.get('from') === 'contracts'}
    />
  );
};

const ContractsRoute = ({
  user,
  onLogout,
}: {
  user: User | null;
  onLogout: () => Promise<void>;
}) => {
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Header
        user={user}
        onLogout={() => {
          void onLogout();
        }}
      />
      <ContractsManagementPage />
    </div>
  );
};

const LegacyEmployeesRedirect = () => <Navigate to="/personnel/employees" replace />;

const LegacyEmployeeDetailRedirect = () => {
  const { employeeId } = useParams();
  const location = useLocation();

  return (
    <Navigate
      to={`/personnel/employees/${employeeId ?? ''}${location.search}${location.hash}`}
      replace
    />
  );
};

function RoutedApp() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
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

    void initAuth();
  }, []);

  const handleLoginSuccess = () => {
    const currentUser = authService.getCurrentUser();
    const redirectState = location.state as AuthRedirectState | null;
    const redirectPath =
      redirectState?.from && redirectState.from !== '/login' && redirectState.from !== '/register'
        ? redirectState.from
        : '/personnel/employees';

    setIsAuthenticated(true);
    setUser(currentUser);
    navigate(redirectPath, { replace: true });
  };

  const handleLogout = async () => {
    await authService.logout();
    setIsAuthenticated(false);
    setUser(null);
    navigate('/login', { replace: true });
  };

  if (isInitializing) {
    return <LoadingScreen message="Hệ thống đang khởi động..." />;
  }

  const defaultRoute = isAuthenticated ? '/personnel/employees' : '/login';
  const loginRedirectPath = `${location.pathname}${location.search}${location.hash}`;

  return (
    <div id="app-root-container">
      <Routes>
        <Route path="/" element={<Navigate to={defaultRoute} replace />} />
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/personnel/employees" replace />
            ) : (
              <LoginPage
                onNavigateToRegister={() => navigate('/register')}
                onLoginSuccess={handleLoginSuccess}
              />
            )
          }
        />
        <Route
          path="/register"
          element={
            isAuthenticated ? (
              <Navigate to="/personnel/employees" replace />
            ) : (
              <RegisterPage
                onNavigateToLogin={() => navigate('/login')}
                onRegisterSuccess={() => navigate('/login')}
              />
            )
          }
        />
        <Route
          path="/personnel/employees"
          element={
            isAuthenticated ? (
              <EmployeeListRoute user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace state={{ from: loginRedirectPath }} />
            )
          }
        />
        <Route
          path="/personnel/contracts"
          element={
            isAuthenticated ? (
              <ContractsRoute user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace state={{ from: loginRedirectPath }} />
            )
          }
        />
        <Route
          path="/personnel/employees/:employeeId"
          element={
            isAuthenticated ? (
              <EmployeeDetailRoute />
            ) : (
              <Navigate to="/login" replace state={{ from: loginRedirectPath }} />
            )
          }
        />
        <Route path="/employees" element={<LegacyEmployeesRedirect />} />
        <Route path="/employees/:employeeId" element={<LegacyEmployeeDetailRedirect />} />
        <Route path="*" element={<Navigate to={defaultRoute} replace />} />
      </Routes>
    </div>
  );
}

export default RoutedApp;
