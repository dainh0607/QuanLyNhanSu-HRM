import React, { useState, useEffect } from 'react';
import { useToast } from '../../../../hooks/useToast';
import { 
  employeeService, 
  type AssetMetadata, 
  type AssetLocationMetadata,
  type EmployeeEditAssetItemPayload 
} from '../../../../services/employeeService';

interface AssetIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onIssue: (asset: EmployeeEditAssetItemPayload) => Promise<void>;
  employeeName: string;
}

const neutralSelectChevronStyle = {
  backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="#94a3b8"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>`
  )}")`,
  backgroundSize: '20px',
  backgroundPosition: 'right 20px center',
  backgroundRepeat: 'no-repeat',
} as const;

const accentSelectChevronStyle = {
  backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="#10b981"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>`
  )}")`,
  backgroundSize: '20px',
  backgroundPosition: 'right 20px center',
  backgroundRepeat: 'no-repeat',
} as const;

const AssetIssueModal: React.FC<AssetIssueModalProps> = ({ 
  isOpen, 
  onClose, 
  onIssue,
  employeeName 
}) => {
  const { showToast, ToastComponent } = useToast();
  const [assets, setAssets] = useState<AssetMetadata[]>([]);
  const [locations, setLocations] = useState<AssetLocationMetadata[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    issueDate: new Date().toISOString().split('T')[0],
    issueTime: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    issueCode: `CP${new Date().getFullYear()}_1`,
    assetId: '',
    assetLocationId: '',
    quantity: '1',
    handoverLocation: '',
    deposit: '',
    note: '',
  });

  const [selectedAsset, setSelectedAsset] = useState<AssetMetadata | null>(null);

  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        try {
          const [assetsData, locationsData] = await Promise.all([
            employeeService.getAssetsMetadata(),
            employeeService.getAssetLocationsMetadata()
          ]);
          setAssets(assetsData);
          setLocations(locationsData);
        } catch (error) {
          console.error('Error fetching metadata:', error);
        }
      };
      fetchData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAssetChange = (id: string) => {
    const asset = assets.find(a => a.id === id) || null;
    setSelectedAsset(asset);
    setFormData(prev => ({ ...prev, assetId: id }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.assetId || !formData.assetLocationId || !formData.quantity) {
      showToast('Vui lòng kiểm tra lại thông tin bắt buộc hoặc định dạng dữ liệu.', 'error');
      return;
    }

    if (isSubmitting) return;

    const qty = parseInt(formData.quantity);
    if (selectedAsset && qty > selectedAsset.availableQuantity) {
      showToast(`Số lượng cấp phát (${qty}) không được vượt quá số lượng tồn kho hiện có (${selectedAsset.availableQuantity}).`, 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await onIssue({
        assetName: selectedAsset?.name || '',
        assetCode: selectedAsset?.code || '',
        issueCode: formData.issueCode,
        quantity: formData.quantity,
        description: formData.note,
        issueDate: formData.issueDate,
      });
      onClose();
    } catch (error) {
      console.error('Issue asset error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1e293b]/60 backdrop-blur-[4px] transition-all p-4">
      <div 
        className="w-full max-w-[640px] bg-white rounded-[32px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-10 pt-10 pb-8 flex items-start justify-between">
          <div>
            <h2 className="text-[32px] font-bold text-[#1e3a8a] leading-tight">Cấp phát Tài sản</h2>
            <p className="text-[16px] text-[#94a3b8] font-medium lowercase mt-1">{employeeName}</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`${
                isSubmitting ? 'bg-emerald-300' : 'bg-[#10b981] hover:bg-[#059669]'
              } text-white px-8 py-3 rounded-2xl font-bold text-[15px] transition-all flex items-center gap-2 shadow-[0_12px_24px_rgba(16,185,129,0.3)] hover:shadow-[0_16px_32px_rgba(16,185,129,0.4)] active:scale-95`}
            >
              Cấp phát
            </button>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <span className="material-symbols-outlined text-[28px]">close</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="px-10 pb-10 overflow-y-auto custom-scrollbar">
          <form className="space-y-8">
            {/* DateTime Row */}
            <div className="flex gap-10">
              <div className="flex-1 space-y-3">
                <label className="text-[14px] font-bold text-[#1e3a8a]">Ngày cấp</label>
                <div className="relative">
                  <input
                    type="date"
                    value={formData.issueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, issueDate: e.target.value }))}
                    className="w-full h-14 pl-6 pr-14 bg-[#f8fafc] border-transparent rounded-[20px] text-[15px] font-medium text-slate-700 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none"
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                    <span className="material-symbols-outlined text-slate-400 text-[20px]">calendar_month</span>
                    <span className="material-symbols-outlined text-slate-300 text-[20px]">calendar_today</span>
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-3">
                <label className="text-[14px] font-bold text-[#1e3a8a]">Giờ cấp</label>
                <div className="relative">
                  <input
                    type="time"
                    value={formData.issueTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, issueTime: e.target.value }))}
                    className="w-full h-14 pl-6 pr-14 bg-[#f8fafc] border-transparent rounded-[20px] text-[15px] font-medium text-slate-700 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none"
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                    <span className="material-symbols-outlined text-slate-400 text-[20px]">schedule</span>
                    <span className="material-symbols-outlined text-slate-300 text-[20px]">history</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Fields List */}
            <div className="space-y-5">
              {/* Mã cấp phát */}
              <div className="grid grid-cols-[180px,1fr] items-center gap-6">
                <label className="text-[15px] font-bold text-[#1e3a8a]">Mã cấp phát</label>
                <input
                  type="text"
                  value={formData.issueCode}
                  readOnly
                  className="w-full h-14 px-6 bg-[#f8fafc] rounded-[20px] text-[15px] font-bold text-[#94a3b8] cursor-not-allowed outline-none"
                />
              </div>

              {/* Tên tài sản */}
              <div className="grid grid-cols-[180px,1fr] items-center gap-6">
                <label className="text-[15px] font-bold text-[#1e3a8a]">Tên tài sản <span className="text-red-500">*</span></label>
                <select
                  value={formData.assetId}
                  onChange={(e) => handleAssetChange(e.target.value)}
                  className="w-full h-14 px-6 bg-[#f8fafc] rounded-[20px] text-[15px] font-medium text-slate-700 outline-none appearance-none"
                  style={neutralSelectChevronStyle}
                >
                  <option value="">Chọn tài sản...</option>
                  {assets.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>

              {/* Vị trí tài sản */}
              <div className="grid grid-cols-[180px,1fr] items-center gap-6">
                <label className="text-[15px] font-bold text-[#1e3a8a]">Vị trí tài sản <span className="text-red-500">*</span></label>
                <select
                  value={formData.assetLocationId}
                  onChange={(e) => setFormData(prev => ({ ...prev, assetLocationId: e.target.value }))}
                  className="w-full h-14 px-6 bg-white border border-[#10b981]/20 rounded-[24px] text-[15px] font-medium text-slate-700 outline-none appearance-none shadow-[0_8px_20px_rgba(16,185,129,0.05)]"
                  style={accentSelectChevronStyle}
                >
                  <option value="">Chọn vị trí...</option>
                  {locations.map(l => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </div>

              {/* Số lượng */}
              <div className="grid grid-cols-[180px,1fr] items-center gap-6">
                <label className="text-[15px] font-bold text-[#1e3a8a]">Số lượng <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                  className="w-full h-14 px-6 bg-[#eff6ff] rounded-[20px] text-[15px] font-bold text-[#1e3a8a] outline-none"
                />
              </div>

              {/* Tồn kho / Tổng */}
              <div className="grid grid-cols-[180px,1fr] items-center gap-6">
                <label className="text-[15px] font-bold text-[#1e3a8a]">Tồn kho / Tổng</label>
                <input
                  type="text"
                  value={selectedAsset ? `${selectedAsset.availableQuantity}/${selectedAsset.totalQuantity}` : '0/0'}
                  readOnly
                  className="w-full h-14 px-6 bg-[#f8fafc] rounded-[20px] text-[15px] font-bold text-[#94a3b8] cursor-not-allowed outline-none"
                />
              </div>

              {/* Địa điểm bàn giao */}
              <div className="grid grid-cols-[180px,1fr] items-center gap-6">
                <label className="text-[15px] font-bold text-[#1e3a8a]">Địa điểm bàn giao</label>
                <input
                  type="text"
                  placeholder="Địa điểm"
                  value={formData.handoverLocation}
                  onChange={(e) => setFormData(prev => ({ ...prev, handoverLocation: e.target.value }))}
                  className="w-full h-14 px-6 bg-[#eff6ff] rounded-[20px] text-[15px] font-medium text-slate-700 placeholder:text-[#94a3b8]/50 outline-none"
                />
              </div>

              {/* Đặt cọc */}
              <div className="grid grid-cols-[180px,1fr] items-center gap-6">
                <label className="text-[15px] font-bold text-[#1e3a8a]">Đặt cọc</label>
                <input
                  type="text"
                  placeholder="Tiền đặt cọc"
                  value={formData.deposit}
                  onChange={(e) => setFormData(prev => ({ ...prev, deposit: e.target.value }))}
                  className="w-full h-14 px-6 bg-[#eff6ff] rounded-[20px] text-[15px] font-medium text-slate-700 placeholder:text-[#94a3b8]/50 outline-none"
                />
              </div>

              {/* Ghi chú */}
              <div className="grid grid-cols-[180px,1fr] items-start gap-6">
                <label className="text-[15px] font-bold text-[#1e3a8a] pt-4">Ghi chú</label>
                <textarea
                  rows={4}
                  placeholder="Ghi chú"
                  value={formData.note}
                  onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                  className="w-full px-6 py-5 bg-[#eff6ff] rounded-[28px] text-[15px] font-medium text-slate-700 placeholder:text-[#94a3b8]/50 outline-none resize-none"
                />
              </div>
            </div>
          </form>
        </div>
      </div>
      {ToastComponent}
    </div>
  );
};

export default AssetIssueModal;
