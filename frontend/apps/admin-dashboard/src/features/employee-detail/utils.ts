import type { EmployeeAddressProfile } from '../../services/employeeService';
import { EMPTY_VALUE } from './constants';

export const displayValue = (...values: Array<unknown>): string => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }

    if (typeof value === 'number' && Number.isFinite(value)) {
      return String(value);
    }

    if (typeof value === 'boolean') {
      return value ? 'Có' : 'Không';
    }
  }

  return EMPTY_VALUE;
};

export const formatDate = (value?: string | null): string => {
  if (!value) return EMPTY_VALUE;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const formatMetric = (value: number | undefined, unit: string): string => {
  if (value === undefined || value === null) return EMPTY_VALUE;
  return `${value} ${unit}`;
};

export const normalizeText = (value?: string): string =>
  (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

export const getRecordValue = (source: Record<string, unknown>, keys: string[]): unknown => {
  for (const key of keys) {
    if (!(key in source)) continue;

    const value = source[key];
    if (value !== undefined && value !== null && value !== '') {
      return value;
    }
  }

  return undefined;
};

export const formatAddress = (address?: EmployeeAddressProfile): string => {
  const raw = address?.address;
  if (!raw) return EMPTY_VALUE;

  const parts = [raw.addressLine, raw.ward, raw.district, raw.city, raw.country].filter(
    (part): part is string => Boolean(part && part.trim()),
  );

  return parts.length > 0 ? parts.join(', ') : EMPTY_VALUE;
};

export const pickAddress = (
  addresses: EmployeeAddressProfile[],
  keywords: string[],
  fallback?: EmployeeAddressProfile,
): EmployeeAddressProfile | undefined => {
  const matched = addresses.find((address) => {
    const normalizedType = normalizeText(address.addressTypeName);
    return keywords.some((keyword) => normalizedType.includes(keyword));
  });

  return matched ?? fallback;
};

export const getFirstEmptyLabel = (
  fields: Array<{
    label: string;
    value: string;
  }>,
): string | null => fields.find((field) => field.value === EMPTY_VALUE)?.label ?? null;

export const getEmptyValueMode = (
  label: string,
  firstEmptyLabel: string | null,
): 'prompt' | 'dash' => (label === firstEmptyLabel ? 'prompt' : 'dash');

export const formatCurrency = (value?: number | null): string => {
  if (value === undefined || value === null) return EMPTY_VALUE;

  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value);
};
