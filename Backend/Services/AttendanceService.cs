
using Backend.DTOs;
using Backend.Interfaces;
using Backend.Data;
using Microsoft.EntityFrameworkCore;
using Backend.Models;
using System.Text.Json;

namespace Backend.Services
{
    public class AttendanceService : IAttendanceService
    {
        private readonly AppDbContext _context;
        private readonly IAuditLogService _auditLogService;
        private readonly ICurrentUserService _currentUserService;

        public AttendanceService(AppDbContext context, IAuditLogService auditLogService, ICurrentUserService currentUserService)
        {
            _context = context;
            _auditLogService = auditLogService;
            _currentUserService = currentUserService;
        }

        public async Task<IEnumerable<AttendanceResponseDto>> GetAllAsync()
        {
            return await _context.Attendances.Include(a => a.Employee).Select(
                a => new AttendanceResponseDto
                {
                    Id = a.Id,
                    EmployeeName = $"{a.Employee.FirstName} {a.Employee.LastName}",
                    Date = a.Date,
                    CheckIn = a.CheckIn,
                    CheckOut = a.CheckOut,
                    Status = a.Status,
                    CreatedAt = a.CreatedAt
                }
            ).ToListAsync();
        }

        public async Task<IEnumerable<AttendanceResponseDto>> GetByEmployeeIdAsync(int employeeId)
        {
            return await _context.Attendances
                .Include(a => a.Employee)
                .Where(a => a.EmployeeId == employeeId)
                .Select(a => new AttendanceResponseDto {
                    Id = a.Id,
                    EmployeeName = $"{a.Employee.FirstName} {a.Employee.LastName}",
                    Date = a.Date,
                    CheckIn = a.CheckIn,
                    CheckOut = a.CheckOut,
                    Status = a.Status,
                    CreatedAt = a.CreatedAt
                })
                .ToListAsync();
        }



        public async Task<AttendanceResponseDto?> GetByIdAsync(int id)
        {
            var att = await _context.Attendances.Include(a => a.Employee).FirstOrDefaultAsync(a => a.Id == id);

            if (att == null) return null;

            return new AttendanceResponseDto
            {
                Id = att.Id,
                EmployeeName = $"{att.Employee.FirstName} {att.Employee.LastName}",
                Date = att.Date,
                CheckIn = att.CheckIn,
                CheckOut = att.CheckOut,
                Status = att.Status,
                CreatedAt = att.CreatedAt
            };

        }

        public async Task<AttendanceResponseDto> CreateAsync(CreateAttendanceDto dto)
        {
            var att = new Attendance
            {
                EmployeeId = dto.EmployeeId,
                Date = dto.Date,
                CheckIn = dto.CheckIn,
                CheckOut = dto.CheckOut,
                Status = dto.Status,
            };

            _context.Attendances.Add(att);

            await _context.SaveChangesAsync();

            await _context.Entry(att).Reference(a => a.Employee).LoadAsync();

            await _auditLogService.LogAsync(new CreateAuditLogDto
            {
                UserId = _currentUserService.GetCurrentUserId(),
                Action = "Create",
                EntityName = "Attendance",
                EntityId = att.Id,
                OldValues = null,
                NewValues = JsonSerializer.Serialize(att)
            });

            return new AttendanceResponseDto
            {
                Id = att.Id,
                EmployeeName = $"{att.Employee.FirstName} {att.Employee.LastName}",
                Date = att.Date,
                CheckIn = att.CheckIn,
                CheckOut = att.CheckOut,
                Status = att.Status,
                CreatedAt = att.CreatedAt
            };
        }

        public async Task<AttendanceResponseDto?> UpdateAsync(int id, CreateAttendanceDto dto)
        {
            var att = await _context.Attendances.Include(a => a.Employee).FirstOrDefaultAsync(a => a.Id == id);


            if(att == null) return null;

            var oldValues = JsonSerializer.Serialize(att);

            att.EmployeeId = dto.EmployeeId;
            att.Date = dto.Date;
            att.CheckIn = dto.CheckIn;
            att.CheckOut = dto.CheckOut;
            att.Status = dto.Status;


            await _context.SaveChangesAsync();

            await _auditLogService.LogAsync(new CreateAuditLogDto
            {
                UserId = _currentUserService.GetCurrentUserId(),
                Action = "Update",
                EntityName = "Attendance",
                EntityId = att.Id,
                OldValues = oldValues,
                NewValues = JsonSerializer.Serialize(att)
            });

            return new AttendanceResponseDto
            {
                Id = att.Id,
                EmployeeName = $"{att.Employee.FirstName} {att.Employee.LastName}",
                Date = att.Date,
                CheckIn = att.CheckIn,
                CheckOut = att.CheckOut,
                Status = att.Status,
                CreatedAt = att.CreatedAt
            };

        }

        public async Task<bool> DeleteAsync(int id)
        {
            var att = await _context.Attendances.FindAsync(id);

            if(att == null) return false;

            _context.Attendances.Remove(att);

            await _context.SaveChangesAsync();

            await _auditLogService.LogAsync(new CreateAuditLogDto
            {
                UserId = _currentUserService.GetCurrentUserId(),
                Action = "Delete",
                EntityName = "Attendance",
                EntityId = att.Id,
                OldValues = JsonSerializer.Serialize(att),
                NewValues = null
            });

            return true;
        }
    }
}