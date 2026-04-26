import React, { useEffect, useState } from "react";
import { shiftJobsService, type ShiftJob } from "../services/shiftJobsService";
import { useToast } from "../../../hooks/useToast";
import ShiftJobFormModal from "./ShiftJobFormModal.tsx";

const ShiftJobsTabView: React.FC = () => {
  const [jobs, setJobs] = useState<ShiftJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<ShiftJob | null>(null);
  const { showToast, ToastComponent } = useToast();

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const data = await shiftJobsService.getAll();
      setJobs(data);
    } catch (e) {
      console.error(e);
      showToast("Không thể tải danh sách công việc", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleEdit = (job: ShiftJob) => {
    setEditingJob(job);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingJob(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa công việc này?")) return;
    try {
      await shiftJobsService.delete(id);
      showToast("Xóa công việc thành công", "success");
      fetchJobs();
    } catch (e) {
      showToast("Không thể xóa công việc", "error");
    }
  };

  return (
    <div className="p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Danh sách Công việc</h2>
          <p className="text-slate-500 mt-1 font-medium">Định nghĩa các vai trò và nhiệm vụ chi tiết trong ca làm.</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 bg-[#134BBA] hover:bg-[#134BBA]/90 text-white px-6 py-3 rounded-2xl font-black transition-all shadow-lg shadow-blue-200 active:scale-95"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Tạo mới Công việc
        </button>
      </div>

      <div className="bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-96">
            <div className="w-10 h-10 border-4 border-[#134BBA] border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-slate-400 font-bold text-sm">Đang tải dữ liệu...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 text-center px-4">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4 mx-auto">
              <span className="material-symbols-outlined text-[48px]">inventory_2</span>
            </div>
            <h3 className="text-lg font-black text-slate-800">Không có dữ liệu</h3>
            <p className="text-slate-400 text-sm font-medium mt-1">Bấm "Tạo mới Công việc" để bắt đầu thiết lập.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-5 text-[11px] font-black uppercase tracking-wider text-slate-400 w-16 text-center">STT</th>
                  <th className="px-6 py-5 text-[11px] font-black uppercase tracking-wider text-slate-400">Tên công việc</th>
                  <th className="px-6 py-5 text-[11px] font-black uppercase tracking-wider text-slate-400">Trạng thái</th>
                  <th className="px-6 py-5 text-[11px] font-black uppercase tracking-wider text-slate-400">Chi nhánh</th>
                  <th className="px-6 py-5 text-[11px] font-black uppercase tracking-wider text-slate-400">Giới hạn phân công</th>
                  <th className="px-6 py-5 text-[11px] font-black uppercase tracking-wider text-slate-400 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {jobs.map((job, index) => (
                  <tr key={job.id} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="px-6 py-5 text-sm font-bold text-slate-400 text-center">{index + 1}</td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full shrink-0 shadow-sm" 
                          style={{ backgroundColor: job.color_code || "#cbd5e1" }}
                        ></div>
                        <div>
                          <p className="text-sm font-black text-slate-800">{job.name}</p>
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">{job.code}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black ${
                        job.is_active 
                          ? "bg-emerald-50 text-emerald-600" 
                          : "bg-slate-100 text-slate-400"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${job.is_active ? "bg-emerald-500" : "bg-slate-300"}`}></span>
                        {job.is_active ? "Đang sử dụng" : "Tạm ngưng"}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-sm font-bold text-slate-600">{job.branch_name}</td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-slate-300">group_work</span>
                        <p className="text-sm font-bold text-slate-500">{job.assignment_summary}</p>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEdit(job)}
                          className="w-9 h-9 flex items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button 
                          onClick={() => handleDelete(job.id)}
                          className="w-9 h-9 flex items-center justify-center rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
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
        )}
      </div>

      {isModalOpen && (
        <ShiftJobFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchJobs();
          }}
          initialData={editingJob}
        />
      )}
      {ToastComponent}
    </div>
  );
};

export default ShiftJobsTabView;
