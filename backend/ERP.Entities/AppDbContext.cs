using Microsoft.EntityFrameworkCore;
using ERP.Entities.Models;
using ERP.Entities.Seeding;

namespace ERP.Entities
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<AddressTypes> AddressTypes { get; set; }
        public DbSet<Addresses> Addresses { get; set; }
        public DbSet<AdvanceTypes> AdvanceTypes { get; set; }
        public DbSet<Allowances> Allowances { get; set; }
        public DbSet<AssetAllocations> AssetAllocations { get; set; }
        public DbSet<Assets> Assets { get; set; }
        public DbSet<AuthSessions> AuthSessions { get; set; }
        public DbSet<AttendanceLogs> AttendanceLogs { get; set; }
        public DbSet<AttendanceModifications> AttendanceModifications { get; set; }
        public DbSet<AttendanceRecords> AttendanceRecords { get; set; }
        public DbSet<AttendanceSettings> AttendanceSettings { get; set; }
        public DbSet<BankAccounts> BankAccounts { get; set; }
        public DbSet<Branches> Branches { get; set; }
        public DbSet<Certificates> Certificates { get; set; }
        public DbSet<ContractTypes> ContractTypes { get; set; }
        public DbSet<Contracts> Contracts { get; set; }
        public DbSet<Courses> Courses { get; set; }
        public DbSet<DecisionTypes> DecisionTypes { get; set; }
        public DbSet<Deductions> Deductions { get; set; }
        public DbSet<Departments> Departments { get; set; }
        public DbSet<Dependents> Dependents { get; set; }
        public DbSet<Devices> Devices { get; set; }
        public DbSet<DigitalSignatures> DigitalSignatures { get; set; }
        public DbSet<DisciplineTypes> DisciplineTypes { get; set; }
        public DbSet<Education> Education { get; set; }
        public DbSet<EmergencyContacts> EmergencyContacts { get; set; }
        public DbSet<EmployeeAddresses> EmployeeAddresses { get; set; }
        public DbSet<EmployeeCertificates> EmployeeCertificates { get; set; }
        public DbSet<EmployeeCourses> EmployeeCourses { get; set; }
        public DbSet<EmployeeEvaluations> EmployeeEvaluations { get; set; }
        public DbSet<EmployeeLeaves> EmployeeLeaves { get; set; }
        public DbSet<EmployeeSkills> EmployeeSkills { get; set; }
        public DbSet<Employees> Employees { get; set; }
        public DbSet<Evaluations> Evaluations { get; set; }
        public DbSet<Genders> Genders { get; set; }
        public DbSet<HealthRecords> HealthRecords { get; set; }
        public DbSet<Insurances> Insurances { get; set; }
        public DbSet<JobTitles> JobTitles { get; set; }
        public DbSet<LeaveDurationTypes> LeaveDurationTypes { get; set; }
        public DbSet<LeaveRequests> LeaveRequests { get; set; }
        public DbSet<LeaveTypes> LeaveTypes { get; set; }
        public DbSet<LocationHistory> LocationHistory { get; set; }
        public DbSet<MaritalStatuses> MaritalStatuses { get; set; }
        public DbSet<MealTypes> MealTypes { get; set; }
        public DbSet<MonthlyAttendanceSummary> MonthlyAttendanceSummary { get; set; }
        public DbSet<OpenShifts> OpenShifts { get; set; }
        public DbSet<OtherIncomes> OtherIncomes { get; set; }
        public DbSet<OvertimeTypes> OvertimeTypes { get; set; }
        public DbSet<PayrollDeductions> PayrollDeductions { get; set; }
        public DbSet<PayrollDetails> PayrollDetails { get; set; }
        public DbSet<PayrollPeriods> PayrollPeriods { get; set; }
        public DbSet<Payrolls> Payrolls { get; set; }
        public DbSet<Permissions> Permissions { get; set; }
        public DbSet<PromotionHistory> PromotionHistory { get; set; }
        public DbSet<Regions> Regions { get; set; }
        public DbSet<RequestApprovals> RequestApprovals { get; set; }
        public DbSet<RequestBorrowDetails> RequestBorrowDetails { get; set; }
        public DbSet<RequestBorrows> RequestBorrows { get; set; }
        public DbSet<RequestDeviceChanges> RequestDeviceChanges { get; set; }
        public DbSet<RequestDisciplines> RequestDisciplines { get; set; }
        public DbSet<RequestExpensePayments> RequestExpensePayments { get; set; }
        public DbSet<RequestLateEarly> RequestLateEarly { get; set; }
        public DbSet<RequestMeals> RequestMeals { get; set; }
        public DbSet<RequestOvertime> RequestOvertime { get; set; }
        public DbSet<RequestPayments> RequestPayments { get; set; }
        public DbSet<RequestPurchaseDetails> RequestPurchaseDetails { get; set; }
        public DbSet<RequestPurchaseRequestDetails> RequestPurchaseRequestDetails { get; set; }
        public DbSet<RequestPurchaseRequests> RequestPurchaseRequests { get; set; }
        public DbSet<RequestPurchases> RequestPurchases { get; set; }
        public DbSet<RequestReimbursementDetails> RequestReimbursementDetails { get; set; }
        public DbSet<RequestReimbursements> RequestReimbursements { get; set; }
        public DbSet<RequestResignations> RequestResignations { get; set; }
        public DbSet<RequestRewards> RequestRewards { get; set; }
        public DbSet<RequestSalaryAdvances> RequestSalaryAdvances { get; set; }
        public DbSet<RequestShiftChange> RequestShiftChange { get; set; }
        public DbSet<RequestShiftRegister> RequestShiftRegister { get; set; }
        public DbSet<RequestShiftSwap> RequestShiftSwap { get; set; }
        public DbSet<RequestTypes> RequestTypes { get; set; }
        public DbSet<RequestVehicleUses> RequestVehicleUses { get; set; }
        public DbSet<RequestWorkTrips> RequestWorkTrips { get; set; }
        public DbSet<Requests> Requests { get; set; }
        public DbSet<RewardTypes> RewardTypes { get; set; }
        public DbSet<RolePermissions> RolePermissions { get; set; }
        public DbSet<Roles> Roles { get; set; }
        public DbSet<Salaries> Salaries { get; set; }
        public DbSet<SalaryGradeConfig> SalaryGradeConfig { get; set; }
        public DbSet<ShiftAssignments> ShiftAssignments { get; set; }
        public DbSet<ShiftTypes> ShiftTypes { get; set; }
        public DbSet<Shifts> Shifts { get; set; }
        public DbSet<Skills> Skills { get; set; }
        public DbSet<TaxBrackets> TaxBrackets { get; set; }
        public DbSet<TaxTypes> TaxTypes { get; set; }
        public DbSet<TimeMachines> TimeMachines { get; set; }
        public DbSet<UpdateHistory> UpdateHistory { get; set; }
        public DbSet<UserRoles> UserRoles { get; set; }
        public DbSet<Users> Users { get; set; }
        public DbSet<VehicleTypes> VehicleTypes { get; set; }
        public DbSet<WorkHistory> WorkHistory { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            // Apply all configurations from this assembly
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);

            modelBuilder.Entity<AuthSessions>(entity =>
            {
                entity.HasIndex(e => e.session_id).IsUnique();
                entity.HasIndex(e => e.refresh_token_hash).IsUnique();
                entity.HasIndex(e => new { e.user_id, e.is_active });

                entity.HasOne(e => e.User)
                    .WithMany()
                    .HasForeignKey(e => e.user_id)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Seed Master Data via Extension Method
            modelBuilder.SeedMasterData();

            // Disable cascade delete globally to avoid SQL Server multiple cascade path errors
            foreach (var relationship in modelBuilder.Model.GetEntityTypes()
                .SelectMany(e => e.GetForeignKeys()))
            {
                relationship.DeleteBehavior = DeleteBehavior.Restrict;
            }
        }
    }
}
