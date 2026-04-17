
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { type CanvasObject } from '../types';

interface CanvasEditorProps {
  objects: CanvasObject[];
  setObjects: React.Dispatch<React.SetStateAction<CanvasObject[]>>;
  activeTool: 'scribble' | 'text' | 'move' | 'image';
  activeColor: string;
  activeFont: string;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  watermarkText: string;
  watermarkConfig: 'both' | 'image_only' | 'info_only';
}

const CanvasEditor: React.FC<CanvasEditorProps> = ({
  objects,
  setObjects,
  activeTool,
  activeColor,
  activeFont,
  canvasRef,
  watermarkText,
  watermarkConfig
}) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentScribble, setCurrentScribble] = useState<{ x: number, y: number }[]>([]);
  const [dragInfo, setDragInfo] = useState<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const [textInput, setTextInput] = useState<{ x: number; y: number; value: string; isOpen: boolean }>({
    x: 0,
    y: 0,
    value: '',
    isOpen: false,
  });
  const textInputRef = useRef<HTMLInputElement>(null);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw objects
    objects.forEach(obj => {
      if (watermarkConfig === 'info_only') {
        // In editor, we might still want to see objects even if export is info_only
        // But for now let's respect the config to show preview
      }
      
      // In editor, we show everything unless it's the export logic
      if (obj.type === 'scribble' && obj.points) {
        ctx.beginPath();
        ctx.strokeStyle = obj.color || '#000';
        ctx.lineWidth = 2;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        obj.points.forEach((p, index) => {
          if (index === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        });
        ctx.stroke();
      } else if (obj.type === 'text') {
        ctx.font = `40px ${obj.fontFamily}`;
        ctx.fillStyle = obj.color || '#000';
        ctx.fillText(obj.content || '', obj.x, obj.y);
      } else if (obj.type === 'image' && obj.content) {
        const img = new Image();
        img.src = obj.content;
        // Simple bounding box logic for images
        if (img.complete) {
           ctx.drawImage(img, obj.x, obj.y, obj.width || 100, obj.height || 100);
        } else {
           img.onload = () => ctx.drawImage(img, obj.x, obj.y, obj.width || 100, obj.height || 100);
        }
      }
    });

    // Draw current scribble
    if (isDrawing && currentScribble.length > 0) {
      ctx.beginPath();
      ctx.strokeStyle = activeColor;
      ctx.lineWidth = 2;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      currentScribble.forEach((p, index) => {
        if (index === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();
    }

    // Draw Watermark (AC 4.1)
    if (watermarkConfig !== 'image_only') {
      ctx.font = '12px "Be Vietnam Pro"';
      ctx.fillStyle = activeColor;
      ctx.fillText(watermarkText, 20, canvas.height - 20);
    }
  }, [objects, isDrawing, currentScribble, activeColor, watermarkText, watermarkConfig, canvasRef]);

  useEffect(() => {
    redraw();
  }, [redraw]);

  useEffect(() => {
    if (textInput.isOpen && textInputRef.current) {
      // Use a small delay to ensure the DOM is ready for focus
      const timer = setTimeout(() => {
        textInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [textInput.isOpen]);

  const getMousePos = (e: React.MouseEvent | MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const pos = getMousePos(e);

    if (activeTool === 'scribble') {
      setIsDrawing(true);
      setCurrentScribble([pos]);
    } else if (activeTool === 'move') {
      // Find object under mouse (simple check)
      // We check in reverse order (topmost first)
      const found = [...objects].reverse().find(obj => {
        if (obj.type === 'text') {
          // Approximate hit area for text
          return pos.x >= obj.x && pos.x <= obj.x + 200 && pos.y >= obj.y - 40 && pos.y <= obj.y;
        }
        if (obj.type === 'image') {
          return pos.x >= obj.x && pos.x <= obj.x + (obj.width || 100) && pos.y >= obj.y && pos.y <= obj.y + (obj.height || 100);
        }
        return false; // Scribble move is harder, let's skip for now or use bounding box
      });

      if (found) {
        setDragInfo({ id: found.id, offsetX: pos.x - found.x, offsetY: pos.y - found.y });
      }
    } else if (activeTool === 'text') {
      if (textInput.isOpen) {
        handleFinishText();
      } else {
        setTextInput({
          x: pos.x,
          y: pos.y,
          value: '',
          isOpen: true,
        });
      }
    }
  };

  const handleFinishText = () => {
    if (textInput.value.trim()) {
      const newObj: CanvasObject = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'text',
        x: textInput.x,
        y: textInput.y,
        content: textInput.value,
        color: activeColor,
        fontFamily: activeFont
      };
      setObjects([...objects, newObj]);
    }
    setTextInput(prev => ({ ...prev, isOpen: false, value: '' }));
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const pos = getMousePos(e);

    if (activeTool === 'scribble' && isDrawing) {
      setCurrentScribble(prev => [...prev, pos]);
    } else if (activeTool === 'move' && dragInfo) {
      setObjects(prev => prev.map(obj => 
        obj.id === dragInfo.id 
          ? { ...obj, x: pos.x - dragInfo.offsetX, y: pos.y - dragInfo.offsetY } 
          : obj
      ));
    }
  };

  const handleMouseUp = () => {
    if (activeTool === 'scribble' && isDrawing) {
      const newObj: CanvasObject = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'scribble',
        x: 0, y: 0,
        points: currentScribble,
        color: activeColor
      };
      setObjects([...objects, newObj]);
      setIsDrawing(false);
      setCurrentScribble([]);
    }
    setDragInfo(null);
  };

  return (
    <div className="relative border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 overflow-hidden cursor-crosshair">
      <canvas
        ref={canvasRef}
        width={800}
        height={400}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="w-full h-full block"
      />
      {textInput.isOpen && (
        <div 
          className="absolute z-[100] p-1.5 bg-white border-2 border-emerald-500 rounded-xl shadow-[0_10px_40px_rgba(16,185,129,0.3)]"
          style={{ 
            left: Math.max(10, Math.min(800 - 220, textInput.x)), 
            top: textInput.y < 60 ? textInput.y + 20 : textInput.y - 65, 
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-2">
            <input
              ref={textInputRef}
              type="text"
              value={textInput.value}
              onChange={(e) => setTextInput(prev => ({ ...prev, value: e.target.value }))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleFinishText();
                if (e.key === 'Escape') setTextInput(prev => ({ ...prev, isOpen: false }));
              }}
              className="px-3 py-2 bg-slate-50 border-none outline-none font-bold text-lg min-w-[200px] rounded-lg focus:ring-2 focus:ring-emerald-500/20"
              style={{ 
                color: activeColor,
                fontFamily: activeFont,
              }}
              placeholder="Nhập chữ ký..."
            />
            <button 
              onClick={handleFinishText}
              className="w-10 h-10 flex items-center justify-center bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">check</span>
            </button>
          </div>
          <div 
            className={`absolute left-4 w-3 h-3 bg-emerald-500 rotate-45 transform origin-center ${
              textInput.y < 60 ? '-top-1.5' : '-bottom-1.5'
            }`}
          ></div>
        </div>
      )}
    </div>
  );
};

export default CanvasEditor;
