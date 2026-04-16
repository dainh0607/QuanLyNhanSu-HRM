import React from 'react';
import type {
  EmployeeEditContractItemPayload,
  EmployeeEditContractPayload,
} from '../../../../services/employeeService';
import { DatePickerInput } from '../components/FormPrimitives';
import EmptyState from '../../components/EmptyState';
import RegularContractModal from '../../../employees-contracts/components/Shared/RegularContractModal';
import { contractsService } from '../../../employees-contracts/services/contractsService';
import type { Employee } from '../../../employees/types';
import { useToast } from '../../../../hooks/useToast';

interface ContractFormProps {
  data: EmployeeEditContractPayload;
  errors: Record<string, string>;
  onRefresh: () => void;
  onChange: (value: EmployeeEditContractPayload) => void;
}

const ContractForm: React.FC<ContractFormProps> = ({ data, errors, onRefresh, onChange }) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [directory, setDirectory] = React.useState<Employee[]>([]);
  const { showToast } = useToast();
  const items = data;

  React.useEffect(() => {
    const fetchDirectory = async () => {
      try {
        const employees = await contractsService.fetchAllEmployees();
        setDirectory(employees);
      } catch (err) {
        console.error('Fetch directory error:', err);
      }
    };
    fetchDirectory();
  }, []);

  const employeeOptions = React.useMemo(() => contractsService.createEmployeeOptions(directory), [directory]);
  const signerOptions = React.useMemo(() => contractsService.createSignerOptions(directory), [directory]);

  const updateItem = (index: number, patch: Partial<EmployeeEditContractItemPayload>) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], ...patch };
    onChange(updatedItems);
  };

  const handleCreateNew = () => {
    setIsCreateModalOpen(true);
  };

  const handleRemove = (index: number) => {
    onChange(items.filter((_, itemIndex) => itemIndex !== index));
  };

  const getItemError = (index: number, field: keyof EmployeeEditContractItemPayload): string | undefined =>
    errors[`contract.${index}.${field}`];

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex items-center gap-4 border-l-[6px] border-emerald-500 py-1 pl-4">
        <h2 className="text-xl font-black tracking-tight text-slate-900">Hợp đồng</h2>
      </div>

      {/* Main List Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800">Danh sách hợp đồng</h3>
          <button
            type="button"
            onClick={handleCreateNew}
            className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-600 hover:shadow-emerald-500/40 active:scale-95"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            Tạo mới
          </button>
        </div>

        <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm ring-1 ring-slate-900/5 transition-all">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="w-16 px-4 py-5 font-black text-[11px] uppercase tracking-wider text-slate-400 text-center">STT</th>
                  <th className="px-4 py-5 text-left font-black text-[11px] uppercase tracking-wider text-slate-400">Họ và tên</th>
                  <th className="px-4 py-5 text-left font-black text-[11px] uppercase tracking-wider text-slate-400">Số</th>
                  <th className="px-4 py-5 text-left font-black text-[11px] uppercase tracking-wider text-slate-400">Loại hợp đồng</th>
                  <th className="px-4 py-5 text-left font-black text-[11px] uppercase tracking-wider text-slate-400">Ngày ký</th>
                  <th className="px-4 py-5 text-left font-black text-[11px] uppercase tracking-wider text-slate-400">Ngày hết hạn</th>
                  <th className="px-4 py-5 text-left font-black text-[11px] uppercase tracking-wider text-slate-400">Trạng thái</th>
                  <th className="w-14 px-4 py-5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-20">
                      <EmptyState 
                        message="Trống"
                        icon="description"
                        onAdd={handleCreateNew}
                      />
                    </td>
                  </tr>
                ) : (
                  items.map((item, index) => (
                    <tr key={index} className="group transition-colors hover:bg-slate-50/50">
                      <td className="px-4 py-4 text-center text-xs font-bold text-slate-400">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3 min-w-[180px]">
                        <input
                          type="text"
                          value={item.employeeName}
                          onChange={(e) => updateItem(index, { employeeName: e.target.value })}
                          placeholder="Họ và tên"
                          className="h-10 w-full rounded-xl border-transparent bg-transparent px-3 text-[13px] font-medium text-slate-600 transition-all hover:bg-white hover:border-slate-200 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500"
                        />
                      </td>
                      <td className="px-4 py-3 min-w-[150px]">
                        <input
                          type="text"
                          value={item.documentNumber}
                          onChange={(e) => updateItem(index, { documentNumber: e.target.value })}
                          placeholder="Số hợp đồng"
                          className={`h-10 w-full rounded-xl border-transparent bg-transparent px-3 text-[13px] font-bold text-slate-900 transition-all hover:bg-white hover:border-slate-200 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 ${getItemError(index, 'documentNumber') ? 'border-rose-300 bg-rose-50/50' : ''}`}
                        />
                      </td>
                      <td className="px-4 py-3 min-w-[180px]">
                        <input
                          type="text"
                          value={item.contractType}
                          onChange={(e) => updateItem(index, { contractType: e.target.value })}
                          placeholder="Loại hợp đồng"
                          className="h-10 w-full rounded-xl border-transparent bg-transparent px-3 text-[13px] font-medium text-slate-600 transition-all hover:bg-white hover:border-slate-200 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500"
                        />
                      </td>
                      <td className="px-4 py-3 min-w-[160px]">
                        <DatePickerInput
                          value={item.signDate}
                          onChange={(val) => updateItem(index, { signDate: val })}
                          className="!h-10 !rounded-xl !border-transparent !bg-transparent hover:!bg-white hover:!border-slate-200 focus:!bg-white focus:!border-emerald-500 !text-[13px]"
                        />
                      </td>
                      <td className="px-4 py-3 min-w-[160px]">
                        <DatePickerInput
                          value={item.expiryDate}
                          onChange={(val) => updateItem(index, { expiryDate: val })}
                          className="!h-10 !rounded-xl !border-transparent !bg-transparent hover:!bg-white hover:!border-slate-200 focus:!bg-white focus:!border-emerald-500 !text-[13px]"
                        />
                      </td>
                      <td className="px-4 py-3 min-w-[150px]">
                        <div className="relative">
                          <select
                            value={item.status}
                            onChange={(e) => updateItem(index, { status: e.target.value })}
                            className="h-10 w-full appearance-none rounded-xl border-transparent bg-transparent pl-3 pr-8 text-[12px] font-bold text-slate-600 transition-all hover:bg-white hover:border-slate-200 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 outline-none"
                          >
                            <option value="Đang hiệu lực">Đang hiệu lực</option>
                            <option value="Đã hết hạn">Đã hết hạn</option>
                            <option value="Đã thanh lý">Đã thanh lý</option>
                          </select>
                          <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[18px] pointer-events-none text-slate-400">expand_more</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemove(index)}
                          className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-300 opacity-0 transition-all hover:bg-rose-50 hover:text-rose-500 focus:opacity-100 group-hover:opacity-100"
                          title="Xóa"
                        >
                          <span className="material-symbols-outlined text-[20px]">delete_sweep</span>
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

      <RegularContractModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        employees={directory}
        employeeOptions={employeeOptions}
        signerOptions={signerOptions}
        existingContracts={[]} // Có thể bổ sung nếu cần check trùng số HĐ
        onCreated={async () => {
          await onRefresh();
          setIsCreateModalOpen(false);
        }}
        onNavigateToEmployeeProfile={() => {}}
        showToast={showToast}
      />
    </div>
  );
};

export default ContractForm;
