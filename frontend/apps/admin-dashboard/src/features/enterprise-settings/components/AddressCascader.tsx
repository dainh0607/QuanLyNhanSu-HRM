import React, { useState, useEffect } from "react";
import { lookupsService, type CountryDto, type ProvinceDto, type DistrictDto } from "../../../services/lookupsService";

interface AddressCascaderProps {
  countryCode?: string;
  provinceCode?: string;
  districtCode?: string;
  onChange: (codes: { countryCode: string; provinceCode: string; districtCode: string }) => void;
}

const AddressCascader: React.FC<AddressCascaderProps> = ({
  countryCode = "",
  provinceCode = "",
  districtCode = "",
  onChange
}) => {
  const [countries, setCountries] = useState<CountryDto[]>([]);
  const [provinces, setProvinces] = useState<ProvinceDto[]>([]);
  const [districts, setDistricts] = useState<DistrictDto[]>([]);

  useEffect(() => {
    const loadCountries = async () => {
      try {
        const data = await lookupsService.getCountries();
        setCountries(data);
      } catch (e) {
        console.error("Failed to load countries", e);
      }
    };
    void loadCountries();
  }, []);

  useEffect(() => {
    if (countryCode) {
      const loadProvinces = async () => {
        try {
          const data = await lookupsService.getProvinces(countryCode);
          setProvinces(data);
        } catch (e) {
          console.error("Failed to load provinces", e);
        }
      };
      void loadProvinces();
    } else {
      setProvinces([]);
    }
  }, [countryCode]);

  useEffect(() => {
    if (provinceCode) {
      const loadDistricts = async () => {
        try {
          const data = await lookupsService.getDistricts(provinceCode);
          setDistricts(data);
        } catch (e) {
          console.error("Failed to load districts", e);
        }
      };
      void loadDistricts();
    } else {
      setDistricts([]);
    }
  }, [provinceCode]);

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({
      countryCode: e.target.value,
      provinceCode: "",
      districtCode: ""
    });
  };

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({
      countryCode,
      provinceCode: e.target.value,
      districtCode: ""
    });
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({
      countryCode,
      provinceCode,
      districtCode: e.target.value
    });
  };

  const selectClassName = "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-all focus:border-[#134BBA] focus:outline-none focus:ring-4 focus:ring-blue-50/50 appearance-none";
  const labelClassName = "mb-1.5 block text-[13px] font-semibold text-slate-600 ml-1";

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label className={labelClassName}>Quốc gia</label>
        <div className="relative">
          <select
            value={countryCode}
            onChange={handleCountryChange}
            className={selectClassName}
          >
            <option value="">Chọn quốc gia</option>
            {countries.map(c => (
              <option key={c.code} value={c.code}>{c.name}</option>
            ))}
          </select>
          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">expand_more</span>
        </div>
      </div>

      <div>
        <label className={labelClassName}>Tỉnh/Thành phố</label>
        <div className="relative">
          <select
            value={provinceCode}
            onChange={handleProvinceChange}
            disabled={!countryCode}
            className={`${selectClassName} ${!countryCode ? 'bg-slate-50 cursor-not-allowed opacity-60' : ''}`}
          >
            <option value="">Chọn tỉnh/thành</option>
            {provinces.map(p => (
              <option key={p.code} value={p.code}>{p.name}</option>
            ))}
          </select>
          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">expand_more</span>
        </div>
      </div>

      <div>
        <label className={labelClassName}>Quận/Huyện</label>
        <div className="relative">
          <select
            value={districtCode}
            onChange={handleDistrictChange}
            disabled={!provinceCode}
            className={`${selectClassName} ${!provinceCode ? 'bg-slate-50 cursor-not-allowed opacity-60' : ''}`}
          >
            <option value="">Chọn quận/huyện</option>
            {districts.map(d => (
              <option key={d.code} value={d.code}>{d.name}</option>
            ))}
          </select>
          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">expand_more</span>
        </div>
      </div>
    </div>
  );
};

export default AddressCascader;
