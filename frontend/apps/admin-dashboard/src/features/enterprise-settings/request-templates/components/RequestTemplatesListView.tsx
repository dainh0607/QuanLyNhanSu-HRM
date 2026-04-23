import React, { useState, useEffect } from "react";
import type { RequestTemplate } from "../services/requestTemplateService";
import { requestTemplateService } from "../services/requestTemplateService";
import FormBuilderModal from "./FormBuilderModal";

const RequestTemplatesListView: React.FC = () => {
  const [templates, setTemplates] = useState<RequestTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<RequestTemplate | null>(null);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const data = await requestTemplateService.getTemplates();
      setTemplates(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    const handleTrigger = () => handleCreate();
    window.addEventListener('trigger-create-request-template', handleTrigger);
    return () => window.removeEventListener('trigger-create-request-template', handleTrigger);
  }, []);

  const categories = Array.from(new Set(templates.map(t => t.category)));

  const handleEdit = (template: RequestTemplate) => {
    setSelectedTemplate(template);
    setIsBuilderOpen(true);
  };

  const handleCreate = () => {
    setSelectedTemplate(null);
    setIsBuilderOpen(true);
  };

  const handleToggle = async (template: RequestTemplate) => {
    await requestTemplateService.toggleStatus(template.id);
    fetchTemplates();
  };

  if (loading && templates.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-12 animate-in fade-in duration-500">


      <div className="space-y-12">
        {categories.map((cat) => (
          <section key={cat} className="space-y-6">
            <div className="flex items-center gap-4">
              <h3 className="text-xs font-black text-[#134BBA] uppercase tracking-[0.3em]">{cat}</h3>
              <div className="flex-1 h-px bg-slate-100"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.filter(t => t.category === cat).map((template) => (
                <div 
                  key={template.id}
                  className={`bg-white border ${template.isActive ? 'border-slate-100' : 'border-slate-100 opacity-60'} rounded-[32px] p-6 shadow-sm hover:shadow-md transition-all group relative overflow-hidden`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm transition-colors ${
                      template.isActive ? 'bg-slate-50 text-[#134BBA]' : 'bg-slate-100 text-slate-400'
                    }`}>
                      <span className="material-symbols-outlined text-[28px]">{template.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-black text-slate-800 tracking-tight truncate">{template.name}</h4>
                      <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${template.isActive ? 'text-emerald-500' : 'text-slate-400'}`}>
                        {template.isActive ? 'Đang hoạt động' : 'Đã tắt'}
                      </p>
                    </div>
                  </div>

                  {/* Action Icons (AC 1.3) */}
                  <div className="flex items-center gap-2 mt-6 pt-6 border-t border-slate-50">
                    <button 
                      onClick={() => handleEdit(template)}
                      title="Chỉnh sửa form"
                      className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:bg-[#134BBA] hover:text-white transition-all flex items-center justify-center"
                    >
                      <span className="material-symbols-outlined text-[20px]">edit</span>
                    </button>
                    <button 
                      title="Cài đặt luồng duyệt"
                      className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-200 transition-all flex items-center justify-center"
                    >
                      <span className="material-symbols-outlined text-[20px]">settings</span>
                    </button>
                    <button 
                      onClick={() => handleToggle(template)}
                      title={template.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
                      className={`w-10 h-10 rounded-xl transition-all flex items-center justify-center ${
                        template.isActive ? 'bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500' : 'bg-emerald-50 text-emerald-500 hover:bg-emerald-100'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">{template.isActive ? 'block' : 'check_circle'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <FormBuilderModal 
        isOpen={isBuilderOpen}
        onClose={() => setIsBuilderOpen(false)}
        onSuccess={fetchTemplates}
        initialData={selectedTemplate}
      />
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}} />
    </div>
  );
};

export default RequestTemplatesListView;
