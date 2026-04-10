import ActionModalShell from "./ActionModalShell";
import type { ShiftAssignmentDetail } from "./types";

interface ShiftLocationMapModalProps {
  isOpen: boolean;
  detail: ShiftAssignmentDetail | null;
  onClose: () => void;
}

const createMarkerStyle = (
  latitude: number,
  longitude: number,
  index: number,
  points: ShiftAssignmentDetail["mapPoints"],
) => {
  if (points.length <= 1) {
    return { left: "50%", top: "50%" };
  }

  const latitudes = points.map((item) => item.latitude);
  const longitudes = points.map((item) => item.longitude);
  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLng = Math.min(...longitudes);
  const maxLng = Math.max(...longitudes);
  const xDenominator = maxLng - minLng || 0.001;
  const yDenominator = maxLat - minLat || 0.001;

  return {
    left: `${18 + (((longitude - minLng) / xDenominator) * 64)}%`,
    top: `${18 + (((maxLat - latitude) / yDenominator) * 64)}%`,
    zIndex: 10 + index,
  };
};

export const ShiftLocationMapModal = ({
  isOpen,
  detail,
  onClose,
}: ShiftLocationMapModalProps) => (
  <ActionModalShell
    isOpen={isOpen}
    onClose={onClose}
    title="Bản đồ chấm công"
    description="Hiển thị các vị trí GPS ghi nhận được từ ca làm hiện tại."
    widthClassName="max-w-4xl"
  >
    {detail?.mapPoints.length ? (
      <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="relative min-h-[420px] overflow-hidden border-b border-slate-100 bg-slate-50 lg:border-b-0 lg:border-r">
          <div
            className="absolute inset-0 opacity-90"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(148,163,184,0.14) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.14) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
          <div className="absolute inset-5 rounded-[28px] border border-sky-100 bg-[radial-gradient(circle_at_top,_rgba(191,219,254,0.9),_rgba(239,246,255,0.8),_rgba(248,250,252,0.95))]" />

          {detail.mapPoints.map((point, index) => (
            <div
              key={point.id}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={createMarkerStyle(point.latitude, point.longitude, index, detail.mapPoints)}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#134BBA] text-white shadow-lg">
                <span className="material-symbols-outlined text-[16px]">
                  {index === detail.mapPoints.length - 1 ? "flag" : "location_on"}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3 p-5">
          {detail.mapPoints.map((point) => (
            <div key={point.id} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">{point.label}</h3>
                  <p className="mt-1 text-xs text-slate-500">{point.source}</p>
                </div>
                <span className="rounded-full bg-sky-50 px-2 py-1 text-[11px] font-medium text-sky-700">
                  {new Intl.DateTimeFormat("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    day: "2-digit",
                    month: "2-digit",
                  }).format(new Date(point.timestamp))}
                </span>
              </div>
              <p className="mt-3 text-sm text-slate-600">
                GPS: {point.latitude.toFixed(6)}, {point.longitude.toFixed(6)}
              </p>
            </div>
          ))}
        </div>
      </div>
    ) : (
      <div className="px-5 py-12 text-center text-sm text-slate-500">
        Chưa có dữ liệu GPS cho ca làm này.
      </div>
    )}
  </ActionModalShell>
);

export default ShiftLocationMapModal;
