import React, { useEffect, useState } from 'react';
import {
  employeeService,
  type EmployeeEditAddressFormPayload,
  type EmployeeEditPermanentAddressPayload,
} from '../../../../services/employeeService';
import { getFieldClassName } from '../formStyles';
import { addressService, type GeographicalLookup } from '../../../../services/addressService';
import { FormRow } from '../components/FormPrimitives';

type AddressFormKey = 'permanentAddress' | 'mergedAddress';

interface PermanentAddressCascadingFormProps {
  data: EmployeeEditPermanentAddressPayload;
  errors: Record<string, string>;
  onFieldChange: <F extends keyof EmployeeEditPermanentAddressPayload>(
    field: F,
    value: EmployeeEditPermanentAddressPayload[F],
  ) => void;
}

interface AddressOptionState {
  provinces: GeographicalLookup[];
  districts: GeographicalLookup[];
  wards: GeographicalLookup[];
  isLoadingProvinces: boolean;
  isLoadingDistricts: boolean;
  isLoadingWards: boolean;
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
    provinces: [],
    districts: [],
    wards: [],
    isLoadingProvinces: false,
    isLoadingDistricts: false,
    isLoadingWards: false,
  },
  mergedAddress: {
    provinces: [],
    districts: [],
    wards: [],
    isLoadingProvinces: false,
    isLoadingDistricts: false,
    isLoadingWards: false,
  },
});

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
  options: GeographicalLookup[];
  error?: string;
  disabled?: boolean;
  loading?: boolean;
  onChange: (value: string, code?: string) => void;
}> = ({
  label,
  value,
  placeholder,
  options,
  error,
  disabled = false,
  loading = false,
  onChange,
}) => (
  <FormRow label={label} error={error}>
    <div className="relative">
      <select
        value={value}
        onChange={(event) => {
          const selectedOption = options.find(opt => opt.name === event.target.value);
          onChange(event.target.value, selectedOption?.code);
        }}
        disabled={disabled || loading}
        className={getSelectClassName(disabled || loading)}
      >
        <option value="">{loading ? `Đang tải ${label.toLowerCase()}...` : placeholder}</option>
        {options.map((option) => (
          <option key={option.code} value={option.name}>
            {option.name}
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
  errors,
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
  const getFieldError = (field: keyof EmployeeEditAddressFormPayload): string | undefined =>
    errors[`${activeAddressForm}.${field}`];

  const [selectedCodes, setSelectedCodes] = useState<Record<AddressFormKey, { province?: string, district?: string }>>({
    permanentAddress: {},
    mergedAddress: {},
  });

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
      provinces: [],
      districts: [],
      wards: [],
      isLoadingProvinces: false,
      isLoadingDistricts: false,
      isLoadingWards: false,
    });

    onFieldChange(formKey, {
      ...data[formKey],
      country,
      city: '',
      district: '',
      ward: '',
    });
  };

  const handleCityChange = (formKey: AddressFormKey, city: string, code?: string) => {
    updateAddressState(formKey, {
      districts: [],
      wards: [],
      isLoadingDistricts: false,
      isLoadingWards: false,
    });

    setSelectedCodes(prev => ({
      ...prev,
      [formKey]: { ...prev[formKey], province: code, district: undefined }
    }));

    onFieldChange(formKey, {
      ...data[formKey],
      city,
      district: '',
      ward: '',
    });
  };

  const handleDistrictChange = (formKey: AddressFormKey, district: string, code?: string) => {
    updateAddressState(formKey, {
      wards: [],
      isLoadingWards: false,
    });

    setSelectedCodes(prev => ({
      ...prev,
      [formKey]: { ...prev[formKey], district: code }
    }));

    onFieldChange(formKey, {
      ...data[formKey],
      district,
      ward: '',
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

    if (!country || !isVietnamCountry(country)) {
      updateAddressState('permanentAddress', {
        provinces: [],
        districts: [],
        wards: [],
        isLoadingProvinces: false,
        isLoadingDistricts: false,
        isLoadingWards: false,
      });
      return;
    }

    const loadProvinces = async () => {
      updateAddressState('permanentAddress', { isLoadingProvinces: true });
      try {
        const provinces = await addressService.getProvinces();
        if (isMounted) {
          updateAddressState('permanentAddress', {
            provinces,
            isLoadingProvinces: false,
          });

          // If we have a city name but no code, find it
          const city = data.permanentAddress.city;
          if (city && !selectedCodes.permanentAddress.province) {
            const match = provinces.find(p => p.name === city);
            if (match) {
              setSelectedCodes(prev => ({
                ...prev,
                permanentAddress: { ...prev.permanentAddress, province: match.code }
              }));
            }
          }
        }
      } catch (error) {
        console.error('Load provinces error:', error);
        if (isMounted) {
          updateAddressState('permanentAddress', { isLoadingProvinces: false });
        }
      }
    };

    loadProvinces();
    return () => { isMounted = false; };
  }, [data.permanentAddress.country]);

  useEffect(() => {
    let isMounted = true;
    const provinceCode = selectedCodes.permanentAddress.province;

    if (!provinceCode) {
      updateAddressState('permanentAddress', {
        districts: [],
        wards: [],
        isLoadingDistricts: false,
        isLoadingWards: false,
      });
      return;
    }

    const loadDistricts = async () => {
      updateAddressState('permanentAddress', { isLoadingDistricts: true });
      try {
        const districts = await addressService.getDistricts(provinceCode);
        if (isMounted) {
          updateAddressState('permanentAddress', {
            districts,
            isLoadingDistricts: false,
          });

          // If we have a district name but no code, find it
          const districtName = data.permanentAddress.district;
          if (districtName && !selectedCodes.permanentAddress.district) {
            const match = districts.find(d => d.name === districtName);
            if (match) {
              setSelectedCodes(prev => ({
                ...prev,
                permanentAddress: { ...prev.permanentAddress, district: match.code }
              }));
            }
          }
        }
      } catch (error) {
        console.error('Load districts error:', error);
        if (isMounted) {
          updateAddressState('permanentAddress', { isLoadingDistricts: false });
        }
      }
    };

    loadDistricts();
    return () => { isMounted = false; };
  }, [selectedCodes.permanentAddress.province]);

  useEffect(() => {
    let isMounted = true;
    const districtCode = selectedCodes.permanentAddress.district;

    if (!districtCode) {
      updateAddressState('permanentAddress', {
        wards: [],
        isLoadingWards: false,
      });
      return;
    }

    const loadWards = async () => {
      updateAddressState('permanentAddress', { isLoadingWards: true });
      try {
        const wards = await addressService.getWards(districtCode);
        if (isMounted) {
          updateAddressState('permanentAddress', {
            wards,
            isLoadingWards: false,
          });
        }
      } catch (error) {
        console.error('Load wards error:', error);
        if (isMounted) {
          updateAddressState('permanentAddress', { isLoadingWards: false });
        }
      }
    };

    loadWards();
    return () => { isMounted = false; };
  }, [selectedCodes.permanentAddress.district]);

  useEffect(() => {
    let isMounted = true;
    const country = data.mergedAddress.country.trim();

    if (!country || !isVietnamCountry(country)) {
      updateAddressState('mergedAddress', {
        provinces: [],
        districts: [],
        wards: [],
        isLoadingProvinces: false,
        isLoadingDistricts: false,
        isLoadingWards: false,
      });
      return;
    }

    const loadProvinces = async () => {
      updateAddressState('mergedAddress', { isLoadingProvinces: true });
      try {
        const provinces = await addressService.getMergedProvinces();
        if (isMounted) {
          updateAddressState('mergedAddress', {
            provinces,
            isLoadingProvinces: false,
          });

          // Sync code for mergedAddress
          const city = data.mergedAddress.city;
          if (city && !selectedCodes.mergedAddress.province) {
            const match = provinces.find(p => p.name === city);
            if (match) {
              setSelectedCodes(prev => ({
                ...prev,
                mergedAddress: { ...prev.mergedAddress, province: match.code }
              }));
            }
          }
        }
      } catch (error) {
        console.error('Load provinces error:', error);
        if (isMounted) {
          updateAddressState('mergedAddress', { isLoadingProvinces: false });
        }
      }
    };

    loadProvinces();
    return () => { isMounted = false; };
  }, [data.mergedAddress.country]);

  useEffect(() => {
    let isMounted = true;
    const provinceCode = selectedCodes.mergedAddress.province;

    if (!provinceCode) {
      updateAddressState('mergedAddress', {
        districts: [],
        wards: [],
        isLoadingDistricts: false,
        isLoadingWards: false,
      });
      return;
    }

    const loadDistricts = async () => {
      // Skip districts for merged address as we flattened the hierarchy
      if (isMergedAddressView) {
        updateAddressState('mergedAddress', { 
          districts: [], 
          isLoadingDistricts: false 
        });
        return;
      }

      updateAddressState('mergedAddress', { isLoadingDistricts: true });
      try {
        const districts = await addressService.getDistricts(provinceCode);
        if (isMounted) {
          updateAddressState('mergedAddress', {
            districts,
            isLoadingDistricts: false,
          });

          // Sync code for mergedAddress
          const districtName = data.mergedAddress.district;
          if (districtName && !selectedCodes.mergedAddress.district) {
            const match = districts.find(d => d.name === districtName);
            if (match) {
              setSelectedCodes(prev => ({
                ...prev,
                mergedAddress: { ...prev.mergedAddress, district: match.code }
              }));
            }
          }
        }
      } catch (error) {
        console.error('Load districts error:', error);
        if (isMounted) {
          updateAddressState('mergedAddress', { isLoadingDistricts: false });
        }
      }
    };

    loadDistricts();
    return () => { isMounted = false; };
  }, [selectedCodes.mergedAddress.province]);

  useEffect(() => {
    let isMounted = true;
    const parentCode = isMergedAddressView 
      ? selectedCodes.mergedAddress.province 
      : selectedCodes.mergedAddress.district;

    if (!parentCode) {
      updateAddressState('mergedAddress', {
        wards: [],
        isLoadingWards: false,
      });
      return;
    }

    const loadWards = async () => {
      updateAddressState('mergedAddress', { isLoadingWards: true });
      try {
        const wards = isMergedAddressView
          ? await addressService.getMergedWards(parentCode)
          : await addressService.getWards(parentCode);
        if (isMounted) {
          updateAddressState('mergedAddress', {
            wards,
            isLoadingWards: false,
          });
        }
      } catch (error) {
        console.error('Load wards error:', error);
        if (isMounted) {
          updateAddressState('mergedAddress', { isLoadingWards: false });
        }
      }
    };

    loadWards();
    return () => { isMounted = false; };
  }, [selectedCodes.mergedAddress.district, selectedCodes.mergedAddress.province, isMergedAddressView]);

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

      <div className="space-y-[1px]">
        <AddressSelectField
          label="Quốc gia"
          value={activeAddress.country}
          placeholder="Chọn quốc gia"
          options={countryOptions.map(name => ({ name, code: name }))}
          error={getFieldError('country')}
          onChange={(value) => handleCountryChange(activeAddressForm, value)}
        />

        <AddressSelectField
          label="Tỉnh/Thành phố"
          value={activeAddress.city}
          placeholder={
            activeAddress.country.trim()
              ? isVietnamCountry(activeAddress.country)
                ? 'Chọn tỉnh/thành phố'
                : 'Nhập tỉnh/thành phố'
              : 'Chọn quốc gia trước'
          }
          options={activeOptionState.provinces}
          error={getFieldError('city')}
          disabled={!activeAddress.country.trim() || !isVietnamCountry(activeAddress.country)}
          loading={activeOptionState.isLoadingProvinces}
          onChange={(value, code) => handleCityChange(activeAddressForm, value, code)}
        />

        {!isMergedAddressView && (
          <AddressSelectField
            label="Quận/Huyện"
            value={activeAddress.district}
            placeholder={
              activeAddress.city.trim()
                ? 'Chọn quận/huyện'
                : 'Chọn tỉnh/thành phố trước'
            }
            options={activeOptionState.districts}
            error={getFieldError('district')}
            disabled={!activeAddress.city.trim() || !isVietnamCountry(activeAddress.country)}
            loading={activeOptionState.isLoadingDistricts}
            onChange={(value, code) => handleDistrictChange(activeAddressForm, value, code)}
          />
        )}

        <AddressSelectField
          label="Phường (xã, thị trấn)"
          value={activeAddress.ward}
          placeholder={
            isMergedAddressView
              ? activeAddress.city.trim()
                ? 'Chọn phường/xã'
                : 'Chọn tỉnh/thành phố trước'
              : activeAddress.district.trim()
                ? 'Chọn phường/xã'
                : 'Chọn quận/huyện trước'
          }
          options={activeOptionState.wards}
          error={getFieldError('ward')}
          disabled={
            isMergedAddressView
              ? !activeAddress.city.trim()
              : !activeAddress.district.trim()
          }
          loading={activeOptionState.isLoadingWards}
          onChange={(value) => updateAddressForm(activeAddressForm, 'ward', value)}
        />

        <FormRow label={activeConfig.addressLabel} error={getFieldError('addressLine')}>
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
