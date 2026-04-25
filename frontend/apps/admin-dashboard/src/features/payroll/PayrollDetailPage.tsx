import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  payrollService,
  type PayrollEntryDetail,
} from "../../services/payrollService";
import { useToast } from "../../hooks/useToast";
import PayrollItemDetailModal from "./components/PayrollItemDetailModal";

const PayrollDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast, ToastComponent } = useToast();
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPayrollItemDetailOpen, setIsPayrollItemDetailOpen] = useState(false);
  const [isPayrollItemDetailLoading, setIsPayrollItemDetailLoading] = useState(false);
  const [selectedPayrollItemDetail, setSelectedPayrollItemDetail] =
    useState<PayrollEntryDetail | null>(null);
  const [summary, setSummary] = useState({
    totalNet: 0,
    totalEmployees: 0,
    periodName: "",
    status: ""
  });

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const response = await payrollService.getPayrollsByPeriod(Number(id));
      setData(response.items);
      
      // Find the period info from the first item or handle differently if BE provides summary
      if (response.items.length > 0) {
        const total = response.items.reduce((acc: number, curr: any) => acc + curr.net_salary, 0);
        setSummary({
          totalNet: total,
          totalEmployees: response.totalCount,
          periodName: "Chi tiết bảng lương", // Ideally get this from BE
          status: response.items[0].status
        });
      }
    } catch (error) {
      showToast("Không thể tải chi tiết bảng lương", "error");
      setTimeout(() => navigate("/payroll"), 1500);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenPayrollItemDetail = async (payrollId: number) => {
    setIsPayrollItemDetailOpen(true);
    setIsPayrollItemDetailLoading(true);
    setSelectedPayrollItemDetail(null);

    try {
      const detail = await payrollService.getPayrollDetail(payrollId);
      setSelectedPayrollItemDetail(detail);
    } catch (error) {
      console.error("Failed to load payroll item detail:", error);
      setSelectedPayrollItemDetail(null);
      showToast("KhĂ´ng thá»ƒ táº£i chi tiáº¿t phiáº¿u lÆ°Æ¡ng", "error");
    } finally {
      setIsPayrollItemDetailLoading(false);
    }
  };

  const handleClosePayrollItemDetail = () => {
    setIsPayrollItemDetailOpen(false);
    setIsPayrollItemDetailLoading(false);
    setSelectedPayrollItemDetail(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'draft':
        return <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[11px] font-bold rounded-full border border-amber-100 uppercase tracking-wider">Nháp</span>;
      case 'approved':
        return <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[11px] font-bold rounded-full border border-emerald-100 uppercase tracking-wider">Đã duyệt</span>;
      default:
        return <span className="px-3 py-1 bg-slate-50 text-slate-500 text-[11px] font-bold rounded-full border border-slate-100 uppercase tracking-wider">{status}</span>;
    }
  };

  return (
    <main className="relative flex h-[calc(100vh-64px)] w-full flex-col overflow-hidden px-[30px] py-6 bg-[#f8fafc]">
      {ToastComponent}
      
      {/* Page Header with Breadcrumb */}
      <div className="flex flex-col mb-8">
        <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
          <button onClick={() => navigate("/payroll")} className="hover:text-[#134BBA] transition-colors">Tiền lương</button>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-slate-900">Chi tiết bảng lương</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{summary.periodName}</h1>
            {getStatusBadge(summary.status)}
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate("/payroll")}
              className="h-[40px] px-4 rounded-lg border border-[#192841] bg-white text-[#192841] text-sm font-semibold hover:bg-[#192841]/5 transition-colors flex items-center gap-2 shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Quay lại
            </button>
            {summary.status?.toLowerCase() === 'draft' && (
              <button className="h-[40px] px-5 rounded-lg bg-[#134BBA] text-white text-sm font-bold shadow-md hover:shadow-lg hover:bg-[#0e378c] active:scale-95 transition-all flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">verified</span>
                Duyệt bảng lương
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0 gap-6 overflow-y-auto pr-2 custom-scrollbar">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-[#134BBA]">
              <span className="material-symbols-outlined text-[28px]">payments</span>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Tổng thực nhận</p>
              <h3 className="text-xl font-bold text-slate-900">{formatCurrency(summary.totalNet)}</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <span className="material-symbols-outlined text-[28px]">group</span>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Tổng nhân viên</p>
              <h3 className="text-xl font-bold text-slate-900">{summary.totalEmployees}</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
              <span className="material-symbols-outlined text-[28px]">account_balance_wallet</span>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Tiến độ chi trả</p>
              <h3 className="text-xl font-bold text-slate-900">0%</h3>
            </div>
          </div>
        </div>

        {/* Employee Table Container */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-0">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-[15px] py-[11px] border-b border-gray-200 text-[11px] font-semibold uppercase tracking-wider text-gray-500">Nhân viên</th>
                  <th className="px-[15px] py-[11px] border-b border-gray-200 text-[11px] font-semibold uppercase tracking-wider text-gray-500">Lương cơ bản</th>
                  <th className="px-[15px] py-[11px] border-b border-gray-200 text-[11px] font-semibold uppercase tracking-wider text-emerald-600">Phụ cấp</th>
                  <th className="px-[15px] py-[11px] border-b border-gray-200 text-[11px] font-semibold uppercase tracking-wider text-rose-600">Khấu trừ</th>
                  <th className="px-[15px] py-[11px] border-b border-gray-200 text-[11px] font-semibold uppercase tracking-wider text-gray-900 font-bold">Thực nhận</th>
                  <th className="px-[15px] py-[11px] border-b border-gray-200 text-[11px] font-semibold uppercase tracking-wider text-gray-500 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={6} className="px-[15px] py-6">
                        <div className="h-4 bg-slate-50 rounded w-full"></div>
                      </td>
                    </tr>
                  ))
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-24 text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                          <span className="material-symbols-outlined text-3xl text-slate-200">payroll</span>
                        </div>
                        <p className="text-slate-400 font-medium">Chưa có dữ liệu nhân viên trong bảng lương này</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  data.map((item) => (
                    <tr key={item.id} className="group hover:bg-gray-50 transition-colors">
                      <td className="px-[15px] py-[15px] border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[13px] font-bold text-[#134BBA] ring-2 ring-slate-50">
                            {item.employeeName?.charAt(0) || 'NV'}
                          </div>
                          <div className="min-w-0">
                            <div className="text-[13px] font-semibold text-gray-900 group-hover:text-[#134BBA] transition-colors">{item.employeeName}</div>
                            <div className="text-[11px] text-slate-400 font-medium tracking-wider uppercase">{item.employeeCode}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-[15px] py-[15px] border-b border-gray-100">
                        <span className="text-[13px] font-medium text-gray-600">{formatCurrency(item.base_salary)}</span>
                      </td>
                      <td className="px-[15px] py-[15px] border-b border-gray-100">
                        <span className="text-[13px] font-semibold text-emerald-600">+{formatCurrency(item.total_allowances)}</span>
                      </td>
                      <td className="px-[15px] py-[15px] border-b border-gray-100">
                        <span className="text-[13px] font-semibold text-rose-600">-{formatCurrency(item.total_deductions)}</span>
                      </td>
                      <td className="px-[15px] py-[15px] border-b border-gray-100">
                        <span className="text-[14px] font-bold text-gray-900">{formatCurrency(item.net_salary)}</span>
                      </td>
                      <td className="px-[15px] py-[15px] border-b border-gray-100 text-right">
                        <button
                          onClick={() => void handleOpenPayrollItemDetail(item.id)}
                          className="h-9 w-9 inline-flex items-center justify-center bg-white border border-gray-200 text-gray-400 hover:text-[#134BBA] hover:border-blue-200 hover:shadow-md rounded-xl transition-all"
                        >
                          <span className="material-symbols-outlined text-[19px]">visibility</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <PayrollItemDetailModal
        isOpen={isPayrollItemDetailOpen}
        isLoading={isPayrollItemDetailLoading}
        detail={selectedPayrollItemDetail}
        onClose={handleClosePayrollItemDetail}
        formatCurrency={formatCurrency}
      />
    </main>
  );
};

export default PayrollDetailPage;
