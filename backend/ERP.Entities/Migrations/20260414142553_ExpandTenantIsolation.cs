using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERP.Entities.Migrations
{
    /// <inheritdoc />
    public partial class ExpandTenantIsolation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "TaxTypes",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "TaxBrackets",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "ShiftTemplates",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "Shifts",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "ShiftCycleTemplates",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "ShiftCycleItems",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "ShiftAssignments",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "SalaryGradeConfig",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "Salaries",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "RequestWorkTrips",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "RequestVehicleUses",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "RequestShiftSwap",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "RequestShiftRegister",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "RequestShiftChange",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "RequestSalaryAdvances",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "Requests",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "RequestRewards",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "RequestResignations",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "RequestReimbursements",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "RequestPurchases",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "RequestPurchaseRequests",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "RequestPurchaseRequestDetails",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "RequestPurchaseDetails",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "RequestPayments",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "RequestOvertime",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "RequestMeals",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "RequestLateEarly",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "RequestExpensePayments",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "RequestDisciplines",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "RequestDeviceChanges",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "RequestBorrows",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "RequestBorrowDetails",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "RequestApprovals",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "Payrolls",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "PayrollPeriods",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "PayrollDetails",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "PayrollDeductions",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "OtherIncomes",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "OpenShifts",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "MonthlyAttendanceSummary",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "LeaveRequests",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "Insurances",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "HealthRecords",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "EmployeeSkills",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "EmployeeDocuments",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "EmployeeCertificates",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "EmployeeAddresses",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "Education",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "Dependents",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "Deductions",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "DailyAttendance",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "ContractTemplates",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "Contracts",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "Certificates",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "BankAccounts",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "AttendanceSettings",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "AttendanceRecords",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "AttendancePolicies",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "AttendanceLogs",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "AttendanceLocations",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "Assets",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "AssetAllocations",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "Allowances",
                type: "int",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "TaxBrackets",
                keyColumn: "id",
                keyValue: 1,
                column: "tenant_id",
                value: 1);

            migrationBuilder.UpdateData(
                table: "TaxBrackets",
                keyColumn: "id",
                keyValue: 2,
                column: "tenant_id",
                value: 1);

            migrationBuilder.UpdateData(
                table: "TaxBrackets",
                keyColumn: "id",
                keyValue: 3,
                column: "tenant_id",
                value: 1);

            migrationBuilder.UpdateData(
                table: "TaxBrackets",
                keyColumn: "id",
                keyValue: 4,
                column: "tenant_id",
                value: 1);

            migrationBuilder.UpdateData(
                table: "TaxBrackets",
                keyColumn: "id",
                keyValue: 5,
                column: "tenant_id",
                value: 1);

            migrationBuilder.UpdateData(
                table: "TaxBrackets",
                keyColumn: "id",
                keyValue: 6,
                column: "tenant_id",
                value: 1);

            migrationBuilder.UpdateData(
                table: "TaxBrackets",
                keyColumn: "id",
                keyValue: 7,
                column: "tenant_id",
                value: 1);

            migrationBuilder.UpdateData(
                table: "TaxTypes",
                keyColumn: "id",
                keyValue: 1,
                column: "tenant_id",
                value: 1);

            migrationBuilder.Sql("UPDATE [Allowances] SET tenant_id = 1 WHERE tenant_id IS NULL");
            migrationBuilder.Sql("UPDATE [AssetAllocations] SET tenant_id = 1 WHERE tenant_id IS NULL");
            migrationBuilder.Sql("UPDATE [Assets] SET tenant_id = 1 WHERE tenant_id IS NULL");
            migrationBuilder.Sql("UPDATE [AttendanceLocations] SET tenant_id = 1 WHERE tenant_id IS NULL");
            migrationBuilder.Sql("UPDATE [AttendanceLogs] SET tenant_id = 1 WHERE tenant_id IS NULL");
            migrationBuilder.Sql("UPDATE [AttendancePolicies] SET tenant_id = 1 WHERE tenant_id IS NULL");
            migrationBuilder.Sql("UPDATE [AttendanceRecords] SET tenant_id = 1 WHERE tenant_id IS NULL");
            migrationBuilder.Sql("UPDATE [AttendanceSettings] SET tenant_id = 1 WHERE tenant_id IS NULL");
            migrationBuilder.Sql("UPDATE [BankAccounts] SET tenant_id = 1 WHERE tenant_id IS NULL");
            migrationBuilder.Sql("UPDATE [Certificates] SET tenant_id = 1 WHERE tenant_id IS NULL");
            migrationBuilder.Sql("UPDATE [ContractTemplates] SET tenant_id = 1 WHERE tenant_id IS NULL");
            migrationBuilder.Sql("UPDATE [Contracts] SET tenant_id = 1 WHERE tenant_id IS NULL");
            migrationBuilder.Sql("UPDATE [DailyAttendance] SET tenant_id = 1 WHERE tenant_id IS NULL");
            migrationBuilder.Sql("UPDATE [Deductions] SET tenant_id = 1 WHERE tenant_id IS NULL");
            migrationBuilder.Sql("UPDATE [Dependents] SET tenant_id = 1 WHERE tenant_id IS NULL");
            migrationBuilder.Sql("UPDATE [Education] SET tenant_id = 1 WHERE tenant_id IS NULL");
            migrationBuilder.Sql("UPDATE [EmployeeAddresses] SET tenant_id = 1 WHERE tenant_id IS NULL");
            migrationBuilder.Sql("UPDATE [EmployeeCertificates] SET tenant_id = 1 WHERE tenant_id IS NULL");
            migrationBuilder.Sql("UPDATE [EmployeeDocuments] SET tenant_id = 1 WHERE tenant_id IS NULL");
            migrationBuilder.Sql("UPDATE [EmployeeSkills] SET tenant_id = 1 WHERE tenant_id IS NULL");
            migrationBuilder.Sql("UPDATE [HealthRecords] SET tenant_id = 1 WHERE tenant_id IS NULL");
            migrationBuilder.Sql("UPDATE [Insurances] SET tenant_id = 1 WHERE tenant_id IS NULL");
            migrationBuilder.Sql("UPDATE [LeaveRequests] SET tenant_id = 1 WHERE tenant_id IS NULL");
            migrationBuilder.Sql("UPDATE [MonthlyAttendanceSummary] SET tenant_id = 1 WHERE tenant_id IS NULL");
            migrationBuilder.Sql("UPDATE [OpenShifts] SET tenant_id = 1 WHERE tenant_id IS NULL");
            migrationBuilder.Sql("UPDATE [OtherIncomes] SET tenant_id = 1 WHERE tenant_id IS NULL");
            migrationBuilder.Sql("UPDATE [PayrollDeductions] SET tenant_id = 1 WHERE tenant_id IS NULL");
            migrationBuilder.Sql("UPDATE [PayrollDetails] SET tenant_id = 1 WHERE tenant_id IS NULL");
            migrationBuilder.Sql("UPDATE [PayrollPeriods] SET tenant_id = 1 WHERE tenant_id IS NULL");
            migrationBuilder.Sql("UPDATE [Payrolls] SET tenant_id = 1 WHERE tenant_id IS NULL");
            migrationBuilder.Sql("UPDATE [RequestApprovals] SET tenant_id = 1 WHERE tenant_id IS NULL");
            migrationBuilder.Sql("UPDATE [RequestBorrowDetails] SET tenant_id = 1 WHERE tenant_id IS NULL");
            migrationBuilder.Sql("UPDATE [RequestBorrows] SET tenant_id = 1 WHERE tenant_id IS NULL");
            migrationBuilder.Sql("UPDATE [RequestDeviceChanges] SET tenant_id = 1 WHERE tenant_id IS NULL");
            migrationBuilder.Sql("UPDATE [RequestDisciplines] SET tenant_id = 1 WHERE tenant_id IS NULL");
            migrationBuilder.Sql("UPDATE [RequestExpensePayments] SET tenant_id = 1 WHERE tenant_id IS NULL");
            migrationBuilder.Sql("UPDATE [RequestLateEarly] SET tenant_id = 1 WHERE tenant_id IS NULL");
            migrationBuilder.Sql("UPDATE [RequestMeals] SET tenant_id = 1 WHERE tenant_id IS NULL");
            migrationBuilder.Sql("UPDATE [RequestOvertime] SET tenant_id = 1 WHERE tenant_id IS NULL");
            migrationBuilder.Sql("UPDATE [RequestPayments] SET tenant_id = 1 WHERE tenant_id IS NULL");
            migrationBuilder.Sql("UPDATE [RequestPurchaseDetails] SET tenant_id = 1 WHERE tenant_id IS NULL");
            migrationBuilder.Sql("UPDATE [RequestPurchaseRequestDetails] SET tenant_id = 1 WHERE tenant_id IS NULL");
            migrationBuilder.Sql("UPDATE [RequestPurchaseRequests] SET tenant_id = 1 WHERE tenant_id IS NULL");
            migrationBuilder.Sql("UPDATE [RequestPurchases] SET tenant_id = 1 WHERE tenant_id IS NULL");
            migrationBuilder.Sql("UPDATE [RequestReimbursements] SET tenant_id = 1 WHERE tenant_id IS NULL");
            migrationBuilder.Sql("UPDATE [RequestResignations] SET tenant_id = 1 WHERE tenant_id IS NULL");
            migrationBuilder.Sql("UPDATE [RequestRewards] SET tenant_id = 1 WHERE tenant_id IS NULL");
            migrationBuilder.Sql("UPDATE [RequestSalaryAdvances] SET tenant_id = 1 WHERE tenant_id IS NULL");
            migrationBuilder.Sql("UPDATE [RequestShiftChange] SET tenant_id = 1 WHERE tenant_id IS NULL");
            migrationBuilder.Sql("UPDATE [RequestShiftRegister] SET tenant_id = 1 WHERE tenant_id IS NULL");
            migrationBuilder.Sql("UPDATE [RequestShiftSwap] SET tenant_id = 1 WHERE tenant_id IS NULL");
            migrationBuilder.Sql("UPDATE [RequestVehicleUses] SET tenant_id = 1 WHERE tenant_id IS NULL");
            migrationBuilder.Sql("UPDATE [RequestWorkTrips] SET tenant_id = 1 WHERE tenant_id IS NULL");
            migrationBuilder.Sql("UPDATE [Requests] SET tenant_id = 1 WHERE tenant_id IS NULL");
            migrationBuilder.Sql("UPDATE [Salaries] SET tenant_id = 1 WHERE tenant_id IS NULL");
            migrationBuilder.Sql("UPDATE [SalaryGradeConfig] SET tenant_id = 1 WHERE tenant_id IS NULL");
            migrationBuilder.Sql("UPDATE [ShiftAssignments] SET tenant_id = 1 WHERE tenant_id IS NULL");
            migrationBuilder.Sql("UPDATE [ShiftCycleItems] SET tenant_id = 1 WHERE tenant_id IS NULL");
            migrationBuilder.Sql("UPDATE [ShiftCycleTemplates] SET tenant_id = 1 WHERE tenant_id IS NULL");
            migrationBuilder.Sql("UPDATE [ShiftTemplates] SET tenant_id = 1 WHERE tenant_id IS NULL");
            migrationBuilder.Sql("UPDATE [Shifts] SET tenant_id = 1 WHERE tenant_id IS NULL");
            migrationBuilder.Sql("UPDATE [TaxBrackets] SET tenant_id = 1 WHERE tenant_id IS NULL");
            migrationBuilder.Sql("UPDATE [TaxTypes] SET tenant_id = 1 WHERE tenant_id IS NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "TaxTypes");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "TaxBrackets");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "ShiftTemplates");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "Shifts");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "ShiftCycleTemplates");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "ShiftCycleItems");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "ShiftAssignments");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "SalaryGradeConfig");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "Salaries");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "RequestWorkTrips");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "RequestVehicleUses");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "RequestShiftSwap");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "RequestShiftRegister");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "RequestShiftChange");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "RequestSalaryAdvances");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "Requests");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "RequestRewards");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "RequestResignations");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "RequestReimbursements");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "RequestPurchases");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "RequestPurchaseRequests");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "RequestPurchaseRequestDetails");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "RequestPurchaseDetails");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "RequestPayments");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "RequestOvertime");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "RequestMeals");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "RequestLateEarly");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "RequestExpensePayments");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "RequestDisciplines");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "RequestDeviceChanges");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "RequestBorrows");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "RequestBorrowDetails");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "RequestApprovals");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "Payrolls");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "PayrollPeriods");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "PayrollDetails");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "PayrollDeductions");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "OtherIncomes");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "OpenShifts");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "MonthlyAttendanceSummary");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "LeaveRequests");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "Insurances");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "HealthRecords");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "EmployeeSkills");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "EmployeeDocuments");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "EmployeeCertificates");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "EmployeeAddresses");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "Education");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "Dependents");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "Deductions");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "DailyAttendance");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "ContractTemplates");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "Contracts");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "Certificates");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "BankAccounts");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "AttendanceSettings");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "AttendanceRecords");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "AttendancePolicies");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "AttendanceLogs");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "AttendanceLocations");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "Assets");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "AssetAllocations");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "Allowances");
        }
    }
}
