
using Backend.Data;
using Backend.DTOs;
using Backend.Interfaces;
using Microsoft.EntityFrameworkCore;
using Backend.Models;
using System.Text.Json;

namespace Backend.Services
{
    public class DepartmentService : IDepartmentService
    {
        private readonly AppDbContext _context;
        private readonly IAuditLogService _auditLogService;
        private readonly ICurrentUserService _currentUserService;

        public DepartmentService(AppDbContext context, IAuditLogService auditLogService, ICurrentUserService currentUserService)
        {
            _context = context;
            _auditLogService = auditLogService;
            _currentUserService = currentUserService;
        }


        public async Task<IEnumerable<DepartmentResponseDto>> GetAllAsync()
        {
            return await _context.Departments
                .Select(d => new DepartmentResponseDto { Id = d.Id, Name = d.Name })
                .ToListAsync();
        }

        public async Task<DepartmentResponseDto?> GetByIdAsync(int id)
        {
            var dept = await _context.Departments.FindAsync(id);

            if (dept == null) return null;

            return new DepartmentResponseDto { Id = dept.Id, Name = dept.Name };
        }


        public async Task<DepartmentResponseDto> CreateAsync(CreateDepartmentDto dto)
        {
            var d = new Department { Name = dto.Name};
            
            _context.Departments.Add(d);

            await _context.SaveChangesAsync();

            await _auditLogService.LogAsync(new CreateAuditLogDto
            {
                UserId = _currentUserService.GetCurrentUserId(),
                Action = "Create",
                EntityName = "Department",
                EntityId = d.Id,
                OldValues = null,
                NewValues = JsonSerializer.Serialize(d)
            });

            return new DepartmentResponseDto { Id = d.Id, Name = d.Name };


        }


        public async Task<DepartmentResponseDto?> UpdateAsync(int id, CreateDepartmentDto dto)
        {
            var dept = await _context.Departments.FindAsync(id);

            var oldValues = JsonSerializer.Serialize(dept);

            if (dept == null) return null;

            dept.Name = dto.Name;

            await _context.SaveChangesAsync();

            await _auditLogService.LogAsync(new CreateAuditLogDto
            {
                UserId = _currentUserService.GetCurrentUserId(),
                Action = "Update",
                EntityName = "Department",
                EntityId = dept.Id,
                OldValues = oldValues,
                NewValues = JsonSerializer.Serialize(dept)
            });
            return new DepartmentResponseDto { Id = dept.Id, Name = dept.Name};

        }


        public async Task<bool> DeleteAsync(int id)
        {
            var dept = await _context.Departments.FindAsync(id);

            if(dept == null) return false;

            var oldValues = JsonSerializer.Serialize(dept);
            await _auditLogService.LogAsync(new CreateAuditLogDto
            {
                UserId = _currentUserService.GetCurrentUserId(),
                Action = "Delete",
                EntityName = "Department",
                EntityId = dept.Id,
                OldValues = oldValues,
                NewValues = null
            });
            _context.Departments.Remove(dept);

            await _context.SaveChangesAsync();

            return true;

        }




    }

}