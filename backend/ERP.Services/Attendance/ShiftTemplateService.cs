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

        public async Task<int> CreateTemplateAsync(ShiftTemplateCreateDto dto)
        {
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
                branch_ids = string.Join(",", dto.BranchIds),
                department_ids = string.Join(",", dto.DepartmentIds),
                position_ids = string.Join(",", dto.PositionIds),
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
            return templates.Select(t => new ShiftTemplateDto
            {
                Id = t.Id,
                TemplateName = t.template_name,
                StartTime = t.start_time.ToString(@"hh\:mm"),
                EndTime = t.end_time.ToString(@"hh\:mm"),
                IsCrossNight = t.is_cross_night,
                BranchIds = string.IsNullOrEmpty(t.branch_ids) ? new List<int>() : t.branch_ids.Split(',').Select(int.Parse).ToList(),
                DepartmentIds = string.IsNullOrEmpty(t.department_ids) ? new List<int>() : t.department_ids.Split(',').Select(int.Parse).ToList(),
                PositionIds = string.IsNullOrEmpty(t.position_ids) ? new List<int>() : t.position_ids.Split(',').Select(int.Parse).ToList(),
                RepeatDays = string.IsNullOrEmpty(t.repeat_days) ? new List<int>() : JsonConvert.DeserializeObject<List<int>>(t.repeat_days) ?? new List<int>(),
                Note = t.note
            });
        }
    }
}
