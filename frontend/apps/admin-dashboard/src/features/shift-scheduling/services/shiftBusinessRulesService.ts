export interface ShiftBusinessRules {
  autoCopyShifts: boolean;
  allowEmployeeRegister: boolean;
  lockRegistrationDay: string | null;
  registrationLockEnabled: boolean;
  scheduleAheadWeeks: number;
  publishRequired: boolean;
}

const MOCK_BUSINESS_RULES: ShiftBusinessRules = {
  autoCopyShifts: false,
  allowEmployeeRegister: true,
  lockRegistrationDay: "Thứ năm",
  registrationLockEnabled: true,
  scheduleAheadWeeks: 2,
  publishRequired: true,
};

export const shiftBusinessRulesService = {
  async getRules(): Promise<ShiftBusinessRules> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { ...MOCK_BUSINESS_RULES };
  },

  async updateRules(rules: Partial<ShiftBusinessRules>): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 800));
    Object.assign(MOCK_BUSINESS_RULES, rules);
    console.log("[Mock API] Updated Business Rules:", MOCK_BUSINESS_RULES);
  }
};
