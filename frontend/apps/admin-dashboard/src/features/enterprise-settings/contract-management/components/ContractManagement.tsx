import React, { useState, useEffect } from 'react';
import { contractService, type ContractType, type ContractTemplate } from '../services/contractService';
import { useToast } from '../../../../hooks/useToast';
import ContractTypeFormModal from './ContractTypeFormModal';
import TemplateGalleryModal from './TemplateGalleryModal';
import ContractTemplateEditorModal from './ContractTemplateEditorModal';
import ContractNotificationSettings from './ContractNotificationSettings';

type SubTab = 'type' | 'template' | 'notification';

const ContractManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SubTab>('type');
  const [data, setData] = useState<ContractType[]>([]);
  const [templates, setTemplates] = useState<ContractTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ContractType | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplate | null>(null);
  const [pendingContent, setPendingContent] = useState('');
  const { showToast, ToastComponent } = useToast();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'type') {
        const result = await contractService.getContractTypes();
        setData(result);
      } else if (activeTab === 'template') {
        const result = await contractService.getTemplates();
        setTemplates(result);
      }
    } catch (error) {
      showToast("Lỗi khi tải dữ liệu", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleCreate = () => {
    if (activeTab === 'type') {
      setSelectedItem(null);
      setIsModalOpen(true);
    } else if (activeTab === 'template') {
      setIsGalleryOpen(true);
    }
  };

  const handleEdit = (item: any) => {
    if (activeTab === 'type') {
      setSelectedItem(item);
      setIsModalOpen(true);
    } else if (activeTab === 'template') {
      setSelectedTemplate(item);
      setPendingContent(item.content);
      setIsEditorOpen(true);
    }
  };

  const handleDelete = async (id: string) => {
    const msg = activeTab === 'type' ? "Bạn có chắc chắn muốn xóa loại hợp đồng này?" : "Bạn có chắc chắn muốn xóa biểu mẫu này?";
    if (window.confirm(msg)) {
      let result;
      if (activeTab === 'type') {
        result = await contractService.deleteContractType(id);
      } else {
        result = await contractService.deleteTemplate(id);
      }

      if (result.success) {
        showToast("Xóa thành công", "success");
        fetchData();
      } else {
        alert(result.message || "Không thể thực hiện thao tác xóa vào lúc này.");
      }
    }
  };

  const handleSelectGallery = (content: string) => {
    setPendingContent(content);
    setSelectedTemplate(null);
    setIsGalleryOpen(false);
    setIsEditorOpen(true);
  };

  return (
    <div className="h-full flex flex-col space-y-6 animate-in fade-in duration-500">
      {/* Header Area */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex gap-4">
          <button 
            onClick={() => setActiveTab('type')}
            className={`px-6 py-2 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'type' ? 'bg-[#192841] text-white shadow-lg' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
          >
            Loại hợp đồng
          </button>
          <button 
            onClick={() => setActiveTab('template')}
            className={`px-6 py-2 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'template' ? 'bg-[#192841] text-white shadow-lg' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
          >
            Hợp đồng mẫu
          </button>
          <button 
            onClick={() => setActiveTab('notification')}
            className={`px-6 py-2 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'notification' ? 'bg-[#192841] text-white shadow-lg' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
          >
            Thông báo
          </button>
        </div>

        {activeTab !== 'notification' && (
          <button 
            onClick={handleCreate}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-100 active:scale-95"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Tạo mới
          </button>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 bg-white border border-slate-100 rounded-[32px] shadow-sm overflow-hidden flex flex-col min-h-[400px]">
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Đang tải dữ liệu...</p>
          </div>
        ) : activeTab === 'type' && data.length > 0 ? (
          /* AC 1.2: Data Table */
          <div className="flex-1 overflow-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 sticky top-0 z-10 backdrop-blur-md">
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-20">STT</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-1/4">Tên loại hợp đồng</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Mô tả chi tiết</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-32">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5 text-xs font-bold text-slate-400">{(idx + 1).toString().padStart(2, '0')}</td>
                    <td className="px-8 py-5">
                      <div className="text-sm font-black text-[#192841]">{item.name}</div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="text-sm font-medium text-slate-500 line-clamp-1">{item.description || 'Chưa có mô tả'}</div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button 
                          onClick={() => handleEdit(item)}
                          className="w-8 h-8 rounded-lg bg-slate-100 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-all flex items-center justify-center"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="w-8 h-8 rounded-lg bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : activeTab === 'template' && templates.length > 0 ? (
          /* AC 1.1: Templates Table */
          <div className="flex-1 overflow-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 sticky top-0 z-10 backdrop-blur-md">
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-20">STT</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-1/3">Tên mẫu hợp đồng</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Loại hợp đồng</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ngày tạo</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-32">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {templates.map((tpl, idx) => (
                  <tr key={tpl.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5 text-xs font-bold text-slate-400">{(idx + 1).toString().padStart(2, '0')}</td>
                    <td className="px-8 py-5">
                      <div className="text-sm font-black text-[#192841]">{tpl.name}</div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="inline-flex items-center px-3 py-1 bg-blue-50 text-[10px] font-black text-blue-600 rounded-lg border border-blue-100 uppercase tracking-widest">
                        {tpl.contractTypeName}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="text-xs font-bold text-slate-500">{new Date(tpl.createdAt).toLocaleDateString('vi-VN')}</div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button 
                          onClick={() => handleEdit(tpl)}
                          className="w-8 h-8 rounded-lg bg-slate-100 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-all flex items-center justify-center"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button 
                          onClick={() => handleDelete(tpl.id)}
                          className="w-8 h-8 rounded-lg bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : activeTab === 'notification' ? (
          <div className="flex-1 overflow-auto custom-scrollbar p-10 bg-slate-50/30">
            <ContractNotificationSettings />
          </div>
        ) : (
          /* AC 1.3: Empty State */
          <div className="flex-1 flex flex-col items-center justify-center py-20">
            <div className="w-24 h-24 bg-slate-50 rounded-[32px] flex items-center justify-center text-slate-200 mb-6">
              <span className="material-symbols-outlined text-[48px]">{activeTab === 'template' ? 'description' : 'history_edu'}</span>
            </div>
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Không có dữ liệu</h3>
            <p className="text-sm font-bold text-slate-400 mt-2 max-w-xs text-center leading-relaxed">
              {activeTab === 'type' 
                ? 'Bạn chưa thiết lập loại hợp đồng nào. Hãy bắt đầu tạo mới để chuẩn hóa hồ sơ.' 
                : activeTab === 'template'
                ? 'Chưa có biểu mẫu hợp đồng nào được tạo. Hãy sử dụng trình soạn thảo để bắt đầu.'
                : 'Phân hệ này đang được phát triển. Vui lòng quay lại sau.'}
            </p>
            {(activeTab === 'type' || activeTab === 'template') && (
              <button 
                onClick={handleCreate}
                className="mt-8 px-10 py-3 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-95"
              >
                {activeTab === 'template' ? 'Soạn mẫu ngay' : 'Thiết lập ngay'}
              </button>
            )}
          </div>
        )}
      </div>

      <ContractTypeFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={selectedItem}
        onSuccess={fetchData}
      />

      <TemplateGalleryModal 
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        onSelect={handleSelectGallery}
      />

      <ContractTemplateEditorModal 
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        initialContent={pendingContent}
        initialData={selectedTemplate}
        onSuccess={fetchData}
      />

      {ToastComponent}
    </div>
  );
};

export default ContractManagement;
