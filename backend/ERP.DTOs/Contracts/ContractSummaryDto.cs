namespace ERP.DTOs.Contracts
{
    public class ContractSummaryDto
    {
        public int TotalContracts { get; set; }
        public int ActiveContracts { get; set; }
        public int PendingSignatureCount { get; set; } // "Chờ ký"
        public int ExpiringSoon { get; set; } // Next 30 days
        public int ExpiredContracts { get; set; }
        public int DraftContracts { get; set; }
        public int ProbationContracts { get; set; }
        public int OfficialContracts { get; set; }
    }
}
