import React, { useState, useEffect, useRef } from "react";
import { employeeCategoryService } from "../../services/employeeCategoryService";
import EmploymentTypeFormModal from "./components/EmploymentTypeFormModal";
import MajorFormModal from "./components/MajorFormModal";
import ResignationFormModal from "./components/ResignationFormModal";
import OvertimeFormModal from "./components/OvertimeFormModal";
import DisciplineFormModal from "./components/DisciplineFormModal";
import RewardFormModal from "./components/RewardFormModal";
import MealFormModal from "./components/MealFormModal";
import AdvanceFormModal from "./components/AdvanceFormModal";
import CustomFieldsView from "./CustomFieldsView";
import SortingRulesView from "./SortingRulesView";

const EmployeeCategoriesView: React.FC = () => {
  const [activeTab, setActiveTab] = useState("employment-type");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  const subTabs = [
    { id: "employment-type", label: "Hình thức làm việc" },
    { id: "major", label: "Chuyên ngành" },
    { id: "resignation", label: "Nghỉ việc" },
    { id: "overtime", label: "Làm thêm giờ" },
    { id: "discipline", label: "Kỷ luật" },
    { id: "reward", label: "Phần thưởng" },
    { id: "meal", label: "Khẩu phần ăn" },
    { id: "advance", label: "Tạm ứng - Hoàn ứng" },
    { id: "fields", label: "Quản lý trường" },
    { id: "sorting", label: "Sắp xếp nhân viên" },
    { id: "training", label: "Chứng chỉ đào tạo", disabled: true },
  ];

  const tabsRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const checkScroll = () => {
    if (tabsRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabsRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  const scrollTabs = (direction: 'left' | 'right') => {
    if (tabsRef.current) {
      const scrollAmount = 200;
      tabsRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    checkScroll();
    // Thêm delay nhỏ để đảm bảo nội dung đã render xong
    const timer = setTimeout(checkScroll, 100);
    return () => clearTimeout(timer);
  }, [subTabs]);

  const fetchData = async () => {
    setLoading(true);
    setCurrentPage(1); // Reset page when tab changes
    try {
      if (activeTab === "employment-type") {
        const result = await employeeCategoryService.getEmploymentTypes();
        setData(result);
      } else if (activeTab === "major") {
        const result = await employeeCategoryService.getMajors();
        setData(result);
      } else if (activeTab === "resignation") {
        const result = await employeeCategoryService.getResignationReasons();
        setData(result);
      } else if (activeTab === "overtime") {
        const result = await employeeCategoryService.getOvertimeTypes();
        setData(result);
      } else if (activeTab === "discipline") {
        const result = await employeeCategoryService.getDisciplineTypes();
        setData(result);
      } else if (activeTab === "reward") {
        const result = await employeeCategoryService.getRewardTypes();
        setData(result);
      } else if (activeTab === "meal") {
        const result = await employeeCategoryService.getMealTypes();
        setData(result);
      } else if (activeTab === "advance") {
        const result = await employeeCategoryService.getAdvanceTypes();
        setData(result);
      }
    } catch (e) {
      console.error("Failed to fetch categories", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    if (openMenuId !== null) {
      window.addEventListener('click', handleClickOutside);
    }
    return () => window.removeEventListener('click', handleClickOutside);
  }, [openMenuId]);

  const handleCreate = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    const item = data.find(i => i.id === id);
    if (!item) return;

    if (!window.confirm(`Bạn có chắc chắn muốn xóa "${item.name}"?`)) return;

    try {
      if (activeTab === "employment-type") {
        await employeeCategoryService.deleteEmploymentType(id);
      } else if (activeTab === "major") {
        await employeeCategoryService.deleteMajor(id);
      } else if (activeTab === "resignation") {
        await employeeCategoryService.deleteResignationReason(id);
      } else if (activeTab === "overtime") {
        await employeeCategoryService.deleteOvertimeType(id);
      } else if (activeTab === "discipline") {
        await employeeCategoryService.deleteDisciplineType(id);
      } else if (activeTab === "reward") {
        await employeeCategoryService.deleteRewardType(id);
      } else if (activeTab === "meal") {
        await employeeCategoryService.deleteMealType(id);
      } else if (activeTab === "advance") {
        await employeeCategoryService.deleteAdvanceType(id);
      }
      fetchData();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Có lỗi xảy ra khi xóa");
    }
  };

  const handleSaveSuccess = () => {
    setIsModalOpen(false);
    fetchData();
  };

  // Pagination Logic
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="flex flex-col h-full w-full overflow-hidden p-2">
      {/* Sub-tabs Navigation */}
      <div className="mb-4 border-b border-slate-100 shrink-0 relative flex items-center group">
        {/* Left Arrow */}
        {showLeftArrow && (
          <button 
            onClick={() => scrollTabs('left')}
            className="absolute left-0 z-10 w-8 h-8 flex items-center justify-center bg-white/80 backdrop-blur-sm border border-slate-100 rounded-full shadow-sm text-slate-400 hover:text-emerald-500 transition-all -ml-2"
          >
            <span className="material-symbols-outlined text-[18px]">chevron_left</span>
          </button>
        )}

        <div 
          ref={tabsRef}
          onScroll={checkScroll}
          className="flex-1 overflow-x-auto no-scrollbar scroll-smooth"
        >
          <div className="flex items-center gap-8 min-w-max px-2">
            {subTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={(e) => {
                  if (!tab.disabled) {
                    setActiveTab(tab.id);
                    // Tự động cuộn tab được chọn vào giữa view
                    (e.currentTarget as HTMLElement).scrollIntoView({ 
                      behavior: 'smooth', 
                      block: 'nearest', 
                      inline: 'center' 
                    });
                  }
                }}
                disabled={tab.disabled}
                className={`pb-3 text-sm font-bold transition-all relative whitespace-nowrap ${
                  activeTab === tab.id
                    ? "text-emerald-500 after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-emerald-500 after:rounded-full"
                    : tab.disabled
                    ? "text-slate-300 cursor-not-allowed"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                {tab.label}
                {tab.disabled && (
                  <span className="ml-2 text-[9px] bg-slate-50 text-slate-300 px-1 py-0.5 rounded uppercase font-bold tracking-wider">Soon</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Right Arrow */}
        {showRightArrow && (
          <button 
            onClick={() => scrollTabs('right')}
            className="absolute right-0 z-10 w-8 h-8 flex items-center justify-center bg-white/80 backdrop-blur-sm border border-slate-100 rounded-full shadow-sm text-slate-400 hover:text-emerald-500 transition-all -mr-2"
          >
            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
          </button>
        )}
      </div>

      {activeTab === 'fields' ? (
        <CustomFieldsView />
      ) : activeTab === 'sorting' ? (
        <SortingRulesView />
      ) : (
        <>
          {/* Module Title & Create Button */}
          <div className="flex items-center justify-between mb-4 shrink-0 px-2">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-3">
              <span className="w-1 h-6 bg-emerald-500 rounded-full"></span>
              {subTabs.find(t => t.id === activeTab)?.label}
            </h2>
            
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-[#2ecc71] hover:bg-[#27ae60] text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Tạo mới
            </button>
          </div>

          {/* Data Table Area */}
          <div className="flex-1 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
            <div 
              className="flex-1 overflow-auto custom-scrollbar"
              style={{ maxHeight: data.length > 7 ? '520px' : 'auto' }}
            >
              <table className="w-full text-left border-separate border-spacing-0">
                <thead className="sticky top-0 z-10 bg-[#f8faff]">
                  <tr>
                    <th className="p-5 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 w-20 text-center">STT</th>
                    <th className="p-5 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 min-w-[200px]">
                      {activeTab === 'overtime' ? 'Tên loại làm thêm' : activeTab === 'discipline' ? 'Tên kỷ luật' : activeTab === 'reward' ? 'Tên khen thưởng' : activeTab === 'meal' ? 'Tên suất ăn' : 'Tên'}
                    </th>
                    <th className="p-5 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                      {activeTab === 'overtime' || activeTab === 'discipline' || activeTab === 'reward' || activeTab === 'meal' ? 'Từ khóa' : 'Mô tả'}
                    </th>
                    {activeTab === 'overtime' && (
                      <th className="p-5 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 w-32 text-center">Tỷ lệ (%)</th>
                    )}
                    <th className="p-5 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 w-24 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr>
                      <td colSpan={activeTab === 'overtime' ? 5 : 4} className="py-20 text-center">
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                          <p className="mt-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Đang tải dữ liệu...</p>
                        </div>
                      </td>
                    </tr>
                  ) : currentItems.length === 0 ? (
                    <tr>
                      <td colSpan={activeTab === 'overtime' ? 5 : 4} className="py-32 text-center bg-white">
                        <div className="flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500">
                          <div className="w-24 h-24 bg-slate-50 rounded-[40px] flex items-center justify-center mb-6">
                            <span className="material-symbols-outlined text-[48px] text-slate-200 select-none">folder_open</span>
                          </div>
                          <h3 className="text-sm font-black text-slate-300 uppercase tracking-[0.2em]">Không có dữ liệu</h3>
                          <p className="mt-2 text-[11px] font-bold text-slate-400/60 uppercase tracking-widest">Vui lòng bấm nút "Tạo mới" để thêm danh mục</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    currentItems.map((item, index) => (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="p-5 text-sm font-bold text-slate-400 text-center">{indexOfFirstItem + index + 1}</td>
                        <td className="p-5 text-sm font-bold text-slate-900">{item.name}</td>
                        <td className="p-5 text-sm text-slate-500 leading-relaxed font-medium">
                          {activeTab === 'overtime' || activeTab === 'discipline' || activeTab === 'reward' || activeTab === 'meal' ? (
                            <code className={`px-2 py-1 rounded-lg font-black text-[11px] border ${
                              activeTab === 'discipline' ? 'bg-rose-50 text-rose-600 border-rose-100' : 
                              activeTab === 'meal' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                              'bg-slate-50 text-emerald-600 border-slate-100'
                            }`}>
                              {item.key}
                            </code>
                          ) : (
                            item.description || ""
                          )}
                        </td>
                        {activeTab === 'overtime' && (
                          <td className="p-5 text-center">
                            <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-black">
                              {item.rate}%
                            </span>
                          </td>
                        )}
                        <td className="p-5 text-center">
                          <div className="flex items-center justify-center relative">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuId(openMenuId === item.id ? null : item.id);
                              }}
                              className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${
                                openMenuId === item.id 
                                  ? "bg-emerald-50 text-emerald-600 shadow-inner" 
                                  : "text-emerald-500/40 hover:bg-emerald-50 hover:text-emerald-600"
                              }`}
                            >
                              <span className="material-symbols-outlined text-[20px]">more_horiz</span>
                            </button>
                            
                            {/* Dropdown Menu - Hiện phía trên khi click */}
                            {openMenuId === item.id && (
                              <div className="absolute bottom-full mb-1 right-0 bg-white border border-slate-100 rounded-xl shadow-xl py-1 z-20 min-w-[120px] animate-in fade-in slide-in-from-bottom-2 duration-200 origin-bottom">
                                <button 
                                  onClick={() => handleEdit(item)}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-[11px] font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                                >
                                  <span className="material-symbols-outlined text-[16px]">edit</span>
                                  Sửa
                                </button>
                                <button 
                                  onClick={() => handleDelete(item.id)}
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
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            {data.length > itemsPerPage && (
              <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Hiển thị {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, data.length)} trên {data.length} {
                    activeTab === 'employment-type' ? 'hình thức' : 
                    activeTab === 'major' ? 'chuyên ngành' : 
                    activeTab === 'overtime' ? 'loại OT' : 
                    activeTab === 'discipline' ? 'hình thức kỷ luật' : 
                    activeTab === 'reward' ? 'loại khen thưởng' : 
                    activeTab === 'meal' ? 'suất ăn' : 
                    activeTab === 'advance' ? 'loại tạm ứng' : 'lý do'
                  }
                </p>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-sm disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                  >
                    <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${
                        currentPage === i + 1 
                          ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20" 
                          : "hover:bg-white hover:shadow-sm text-slate-500"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-sm disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                  >
                    <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'employment-type' && (
        <EmploymentTypeFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleSaveSuccess}
          initialData={editingItem}
        />
      )}
      {activeTab === 'major' && (
        <MajorFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleSaveSuccess}
          initialData={editingItem}
        />
      )}
      {activeTab === 'resignation' && (
        <ResignationFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleSaveSuccess}
          initialData={editingItem}
        />
      )}
      {activeTab === 'overtime' && (
        <OvertimeFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleSaveSuccess}
          initialData={editingItem}
        />
      )}
      {activeTab === 'discipline' && (
        <DisciplineFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleSaveSuccess}
          initialData={editingItem}
        />
      )}
      {activeTab === 'reward' && (
        <RewardFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleSaveSuccess}
          initialData={editingItem}
        />
      )}
      {activeTab === 'meal' && (
        <MealFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleSaveSuccess}
          initialData={editingItem}
        />
      )}
      {activeTab === 'advance' && (
        <AdvanceFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleSaveSuccess}
          initialData={editingItem}
        />
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}} />
    </div>
  );
};

export default EmployeeCategoriesView;
