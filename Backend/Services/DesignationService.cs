using Backend.DTOs;
using Backend.Interfaces;
using Backend.Data;
using Backend.Models;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace Backend.Services
{
    // Services/DesignationService.cs
    public class DesignationService : IDesignationService
    {
        private readonly AppDbContext _context;
        private readonly IAuditLogService _auditLogService;
        private readonly ICurrentUserService _currentUserService;

        public DesignationService(AppDbContext context, IAuditLogService auditLogService, ICurrentUserService currentUserService)
        {
            _context = context;
            _auditLogService = auditLogService;
            _currentUserService = currentUserService;
        }

        public async Task<IEnumerable<DesignationResponseDto>> GetAllAsync()
        {
            return await _context.Designations.Include(d => d.Department).Select(d => new DesignationResponseDto {Id = d.Id, Title = d.Title, DepartmentName = d.Department.Name, DepartmentId = d.Department.Id}).ToListAsync();

        }

        public async Task<DesignationResponseDto?> GetByIdAsync(int id)
        {
            var dept = await _context.Designations.Include(d => d.Department).FirstOrDefaultAsync(d => d.Id == id);

            if (dept == null) return null;

            return new DesignationResponseDto { Id = dept.Id, Title = dept.Title, DepartmentName = dept.Department.Name, DepartmentId = dept.Department.Id,
 };

        }

        public async Task<DesignationResponseDto> CreateAsync(CreateDesignationDto dto)
        {

            var des = new Designation { Title = dto.Title, DepartmentId = dto.DepartmentId};

            _context.Designations.Add(des);

            await _context.SaveChangesAsync();

            await _context.Entry(des).Reference(d => d.Department).LoadAsync();

            var id = des.Id;
            var title = des.Title;
            var departmentId = des.DepartmentId;
            var departmentName = des.Department.Name;


            await _auditLogService.LogAsync(new CreateAuditLogDto
            {
                UserId = _currentUserService.GetCurrentUserId(),
                Action = "Create",
                EntityName = "Designation",
                EntityId = des.Id,
                OldValues = null,
                NewValues = JsonSerializer.Serialize(new
                        {
                            Id = id,
                            Title = title,
                            DepartmentId = departmentId,
                            DepartmentName = departmentName
                        })
            });

            return new DesignationResponseDto { Title = des.Title, Id = des.Id, DepartmentName = des.Department.Name, DepartmentId = des.Department.Id};
            
        }

        public async Task<DesignationResponseDto?> UpdateAsync(int id, CreateDesignationDto dto)
        {
            var des = await _context.Designations
                            .Include(d => d.Department)
                            .FirstOrDefaultAsync(d => d.Id == id);

            if(des == null) return null;

            var oldValues = JsonSerializer.Serialize(new
            {
                des.Id,
                des.Title,
                des.DepartmentId,
                DepartmentName = des.Department.Name
            });

            des.Title = dto.Title;
            des.DepartmentId = dto.DepartmentId;

            await _context.SaveChangesAsync();

            await _context.Entry(des).Reference(d => d.Department).LoadAsync();

            var departmentName = des.Department.Name;
    
            await _auditLogService.LogAsync(new CreateAuditLogDto
            {
                UserId = _currentUserService.GetCurrentUserId(),
                Action = "Update",
                EntityName = "Designation",
                EntityId = des.Id,
                OldValues = oldValues,
                NewValues = JsonSerializer.Serialize(new
                            {
                                des.Id,
                                des.Title,
                                des.DepartmentId,
                                DepartmentName = departmentName,
                            })
            });

            return new DesignationResponseDto { DepartmentName = des.Department.Name, Id = des.Id, Title = des.Title, DepartmentId = des.Department.Id};

        }

        public async Task<EmployeeResponseDto?> ChangeDesignationAsync(int employeeId, int newDesignationId)
        {
            var employee = await _context.Employees
                .Include(e => e.Department)
                .Include(e => e.Designation)
                .FirstOrDefaultAsync(e => e.Id == employeeId);

            if (employee == null) return null;

            employee.DesignationId = newDesignationId;
            employee.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            await _context.Entry(employee).Reference(e => e.Designation).LoadAsync();

            return new EmployeeResponseDto
            {
                Id = employee.Id,
                FirstName = employee.FirstName,
                LastName = employee.LastName,
                Email = employee.Email,
                Phone = employee.Phone,
                Salary = employee.Salary,
                IsActive = employee.IsActive,
                DepartmentName = employee.Department.Name,
                DesignationTitle = employee.Designation.Title
            };
        }
        

        public async Task<bool> DeleteAsync(int id)
        {
            var des = await _context.Designations
                .Include(d => d.Department)   // ← add this
                .FirstOrDefaultAsync(d => d.Id == id);

            if (des == null) return false;

            var departmentName = des.Department.Name; // safe now

            _context.Designations.Remove(des);

            await _auditLogService.LogAsync(new CreateAuditLogDto
            {
                UserId = _currentUserService.GetCurrentUserId(),
                Action = "Delete",
                EntityName = "Designation",
                EntityId = des.Id,
                OldValues = JsonSerializer.Serialize(new
                {
                    des.Id,
                    des.Title,
                    des.DepartmentId,
                    DepartmentName = departmentName
                }),
                NewValues = null
            });

            await _context.SaveChangesAsync();

            return true;
        }
    }
}