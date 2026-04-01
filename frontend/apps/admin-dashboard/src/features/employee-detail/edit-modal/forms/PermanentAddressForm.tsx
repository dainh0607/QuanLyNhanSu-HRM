export { default } from './PermanentAddressCascadingForm';
/*
import type { EmployeeEditPermanentAddressPayload } from '../../../../services/employeeService';
import { FormHeading, FormRow } from '../components/FormPrimitives';
import { getFieldClassName } from '../formStyles';

interface PermanentAddressFormProps {
  data: EmployeeEditPermanentAddressPayload;
  onFieldChange: <F extends keyof EmployeeEditPermanentAddressPayload>(
    field: F,
    value: EmployeeEditPermanentAddressPayload[F],
  ) => void;
}

const PermanentAddressForm: React.FC<PermanentAddressFormProps> = ({ data, onFieldChange }) => (
  <>
    <FormHeading
      title="Địa chỉ thường trú"
      description="Cập nhật đầy đủ địa chỉ hộ khẩu hoặc địa chỉ thường trú hiện tại."
    />
    <div className="space-y-5">
      <FormRow label="Quốc gia">
        <input
          type="text"
          value={data.country}
          onChange={(event) => onFieldChange('country', event.target.value)}
          className={getFieldClassName(false)}
          placeholder="Nhập quốc gia"
        />
      </FormRow>

      <FormRow label="Tỉnh/Thành phố">
        <input
          type="text"
          value={data.city}
          onChange={(event) => onFieldChange('city', event.target.value)}
          className={getFieldClassName(false)}
          placeholder="Nhập tỉnh hoặc thành phố"
        />
      </FormRow>

      <FormRow label="Quận/Huyện">
        <input
          type="text"
          value={data.district}
          onChange={(event) => onFieldChange('district', event.target.value)}
          className={getFieldClassName(false)}
          placeholder="Nhập quận hoặc huyện"
        />
      </FormRow>

      <FormRow label="Phường/Xã/Thị trấn">
        <input
          type="text"
          value={data.ward}
          onChange={(event) => onFieldChange('ward', event.target.value)}
          className={getFieldClassName(false)}
          placeholder="Nhập phường, xã hoặc thị trấn"
        />
      </FormRow>

      <FormRow label="Địa chỉ thường trú">
        <textarea
          value={data.addressLine}
          onChange={(event) => onFieldChange('addressLine', event.target.value)}
          className={`${getFieldClassName(false)} min-h-[112px] py-3`}
          placeholder="Nhập địa chỉ thường trú"
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

      <FormRow label="Địa chỉ hiện tại">
        <input
          type="text"
          value={data.addressLine}
          onChange={(event) => onFieldChange('addressLine', event.target.value)}
          className={getFieldClassName(false)}
          placeholder="Địa chỉ hiện tại"
        />
      </FormRow>
    </div>
  </>
);

*/
