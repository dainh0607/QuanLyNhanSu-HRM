import React, { useState, useEffect, useRef } from 'react';
import { contractService, type ContractType, type DynamicVariable, type ContractTemplate } from '../services/contractService';
import { useToast } from '../../../../hooks/useToast';

interface ContractTemplateEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialContent: string;
  initialData: ContractTemplate | null;
  onSuccess: () => void;
}

const ContractTemplateEditorModal: React.FC<ContractTemplateEditorModalProps> = ({ 
  isOpen, 
  onClose, 
  initialContent,
  initialData,
  onSuccess 
}) => {
  const [name, setName] = useState('');
  const [contractTypeId, setContractTypeId] = useState('');
  const [contractTypes, setContractTypes] = useState<ContractType[]>([]);
  const [variables, setVariables] = useState<DynamicVariable[]>([]);
  const [showVarDropdown, setShowVarDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const editorRef = useRef<HTMLDivElement>(null);
  const { showToast, ToastComponent } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      const [types, vars] = await Promise.all([
        contractService.getContractTypes(),
        contractService.getDynamicVariables()
      ]);
      setContractTypes(types);
      setVariables(vars);
    };

    if (isOpen) {
      fetchData();
      if (initialData) {
        setName(initialData.name);
        setContractTypeId(initialData.contractTypeId);
        setTimeout(() => {
          if (editorRef.current) editorRef.current.innerHTML = initialData.content;
        }, 100);
      } else {
        setName('');
        setContractTypeId('');
        setTimeout(() => {
          if (editorRef.current) editorRef.current.innerHTML = initialContent;
        }, 100);
      }
    }
  }, [isOpen, initialContent, initialData]);

  const execCommand = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  // AC 3.3: Insert variable at cursor position
  const insertVariable = (varCode: string) => {
    const selection = window.getSelection();
    if (!selection?.rangeCount) return;

    const range = selection.getRangeAt(0);
    range.deleteContents();

    const varSpan = document.createElement('span');
    varSpan.className = 'bg-blue-50 text-blue-600 font-black px-1.5 py-0.5 rounded border border-blue-100 mx-0.5 pointer-events-none select-all';
    varSpan.innerText = `[[${varCode}]]`;
    
    range.insertNode(varSpan);
    
    // Move cursor after the inserted variable
    const newRange = document.createRange();
    newRange.setStartAfter(varSpan);
    newRange.setEndAfter(varSpan);
    selection.removeAllRanges();
    selection.addRange(newRange);
    
    setShowVarDropdown(false);
    editorRef.current?.focus();
  };

  const handleSave = async () => {
    if (!name || !contractTypeId || !editorRef.current?.innerHTML.trim()) {
      showToast("Vui lòng nhập đầy đủ thông tin mẫu hợp đồng", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await contractService.saveTemplate({
        id: initialData?.id,
        name,
        contractTypeId,
        content: editorRef.current.innerHTML
      });
      if (result.success) {
        showToast(initialData ? "Cập nhật thành công" : "Tạo mẫu hợp đồng thành công", "success");
        onSuccess();
        onClose();
      }
    } catch (e) {
      showToast("Đã xảy ra lỗi", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
      <div className="w-full max-w-6xl h-[90vh] bg-white rounded-[40px] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 duration-500">
        {/* Header */}
        <div className="px-10 py-6 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-6 flex-1">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[28px]">description</span>
            </div>
            <div className="flex-1 flex gap-4">
              <div className="flex-1 space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tên mẫu hợp đồng *</label>
                <input 
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Nhập tên mẫu đơn (VD: Hợp đồng Thử việc Chuẩn)..."
                  className="w-full bg-slate-50 border-0 rounded-2xl px-5 py-3 text-sm font-black text-[#192841] outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
              </div>
              <div className="w-72 space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Loại hợp đồng *</label>
                <select 
                  value={contractTypeId}
                  onChange={e => setContractTypeId(e.target.value)}
                  className="w-full bg-slate-50 border-0 rounded-2xl px-5 py-3 text-sm font-black text-[#192841] outline-none focus:ring-4 focus:ring-blue-500/10 transition-all appearance-none"
                >
                  <option value="">Chọn loại hợp đồng...</option>
                  {contractTypes.map(ct => (
                    <option key={ct.id} value={ct.id}>{ct.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center text-slate-300 hover:bg-slate-50 hover:text-slate-600 transition-all ml-6">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Toolbar */}
        <div className="px-10 py-3 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1">
            <ToolbarButton icon="format_bold" onClick={() => execCommand('bold')} tooltip="In đậm" />
            <ToolbarButton icon="format_italic" onClick={() => execCommand('italic')} tooltip="In nghiêng" />
            <ToolbarButton icon="format_underlined" onClick={() => execCommand('underline')} tooltip="Gạch chân" />
            <div className="w-px h-6 bg-slate-200 mx-2"></div>
            <ToolbarButton icon="format_align_left" onClick={() => execCommand('justifyLeft')} tooltip="Căn trái" />
            <ToolbarButton icon="format_align_center" onClick={() => execCommand('justifyCenter')} tooltip="Căn giữa" />
            <ToolbarButton icon="format_align_right" onClick={() => execCommand('justifyRight')} tooltip="Căn phải" />
            <div className="w-px h-6 bg-slate-200 mx-2"></div>
            <ToolbarButton icon="format_list_bulleted" onClick={() => execCommand('insertUnorderedList')} tooltip="Danh sách" />
            <ToolbarButton icon="table_chart" onClick={() => {
              const rows = prompt("Nhập số hàng:", "3");
              const cols = prompt("Nhập số cột:", "2");
              if (rows && cols) {
                let table = '<table border="1" style="width:100%; border-collapse: collapse; margin: 10px 0;">';
                for(let i=0; i<parseInt(rows); i++) {
                  table += '<tr>';
                  for(let j=0; j<parseInt(cols); j++) table += '<td style="padding: 8px; border: 1px solid #ddd;">&nbsp;</td>';
                  table += '</tr>';
                }
                table += '</table>';
                execCommand('insertHTML', table);
              }
            }} tooltip="Chèn bảng" />
          </div>

          <div className="relative">
            <button 
              onClick={() => setShowVarDropdown(!showVarDropdown)}
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-md shadow-blue-100 active:scale-95"
            >
              <span className="material-symbols-outlined text-sm font-black">add</span>
              Chèn biến dữ liệu
            </button>
            
            {showVarDropdown && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-3xl shadow-2xl border border-slate-100 py-4 z-[1100] animate-in fade-in slide-in-from-top-2">
                <div className="px-5 pb-2 border-b border-slate-50 mb-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Danh sách biến có sẵn</span>
                </div>
                <div className="max-h-60 overflow-y-auto custom-scrollbar px-2">
                  {variables.map(v => (
                    <button 
                      key={v.code}
                      onClick={() => insertVariable(v.code)}
                      className="w-full text-left px-4 py-2.5 hover:bg-blue-50 rounded-2xl flex items-center justify-between group transition-colors"
                    >
                      <span className="text-xs font-bold text-slate-600 group-hover:text-blue-700">{v.label}</span>
                      <span className="text-[9px] font-black text-slate-300 group-hover:text-blue-400 uppercase tracking-tighter">[[{v.code}]]</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Editor Content Area */}
        <div className="flex-1 overflow-auto bg-slate-100/50 p-12 flex justify-center custom-scrollbar">
          <div 
            ref={editorRef}
            contentEditable
            className="w-[210mm] min-h-[297mm] bg-white shadow-xl border border-slate-200 rounded-sm p-[25mm] outline-none text-slate-700 leading-relaxed prose prose-slate max-w-none"
            style={{ 
              fontFamily: "'Inter', sans-serif",
              fontSize: '14px'
            }}
          ></div>
        </div>

        {/* Footer */}
        <div className="px-10 py-6 border-t border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3 text-slate-400">
            <span className="material-symbols-outlined text-sm">auto_fix_high</span>
            <p className="text-[10px] font-black uppercase tracking-widest leading-none">Mẹo: Hệ thống sẽ tự động điền thông tin thực tế vào các ô [[biến]] khi bạn xuất hợp đồng.</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={onClose}
              className="px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all"
            >
              Hủy bỏ
            </button>
            <button 
              onClick={handleSave}
              disabled={isSubmitting}
              className="px-12 py-3 bg-[#192841] text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-[#111c2f] shadow-xl shadow-slate-200 transition-all flex items-center gap-2"
            >
              {isSubmitting ? 'Đang lưu mẫu...' : 'Lưu mẫu hợp đồng'}
            </button>
          </div>
        </div>
      </div>
      {ToastComponent}
    </div>
  );
};

const ToolbarButton: React.FC<{ icon: string; onClick: () => void; tooltip: string }> = ({ icon, onClick, tooltip }) => (
  <button 
    onClick={(e) => { e.preventDefault(); onClick(); }}
    title={tooltip}
    className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 hover:bg-white hover:text-blue-600 transition-all hover:shadow-sm"
  >
    <span className="material-symbols-outlined text-[22px]">{icon}</span>
  </button>
);

export default ContractTemplateEditorModal;
