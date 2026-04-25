import type { PayrollEntryDetail } from "../../../services/payrollService";

interface PayrollItemDetailModalProps {
  isOpen: boolean;
  isLoading: boolean;
  detail: PayrollEntryDetail | null;
  onClose: () => void;
  formatCurrency: (amount: number) => string;
}

const getStatusClasses = (status: string): string => {
  switch (status.trim().toLowerCase()) {
    case "approved":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "draft":
      return "border-amber-200 bg-amber-50 text-amber-700";
    default:
      return "border-slate-200 bg-slate-50 text-slate-600";
  }
};

export const PayrollItemDetailModal = ({
  isOpen,
  isLoading,
  detail,
  onClose,
  formatCurrency,
}: PayrollItemDetailModalProps) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/55 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-7 py-5">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400">
              Chi tiet phieu luong
            </p>
            <h3 className="mt-2 truncate text-xl font-bold text-slate-900">
              {detail?.employeeName || "Dang tai du lieu"}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {detail?.employeeCode || "--"} {detail?.period ? `- Ky ${detail.period}` : ""}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Dong chi tiet phieu luong"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-7 py-6">
          {isLoading ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center gap-4">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#134BBA]" />
              <p className="text-sm font-semibold text-slate-500">
                Dang tai chi tiet phieu luong...
              </p>
            </div>
          ) : detail ? (
            <div className="space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-4 rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
                <div className="space-y-2">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                      Nhan vien
                    </p>
                    <p className="mt-1 text-base font-semibold text-slate-900">
                      {detail.employeeName}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {detail.employeeCode || "--"}
                    </p>
                  </div>
                  <div className="grid gap-3 text-sm text-slate-600 md:grid-cols-2">
                    <div>
                      <span className="font-semibold text-slate-800">Phong ban:</span>{" "}
                      {detail.department || "--"}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-800">Chuc vu:</span>{" "}
                      {detail.jobTitle || "--"}
                    </div>
                  </div>
                </div>

                <span
                  className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${getStatusClasses(detail.status)}`}
                >
                  {detail.status || "Unknown"}
                </span>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                    Luong co ban
                  </p>
                  <p className="mt-2 text-lg font-bold text-slate-900">
                    {formatCurrency(detail.baseSalary)}
                  </p>
                </div>
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 shadow-sm">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-600">
                    Phu cap
                  </p>
                  <p className="mt-2 text-lg font-bold text-emerald-700">
                    +{formatCurrency(detail.totalAllowances)}
                  </p>
                </div>
                <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-4 shadow-sm">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-rose-600">
                    Khau tru
                  </p>
                  <p className="mt-2 text-lg font-bold text-rose-700">
                    -{formatCurrency(detail.totalDeductions)}
                  </p>
                </div>
                <div className="rounded-2xl border border-[#BFDBFE] bg-[#EFF6FF] p-4 shadow-sm">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#134BBA]">
                    Thuc nhan
                  </p>
                  <p className="mt-2 text-lg font-bold text-[#134BBA]">
                    {formatCurrency(detail.netSalary)}
                  </p>
                </div>
              </div>

              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-5 py-4">
                  <h4 className="text-sm font-bold text-slate-900">
                    Cac thanh phan tinh luong
                  </h4>
                  <p className="mt-1 text-xs text-slate-500">
                    Danh sach thu nhap va khau tru duoc tra ve tu backend.
                  </p>
                </div>

                {detail.components.length ? (
                  <div className="divide-y divide-slate-100">
                    {detail.components.map((component, index) => {
                      const isDeduction = component.type.trim().toLowerCase() === "deduction";

                      return (
                        <div
                          key={`${component.name}-${component.type}-${index}`}
                          className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:justify-between"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900">
                              {component.name || `Thanh phan ${index + 1}`}
                            </p>
                            <p className="mt-1 text-xs uppercase tracking-wider text-slate-500">
                              {component.type || "Unknown"}
                            </p>
                          </div>

                          <span
                            className={`text-sm font-bold ${isDeduction ? "text-rose-600" : "text-emerald-600"}`}
                          >
                            {isDeduction ? "-" : "+"}
                            {formatCurrency(component.amount)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="px-5 py-14 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                      <span className="material-symbols-outlined text-[28px]">receipt_long</span>
                    </div>
                    <p className="mt-4 text-sm font-semibold text-slate-700">
                      Chua co thanh phan chi tiet
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Backend chua tra ve danh sach component cho phieu luong nay.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex min-h-[320px] flex-col items-center justify-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <span className="material-symbols-outlined text-[30px]">warning</span>
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-700">
                  Khong tai duoc chi tiet phieu luong
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Vui long dong modal va thu lai.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PayrollItemDetailModal;
