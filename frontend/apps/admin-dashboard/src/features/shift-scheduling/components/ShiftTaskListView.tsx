import React, { useState, useEffect } from "react";
import type { ShiftTask } from "../services/shiftTaskService";
import { shiftTaskService } from "../services/shiftTaskService";
import ShiftTaskFormModal from "./ShiftTaskFormModal";

const ShiftTaskListView: React.FC = () => {
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
    fetchTasks();
  }, []);

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

  if (loading && tasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Danh sách Công việc</h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Quản lý vai trò và phân công trong ca làm</p>
        </div>
        <button 
          onClick={handleCreate}
          className="flex items-center gap-2 bg-[#134BBA] text-white px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-[#0f41a8] hover:-translate-y-0.5 transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Thêm công việc
        </button>
      </div>

      {tasks.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-200 rounded-[32px] py-20 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
             <span className="material-symbols-outlined text-4xl text-slate-200">work_off</span>
          </div>
          <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Chưa có dữ liệu</h3>
          <p className="text-sm font-bold text-slate-400 mt-2 max-w-xs">Hãy bắt đầu bằng cách tạo công việc đầu tiên để quản lý vai trò trong ca làm.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">STT</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Tên Công việc</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Chi nhánh</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Phạm vi gán</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Trạng thái</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task, index) => (
                <tr key={task.id} className="border-t border-slate-50 hover:bg-slate-50/30 transition-colors group">
                  <td className="px-6 py-5 text-sm font-bold text-slate-400">{(index + 1).toString().padStart(2, '0')}</td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: task.color }}></div>
                      <div>
                        <p className="text-sm font-black text-slate-800 uppercase tracking-tight">{task.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 tracking-widest">{task.code}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-widest">{task.branchName}</span>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-xs font-bold text-slate-500 leading-relaxed truncate max-w-[200px]">{task.scopeSummary}</p>
                  </td>
                  <td className="px-6 py-5">
                    <button 
                      onClick={() => handleToggleStatus(task)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${task.isActive ? "bg-emerald-500" : "bg-slate-200"}`}
                    >
                      <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${task.isActive ? "translate-x-5" : "translate-x-1"}`} />
                    </button>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button 
                      onClick={() => handleEdit(task)}
                      className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:bg-[#134BBA] hover:text-white transition-all shadow-sm flex items-center justify-center ml-auto"
                    >
                      <span className="material-symbols-outlined text-[20px]">edit</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ShiftTaskFormModal 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={fetchTasks}
        initialData={selectedTask}
      />
    </div>
  );
};

export default ShiftTaskListView;
