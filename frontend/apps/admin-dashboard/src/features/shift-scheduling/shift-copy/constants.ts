import type { ShiftCopyWeekAnnotation } from "./types";

export const ANNOTATION_LABELS: Record<ShiftCopyWeekAnnotation, string> = {
  past: "Tuần cũ",
  current: "Tuần hiện tại",
  future: "Tuần tương lai",
};

export const ANNOTATION_STYLES: Record<ShiftCopyWeekAnnotation, string> = {
  past: "bg-slate-100 text-slate-500",
  current: "bg-[#EFF6FF] text-[#134BBA]",
  future: "bg-emerald-50 text-emerald-600",
};
