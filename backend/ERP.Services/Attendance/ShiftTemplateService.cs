using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ERP.DTOs.Attendance;
using ERP.Entities.Models;
using ERP.Repositories.Interfaces;
using Newtonsoft.Json;

namespace ERP.Services.Attendance
{
    public class ShiftTemplateService : IShiftTemplateService
    {
        private readonly IUnitOfWork _unitOfWork;

        public ShiftTemplateService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        private static void ValidateTemplate(ShiftTemplateCreateDto dto, out TimeSpan startTime, out TimeSpan endTime)
        {
            if (!TimeSpan.TryParse(dto.StartTime, out startTime))
                throw new Exception("Giá» báº¯t Ä‘áº§u khĂ´ng há»£p lá»‡.");

            if (!TimeSpan.TryParse(dto.EndTime, out endTime))
                throw new Exception("Giá» káº¿t thĂºc khĂ´ng há»£p lá»‡.");

            if (!dto.IsCrossNight && endTime <= startTime)
            {
                throw new Exception("Giá» káº¿t thĂºc pháº£i lá»›n hÆ¡n giá» báº¯t Ä‘áº§u (trá»« trÆ°á»ng há»£p ca qua Ä‘Ăªm).");
            }
        }

        private static string ToCsv(IEnumerable<int>? values) =>
            string.Join(",", (values ?? Enumerable.Empty<int>()).Where(value => value > 0).Distinct());

        private static List<int> ParseCsvIds(string? values)
        {
            if (string.IsNullOrWhiteSpace(values))
            {
                return new List<int>();
            }

            return values
                .Split(',', StringSplitOptions.RemoveEmptyEntries)
                .Select(value => int.TryParse(value.Trim(), out var parsedValue) ? parsedValue : (int?)null)
                .Where(value => value.HasValue)
                .Select(value => value!.Value)
                .Distinct()
                .ToList();
        }

        private static List<int> ParseRepeatDays(string? values)
        {
            if (string.IsNullOrWhiteSpace(values))
            {
                return new List<int>();
            }

            return JsonConvert.DeserializeObject<List<int>>(values) ?? new List<int>();
        }

        private static ShiftTemplateDto MapToDto(ShiftTemplates template) => new ShiftTemplateDto
        {
            Id = template.Id,
            TemplateName = template.template_name,
            StartTime = template.start_time.ToString(@"hh\:mm"),
            EndTime = template.end_time.ToString(@"hh\:mm"),
            IsCrossNight = template.is_cross_night,
            IsActive = template.is_active,
            BranchIds = ParseCsvIds(template.branch_ids),
            DepartmentIds = ParseCsvIds(template.department_ids),
            PositionIds = ParseCsvIds(template.position_ids),
            RepeatDays = ParseRepeatDays(template.repeat_days),
            Note = template.note
        };

        public async Task<int> CreateTemplateAsync(ShiftTemplateCreateDto dto)
        {
            ValidateTemplate(dto, out _, out _);
            // 1. Strict Validation
            if (!TimeSpan.TryParse(dto.StartTime, out var startTime))
                throw new Exception("Giờ bắt đầu không hợp lệ.");

            if (!TimeSpan.TryParse(dto.EndTime, out var endTime))
                throw new Exception("Giờ kết thúc không hợp lệ.");

            // Logic check: if not cross night, end must be after start
            if (!dto.IsCrossNight && endTime <= startTime)
            {
                throw new Exception("Giờ kết thúc phải lớn hơn giờ bắt đầu (trừ trường hợp ca qua đêm).");
            }

            // 2. Map to Entity
            var template = new ShiftTemplates
            {
                template_name = dto.TemplateName,
                start_time = startTime,
                end_time = endTime,
                is_cross_night = dto.IsCrossNight,
                branch_ids = ToCsv(dto.BranchIds),
                department_ids = ToCsv(dto.DepartmentIds),
                position_ids = ToCsv(dto.PositionIds),
                repeat_days = JsonConvert.SerializeObject(dto.RepeatDays),
                is_active = true,
                note = dto.Note,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            // 3. Save
            await _unitOfWork.Repository<ShiftTemplates>().AddAsync(template);
            await _unitOfWork.SaveChangesAsync();

            return template.Id;
        }

        public async Task<IEnumerable<ShiftTemplateDto>> GetAllTemplatesAsync()
        {
            var templates = await _unitOfWork.Repository<ShiftTemplates>().GetAllAsync();
            return templates.Select(MapToDto);
        }

        public async Task<ShiftTemplateDto?> GetTemplateByIdAsync(int id)
        {
            var template = await _unitOfWork.Repository<ShiftTemplates>().GetByIdAsync(id);
            return template == null ? null : MapToDto(template);
        }

        public async Task<bool> UpdateTemplateAsync(int id, ShiftTemplateCreateDto dto)
        {
            ValidateTemplate(dto, out var startTime, out var endTime);

            var template = await _unitOfWork.Repository<ShiftTemplates>().GetByIdAsync(id);
            if (template == null)
            {
                return false;
            }

            template.template_name = dto.TemplateName;
            template.start_time = startTime;
            template.end_time = endTime;
            template.is_cross_night = dto.IsCrossNight;
            template.branch_ids = ToCsv(dto.BranchIds);
            template.department_ids = ToCsv(dto.DepartmentIds);
            template.position_ids = ToCsv(dto.PositionIds);
            template.repeat_days = JsonConvert.SerializeObject(dto.RepeatDays);
            template.note = dto.Note;
            template.UpdatedAt = DateTime.UtcNow;

            _unitOfWork.Repository<ShiftTemplates>().Update(template);
            return await _unitOfWork.SaveChangesAsync() > 0;
        }

        public async Task<bool> DeleteTemplateAsync(int id)
        {
            var template = await _unitOfWork.Repository<ShiftTemplates>().GetByIdAsync(id);
            if (template == null)
            {
                return false;
            }

            _unitOfWork.Repository<ShiftTemplates>().Remove(template);
            return await _unitOfWork.SaveChangesAsync() > 0;
        }
    }
}
