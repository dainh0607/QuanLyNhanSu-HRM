import React, { useState, useEffect } from "react";
import { employeeCategoryService } from "../../services/employeeCategoryService";
import type { CustomField } from "../../services/employeeCategoryService";
import CustomFieldFormModal from "./components/CustomFieldFormModal";
import DeleteConfirmModal from "./components/DeleteConfirmModal";

interface FieldItem {
  name: string;
  type: string;
}

interface FieldGroup {
  id: string;
  title: string;
  fields: FieldItem[];
}

const DEFAULT_GROUPS: FieldGroup[] = [
  {
    id: "basic",
    title: "Thông tin cơ bản",
    fields: [
      { name: "Họ và tên", type: "Văn bản" },
      { name: "Ngày sinh", type: "Ngày" },
      { name: "Giới tính", type: "Văn bản" },
      { name: "Mã nhân viên", type: "Văn bản" },
    ]
  },
  {
    id: "contact",
    title: "Thông tin liên hệ",
    fields: [
      { name: "Email", type: "Email" },
      { name: "Điện thoại", type: "Văn bản" },
      { name: "Địa chỉ", type: "Văn bản" },
      { name: "Mạng xã hội", type: "Văn bản" },
    ]
  },
  {
    id: "emergency",
    title: "Liên hệ khẩn cấp",
    fields: [
      { name: "Điện thoại di động", type: "Văn bản" },
      { name: "Quan hệ với nhân viên", type: "Văn bản" },
      { name: "Điện thoại cố định", type: "Văn bản" },
      { name: "Địa chỉ khẩn cấp", type: "Văn bản" },
    ]
  },
  {
    id: "address",
    title: "Địa chỉ thường trú",
    fields: [
      { name: "Quốc gia", type: "Văn bản" },
      { name: "Địa chỉ thường trú", type: "Văn bản" },
      { name: "Nguyên quán", type: "Văn bản" },
    ]
  },
  {
    id: "education",
    title: "Trình độ học vấn",
    fields: [
      { name: "Trường đại học/Học viện", type: "Văn bản" },
      { name: "Chuyên ngành", type: "Văn bản" },
      { name: "Trình độ", type: "Văn bản" },
      { name: "Ngày cấp", type: "Ngày" },
      { name: "Ghi chú", type: "Văn bản" },
    ]
  },
  {
    id: "identity",
    title: "Thông tin định danh",
    fields: [
      { name: "Loại định danh", type: "Văn bản" },
      { name: "CMND/CCCD", type: "Văn bản" },
      { name: "Ngày cấp", type: "Ngày" },
      { name: "Nơi cấp", type: "Văn bản" },
      { name: "Số hộ chiếu", type: "Văn bản" },
      { name: "Ngày cấp hộ chiếu", type: "Ngày" },
      { name: "Ngày hết hạn hộ chiếu", type: "Ngày" },
      { name: "Nơi cấp hộ chiếu", type: "Văn bản" },
    ]
  },
  {
    id: "health",
    title: "Sức khỏe",
    fields: [
      { name: "Chiều cao", type: "Văn bản" },
      { name: "Cân nặng", type: "Văn bản" },
      { name: "Nhóm máu", type: "Văn bản" },
      { name: "Tình trạng sức khỏe", type: "Văn bản" },
      { name: "Bệnh bẩm sinh, mãn tính (nếu có)", type: "Văn bản" },
      { name: "Ngày kiểm tra gần nhất", type: "Ngày" },
    ]
  },
  {
    id: "digital_sign",
    title: "Chữ ký số",
    fields: [
      { name: "Chữ ký điện tử", type: "Văn bản" },
      { name: "Mã QR cá nhân", type: "Văn bản" },
    ]
  },
  {
    id: "others",
    title: "Thông tin khác",
    fields: [
      { name: "Công đoàn", type: "Văn bản" },
      { name: "Dân tộc", type: "Văn bản" },
      { name: "Tôn giáo", type: "Văn bản" },
      { name: "Mã số thuế", type: "Văn bản" },
      { name: "Tình trạng hôn nhân", type: "Văn bản" },
      { name: "Ghi chú", type: "Văn bản" },
    ]
  }
];

const CustomFieldsView: React.FC = () => {
  const [viewMode, setViewMode] = useState<"default" | "custom">("default");
  const [expandedGroups, setExpandedGroups] = useState<string[]>(["basic"]);
  const [selectedField, setSelectedField] = useState<FieldItem | null>(null);
  
  // Custom fields state
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CustomField | null>(null);
  const [deletingItem, setDeletingItem] = useState<CustomField | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const fetchCustomFields = async () => {
    setLoading(true);
    try {
      const data = await employeeCategoryService.getCustomFields();
      setCustomFields(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("CustomFieldsView mounted, viewMode:", viewMode);
    if (viewMode === "custom") {
      fetchCustomFields();
    }
  }, [viewMode]);

  const toggleGroup = (id: string) => {
    setExpandedGroups(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleToggleActive = async (id: number) => {
    try {
      await employeeCategoryService.toggleCustomFieldStatus(id);
      setCustomFields(prev => prev.map(f => f.id === id ? { ...f, isActive: !f.isActive } : f));
    } catch (e) {
      alert("Không thể cập nhật trạng thái");
    }
  };

  const handleSaveField = async (data: any) => {
    try {
      if (editingItem) {
        await employeeCategoryService.updateCustomField(editingItem.id, data);
      } else {
        await employeeCategoryService.createCustomField(data);
      }
      setIsModalOpen(false);
      fetchCustomFields();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleDeleteClick = (field: CustomField) => {
    setDeletingItem(field);
    setIsDeleteModalOpen(true);
    setOpenMenuId(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    try {
      await employeeCategoryService.deleteCustomField(deletingItem.id);
      setIsDeleteModalOpen(false);
      setDeletingItem(null);
      fetchCustomFields();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const typeLabels: Record<string, string> = {
    text: "Văn bản",
    textarea: "Đoạn văn bản",
    number: "Số",
    date: "Ngày",
    select: "Lựa chọn",
  };

  return (
    <div className="flex flex-col h-full w-full p-2 animate-in fade-in duration-500">
      {/* Segmented Control */}
      <div className="flex items-center justify-between mb-8 shrink-0">
        <div className="bg-slate-100 p-1 rounded-2xl flex items-center shadow-inner mx-auto">
          <button
            onClick={() => setViewMode("default")}
            className={`px-8 py-2.5 rounded-xl text-xs font-black transition-all uppercase tracking-widest ${
              viewMode === "default" 
                ? "bg-white text-emerald-600 shadow-sm" 
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            Mặc định (System)
          </button>
          <button
            onClick={() => setViewMode("custom")}
            className={`px-8 py-2.5 rounded-xl text-xs font-black transition-all uppercase tracking-widest ${
              viewMode === "custom" 
                ? "bg-white text-emerald-600 shadow-sm" 
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            Tùy chỉnh
          </button>
        </div>

        {viewMode === "custom" && (
          <button 
            onClick={() => {
              setEditingItem(null);
              setIsModalOpen(true);
            }}
            className="px-6 py-2.5 bg-emerald-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Thêm trường
          </button>
        )}
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar pr-2">
        {viewMode === "default" ? (
          <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
            {DEFAULT_GROUPS.map((group) => {
              const isExpanded = expandedGroups.includes(group.id);
              return (
                <div key={group.id} className="bg-white border border-slate-100 rounded-[24px] shadow-sm overflow-hidden transition-all">
                  {/* Accordion Header */}
                  <button
                    onClick={() => toggleGroup(group.id)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`material-symbols-outlined text-[20px] transition-transform duration-300 ${isExpanded ? 'rotate-180 text-emerald-500' : 'text-slate-400'}`}>
                        {isExpanded ? 'remove' : 'add'}
                      </span>
                      <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        {group.title}
                        <span className="text-[10px] bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full font-black">
                          {group.fields.length}
                        </span>
                      </h4>
                    </div>
                    <span className="material-symbols-outlined text-slate-300 text-[18px]">
                      {isExpanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
                    </span>
                  </button>

                  {/* Accordion Content */}
                  {isExpanded && (
                    <div className="border-t border-slate-50 bg-white animate-in slide-in-from-top-2 duration-300">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-[#f8faff]/50">
                            <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest w-16 text-center">STT</th>
                            <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tên trường</th>
                            <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest w-40">Loại</th>
                            <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest w-24 text-center">Thao tác</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {group.fields.map((field, index) => (
                            <tr key={index} className="hover:bg-slate-50/30 transition-colors group">
                              <td className="px-6 py-3 text-xs font-bold text-slate-400 text-center">{index + 1}</td>
                              <td className="px-6 py-3 text-xs font-bold text-slate-700">{field.name}</td>
                              <td className="px-6 py-3">
                                <span className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-wider">
                                  {field.type}
                                </span>
                              </td>
                              <td className="px-6 py-3 text-center">
                                <button 
                                  onClick={() => setSelectedField(field)}
                                  className="text-[11px] font-black text-emerald-600 hover:underline uppercase tracking-widest"
                                >
                                  Chi tiết
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-6 h-full flex flex-col animate-in slide-in-from-right-4 duration-500">
            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Đang tải...</p>
              </div>
            ) : customFields.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20 bg-white border border-slate-100 rounded-[40px]">
                <div className="w-24 h-24 bg-slate-50 rounded-[40px] flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-[48px] text-slate-200 select-none">folder_open</span>
                </div>
                <h3 className="text-sm font-black text-slate-300 uppercase tracking-[0.2em]">Trống</h3>
                <p className="mt-2 text-[11px] font-bold text-slate-400/60 uppercase tracking-widest">Chưa có trường tùy chỉnh nào được tạo</p>
              </div>
            ) : (
              <div className="bg-white border border-slate-100 rounded-[32px] shadow-sm overflow-hidden flex flex-col">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#f8faff]/50">
                      <th className="p-5 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 min-w-[200px]">Tên trường</th>
                      <th className="p-5 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Loại</th>
                      <th className="p-5 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center w-32">Hiển thị</th>
                      <th className="p-5 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center w-24">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {customFields.map((field) => (
                      <tr key={field.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="p-5 text-sm font-bold text-slate-900">{field.name}</td>
                        <td className="p-5">
                          <span className="px-3 py-1 bg-slate-50 border border-slate-100 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-wider">
                            {typeLabels[field.type]}
                          </span>
                        </td>
                        <td className="p-5 text-center">
                          <button
                            onClick={() => handleToggleActive(field.id)}
                            className={`w-10 h-6 rounded-full relative transition-all ${
                              field.isActive ? "bg-emerald-500 shadow-sm" : "bg-slate-200"
                            }`}
                          >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${
                              field.isActive ? "left-5" : "left-1"
                            }`}></div>
                          </button>
                        </td>
                        <td className="p-5 text-center">
                          <div className="flex items-center justify-center relative">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuId(openMenuId === field.id ? null : field.id);
                              }}
                              className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${
                                openMenuId === field.id 
                                  ? "bg-emerald-50 text-emerald-600" 
                                  : "text-slate-300 hover:bg-emerald-50 hover:text-emerald-500"
                              }`}
                            >
                              <span className="material-symbols-outlined text-[20px]">more_horiz</span>
                            </button>
                            
                            {openMenuId === field.id && (
                              <div className="absolute bottom-full mb-1 right-0 bg-white border border-slate-100 rounded-xl shadow-xl py-1 z-20 min-w-[120px] animate-in fade-in slide-in-from-bottom-2 duration-200 origin-bottom">
                                <button 
                                  onClick={() => {
                                    setEditingItem(field);
                                    setIsModalOpen(true);
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-[11px] font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                                >
                                  <span className="material-symbols-outlined text-[16px]">edit</span>
                                  Sửa
                                </button>
                                <button 
                                  onClick={() => handleDeleteClick(field)}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-[11px] font-bold text-rose-500 hover:bg-rose-50 transition-colors"
                                >
                                  <span className="material-symbols-outlined text-[16px]">delete</span>
                                  Xóa
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Field Detail Modal (Mặc định) */}
      {selectedField && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" 
            onClick={() => setSelectedField(null)}
          ></div>
          <div className="relative w-full max-w-[400px] bg-white rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-900">Chi tiết trường</h3>
              <button onClick={() => setSelectedField(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white text-slate-400 transition-all shadow-sm">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Tên trường dữ liệu</label>
                <p className="text-sm font-bold text-slate-900">{selectedField.name}</p>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Loại (Data Type)</label>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <p className="text-sm font-bold text-slate-700">{selectedField.type}</p>
                </div>
              </div>
              <div className="pt-4">
                <button 
                  onClick={() => setSelectedField(null)}
                  className="w-full py-3 bg-emerald-600 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Field Forms */}
      <CustomFieldFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSaveField}
        initialData={editingItem}
      />

      {deletingItem && (
        <DeleteConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          targetName={deletingItem.name}
        />
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}} />
    </div>
  );
};

export default CustomFieldsView;
