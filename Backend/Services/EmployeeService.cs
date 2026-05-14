


using Backend.DTOs;
using Backend.Interfaces;
using Backend.Data;
using Backend.Models;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace Backend.Services
{
    // Services/EmployeeService.cs
    public class EmployeeService : IEmployeeService
    {
        private readonly AppDbContext _context;
        private readonly IAuditLogService _auditLogService;
        
        private readonly ICurrentUserService _currentUserService;


        public EmployeeService(AppDbContext context, IAuditLogService auditLogService, ICurrentUserService currentUserService)
        {
            _context = context;
            _auditLogService = auditLogService;
            _currentUserService = currentUserService;
        }

        public async Task<IEnumerable<EmployeeResponseDto>> GetAllAsync()
        {
            return await _context.Employees.Include(e => e.Department).Include(e => e.Designation).Select(e => new EmployeeResponseDto {
                Id = e.Id,
                FirstName = e.FirstName,
                LastName = e.LastName,
                Email = e.Email,
                Phone = e.Phone,
                DateOfBirth = e.DateOfBirth,
                HireDate = e.HireDate,
                Salary = e.Salary,
                IsActive = e.IsActive,
                DepartmentName = e.Department.Name,
                DesignationTitle = e.Designation.Title
            }).ToListAsync();
        }

        public async Task<EmployeeResponseDto?> GetByIdAsync(int id)
        {
            var e = await _context.Employees.Include(e => e.Department).Include(e => e.Designation).FirstOrDefaultAsync(e => e.Id == id);

            if(e == null) return null;

            return new EmployeeResponseDto
        {
            Id = e.Id, FirstName = e.FirstName, LastName = e.LastName,
            Email = e.Email, Phone = e.Phone, DateOfBirth = e.DateOfBirth,
            HireDate = e.HireDate, Salary = e.Salary,
            IsActive = e.IsActive, DepartmentName = e.Department.Name,
            DesignationTitle = e.Designation.Title
        };
        }

        public async Task<EmployeeResponseDto> CreateAsync(CreateEmployeeDto dto)
        {
            var e = new Employee
            {
            FirstName = dto.FirstName, LastName = dto.LastName,
            Email = dto.Email, Phone = dto.Phone,
            DateOfBirth = dto.DateOfBirth, HireDate = dto.HireDate,
            Salary = dto.Salary, DepartmentId = dto.DepartmentId,
            DesignationId = dto.DesignationId,
            IsActive = true, CreatedAt = DateTime.UtcNow
            };

            _context.Employees.Add(e);

            await _context.SaveChangesAsync();

            await _context.Entry(e).Reference(e => e.Department).LoadAsync();
            await _context.Entry(e).Reference(e => e.Designation).LoadAsync();

            var auditData = new
            {
                e.Id,
                e.FirstName,
                e.LastName,
                e.Email,
                e.Phone,
                e.DateOfBirth,
                e.HireDate,
                e.Salary,
                e.DepartmentId,
                e.DesignationId,
                DepartmentName = e.Department.Name,
                DesignationTitle = e.Designation.Title,
                e.IsActive,
                e.CreatedAt
            };

            await _auditLogService.LogAsync(new CreateAuditLogDto
            {
                UserId = _currentUserService.GetCurrentUserId(),
                Action = "Create",
                EntityName = "Employee",
                EntityId = e.Id,
                OldValues = null,
                NewValues = JsonSerializer.Serialize(auditData)
            });


            return new EmployeeResponseDto
            {
                Id = e.Id, FirstName = e.FirstName, LastName = e.LastName,
                Email = e.Email, Phone = e.Phone, DateOfBirth = e.DateOfBirth, 
                HireDate = e.HireDate, Salary = e.Salary,
                IsActive = e.IsActive, DepartmentName = e.Department.Name,
                DesignationTitle = e.Designation.Title
            };
        }

        public async Task<EmployeeResponseDto?> UpdateAsync(int id, UpdateEmployeeDto dto)
        {
            var employee = await _context.Employees
            .Include(e => e.Department)
            .Include(e => e.Designation)
            .FirstOrDefaultAsync(e => e.Id == id);

            if (employee == null) return null;

            var oldValues = new
            {
                employee.Id,
                employee.FirstName,
                employee.LastName,
                employee.Email,
                employee.Phone,
                employee.Salary,
                employee.DateOfBirth,
                employee.DepartmentId,
                employee.DesignationId,
                DepartmentName = employee.Department.Name,
                DesignationTitle = employee.Designation.Title,
                employee.IsActive,
                employee.CreatedAt
            };

            employee.FirstName = dto.FirstName; employee.LastName = dto.LastName;
            employee.Email = dto.Email; employee.Phone = dto.Phone;
            employee.DateOfBirth = dto.DateOfBirth;
            employee.Salary = dto.Salary; employee.DepartmentId = dto.DepartmentId;
            employee.DesignationId = dto.DesignationId; employee.UpdatedAt = DateTime.UtcNow;


            await _context.SaveChangesAsync();

            await _context.Entry(employee).Reference(e => e.Department).LoadAsync();
            await _context.Entry(employee).Reference(e => e.Designation).LoadAsync();

            var auditData = new
            {
                employee.Id,
                employee.FirstName,
                employee.LastName,
                employee.Email,
                employee.Phone,
                employee.Salary,
                employee.DateOfBirth,
                employee.DepartmentId,
                employee.DesignationId,
                DepartmentName = employee.Department.Name,
                DesignationTitle = employee.Designation.Title,
                employee.IsActive,
                employee.CreatedAt
            };

            await _auditLogService.LogAsync(new CreateAuditLogDto
            {
                UserId = _currentUserService.GetCurrentUserId(),
                Action = "Update",
                EntityName = "Employee",
                EntityId = employee.Id,
                OldValues = JsonSerializer.Serialize(oldValues),
                NewValues = JsonSerializer.Serialize(auditData)
            });

            return new EmployeeResponseDto
            {
                Id = employee.Id, FirstName = employee.FirstName, LastName = employee.LastName,
                Email = employee.Email, Phone = employee.Phone, DateOfBirth = employee.DateOfBirth,
                HireDate = employee.HireDate, Salary = employee.Salary,
                IsActive = employee.IsActive, DepartmentName = employee.Department.Name,
                DesignationTitle = employee.Designation.Title
            };

        }


        public async Task<EmployeeResponseDto?> GetMyProfileAsync(int userId)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null) return null;

            var employeeId = user.EmployeeId;

            var employee = await _context.Employees
                .Include(e => e.Department)    // ✅ Eagerly load Department
                .Include(e => e.Designation)   // ✅ Eagerly load Designation
                .FirstOrDefaultAsync(e => e.Id == employeeId);

            if (employee == null) return null;

            return new EmployeeResponseDto
            {
                Id = employee.Id,
                FirstName = employee.FirstName,
                LastName = employee.LastName,
                Email = employee.Email,
                Phone = employee.Phone,
                DateOfBirth = employee.DateOfBirth,
                HireDate = employee.HireDate,
                Salary = employee.Salary,
                IsActive = employee.IsActive,
                DepartmentName = employee.Department.Name,     // ✅ null-safe
                DesignationTitle = employee.Designation.Title  // ✅ null-safe
            };
        }
        public async Task<bool> DeleteAsync(int id)
        {
            var employee = await _context.Employees.FindAsync(id);

            if (employee == null) return false;

            employee.IsActive = false;

            // await _auditLogService.LogAsync(new CreateAuditLogDto
            // {
            //     UserId = _currentUserService.GetCurrentUserId(),
            //     Action = "Delete",
            //     EntityName = "Employee",
            //     EntityId = employee.Id,
            //     OldValues = JsonSerializer.Serialize(employee),
            //     NewValues = null
            // });

            await _context.SaveChangesAsync();


            return true;


        }
    }
}