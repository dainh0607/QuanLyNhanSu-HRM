import type { LeaveFormMap, TabState } from '../types';
import LeaveBalanceForm from '../forms/LeaveBalanceForm';

interface LeaveTabPanelProps {
  leaveState: TabState<LeaveFormMap['leaveBalance']>;
}

const LeaveTabPanel: React.FC<LeaveTabPanelProps> = ({
  leaveState,
}) => {
  if (leaveState.isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  if (leaveState.loadError) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-600 border border-red-100 mt-4">
        <p className="font-semibold">Lỗi tải dữ liệu</p>
        <p className="text-sm opacity-90">{leaveState.loadError}</p>
      </div>
    );
  }

  return (
    <LeaveBalanceForm
      data={leaveState.data as LeaveFormMap['leaveBalance']}
    />
  );
};

export default LeaveTabPanel;
