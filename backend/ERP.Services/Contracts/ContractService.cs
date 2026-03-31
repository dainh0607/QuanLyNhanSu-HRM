using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ERP.DTOs.Contracts;
using ERP.Entities.Models;
using ERP.Repositories.Interfaces;

namespace ERP.Services.Contracts
{
    public class ContractService : IContractService
    {
        private readonly IUnitOfWork _unitOfWork;

        public ContractService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<IEnumerable<ContractDto>> GetByEmployeeIdAsync(int employeeId)
        {
            var contracts = await _unitOfWork.Repository<Entities.Models.Contracts>().FindAsync(
                x => x.employee_id == employeeId,
                includeProperties: "Employee,ContractType"
            );

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
            var x = (await _unitOfWork.Repository<Entities.Models.Contracts>().FindAsync(
                c => c.Id == id,
                includeProperties: "Employee,ContractType"
            )).FirstOrDefault();

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
            var contract = new Entities.Models.Contracts
            {
                employee_id = dto.EmployeeId,
                contract_number = dto.ContractNumber,
                contract_type_id = dto.ContractTypeId,
                sign_date = dto.SignDate,
                effective_date = dto.EffectiveDate,
                expiry_date = dto.ExpiryDate,
                signed_by = dto.SignedBy,
                tax_type = dto.TaxType,
                attachment = dto.Attachment,
                status = dto.Status ?? "Draft"
            };

            await _unitOfWork.Repository<Entities.Models.Contracts>().AddAsync(contract);
            return await _unitOfWork.SaveChangesAsync() > 0;
        }

        public async Task<bool> UpdateAsync(int id, ContractUpdateDto dto)
        {
            var contract = await _unitOfWork.Repository<Entities.Models.Contracts>().GetByIdAsync(id);
            if (contract == null) return false;

            contract.contract_number = dto.ContractNumber;
            contract.contract_type_id = dto.ContractTypeId;
            contract.sign_date = dto.SignDate;
            contract.effective_date = dto.EffectiveDate;
            contract.expiry_date = dto.ExpiryDate;
            contract.signed_by = dto.SignedBy;
            contract.tax_type = dto.TaxType;
            contract.attachment = dto.Attachment;
            contract.status = dto.Status;

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
    }
}
