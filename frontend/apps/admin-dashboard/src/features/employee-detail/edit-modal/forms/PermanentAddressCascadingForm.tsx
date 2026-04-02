import React, { useEffect, useState } from 'react';
import {
  employeeService,
  type EmployeeEditAddressFormPayload,
  type EmployeeEditPermanentAddressPayload,
} from '../../../../services/employeeService';
import { MERGED_VIETNAM_PROVINCE_OPTIONS } from '../../data/mergedVietnamProvinceOptions';
import { FormRow } from '../components/FormPrimitives';
import { getFieldClassName } from '../formStyles';

type AddressFormKey = 'permanentAddress' | 'mergedAddress';

interface PermanentAddressCascadingFormProps {
  data: EmployeeEditPermanentAddressPayload;
  onFieldChange: <F extends keyof EmployeeEditPermanentAddressPayload>(
    field: F,
    value: EmployeeEditPermanentAddressPayload[F],
  ) => void;
}

interface AddressOptionState {
  cities: string[];
  districts: string[];
  isLoadingCities: boolean;
  isLoadingDistricts: boolean;
}

const ADDRESS_FORM_CONFIG: Record<
  AddressFormKey,
  {
    toggleLabel: string;
    title: string;
    addressLabel: string;
    addressPlaceholder: string;
  }
> = {
  permanentAddress: {
    toggleLabel: 'Địa chỉ thường trú',
    title: 'Địa chỉ thường trú',
    addressLabel: 'Địa chỉ thường trú',
    addressPlaceholder: 'Nhập địa chỉ thường trú',
  },
  mergedAddress: {
    toggleLabel: 'Địa chỉ sát nhập',
    title: 'Địa chỉ sát nhập',
    addressLabel: 'Địa chỉ hiện tại',
    addressPlaceholder: 'Nhập địa chỉ hiện tại',
  },
};

const createAddressOptionState = (): Record<AddressFormKey, AddressOptionState> => ({
  permanentAddress: {
    cities: [],
    districts: [],
    isLoadingCities: false,
    isLoadingDistricts: false,
  },
  mergedAddress: {
    cities: [],
    districts: [],
    isLoadingCities: false,
    isLoadingDistricts: false,
  },
});

const mergeUniqueOptions = (...optionGroups: Array<Array<string | undefined>>): string[] => {
  const values = new Set<string>();

  optionGroups.forEach((group) => {
    group.forEach((option) => {
      const normalizedOption = option?.trim() ?? '';
      if (normalizedOption) {
        values.add(normalizedOption);
      }
    });
  });

  return Array.from(values).sort((left, right) => left.localeCompare(right, 'vi'));
};

const normalizeCountryValue = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z]/g, '')
    .toLowerCase();

const isVietnamCountry = (value: string): boolean => normalizeCountryValue(value) === 'vietnam';

const getSelectClassName = (disabled: boolean): string =>
  `${getFieldClassName(false)} appearance-none pr-12 ${
    disabled ? 'cursor-not-allowed bg-slate-100 text-slate-400' : ''
  }`;

const AddressSelectField: React.FC<{
  label: string;
  value: string;
  placeholder: string;
  options: string[];
  disabled?: boolean;
  loading?: boolean;
  onChange: (value: string) => void;
}> = ({ label, value, placeholder, options, disabled = false, loading = false, onChange }) => (
  <FormRow label={label}>
    <div className="relative">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled || loading}
        className={getSelectClassName(disabled || loading)}
      >
        <option value="">{loading ? `Đang tải ${label.toLowerCase()}...` : placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <span className="material-symbols-outlined pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
        expand_more
      </span>
    </div>
  </FormRow>
);

const PermanentAddressCascadingForm: React.FC<PermanentAddressCascadingFormProps> = ({
  data,
  onFieldChange,
}) => {
  const [activeAddressForm, setActiveAddressForm] = useState<AddressFormKey>('permanentAddress');
  const [countryOptions, setCountryOptions] = useState<string[]>([]);
  const [addressOptions, setAddressOptions] =
    useState<Record<AddressFormKey, AddressOptionState>>(createAddressOptionState);

  const activeConfig = ADDRESS_FORM_CONFIG[activeAddressForm];
  const activeAddress = data[activeAddressForm];
  const activeOptionState = addressOptions[activeAddressForm];
  const isMergedAddressView = activeAddressForm === 'mergedAddress';
  const isMergedVietnam = isMergedAddressView && isVietnamCountry(activeAddress.country);
  const resolvedCountryOptions = mergeUniqueOptions(countryOptions, [
    data.permanentAddress.country,
    data.mergedAddress.country,
  ]);
  const resolvedCityOptions = mergeUniqueOptions(
    isMergedVietnam ? MERGED_VIETNAM_PROVINCE_OPTIONS : activeOptionState.cities,
    [activeAddress.city],
  );
  const resolvedDistrictOptions = mergeUniqueOptions(activeOptionState.districts, [
    activeAddress.district,
  ]);

  const updateAddressState = (formKey: AddressFormKey, patch: Partial<AddressOptionState>) => {
    setAddressOptions((prev) => ({
      ...prev,
      [formKey]: {
        ...prev[formKey],
        ...patch,
      },
    }));
  };

  const updateAddressForm = <F extends keyof EmployeeEditAddressFormPayload>(
    formKey: AddressFormKey,
    field: F,
    value: EmployeeEditAddressFormPayload[F],
  ) => {
    onFieldChange(formKey, {
      ...data[formKey],
      [field]: value,
    });
  };

  const handleCountryChange = (formKey: AddressFormKey, country: string) => {
    updateAddressState(formKey, {
      cities: [],
      districts: [],
      isLoadingCities: false,
      isLoadingDistricts: false,
    });

    onFieldChange(formKey, {
      ...data[formKey],
      country,
      city: '',
      district: '',
    });
  };

  const handleCityChange = (formKey: AddressFormKey, city: string) => {
    updateAddressState(formKey, {
      districts: [],
      isLoadingDistricts: false,
    });

    onFieldChange(formKey, {
      ...data[formKey],
      city,
      district: '',
    });
  };

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      setActiveAddressForm('permanentAddress');
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [data.permanentAddress.addressId, data.mergedAddress.addressId]);

  useEffect(() => {
    let isMounted = true;

    const loadCountries = async () => {
      try {
        const options = await employeeService.getAddressCountryOptions();
        if (isMounted) {
          setCountryOptions(options);
        }
      } catch (error) {
        console.error('Load country options error:', error);
        if (isMounted) {
          setCountryOptions([]);
        }
      }
    };

    void loadCountries();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const country = data.permanentAddress.country.trim();

    if (!country) {
      const resetFrameId = window.requestAnimationFrame(() => {
        updateAddressState('permanentAddress', {
          cities: [],
          districts: [],
          isLoadingCities: false,
          isLoadingDistricts: false,
        });
      });
      return () => {
        window.cancelAnimationFrame(resetFrameId);
      };
    }

    const loadingFrameId = window.requestAnimationFrame(() => {
      updateAddressState('permanentAddress', {
        isLoadingCities: true,
        districts: [],
        isLoadingDistricts: false,
      });
    });

    const loadCities = async () => {
      try {
        const options = await employeeService.getAddressCityOptions(country);
        if (isMounted) {
          updateAddressState('permanentAddress', {
            cities: options,
            isLoadingCities: false,
          });
        }
      } catch (error) {
        console.error('Load permanent address city options error:', error);
        if (isMounted) {
          updateAddressState('permanentAddress', {
            cities: [],
            isLoadingCities: false,
          });
        }
      }
    };

    void loadCities();

    return () => {
      isMounted = false;
      window.cancelAnimationFrame(loadingFrameId);
    };
  }, [data.permanentAddress.country]);

  useEffect(() => {
    let isMounted = true;
    const country = data.permanentAddress.country.trim();
    const city = data.permanentAddress.city.trim();

    if (!country || !city) {
      const resetFrameId = window.requestAnimationFrame(() => {
        updateAddressState('permanentAddress', {
          districts: [],
          isLoadingDistricts: false,
        });
      });
      return () => {
        window.cancelAnimationFrame(resetFrameId);
      };
    }

    const loadingFrameId = window.requestAnimationFrame(() => {
      updateAddressState('permanentAddress', {
        isLoadingDistricts: true,
      });
    });

    const loadDistricts = async () => {
      try {
        const options = await employeeService.getAddressDistrictOptions(country, city);
        if (isMounted) {
          updateAddressState('permanentAddress', {
            districts: options,
            isLoadingDistricts: false,
          });
        }
      } catch (error) {
        console.error('Load permanent address district options error:', error);
        if (isMounted) {
          updateAddressState('permanentAddress', {
            districts: [],
            isLoadingDistricts: false,
          });
        }
      }
    };

    void loadDistricts();

    return () => {
      isMounted = false;
      window.cancelAnimationFrame(loadingFrameId);
    };
  }, [data.permanentAddress.city, data.permanentAddress.country]);

  useEffect(() => {
    let isMounted = true;
    const country = data.mergedAddress.country.trim();
    const isVietnam = isVietnamCountry(country);

    if (!country) {
      const resetFrameId = window.requestAnimationFrame(() => {
        updateAddressState('mergedAddress', {
          cities: [],
          districts: [],
          isLoadingCities: false,
          isLoadingDistricts: false,
        });
      });
      return () => {
        window.cancelAnimationFrame(resetFrameId);
      };
    }

    if (isVietnam) {
      const setVietnamFrameId = window.requestAnimationFrame(() => {
        updateAddressState('mergedAddress', {
          cities: MERGED_VIETNAM_PROVINCE_OPTIONS,
          districts: [],
          isLoadingCities: false,
          isLoadingDistricts: false,
        });
      });

      return () => {
        window.cancelAnimationFrame(setVietnamFrameId);
      };
    }

    const loadingFrameId = window.requestAnimationFrame(() => {
      updateAddressState('mergedAddress', {
        isLoadingCities: true,
        districts: [],
        isLoadingDistricts: false,
      });
    });

    const loadCities = async () => {
      try {
        const options = await employeeService.getAddressCityOptions(country);
        if (isMounted) {
          updateAddressState('mergedAddress', {
            cities: options,
            isLoadingCities: false,
          });
        }
      } catch (error) {
        console.error('Load merged address city options error:', error);
        if (isMounted) {
          updateAddressState('mergedAddress', {
            cities: [],
            isLoadingCities: false,
          });
        }
      }
    };

    void loadCities();

    return () => {
      isMounted = false;
      window.cancelAnimationFrame(loadingFrameId);
    };
  }, [data.mergedAddress.country]);

  useEffect(() => {
    const resetDistrictFrameId = window.requestAnimationFrame(() => {
      updateAddressState('mergedAddress', {
        districts: [],
        isLoadingDistricts: false,
      });
    });

    return () => {
      window.cancelAnimationFrame(resetDistrictFrameId);
    };
  }, [data.mergedAddress.city, data.mergedAddress.country]);

  return (
    <>
      <div className="mb-6">
        <div className="inline-flex w-full max-w-[400px] rounded-[22px] border border-slate-200 bg-slate-100/80 p-1 shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
          {(Object.keys(ADDRESS_FORM_CONFIG) as AddressFormKey[]).map((formKey) => {
            const isActive = formKey === activeAddressForm;

            return (
              <button
                key={formKey}
                type="button"
                onClick={() => setActiveAddressForm(formKey)}
                className={`flex-1 rounded-[17px] px-4 py-2.5 text-[0.8rem] font-bold transition-all ${
                  isActive
                    ? 'bg-emerald-500 text-white shadow-[0_12px_24px_rgba(16,185,129,0.22)]'
                    : 'bg-transparent text-slate-600 hover:text-emerald-600'
                }`}
              >
                {ADDRESS_FORM_CONFIG[formKey].toggleLabel}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-5">
        <AddressSelectField
          label="Quốc gia"
          value={activeAddress.country}
          placeholder="Chọn quốc gia"
          options={resolvedCountryOptions}
          onChange={(value) => handleCountryChange(activeAddressForm, value)}
        />

        <AddressSelectField
          label="Tỉnh/Thành phố"
          value={activeAddress.city}
          placeholder={
            activeAddress.country.trim()
              ? isMergedAddressView
                ? 'Chọn tỉnh/thành phố sau sát nhập'
                : 'Chọn tỉnh/thành phố trước sát nhập'
              : 'Chọn quốc gia trước'
          }
          options={resolvedCityOptions}
          disabled={!activeAddress.country.trim()}
          loading={activeOptionState.isLoadingCities}
          onChange={(value) => handleCityChange(activeAddressForm, value)}
        />

        {!isMergedAddressView ? (
          <AddressSelectField
            label="Quận/Huyện"
            value={activeAddress.district}
            placeholder={
              activeAddress.city.trim()
                ? 'Chọn quận/huyện trước sát nhập'
                : 'Chọn tỉnh/thành phố trước'
            }
            options={resolvedDistrictOptions}
            disabled={!activeAddress.country.trim() || !activeAddress.city.trim()}
            loading={activeOptionState.isLoadingDistricts}
            onChange={(value) => updateAddressForm(activeAddressForm, 'district', value)}
          />
        ) : null}

        <FormRow label="Phường (xã, thị trấn)">
          <input
            type="text"
            value={activeAddress.ward}
            onChange={(event) => updateAddressForm(activeAddressForm, 'ward', event.target.value)}
            className={getFieldClassName(false)}
            placeholder="Nhập phường, xã hoặc thị trấn"
          />
        </FormRow>

        <FormRow label={activeConfig.addressLabel}>
          <input
            type="text"
            value={activeAddress.addressLine}
            onChange={(event) =>
              updateAddressForm(activeAddressForm, 'addressLine', event.target.value)
            }
            className={getFieldClassName(false)}
            placeholder={activeConfig.addressPlaceholder}
          />
        </FormRow>

        <FormRow label="Nguyên quán">
          <input
            type="text"
            value={data.originPlace}
            onChange={(event) => onFieldChange('originPlace', event.target.value)}
            className={getFieldClassName(false)}
            placeholder="Nhập nguyên quán"
          />
        </FormRow>
        {activeAddressForm === 'permanentAddress' ? (
          <FormRow label="Địa chỉ hiện tại">
            <input
              type="text"
              value={data.mergedAddress.addressLine}
              onChange={(event) =>
                onFieldChange('mergedAddress', {
                  ...data.mergedAddress,
                  addressLine: event.target.value,
                })
              }
              className={getFieldClassName(false)}
              placeholder="Nhập địa chỉ hiện tại"
            />
          </FormRow>
        ) : (
          <FormRow label="Địa chỉ thường trú">
            <input
              type="text"
              value={data.permanentAddress.addressLine}
              onChange={(event) =>
                onFieldChange('permanentAddress', {
                  ...data.permanentAddress,
                  addressLine: event.target.value,
                })
              }
              className={getFieldClassName(false)}
              placeholder="Nhập địa chỉ thường trú"
            />
          </FormRow>
        )}
      </div>
    </>
  );
};

export default PermanentAddressCascadingForm;
