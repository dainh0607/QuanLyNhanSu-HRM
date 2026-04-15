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
    
    // Kiểm tra thông tin bắt buộc
    if (!formData.assetId || !formData.assetLocationId || !formData.quantity) {
      showToast('Vui lòng kiểm tra lại thông tin bắt buộc hoặc định dạng dữ liệu.', 'error');
      return;
    }

    if (isSubmitting) return;

    // Ràng buộc số lượng không được vượt quá tồn kho
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px] transition-all p-4">
      <div 
        className="w-full max-w-[700px] bg-white rounded-[32px] shadow-[0_24px_50px_-12px_rgba(0,0,0,0.15)] overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col max-h-[95vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-8 pt-8 pb-6 flex items-center justify-between border-b border-slate-50">
          <div>
            <h2 className="text-[28px] font-bold text-[#1c3563] mb-1">Cấp phát Tài sản</h2>
            <p className="text-[15px] text-slate-400 font-medium lowercase tracking-wide">{employeeName}</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`${
                isSubmitting ? 'bg-emerald-300 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-600'
              } text-white px-6 py-2.5 rounded-2xl font-bold text-[14px] transition-all flex items-center gap-2 shadow-[0_8px_20px_rgba(16,185,129,0.2)] active:scale-95`}
            >
              {isSubmitting && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>
              )}
              Cấp phát
            </button>
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <span className="material-symbols-outlined text-[28px]">close</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="px-8 py-8 overflow-y-auto custom-scrollbar">
          <form className="space-y-8">
            {/* DateTime Row */}
            <div className="flex gap-8">
              <div className="flex-1 space-y-3">
                <label className="text-[14px] font-bold text-[#1c3563] flex items-center gap-2">
                  Ngày cấp
                </label>
                <div className="relative group">
                  <input
                    type="date"
                    value={formData.issueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, issueDate: e.target.value }))}
                    className="w-full h-14 pl-5 pr-12 bg-slate-50 border border-transparent rounded-[20px] text-[15px] font-medium text-slate-700 focus:bg-white focus:border-emerald-500/30 focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none"
                  />
                  <span className="material-symbols-outlined absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors pointer-events-none">calendar_today</span>
                </div>
              </div>

              <div className="flex-1 space-y-3">
                <label className="text-[14px] font-bold text-[#1c3563] flex items-center gap-2">
                  Giờ cấp
                </label>
                <div className="relative group">
                  <input
                    type="time"
                    value={formData.issueTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, issueTime: e.target.value }))}
                    className="w-full h-14 pl-5 pr-12 bg-slate-50 border border-transparent rounded-[20px] text-[15px] font-medium text-slate-700 focus:bg-white focus:border-emerald-500/30 focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none"
                  />
                  <span className="material-symbols-outlined absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors pointer-events-none">schedule</span>
                </div>
              </div>
            </div>

            {/* Fields Grid */}
            <div className="space-y-6">
              {/* Mã cấp phát */}
              <div className="grid grid-cols-[180px,1fr] items-center gap-6">
                <label className="text-[15px] font-bold text-slate-600">Mã cấp phát</label>
                <input
                  type="text"
                  value={formData.issueCode}
                  readOnly
                  className="w-full h-14 px-5 bg-slate-100/50 border border-transparent rounded-[20px] text-[15px] font-bold text-slate-400 cursor-not-allowed outline-none"
                />
              </div>

              {/* Tên tài sản */}
              <div className="grid grid-cols-[180px,1fr] items-start gap-6 pt-2">
                <label className="text-[15px] font-bold text-slate-600 pt-4">Tên tài sản <span className="text-red-500">*</span></label>
                <select
                  value={formData.assetId}
                  onChange={(e) => handleAssetChange(e.target.value)}
                  className="w-full h-14 px-5 bg-slate-50 border border-transparent rounded-[20px] text-[15px] font-medium text-slate-700 focus:bg-white focus:border-emerald-500/30 transition-all outline-none appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%2394a3b8%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22m19%209-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px] bg-[right_20px_center] bg-no-repeat"
                >
                  <option value="">Chọn tài sản...</option>
                  {assets.map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({a.code})</option>
                  ))}
                </select>
              </div>

              {/* Vị trí tài sản */}
              <div className="grid grid-cols-[180px,1fr] items-start gap-6 pt-2">
                <label className="text-[15px] font-bold text-slate-600 pt-4">Vị trí tài sản <span className="text-red-500">*</span></label>
                <select
                  value={formData.assetLocationId}
                  onChange={(e) => setFormData(prev => ({ ...prev, assetLocationId: e.target.value }))}
                  className="w-full h-14 px-5 bg-slate-50 border border-emerald-500/20 rounded-[20px] text-[15px] font-medium text-slate-700 focus:bg-white focus:border-emerald-500/30 transition-all outline-none appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%2310b981%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22m19%209-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px] bg-[right_20px_center] bg-no-repeat ring-2 ring-emerald-500/5 shadow-[0_8px_20px_rgba(16,185,129,0.05)]"
                >
                  <option value="">Chọn vị trí...</option>
                  {locations.map(l => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </div>

              {/* Số lượng */}
              <div className="grid grid-cols-[180px,1fr] items-center gap-6 pt-2">
                <label className="text-[15px] font-bold text-slate-600">Số lượng <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                  className="w-full h-14 px-5 bg-[#f0f7ff] border border-transparent rounded-[20px] text-[15px] font-bold text-[#1c3563] focus:border-emerald-500/30 transition-all outline-none"
                />
              </div>

              {/* Tồn kho / Tổng */}
              <div className="grid grid-cols-[180px,1fr] items-center gap-6 pt-2">
                <label className="text-[15px] font-bold text-slate-600">Tồn kho / Tổng</label>
                <input
                  type="text"
                  value={selectedAsset ? `${selectedAsset.availableQuantity}/${selectedAsset.totalQuantity}` : '0/0'}
                  readOnly
                  className="w-full h-14 px-5 bg-slate-100/50 border border-transparent rounded-[20px] text-[15px] font-bold text-slate-400 cursor-not-allowed outline-none"
                />
              </div>

              {/* Địa điểm bàn giao */}
              <div className="grid grid-cols-[180px,1fr] items-center gap-6 pt-2">
                <label className="text-[15px] font-bold text-slate-600">Địa điểm bàn giao</label>
                <input
                  type="text"
                  placeholder="Địa điểm"
                  value={formData.handoverLocation}
                  onChange={(e) => setFormData(prev => ({ ...prev, handoverLocation: e.target.value }))}
                  className="w-full h-14 px-5 bg-[#f0f7ff] border border-transparent rounded-[20px] text-[15px] font-medium text-slate-700 placeholder:text-slate-300 focus:border-emerald-500/30 transition-all outline-none"
                />
              </div>

              {/* Đặt cọc */}
              <div className="grid grid-cols-[180px,1fr] items-center gap-6 pt-2">
                <label className="text-[15px] font-bold text-slate-600">Đặt cọc</label>
                <input
                  type="text"
                  placeholder="Tiền đặt cọc"
                  value={formData.deposit}
                  onChange={(e) => setFormData(prev => ({ ...prev, deposit: e.target.value }))}
                  className="w-full h-14 px-5 bg-[#f0f7ff] border border-transparent rounded-[20px] text-[15px] font-medium text-slate-700 placeholder:text-slate-300 focus:border-emerald-500/30 transition-all outline-none"
                />
              </div>

              {/* Ghi chú */}
              <div className="grid grid-cols-[180px,1fr] items-start gap-6 pt-2">
                <label className="text-[15px] font-bold text-slate-600 pt-4">Ghi chú</label>
                <textarea
                  rows={4}
                  placeholder="Ghi chú"
                  value={formData.note}
                  onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                  className="w-full px-5 py-4 bg-[#f0f7ff] border border-transparent rounded-[24px] text-[15px] font-medium text-slate-700 placeholder:text-slate-300 focus:border-emerald-500/30 transition-all outline-none resize-none"
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
