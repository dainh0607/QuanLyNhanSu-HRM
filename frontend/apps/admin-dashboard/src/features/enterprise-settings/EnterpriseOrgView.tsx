import React, { useState, useEffect } from "react";
import OrgDataTable from "./components/OrgDataTable";
import OrgFormModal from "./components/OrgFormModal";
import { orgService, type Region, type Branch, type Department, type JobTitle } from "../../services/orgService";

const EnterpriseOrgView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"region" | "branch" | "department" | "jobTitle">("region");
  const [regions, setRegions] = useState<Region[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [jobTitles, setJobTitles] = useState<JobTitle[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [r, b, d, j] = await Promise.all([
        orgService.getRegions(),
        orgService.getBranches(),
        orgService.getDepartments(),
        orgService.getJobTitles()
      ]);
      setRegions(r);
      setBranches(b);
      setDepartments(d);
      setJobTitles(j);
    } catch (e) {
      console.error("Failed to fetch org data", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, []);

  const handleCreate = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleSave = async (formData: any) => {
    try {
      if (editingItem) {
        // Update
        switch (activeTab) {
          case "region": await orgService.updateRegion(editingItem.id, formData); break;
          case "branch": await orgService.updateBranch(editingItem.id, formData); break;
          case "department": await orgService.updateDepartment(editingItem.id, formData); break;
          case "jobTitle": await orgService.updateJobTitle(editingItem.id, formData); break;
        }
      } else {
        // Create
        switch (activeTab) {
          case "region": await orgService.createRegion(formData); break;
          case "branch": await orgService.createBranch(formData); break;
          case "department": await orgService.createDepartment(formData); break;
          case "jobTitle": await orgService.createJobTitle(formData); break;
        }
      }
      setIsModalOpen(false);
      void fetchData();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Có lỗi xảy ra khi lưu dữ liệu");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      switch (activeTab) {
        case "region": await orgService.deleteRegion(id); break;
        case "branch": await orgService.deleteBranch(id); break;
        case "department": await orgService.deleteDepartment(id); break;
        case "jobTitle": await orgService.deleteJobTitle(id); break;
      }
      void fetchData();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Không thể xóa mục này");
    }
  };

  const handleBulkDelete = async (ids: number[]) => {
    try {
      for (const id of ids) {
        switch (activeTab) {
          case "region": await orgService.deleteRegion(id); break;
          case "branch": await orgService.deleteBranch(id); break;
          case "department": await orgService.deleteDepartment(id); break;
          case "jobTitle": await orgService.deleteJobTitle(id); break;
        }
      }
      void fetchData();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Có lỗi khi xóa một số mục");
      void fetchData(); // Refresh anyway to see what was deleted
    }
  };

  const getCurrentData = () => {
    switch (activeTab) {
      case "region": return regions;
      case "branch": return branches;
      case "department": return departments;
      case "jobTitle": return jobTitles;
      default: return [];
    }
  };

  const getTypeLabel = () => {
    switch (activeTab) {
      case "region": return "Vùng";
      case "branch": return "Chi nhánh";
      case "department": return "Phòng ban";
      case "jobTitle": return "Chức danh";
      default: return "";
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Sub-tabs Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-2 mb-4">
        <div className="flex items-center gap-8 overflow-x-auto no-scrollbar">
          {[
            { key: "region", label: "Vùng" },
            { key: "branch", label: "Chi nhánh" },
            { key: "department", label: "Phòng ban" },
            { key: "jobTitle", label: "Chức danh" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`pb-3 text-[13px] font-bold transition-all relative whitespace-nowrap ${
                activeTab === tab.key 
                  ? "text-emerald-600 after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-emerald-500 after:rounded-full" 
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button 
          onClick={handleCreate}
          className="mb-2 px-6 py-2 bg-emerald-600 text-white rounded-xl text-[12px] font-black shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 hover:-translate-y-0.5 transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          Tạo mới {getTypeLabel()}
        </button>
      </div>

      <OrgDataTable 
        data={getCurrentData()}
        typeLabel={getTypeLabel()}
        type={activeTab}
        isLoading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onBulkDelete={handleBulkDelete}
        regions={regions}
        branches={branches}
        departments={departments}
      />

      <OrgFormModal 
        isOpen={isModalOpen}
        type={activeTab}
        initialData={editingItem}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        regions={regions}
        branches={branches}
        departments={departments}
        jobTitles={jobTitles}
      />

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
};

export default EnterpriseOrgView;
