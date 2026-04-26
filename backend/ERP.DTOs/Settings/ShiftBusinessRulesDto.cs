using System;

namespace ERP.DTOs.Settings
{
    public class ShiftBusinessRulesDto
    {
        public bool AutoScheduleNextWeek { get; set; }
        public bool AllowShiftRegistration { get; set; }
        public bool EnableRegistrationLock { get; set; }
        public string RegistrationLockDay { get; set; } // Monday, Tuesday, ...
        public int AdvanceScheduleWeeks { get; set; }
        public bool RequireShiftPublish { get; set; }
    }

    public class UpdateShiftBusinessRulesDto
    {
        public bool? AutoScheduleNextWeek { get; set; }
        public bool? AllowShiftRegistration { get; set; }
        public bool? EnableRegistrationLock { get; set; }
        public string? RegistrationLockDay { get; set; }
        public int? AdvanceScheduleWeeks { get; set; }
        public bool? RequireShiftPublish { get; set; }
    }
}
