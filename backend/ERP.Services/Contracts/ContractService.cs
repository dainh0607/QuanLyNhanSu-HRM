using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ERP.DTOs;
using ERP.DTOs.Contracts;
using ERP.Entities.Models;
using ERP.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using ERP.Services.Common;

namespace ERP.Services.Contracts
{
    public class ContractService : IContractService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IPdfService _pdfService;
        private readonly Microsoft.AspNetCore.Hosting.IWebHostEnvironment _environment;
        private readonly IStorageService _storageService;
        private readonly IEmailService _emailService;
        private readonly IContractNotificationService _notificationService;
        private readonly Microsoft.Extensions.Configuration.IConfiguration _configuration;

        public ContractService(
            IUnitOfWork unitOfWork, 
            IPdfService pdfService, 
            Microsoft.AspNetCore.Hosting.IWebHostEnvironment environment,
            IStorageService storageService,
            IEmailService emailService,
            IContractNotificationService notificationService,
            Microsoft.Extensions.Configuration.IConfiguration configuration)
        {
            _unitOfWork = unitOfWork;
            _pdfService = pdfService;
            _environment = environment;
            _storageService = storageService;
            _emailService = emailService;
            _notificationService = notificationService;
            _configuration = configuration;
        }

        public async Task<PaginatedListDto<ContractListItemDto>> GetPagedListAsync(ContractFilterDto filter)
        {
            var query = BuildFilteredQuery(filter);

            // 2. Counting
            var totalCount = await query.CountAsync();

            // 3. Paging & Projection
            var items = await query
                .OrderByDescending(x => x.effective_date)
                .Skip((filter.PageNumber - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .Select(x => new ContractListItemDto
                {
                    Id = x.Id,
                    ContractNumber = x.contract_number,
                    Status = x.status,
                    StatusLabel = MapStatusToLabel(x.status),
                    StatusColor = MapStatusToColor(x.status),
                    SignDate = x.sign_date,
                    EffectiveDate = x.effective_date,
                    ExpiryDate = x.expiry_date,
                    EmployeeId = x.employee_id,
                    EmployeeCode = x.Employee.employee_code,
                    FullName = x.Employee.full_name,
                    Avatar = x.Employee.avatar,
                    BranchName = x.Employee.Branch.name,
                    DepartmentName = x.Employee.Department.name,
                    JobTitleName = x.Employee.JobTitle.name,
                    ContractTypeId = x.contract_type_id,
                    ContractTypeName = x.ContractType.name,
                    SignedBy = x.signed_by,
                    TaxType = x.tax_type,
                    Attachment = x.attachment
                })
                .ToListAsync();

            return new PaginatedListDto<ContractListItemDto>(items, totalCount, filter.PageNumber, filter.PageSize);
        }

        private IQueryable<Entities.Models.Contracts> BuildFilteredQuery(ContractFilterDto filter)
        {
            var query = _unitOfWork.Repository<Entities.Models.Contracts>()
                .AsQueryable()
                .Include(x => x.Employee)
                    .ThenInclude(e => e.Branch)
                .Include(x => x.Employee)
                    .ThenInclude(e => e.Department)
                .Include(x => x.Employee)
                    .ThenInclude(e => e.JobTitle)
                .Include(x => x.ContractType)
                .AsQueryable();

            // 1. Filtering
            if (!string.IsNullOrEmpty(filter.Search))
            {
                query = query.Where(x => x.contract_number.Contains(filter.Search) || 
                                         x.Employee.full_name.Contains(filter.Search) ||
                                         x.Employee.employee_code.Contains(filter.Search));
            }

            if (!string.IsNullOrEmpty(filter.Status))
            {
                query = query.Where(x => x.status == filter.Status);
            }

            if (filter.ContractTypeId.HasValue)
            {
                query = query.Where(x => x.contract_type_id == filter.ContractTypeId);
            }

            if (filter.BranchId.HasValue)
            {
                query = query.Where(x => x.Employee.branch_id == filter.BranchId);
            }

            if (filter.DepartmentId.HasValue)
            {
                query = query.Where(x => x.Employee.department_id == filter.DepartmentId);
            }

            if (filter.FromDate.HasValue)
            {
                query = query.Where(x => x.effective_date >= filter.FromDate);
            }

            if (filter.ToDate.HasValue)
            {
                query = query.Where(x => x.effective_date <= filter.ToDate);
            }

            return query;
        }

        public async Task<ContractSummaryDto> GetSummaryAsync()
        {
            var repo = _unitOfWork.Repository<Entities.Models.Contracts>();
            var today = DateTime.Today;
            var expiringThreshold = today.AddDays(30);

            var allContracts = await repo.AsQueryable()
                .Include(c => c.ContractType)
                .ToListAsync();

            return new ContractSummaryDto
            {
                TotalContracts = allContracts.Count,
                ActiveContracts = allContracts.Count(c => c.status == "Active"),
                PendingSignatureCount = allContracts.Count(c => c.status == "Draft"), // "Chờ ký"
                ExpiredContracts = allContracts.Count(c => c.status == "Expired" || (c.expiry_date.HasValue && c.expiry_date < today)),
                ExpiringSoon = allContracts.Count(c => c.status == "Active" && c.expiry_date.HasValue && c.expiry_date >= today && c.expiry_date <= expiringThreshold),
                DraftContracts = allContracts.Count(c => c.status == "Draft"),
                ProbationContracts = allContracts.Count(c => c.ContractType != null && c.ContractType.name.Contains("Thử việc")),
                OfficialContracts = allContracts.Count(c => c.ContractType != null && c.ContractType.name.Contains("Chính thức"))
            };
        }

        public async Task<byte[]> ExportToCsvAsync(ContractFilterDto filter)
        {
            var contracts = await BuildFilteredQuery(filter)
                .OrderByDescending(x => x.effective_date)
                .ToListAsync();

            var sb = new System.Text.StringBuilder();

            // Header - Using semicolon (';') for Vietnamese Excel compatibility
            var headers = new[] 
            { 
                "STT", "Mã nhân viên", "Họ và tên", "Số hợp đồng", "Loại hợp đồng", 
                "Trạng thái", "Ngày ký", "Ngày hiệu lực", "Ngày hết hạn", 
                "Chi nhánh", "Phòng ban", "Người ký", "Loại thuế TNCN" 
            };
            sb.AppendLine(string.Join(";", headers.Select(EscapeCsv)));

            int index = 1;
            foreach (var c in contracts)
            {
                var row = new List<string>
                {
                    index.ToString(),
                    c.Employee?.employee_code ?? "",
                    c.Employee?.full_name ?? "",
                    c.contract_number ?? "",
                    c.ContractType?.name ?? "",
                    MapStatusToLabel(c.status),
                    c.sign_date?.ToString("dd/MM/yyyy") ?? "",
                    c.effective_date?.ToString("dd/MM/yyyy") ?? "",
                    c.expiry_date?.ToString("dd/MM/yyyy") ?? "",
                    c.Employee?.Branch?.name ?? "",
                    c.Employee?.Department?.name ?? "",
                    c.signed_by ?? "",
                    c.tax_type ?? ""
                };
                sb.AppendLine(string.Join(";", row.Select(EscapeCsv)));
                index++;
            }

            // UTF-8 with BOM
            var encoding = new System.Text.UTF8Encoding(true);
            var headerBytes = encoding.GetPreamble();
            var contentBytes = encoding.GetBytes(sb.ToString());
            
            return headerBytes.Concat(contentBytes).ToArray();
        }

        public async Task<int> DeleteMultipleAsync(int[] ids)
        {
            if (ids == null || ids.Length == 0) return 0;

            var repo = _unitOfWork.Repository<Entities.Models.Contracts>();
            int count = 0;

            foreach (var id in ids)
            {
                var contract = await repo.GetByIdAsync(id);
                if (contract != null)
                {
                    repo.Remove(contract);
                    count++;
                }
            }

            if (count > 0)
            {
                await _unitOfWork.SaveChangesAsync();
            }

            return count;
        }

        private string EscapeCsv(string? val)
        {
            if (string.IsNullOrEmpty(val)) return "";
            return $"\"{val.Replace("\"", "\"\"")}\"";
        }

        private static string MapStatusToLabel(string status)
        {
            return status switch
            {
                "Active" => "Đang hiệu lực",
                "Expired" => "Hết hạn",
                "Draft" => "Chờ ký",
                "Terminated" => "Đã chấm dứt",
                "Cancelled" => "Đã hủy",
                _ => status
            };
        }

        private static string MapStatusToColor(string status)
        {
            return status switch
            {
                "Active" => "success",
                "Expired" => "error",
                "Draft" => "warning",
                "Terminated" => "default",
                "Cancelled" => "error",
                _ => "default"
            };
        }

        public async Task<IEnumerable<ContractDto>> GetByEmployeeIdAsync(int employeeId)
        {
            var contracts = await _unitOfWork.Repository<Entities.Models.Contracts>()
                .AsQueryable()
                .Include(x => x.Employee)
                .Include(x => x.ContractType)
                .Where(x => x.employee_id == employeeId)
                .ToListAsync();

            return contracts.Select(x => new ContractDto
            {
                Id = x.Id,
                EmployeeId = x.employee_id,
                EmployeeName = x.Employee?.full_name,
                ContractNumber = x.contract_number,
                ContractTypeId = x.contract_type_id,
                ContractTypeName = x.ContractType?.name,
                SignDate = x.sign_date,
                EffectiveDate = x.effective_date,
                ExpiryDate = x.expiry_date,
                SignedBy = x.signed_by,
                TaxType = x.tax_type,
                Attachment = x.attachment,
                Status = x.status
            }).OrderByDescending(c => c.EffectiveDate);
        }

        public async Task<ContractDto> GetByIdAsync(int id)
        {
            var x = await _unitOfWork.Repository<Entities.Models.Contracts>()
                .AsQueryable()
                .Include(c => c.Employee)
                .Include(c => c.ContractType)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (x == null) return null;

            return new ContractDto
            {
                Id = x.Id,
                EmployeeId = x.employee_id,
                EmployeeName = x.Employee?.full_name,
                ContractNumber = x.contract_number,
                ContractTypeId = x.contract_type_id,
                ContractTypeName = x.ContractType?.name,
                SignDate = x.sign_date,
                EffectiveDate = x.effective_date,
                ExpiryDate = x.expiry_date,
                SignedBy = x.signed_by,
                TaxType = x.tax_type,
                Attachment = x.attachment,
                Status = x.status
            };
        }

        public async Task<bool> CreateAsync(ContractCreateDto dto)
        {
            // 1. Validation: Unitque Contract Number
            var existingContract = await _unitOfWork.Repository<Entities.Models.Contracts>()
                .AsQueryable()
                .FirstOrDefaultAsync(c => c.contract_number == dto.ContractNumber);
            if (existingContract != null)
            {
                throw new System.Exception($"Số hợp đồng '{dto.ContractNumber}' đã tồn tại trên hệ thống.");
            }

            // 2. Validation: Expiry Date >= Sign Date (AC 3)
            if (dto.SignDate.HasValue && dto.ExpiryDate.HasValue && dto.ExpiryDate < dto.SignDate)
            {
                throw new System.Exception("Ngày hết hạn không được nhỏ hơn ngày ký.");
            }

            // 3. Validation: Overlapping dates (Existing logic)
            // Note: If SignDate is used for AC 2, we use EffectiveDate (often same) for overlap check.
            var startDate = dto.EffectiveDate ?? dto.SignDate ?? DateTime.UtcNow;
            if (await CheckOverlappingContractAsync(dto.EmployeeId, startDate, dto.ExpiryDate))
            {
                throw new System.Exception("Nhân viên này đã có hợp đồng khác hiệu lực trong khoảng thời gian này.");
            }

            var contract = new Entities.Models.Contracts
            {
                employee_id = dto.EmployeeId,
                contract_number = dto.ContractNumber,
                contract_type_id = dto.ContractTypeId,
                sign_date = dto.SignDate,
                effective_date = dto.EffectiveDate ?? dto.SignDate, // Fallback if not provided
                expiry_date = dto.ExpiryDate,
                signed_by = dto.SignedBy,
                tax_type = dto.TaxType,
                attachment = dto.Attachment,
                status = dto.Status ?? "Draft",
                is_electronic = dto.IsElectronic,
                note = dto.Note ?? "",
                template_id = dto.TemplateId
            };

            await _unitOfWork.Repository<Entities.Models.Contracts>().AddAsync(contract);
            return await _unitOfWork.SaveChangesAsync() > 0;
        }

        public async Task<int> CreateElectronicDraftAsync(ElectronicContractDraftDto dto)
        {
            var contract = new Entities.Models.Contracts
            {
                employee_id = dto.EmployeeId,
                contract_number = dto.ContractNumber ?? $"DRAFT-{Guid.NewGuid().ToString().Substring(0, 8)}",
                contract_type_id = dto.ContractTypeId,
                effective_date = dto.EffectiveDate ?? DateTime.UtcNow,
                status = "Draft",
                is_electronic = true,
                note = dto.Note ?? "",
                template_id = dto.TemplateId,
                attachment = "", // Required field, set to empty for draft
                signed_by = "",  // Required field
                tax_type = ""    // Required field
            };

            await _unitOfWork.Repository<Entities.Models.Contracts>().AddAsync(contract);
            await _unitOfWork.SaveChangesAsync();
            return contract.Id;
        }

        private async Task<bool> CheckOverlappingContractAsync(int employeeId, DateTime startDate, DateTime? endDate, int? excludeContractId = null)
        {
            var contracts = await _unitOfWork.Repository<Entities.Models.Contracts>().FindAsync(c => 
                c.employee_id == employeeId && 
                c.status != "Terminated" && // Ignore terminated contracts
                c.status != "Cancelled" &&
                (!excludeContractId.HasValue || c.Id != excludeContractId.Value));

            foreach (var c in contracts)
            {
                // Condition for overlap:
                // (StartA <= EndB) and (EndA >= StartB)
                // If End is null, treat it as a very far future date
                DateTime endA = endDate ?? DateTime.MaxValue;
                DateTime endB = c.expiry_date ?? DateTime.MaxValue;

                if (startDate <= endB && endA >= c.effective_date)
                {
                    return true;
                }
            }
            return false;
        }

        public async Task<bool> UpdateAsync(int id, ContractUpdateDto dto)
        {
            var contract = await _unitOfWork.Repository<Entities.Models.Contracts>().GetByIdAsync(id);
            if (contract == null) return false;

            // 1. Validation: Overlapping dates
            DateTime newStartDate = dto.EffectiveDate ?? contract.effective_date ?? DateTime.UtcNow;
            DateTime? newEndDate = dto.ExpiryDate ?? contract.expiry_date;
            
            if (await CheckOverlappingContractAsync(contract.employee_id, newStartDate, newEndDate, id))
            {
                throw new Exception("Cập nhật thất bại: Khoảng thời gian hiệu lực mới bị chồng chéo với hợp đồng khác.");
            }

            contract.contract_number = dto.ContractNumber;
            contract.contract_type_id = dto.ContractTypeId;
            contract.sign_date = dto.SignDate;
            contract.effective_date = dto.EffectiveDate;
            contract.expiry_date = dto.ExpiryDate;
            contract.signed_by = dto.SignedBy;
            contract.tax_type = dto.TaxType;
            contract.attachment = dto.Attachment;
            contract.status = dto.Status;
            
            if (dto.IsElectronic.HasValue)
                contract.is_electronic = dto.IsElectronic.Value;
            
            if (dto.Note != null)
                contract.note = dto.Note;
            
            if (dto.TemplateId.HasValue)
                contract.template_id = dto.TemplateId;

            _unitOfWork.Repository<Entities.Models.Contracts>().Update(contract);
            return await _unitOfWork.SaveChangesAsync() > 0;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var contract = await _unitOfWork.Repository<Entities.Models.Contracts>().GetByIdAsync(id);
            if (contract == null) return false;

            _unitOfWork.Repository<Entities.Models.Contracts>().Remove(contract);
            return await _unitOfWork.SaveChangesAsync() > 0;
        }

        public async Task<(byte[] content, string contentType, string fileName)> GetContractPreviewAsync(int id)
        {
            var contract = await _unitOfWork.Repository<Entities.Models.Contracts>()
                .AsQueryable()
                .Include(c => c.Employee)
                    .ThenInclude(e => e.Department)
                .Include(c => c.Employee)
                    .ThenInclude(e => e.JobTitle)
                .Include(c => c.Template)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (contract == null) throw new Exception("Không tìm thấy hợp đồng.");

            if (contract.is_electronic)
            {
                // Generate PDF from Template
                var content = await _pdfService.GenerateContractPdfAsync(contract);
                return (content, "application/pdf", $"Preview_{contract.contract_number}.pdf");
            }
            else
            {
                // Return Physical File
                if (string.IsNullOrEmpty(contract.attachment))
                {
                    throw new Exception("Hợp đồng này không có tệp đính kèm để xem trước.");
                }

                // Extract relative path from URL
                // Example: https://localhost:5001/uploads/guid_filename.pdf -> uploads/guid_filename.pdf
                var uri = new Uri(contract.attachment);
                var fileName = Path.GetFileName(uri.LocalPath);
                
                var webRoot = string.IsNullOrEmpty(_environment.WebRootPath) 
                    ? Path.Combine(_environment.ContentRootPath, "wwwroot") 
                    : _environment.WebRootPath;
                
                var filePath = Path.Combine(webRoot, "uploads", fileName);

                if (!File.Exists(filePath))
                {
                    throw new Exception("Tệp đính kèm không tồn tại trên hệ thống.");
                }

                var content = await File.ReadAllBytesAsync(filePath);
                return (content, "application/pdf", fileName);
            }
        }

        public async Task<bool> SaveElectronicSignersAsync(ContractStep3Dto dto)
        {
            var contract = await _unitOfWork.Repository<Entities.Models.Contracts>()
                .AsQueryable()
                .Include(c => c.Signers)
                .FirstOrDefaultAsync(c => c.Id == dto.ContractId);

            if (contract == null) throw new Exception("Không tìm thấy hợp đồng.");
            if (!contract.is_electronic) throw new Exception("Hợp đồng này không phải là hợp đồng điện tử.");

            // 1. Remove existing signers
            var signerRepo = _unitOfWork.Repository<ContractSigners>();
            foreach (var existingSigner in contract.Signers.ToList())
            {
                signerRepo.Remove(existingSigner);
            }

            // 2. Add new signers
            foreach (var signerDto in dto.Signers)
            {
                var newSigner = new ContractSigners
                {
                    contract_id = dto.ContractId,
                    email = signerDto.Email,
                    full_name = signerDto.FullName,
                    sign_order = signerDto.SignOrder,
                    status = signerDto.Status ?? "Pending",
                    note = signerDto.Note ?? "",
                    signature_token = Guid.NewGuid().ToString("N") // Required field
                };

                await signerRepo.AddAsync(newSigner);
            }

            contract.UpdatedAt = DateTime.UtcNow;
            _unitOfWork.Repository<Entities.Models.Contracts>().Update(contract);

            return await _unitOfWork.SaveChangesAsync() > 0;
        }

        public async Task<bool> SaveElectronicPositionsAsync(ContractStep4Dto dto)
        {
            var signerIds = await _unitOfWork.Repository<ContractSigners>()
                .AsQueryable()
                .Where(s => s.contract_id == dto.ContractId)
                .Select(s => s.Id)
                .ToListAsync();

            if (signerIds == null || !signerIds.Any()) 
                throw new Exception("Không tìm thấy danh sách người ký cho hợp đồng này.");

            var positionRepo = _unitOfWork.Repository<ContractSignerPositions>();

            // 1. Remove existing positions for these signers
            var existingPositions = await positionRepo.AsQueryable()
                .Where(p => signerIds.Contains(p.signer_id))
                .ToListAsync();

            foreach (var pos in existingPositions)
            {
                positionRepo.Remove(pos);
            }

            // 2. Add new positions
            foreach (var posDto in dto.Positions)
            {
                if (!signerIds.Contains(posDto.SignerId))
                    throw new Exception($"Người ký (ID: {posDto.SignerId}) không thuộc hợp đồng này.");

                var newPos = new ContractSignerPositions
                {
                    signer_id = posDto.SignerId,
                    type = posDto.Type,
                    page_number = posDto.PageNumber,
                    x_pos = posDto.XPos,
                    y_pos = posDto.YPos,
                    width = posDto.Width,
                    height = posDto.Height
                };

                await positionRepo.AddAsync(newPos);
            }

            return await _unitOfWork.SaveChangesAsync() > 0;
        }

        public async Task<bool> SubmitElectronicContractAsync(int contractId)
        {
            var contract = await _unitOfWork.Repository<Entities.Models.Contracts>()
                .AsQueryable()
                .Include(c => c.Employee)
                .Include(c => c.Template)
                .Include(c => c.Signers)
                .FirstOrDefaultAsync(c => c.Id == contractId);

            if (contract == null) throw new Exception("Không tìm thấy hợp đồng.");
            if (!contract.is_electronic) throw new Exception("Hợp đồng này không phải là hợp đồng điện tử.");
            
            // 1. Generate final PDF
            var pdfBytes = await _pdfService.GenerateContractPdfAsync(contract);
            
            // 2. Upload to storage
            using (var ms = new System.IO.MemoryStream(pdfBytes))
            {
                var fileName = $"{contract.contract_number}_{Guid.NewGuid().ToString().Substring(0, 8)}.pdf";
                var fileUrl = await _storageService.UploadFileAsync(ms, fileName, "application/pdf");
                contract.attachment = fileUrl;
            }

            // 3. Update Status
            contract.status = "PendingSignature";
            contract.UpdatedAt = DateTime.UtcNow;

            _unitOfWork.Repository<Entities.Models.Contracts>().Update(contract);
            await _unitOfWork.SaveChangesAsync();

            // 4. Handle first signer notification via NotificationService
            await _notificationService.NotifyNextSignerAsync(contract.Id);

            return true;
        }
    }
}
