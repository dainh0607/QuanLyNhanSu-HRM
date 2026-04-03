import type {
  ContractCategoryKey,
  ContractColumnConfig,
  ContractTemplateOption,
  SelectOption,
} from './types';

export const CONTRACT_TYPE_OPTIONS = [
  { id: 1, name: 'Hợp đồng thử việc', category: 'probation' },
  { id: 2, name: 'HĐLĐ xác định thời hạn (12 tháng)', category: 'official' },
  { id: 3, name: 'HĐLĐ xác định thời hạn (36 tháng)', category: 'official' },
  { id: 4, name: 'HĐLĐ không xác định thời hạn', category: 'official' },
  { id: 5, name: 'HĐ khoán việc / Cộng tác viên', category: 'seasonal' },
] as const satisfies ReadonlyArray<{
  id: number;
  name: string;
  category: Exclude<ContractCategoryKey, 'all'>;
}>;

export const CONTRACT_CATEGORY_OPTIONS: Array<{ value: ContractCategoryKey; label: string }> = [
  { value: 'all', label: 'Tất cả loại' },
  { value: 'official', label: 'Hợp đồng chính thức' },
  { value: 'probation', label: 'Hợp đồng thử việc' },
  { value: 'seasonal', label: 'Hợp đồng mùa vụ' },
];

export const REGULAR_CONTRACT_TYPE_OPTIONS: SelectOption[] = CONTRACT_TYPE_OPTIONS.map((type) => ({
  value: String(type.id),
  label: type.name,
}));

export const ELECTRONIC_CONTRACT_TYPE_OPTIONS: SelectOption[] = [
  { value: '2', label: 'Hợp đồng chính thức' },
  { value: '1', label: 'Hợp đồng thử việc' },
  { value: '5', label: 'Hợp đồng mùa vụ' },
];

export const TAX_TYPE_OPTIONS: SelectOption[] = [
  { value: 'Cu tru co hop dong lao dong 3 thang tro len', label: 'Cư trú có hợp đồng lao động 3 tháng trở lên' },
  { value: 'Ca nhan khong cu tru', label: 'Cá nhân không cư trú' },
  { value: 'Khong tinh thue', label: 'Không tính thuế' },
  { value: 'Hop dong lao dong duoi 3 thang', label: 'Hợp đồng lao động dưới 3 tháng' },
  { value: 'Ca nhan chiu thue TNCN toan phan', label: 'Cá nhân chịu thuế TNCN toàn phần' },
  { value: 'Ca nhan ky hop dong khac', label: 'Cá nhân ký hợp đồng khác' },
];

export const CONTRACT_TEMPLATE_OPTIONS: ContractTemplateOption[] = [
  { id: 'food-probation', title: 'Hợp đồng thử việc - F&B', subtitle: 'Chuỗi nhà hàng và dịch vụ ăn uống' },
  { id: 'food-term', title: 'Hợp đồng lao động xác định thời hạn - F&B', subtitle: 'Khối vận hành và back-office F&B' },
  { id: 'food-indefinite', title: 'Hợp đồng lao động không xác định thời hạn - F&B', subtitle: 'Nhân sự chủ chốt ngành F&B' },
  { id: 'food-collab', title: 'Hợp đồng cộng tác - F&B', subtitle: 'CTV, cộng tác viên hoặc thời vụ F&B' },
  { id: 'tech-probation', title: 'Hợp đồng thử việc - (Ngành Công Nghệ)', subtitle: 'Khối sản phẩm, kỹ thuật và vận hành công nghệ' },
  { id: 'tech-term', title: 'Hợp đồng lao động xác định thời hạn - (Ngành Công nghệ)', subtitle: 'Nhân sự chính thức có thời hạn' },
  { id: 'tech-indefinite', title: 'Hợp đồng lao động không xác định thời hạn - (Ngành Công nghệ)', subtitle: 'Nhân sự lâu dài ngành công nghệ' },
  { id: 'service-mission', title: 'Hợp đồng công tác - Dịch vụ', subtitle: 'Khối triển khai và hỗ trợ dịch vụ' },
  { id: 'retail-probation', title: 'Hợp đồng thử việc (Ngành bán lẻ)', subtitle: 'Tuyến cửa hàng và vận hành bán lẻ' },
  { id: 'retail-term', title: 'Hợp đồng lao động xác định thời hạn (Ngành bán lẻ)', subtitle: 'Nhân sự bán lẻ có thời hạn' },
  { id: 'retail-indefinite', title: 'Hợp đồng lao động không xác định thời hạn (Ngành bán lẻ)', subtitle: 'Nhân sự lâu dài ngành bán lẻ' },
  { id: 'retail-collab', title: 'Hợp đồng cộng tác - (Ngành Bán lẻ)', subtitle: 'CTV ngành bán lẻ' },
  { id: 'construction-probation', title: 'Hợp đồng thử việc - (Ngành xây dựng)', subtitle: 'Khối công trường và kỹ thuật xây dựng' },
  { id: 'construction-term', title: 'Hợp đồng lao động xác định thời hạn - (Ngành Xây Dựng)', subtitle: 'Nhân sự thời hạn ngành xây dựng' },
  { id: 'construction-indefinite', title: 'Hợp đồng lao động không xác định thời hạn - (Ngành xây dựng)', subtitle: 'Nhân sự gắn bó dài hạn ngành xây dựng' },
  { id: 'tech-indefinite-extended', title: 'Hợp đồng lao động không xác định thời hạn - (Ngành Công nghệ) Bản mở rộng', subtitle: 'Biến thể mẫu công nghệ với điều khoản mở rộng' },
];

export const DEFAULT_CONTRACT_COLUMNS: ContractColumnConfig[] = [
  { id: 'col-index', label: 'STT', key: 'index', show: true, pinned: true, pinOrder: 1 },
  { id: 'col-number', label: 'Số', key: 'contractNumber', show: true, pinned: false },
  { id: 'col-name', label: 'Họ và tên', key: 'fullName', show: true, pinned: true, pinOrder: 2 },
  { id: 'col-branch', label: 'Chi nhánh', key: 'branchName', show: true, pinned: false },
  { id: 'col-type', label: 'Loại hợp đồng', key: 'contractTypeName', show: true, pinned: false },
  { id: 'col-status', label: 'Trạng thái', key: 'status', show: true, pinned: false },
  { id: 'col-expiry', label: 'Ngày hết hạn', key: 'expiryDate', show: true, pinned: false },
];

export const PAGE_SIZE = 10;
