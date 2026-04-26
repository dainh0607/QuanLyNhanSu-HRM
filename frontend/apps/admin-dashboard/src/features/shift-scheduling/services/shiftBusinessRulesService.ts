import { API_URL as BASE_API_URL } from "../../../services/apiConfig";
import { requestJson as coreRequestJson } from "../../../services/employee/core";

export interface ShiftBusinessRules {
  autoCopyShifts: boolean;
  allowEmployeeRegister: boolean;
  lockRegistrationDay: string | null;
  registrationLockEnabled: boolean;
  scheduleAheadWeeks: number;
  publishRequired: boolean;
}

interface BEShiftBusinessRules {
  auto_schedule_next_week: boolean;
  allow_shift_registration: boolean;
  enable_registration_lock: boolean;
  registration_lock_day: string;
  advance_schedule_weeks: number;
  require_shift_publish: boolean;
}

export const shiftBusinessRulesService = {
  async getRules(): Promise<ShiftBusinessRules> {
    const data = await coreRequestJson<BEShiftBusinessRules>(
      `${BASE_API_URL}/settings/tenant/shift-business-rules`,
      { method: "GET" },
      "Không thể tải cấu hình xếp ca"
    );

    return {
      autoCopyShifts: data.auto_schedule_next_week,
      allowEmployeeRegister: data.allow_shift_registration,
      registrationLockEnabled: data.enable_registration_lock,
      lockRegistrationDay: data.registration_lock_day,
      scheduleAheadWeeks: data.advance_schedule_weeks,
      publishRequired: data.require_shift_publish,
    };
  },

  async updateRules(rules: Partial<ShiftBusinessRules>): Promise<void> {
    const beRules: Partial<BEShiftBusinessRules> = {};
    
    if (rules.autoCopyShifts !== undefined) beRules.auto_schedule_next_week = rules.autoCopyShifts;
    if (rules.allowEmployeeRegister !== undefined) beRules.allow_shift_registration = rules.allowEmployeeRegister;
    if (rules.registrationLockEnabled !== undefined) beRules.enable_registration_lock = rules.registrationLockEnabled;
    if (rules.lockRegistrationDay !== undefined) beRules.registration_lock_day = rules.lockRegistrationDay ?? "Friday";
    if (rules.scheduleAheadWeeks !== undefined) beRules.advance_schedule_weeks = rules.scheduleAheadWeeks;
    if (rules.publishRequired !== undefined) beRules.require_shift_publish = rules.publishRequired;

    await coreRequestJson<void>(
      `${BASE_API_URL}/settings/tenant/shift-business-rules`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(beRules),
      },
      "Không thể cập nhật cấu hình xếp ca"
    );
  }
};
