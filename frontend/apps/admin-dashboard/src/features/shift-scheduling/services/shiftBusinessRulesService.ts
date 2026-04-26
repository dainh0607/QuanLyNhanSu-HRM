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
  autoScheduleNextWeek: boolean;
  allowShiftRegistration: boolean;
  enableRegistrationLock: boolean;
  registrationLockDay: string;
  advanceScheduleWeeks: number;
  requireShiftPublish: boolean;
}

export const shiftBusinessRulesService = {
  async getRules(): Promise<ShiftBusinessRules> {
    const data = await coreRequestJson<BEShiftBusinessRules>(
      `${BASE_API_URL}/settings/tenant/shift-business-rules`,
      { method: "GET" },
      "Không thể tải cấu hình xếp ca"
    );

    return {
      autoCopyShifts: data.autoScheduleNextWeek,
      allowEmployeeRegister: data.allowShiftRegistration,
      registrationLockEnabled: data.enableRegistrationLock,
      lockRegistrationDay: data.registrationLockDay,
      scheduleAheadWeeks: data.advanceScheduleWeeks,
      publishRequired: data.requireShiftPublish,
    };
  },

  async updateRules(rules: Partial<ShiftBusinessRules>): Promise<void> {
    const beRules: Partial<BEShiftBusinessRules> = {};
    
    if (rules.autoCopyShifts !== undefined) beRules.autoScheduleNextWeek = rules.autoCopyShifts;
    if (rules.allowEmployeeRegister !== undefined) beRules.allowShiftRegistration = rules.allowEmployeeRegister;
    if (rules.registrationLockEnabled !== undefined) beRules.enableRegistrationLock = rules.registrationLockEnabled;
    if (rules.lockRegistrationDay !== undefined) beRules.registrationLockDay = rules.lockRegistrationDay ?? "Friday";
    if (rules.scheduleAheadWeeks !== undefined) beRules.advanceScheduleWeeks = rules.scheduleAheadWeeks;
    if (rules.publishRequired !== undefined) beRules.requireShiftPublish = rules.publishRequired;

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
