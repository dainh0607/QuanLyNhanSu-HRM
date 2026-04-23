import React, { useState, useEffect } from "react";
import type { ShiftTask } from "../services/shiftTaskService";
import { shiftTaskService } from "../services/shiftTaskService";
import ShiftTaskFormModal from "./ShiftTaskFormModal";

interface ShiftTaskListViewProps {
  isOpen: boolean;
  onClose: () => void;
}

const ShiftTaskListView: React.FC<ShiftTaskListViewProps> = ({ isOpen, onClose }) => {
  const [tasks, setTasks] = useState<ShiftTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<ShiftTask | null>(null);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const data = await shiftTaskService.getTasks();
      setTasks(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTasks();
    }
  }, [isOpen]);

  const handleEdit = (task: ShiftTask) => {
    setSelectedTask(task);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setSelectedTask(null);
    setIsFormOpen(true);
  };

  const handleToggleStatus = async (task: ShiftTask) => {
    try {
      await shiftTaskService.updateTask(task.id, { isActive: !task.isActive });
      fetchTasks();
    } catch (e) {
      console.error(e);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[260] flex items-center justify-center bg-slate-950/40 px-4 py-8 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-4xl max-h-full flex flex-col rounded-[28px] border border-slate-200 bg-white shadow-[0_28px_80px_rgba(15,23,42,0.28)] animate-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5 shrink-0 bg-white rounded-t-[28px]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#134BBA]">
              Cài đặt chấm công
            </p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">
              Quản lý danh sách công việc
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleCreate}
              className="flex items-center gap-2 bg-[#134BBA] text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow-sm hover:bg-[#0f41a8] transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Thêm công việc
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 text-slate-500 transition hover:bg-slate-50"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 custom-scrollbar rounded-b-[28px]">
          {loading && tasks.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-2 border-[#134BBA] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : tasks.length === 0 ? (
            <div className="bg-white rounded-[24px] border border-slate-200 py-20 flex flex-col items-center justify-center text-center shadow-sm">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                 <span className="material-symbols-outlined text-4xl text-slate-300">work_off</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-800">Chưa có dữ liệu</h3>
              <p className="text-sm text-slate-500 mt-2 max-w-xs">Hãy bắt đầu bằng cách tạo công việc đầu tiên để quản lý vai trò trong ca làm.</p>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-[24px] overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100">
                    <th className="px-6 py-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">STT</th>
                    <th className="px-6 py-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Tên Công việc</th>
                    <th className="px-6 py-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Chi nhánh</th>
                    <th className="px-6 py-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Phạm vi gán</th>
                    <th className="px-6 py-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Trạng thái</th>
                    <th className="px-6 py-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task, index) => (
                    <tr key={task.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors last:border-0 group">
                      <td className="px-6 py-4 text-sm font-medium text-slate-500">{(index + 1).toString().padStart(2, '0')}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: task.color }}></div>
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{task.name}</p>
                            <p className="text-[11px] text-slate-500 mt-0.5">{task.code}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">{task.branchName}</span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs text-slate-600 truncate max-w-[180px]" title={task.scopeSummary}>{task.scopeSummary}</p>
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => handleToggleStatus(task)}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${task.isActive ? "bg-emerald-500" : "bg-slate-200"}`}
                        >
                          <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${task.isActive ? "translate-x-4.5" : "translate-x-1"}`} />
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleEdit(task)}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:bg-[#134BBA]/10 hover:text-[#134BBA] transition-colors ml-auto"
                          title="Sửa"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <ShiftTaskFormModal 
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSuccess={fetchTasks}
          initialData={selectedTask}
        />
      </div>
    </div>
  );
};

export default ShiftTaskListView;
