namespace ERP.DTOs.Employees.Profile
{
    public class BankAccountDto
    {
        public int Id { get; set; }
        public string AccountHolder { get; set; }
        public string AccountNumber { get; set; }
        public string BankName { get; set; }
        public string Branch { get; set; }
    }
}
