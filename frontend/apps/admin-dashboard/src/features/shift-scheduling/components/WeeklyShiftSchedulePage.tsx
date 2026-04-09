import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FC,
} from 'react';
import PersonnelWorkspaceTabs from '../../personnel/components/PersonnelWorkspaceTabs';
import { DEFAULT_WEEKLY_SHIFT_SETTINGS } from '../constants';
import { useToast } from '../../../hooks/useToast';
import { openShiftCreationService } from '../services/openShiftCreationService';
import { shiftTemplateService } from '../services/shiftTemplateService';
import { weeklyShiftSchedulingService } from '../services/weeklyShiftSchedulingService';
import {
  createDefaultWeeklyShiftFilters,
  createEmptyEmployeeRow,
  formatDisplayDate,
  matchesEmployeeSearch,
} from '../utils';
import WeeklyShiftAddEmployeeModal from './WeeklyShiftAddEmployeeModal';
import WeeklyShiftFilterToolbar from './WeeklyShiftFilterToolbar';
import WeeklyShiftGrid from './WeeklyShiftGrid';
import WeeklyShiftLegend from './WeeklyShiftLegend';
import WeeklyShiftSettingsModal from './WeeklyShiftSettingsModal';
import OpenShiftCreationModal from './open-shift/OpenShiftCreationModal';
import ShiftTemplateCreationModal from './shift-template/ShiftTemplateCreationModal';
import ShiftTemplateLibraryPanel from './shift-template/ShiftTemplateLibraryPanel';
import type {
  OpenShiftComposerData,
  OpenShiftCreateRequest,
  OpenShiftCreatedRecord,
  ShiftTemplateCreateRequest,
  ShiftTemplateLibraryData,
  ShiftTemplateLibraryItem,
  WeeklyShiftBoardData,
  WeeklyShiftCardData,
  WeeklyShiftDashboardResult,
  WeeklyShiftEmployeeRow,
  WeeklyShiftEmployeeSummary,
  WeeklyShiftFilterOptions,
  WeeklyShiftFilterState,
  WeeklyShiftSettings,
} from '../types';

const EMPTY_FILTER_OPTIONS: WeeklyShiftFilterOptions = {
  branchOptions: [{ value: '', label: 'Tat ca chi nhanh' }],
  projectOptions: [{ value: '', label: 'Tat ca du an' }],
  jobOptions: [{ value: '', label: 'Tat ca cong viec' }],
  workingHourOptions: [{ value: '', label: 'Tat ca khung gio' }],
  workingDayOptions: [{ value: '', label: 'Tat ca ngay cong' }],
  timekeepingHourOptions: [{ value: '', label: 'Tat ca gio cong' }],
  attendanceStatusOptions: [{ value: '', label: 'Tat ca trang thai cham cong' }],
  employeeStatusOptions: [{ value: 'active', label: 'Nhan vien hoat dong' }],
};

const mergeTemplateLists = (
  baseTemplates: ShiftTemplateLibraryItem[],
  localTemplates: ShiftTemplateLibraryItem[],
): ShiftTemplateLibraryItem[] => {
  if (localTemplates.length === 0) {
    return baseTemplates;
  }

  const localTemplateMap = new Map(localTemplates.map((template) => [template.id, template]));
  const mergedTemplates = [
    ...localTemplates,
    ...baseTemplates.filter((template) => !localTemplateMap.has(template.id)),
  ];

  return mergedTemplates;
};

const mergeLibraryWithLocalTemplates = (
  libraryData: ShiftTemplateLibraryData,
  localTemplates: ShiftTemplateLibraryItem[],
): ShiftTemplateLibraryData => ({
  ...libraryData,
  templates: mergeTemplateLists(libraryData.templates, localTemplates),
});

const applyTemplatesToComposerData = (
  composerData: OpenShiftComposerData,
  templates: ShiftTemplateLibraryItem[],
): OpenShiftComposerData => ({
  ...composerData,
  shiftTemplates: templates.map((template) => shiftTemplateService.mapShiftTemplateToOpenShiftTemplate(template)),
});

const mapCreatedOpenShiftToCard = (record: OpenShiftCreatedRecord): WeeklyShiftCardData => ({
  id: record.id,
  shiftId: record.shiftId,
  shiftName: record.shiftName,
  startTime: record.startTime,
  endTime: record.endTime,
  attendanceStatus: record.autoPublish ? 'upcoming' : 'locked',
  note: record.note,
  color: record.color,
  requiredQuantity: record.requiredQuantity,
  filledQuantity: 0,
});

const mergeOpenShiftRecordsIntoBoard = (
  board: WeeklyShiftBoardData,
  createdRecords: OpenShiftCreatedRecord[],
): WeeklyShiftBoardData => {
  if (createdRecords.length === 0) {
    return board;
  }

  const mergedCells = board.days.map((day) => {
    const existingCell = board.openShiftRow.cells.find((cell) => cell.date === day.date) ?? {
      date: day.date,
      shifts: [],
    };
    const localCards = createdRecords
      .filter((record) => record.openDate === day.date)
      .map((record) => mapCreatedOpenShiftToCard(record));
    const existingIds = new Set(existingCell.shifts.map((shift) => shift.id));
    const appendedCards = localCards.filter((card) => !existingIds.has(card.id));

    return {
      ...existingCell,
      shifts: [...existingCell.shifts, ...appendedCards],
    };
  });

  return {
    ...board,
    openShiftRow: {
      ...board.openShiftRow,
      cells: mergedCells,
    },
    summary: {
      ...board.summary,
      totalOpenShifts: mergedCells.reduce((sum, cell) => sum + cell.shifts.length, 0),
    },
  };
};

const buildVisibleRows = ({
  board,
  addedEmployees,
  employeeSearch,
}: {
  board: WeeklyShiftBoardData | null;
  addedEmployees: WeeklyShiftEmployeeSummary[];
  employeeSearch: string;
}): WeeklyShiftEmployeeRow[] => {
  if (!board) {
    return [];
  }

  const existingEmployeeIds = new Set(board.employeeRows.map((row) => row.employee.id));
  const appendedRows = addedEmployees
    .filter((employee) => !existingEmployeeIds.has(employee.id))
    .map((employee) => createEmptyEmployeeRow(employee, board.days));

  return [...board.employeeRows, ...appendedRows].filter((row) => matchesEmployeeSearch(row, employeeSearch));
};

const WeeklyShiftSchedulePage: FC = () => {
  const { showToast, ToastComponent } = useToast();
  const [filters, setFilters] = useState<WeeklyShiftFilterState>(() => createDefaultWeeklyShiftFilters());
  const [board, setBoard] = useState<WeeklyShiftBoardData | null>(null);
  const [filterOptions, setFilterOptions] = useState<WeeklyShiftFilterOptions>(EMPTY_FILTER_OPTIONS);
  const [settings, setSettings] = useState<WeeklyShiftSettings>(DEFAULT_WEEKLY_SHIFT_SETTINGS);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [addedEmployees, setAddedEmployees] = useState<WeeklyShiftEmployeeSummary[]>([]);
  const [isOpenShiftModalOpen, setIsOpenShiftModalOpen] = useState(false);
  const [selectedOpenShiftDate, setSelectedOpenShiftDate] = useState<string | null>(null);
  const [openShiftComposerData, setOpenShiftComposerData] = useState<OpenShiftComposerData | null>(null);
  const [isOpenShiftComposerLoading, setIsOpenShiftComposerLoading] = useState(false);
  const [isOpenShiftSubmitting, setIsOpenShiftSubmitting] = useState(false);
  const [localOpenShiftRecords, setLocalOpenShiftRecords] = useState<OpenShiftCreatedRecord[]>([]);
  const [shiftTemplateLibraryData, setShiftTemplateLibraryData] = useState<ShiftTemplateLibraryData | null>(null);
  const [isShiftTemplateLibraryLoading, setIsShiftTemplateLibraryLoading] = useState(false);
  const [isShiftTemplateModalOpen, setIsShiftTemplateModalOpen] = useState(false);
  const [isShiftTemplateSubmitting, setIsShiftTemplateSubmitting] = useState(false);
  const [localShiftTemplates, setLocalShiftTemplates] = useState<ShiftTemplateLibraryItem[]>([]);

  const deferredEmployeeSearch = useDeferredValue(employeeSearch);
  const localOpenShiftRecordsRef = useRef<OpenShiftCreatedRecord[]>([]);
  const localShiftTemplatesRef = useRef<ShiftTemplateLibraryItem[]>([]);

  useEffect(() => {
    localOpenShiftRecordsRef.current = localOpenShiftRecords;
    setBoard((currentBoard) =>
      currentBoard ? mergeOpenShiftRecordsIntoBoard(currentBoard, localOpenShiftRecords) : currentBoard,
    );
  }, [localOpenShiftRecords]);

  useEffect(() => {
    localShiftTemplatesRef.current = localShiftTemplates;
  }, [localShiftTemplates]);

  const loadDashboard = useCallback(
    async (showRefreshState: boolean) => {
      if (showRefreshState) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      try {
        const result: WeeklyShiftDashboardResult =
          await weeklyShiftSchedulingService.getWeeklyShiftDashboard(filters);

        setBoard(mergeOpenShiftRecordsIntoBoard(result.board, localOpenShiftRecordsRef.current));
        setFilterOptions(result.filterOptions);
        setAddedEmployees((previousEmployees) =>
          previousEmployees.filter(
            (employee) =>
              result.board.availableEmployees.some((candidate) => candidate.id === employee.id) &&
              !result.board.employeeRows.some((row) => row.employee.id === employee.id),
          ),
        );
      } catch (error) {
        console.error('Failed to load weekly shift board:', error);
        showToast('Khong the tai bang xep ca tuan. Vui long thu lai.', 'error');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [filters, showToast],
  );

  const loadShiftTemplateLibrary = useCallback(async (): Promise<ShiftTemplateLibraryData | null> => {
    setIsShiftTemplateLibraryLoading(true);

    try {
      const libraryData = await shiftTemplateService.getShiftTemplateLibraryData();
      const mergedLibraryData = mergeLibraryWithLocalTemplates(
        libraryData,
        localShiftTemplatesRef.current,
      );

      setShiftTemplateLibraryData(mergedLibraryData);
      setOpenShiftComposerData((currentComposerData) =>
        currentComposerData
          ? applyTemplatesToComposerData(currentComposerData, mergedLibraryData.templates)
          : currentComposerData,
      );

      return mergedLibraryData;
    } catch (error) {
      console.error('Failed to load shift template library:', error);
      showToast('Khong the tai thu vien mau ca. Vui long thu lai.', 'error');
      return null;
    } finally {
      setIsShiftTemplateLibraryLoading(false);
    }
  }, [showToast]);

  const ensureOpenShiftComposerData = useCallback(async () => {
    if (openShiftComposerData) {
      return openShiftComposerData;
    }

    setIsOpenShiftComposerLoading(true);

    try {
      const composerData = await openShiftCreationService.getOpenShiftComposerData();
      const nextComposerData = shiftTemplateLibraryData
        ? applyTemplatesToComposerData(composerData, shiftTemplateLibraryData.templates)
        : composerData;

      setOpenShiftComposerData(nextComposerData);
      return nextComposerData;
    } catch (error) {
      console.error('Failed to load open shift composer data:', error);
      showToast('Khong the tai cau hinh Ca mo. Vui long thu lai.', 'error');
      return null;
    } finally {
      setIsOpenShiftComposerLoading(false);
    }
  }, [openShiftComposerData, shiftTemplateLibraryData, showToast]);

  useEffect(() => {
    void loadDashboard(false);
  }, [loadDashboard]);

  useEffect(() => {
    void loadShiftTemplateLibrary();
  }, [loadShiftTemplateLibrary]);

  useEffect(() => {
    if (!shiftTemplateLibraryData) {
      return;
    }

    setOpenShiftComposerData((currentComposerData) =>
      currentComposerData
        ? applyTemplatesToComposerData(currentComposerData, shiftTemplateLibraryData.templates)
        : currentComposerData,
    );
  }, [shiftTemplateLibraryData]);

  const visibleRows = useMemo(
    () =>
      buildVisibleRows({
        board,
        addedEmployees,
        employeeSearch: deferredEmployeeSearch,
      }),
    [addedEmployees, board, deferredEmployeeSearch],
  );

  const availableEmployeesForModal = useMemo(() => {
    if (!board) {
      return [];
    }

    const visibleEmployeeIds = new Set([
      ...board.employeeRows.map((row) => row.employee.id),
      ...addedEmployees.map((employee) => employee.id),
    ]);

    return board.availableEmployees.filter((employee) => !visibleEmployeeIds.has(employee.id));
  }, [addedEmployees, board]);

  const handleOpenOpenShiftModal = useCallback(
    (date: string) => {
      setSelectedOpenShiftDate(date);
      setIsOpenShiftModalOpen(true);
      void ensureOpenShiftComposerData();
    },
    [ensureOpenShiftComposerData],
  );

  const handleSubmitOpenShift = useCallback(
    async (payload: OpenShiftCreateRequest) => {
      const composerData = await ensureOpenShiftComposerData();
      if (!composerData) {
        return;
      }

      setIsOpenShiftSubmitting(true);

      try {
        const result = await openShiftCreationService.createOpenShift(payload, composerData);

        if (result.source === 'local') {
          setLocalOpenShiftRecords((currentRecords) => {
            const currentIds = new Set(currentRecords.map((record) => record.id));
            const nextRecords = result.records.filter((record) => !currentIds.has(record.id));
            return [...currentRecords, ...nextRecords];
          });
        }

        setIsOpenShiftModalOpen(false);
        setSelectedOpenShiftDate(null);
        showToast(
          `Da tao ${result.records.length} Ca mo cho ngay ${formatDisplayDate(payload.open_date)}.`,
          'success',
        );
        await loadDashboard(true);
      } catch (error) {
        console.error('Failed to create open shift:', error);
        showToast('Tao Ca mo that bai. Vui long thu lai.', 'error');
      } finally {
        setIsOpenShiftSubmitting(false);
      }
    },
    [ensureOpenShiftComposerData, loadDashboard, showToast],
  );

  const handleSubmitShiftTemplate = useCallback(
    async (payload: ShiftTemplateCreateRequest) => {
      const currentLibraryData = shiftTemplateLibraryData ?? (await loadShiftTemplateLibrary());
      if (!currentLibraryData) {
        return;
      }

      setIsShiftTemplateSubmitting(true);

      try {
        const result = await shiftTemplateService.createShiftTemplate(payload);
        let nextLocalTemplates = localShiftTemplatesRef.current;

        if (result.source === 'local') {
          nextLocalTemplates = [
            result.template,
            ...localShiftTemplatesRef.current.filter((template) => template.id !== result.template.id),
          ];
          localShiftTemplatesRef.current = nextLocalTemplates;
          setLocalShiftTemplates(nextLocalTemplates);
        }

        const nextLibraryData = mergeLibraryWithLocalTemplates(
          {
            ...currentLibraryData,
            templates: [
              result.template,
              ...currentLibraryData.templates.filter((template) => template.id !== result.template.id),
            ],
          },
          nextLocalTemplates,
        );

        setShiftTemplateLibraryData(nextLibraryData);
        setOpenShiftComposerData((currentComposerData) =>
          currentComposerData
            ? applyTemplatesToComposerData(currentComposerData, nextLibraryData.templates)
            : currentComposerData,
        );
        setIsShiftTemplateModalOpen(false);
        showToast('Tao ca lam thanh cong.', 'success');
        await loadShiftTemplateLibrary();
      } catch (error) {
        console.error('Failed to create shift template:', error);
        showToast('Tao ca lam that bai. Vui long thu lai.', 'error');
      } finally {
        setIsShiftTemplateSubmitting(false);
      }
    },
    [loadShiftTemplateLibrary, shiftTemplateLibraryData, showToast],
  );

  return (
    <main className="relative flex h-[calc(100vh-64px)] w-full flex-col overflow-hidden px-[30px] py-6">
      <PersonnelWorkspaceTabs />

      {board ? (
        <WeeklyShiftFilterToolbar
          weekLabel={board.weekLabel}
          filters={filters}
          filterOptions={filterOptions}
          summary={board.summary}
          dataSource={board.dataSource}
          isRefreshing={isRefreshing}
          onChangeFilters={setFilters}
          onRefresh={() => {
            void loadDashboard(true);
          }}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenAlerts={() =>
            showToast('Module lich su vao/ra se duoc ket noi tiep o buoc sau.', 'info')
          }
          onOpenMealBoard={() =>
            showToast('Bang xuat an da co nut truy cap, phan nghiep vu se duoc noi them sau.', 'info')
          }
        />
      ) : null}

      <div className="mt-6 flex min-h-0 flex-1 flex-col gap-6 overflow-hidden">
        {isLoading && !board ? (
          <div className="flex flex-1 items-center justify-center rounded-[28px] border border-slate-200 bg-white shadow-sm">
            <div className="text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-b-2 border-[#134BBA]" />
              <p className="mt-4 text-sm font-medium text-slate-500">Dang tai bang xep ca tuan...</p>
            </div>
          </div>
        ) : board ? (
          <>
            <ShiftTemplateLibraryPanel
              templates={shiftTemplateLibraryData?.templates ?? []}
              branchOptions={shiftTemplateLibraryData?.branchOptions ?? []}
              onCreateNew={() => {
                setIsShiftTemplateModalOpen(true);
                if (!shiftTemplateLibraryData) {
                  void loadShiftTemplateLibrary();
                }
              }}
            />
            <WeeklyShiftGrid
              board={board}
              rows={visibleRows}
              employeeSearch={employeeSearch}
              onEmployeeSearchChange={setEmployeeSearch}
              onAddEmployee={() => setIsAddEmployeeOpen(true)}
              onCreateOpenShift={handleOpenOpenShiftModal}
              settings={settings}
            />
            <WeeklyShiftLegend />
          </>
        ) : (
          <div className="rounded-[28px] border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
            <p className="text-base font-semibold text-slate-900">Chua tai duoc du lieu xep ca</p>
            <p className="mt-2 text-sm text-slate-500">Thu lam moi bang hoac dieu chinh bo loc de tiep tuc.</p>
          </div>
        )}
      </div>

      <WeeklyShiftSettingsModal
        isOpen={isSettingsOpen}
        settings={settings}
        onChange={setSettings}
        onClose={() => setIsSettingsOpen(false)}
      />

      <WeeklyShiftAddEmployeeModal
        isOpen={isAddEmployeeOpen}
        employees={availableEmployeesForModal}
        onClose={() => setIsAddEmployeeOpen(false)}
        onAddEmployee={(employee) =>
          setAddedEmployees((currentEmployees) =>
            currentEmployees.some((item) => item.id === employee.id)
              ? currentEmployees
              : [...currentEmployees, employee],
          )
        }
      />

      <OpenShiftCreationModal
        isOpen={isOpenShiftModalOpen}
        targetDate={selectedOpenShiftDate}
        composerData={openShiftComposerData}
        isLoading={isOpenShiftComposerLoading}
        isSubmitting={isOpenShiftSubmitting}
        onClose={() => {
          setIsOpenShiftModalOpen(false);
          setSelectedOpenShiftDate(null);
        }}
        onSubmit={handleSubmitOpenShift}
      />

      <ShiftTemplateCreationModal
        isOpen={isShiftTemplateModalOpen}
        libraryData={shiftTemplateLibraryData}
        isLoading={isShiftTemplateLibraryLoading}
        isSubmitting={isShiftTemplateSubmitting}
        onClose={() => setIsShiftTemplateModalOpen(false)}
        onSubmit={handleSubmitShiftTemplate}
      />

      {ToastComponent}
    </main>
  );
};

export default WeeklyShiftSchedulePage;
