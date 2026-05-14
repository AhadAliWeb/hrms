using Backend.Data;
using Backend.Interfaces;
using Backend.DTOs;
using Backend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Backend.Services
{
    public class OvertimeService : IOvertimeService
    {
        private readonly AppDbContext _context;
        
        private readonly IAuditLogService _auditLogService;
        private readonly ICurrentUserService _currentUserService;
        private readonly ILogger<OvertimeService> _logger;


        public OvertimeService(AppDbContext context, IAuditLogService auditLogService, ICurrentUserService currentUserService, ILogger<OvertimeService> logger)
        {
            _context = context;
            _auditLogService = auditLogService;
            _currentUserService = currentUserService;
            _logger = logger;
        }

    public async Task<OvertimeResponseDto> CreateAsync(CreateOvertimeDto dto)
    {
        var overtime = new Overtime
        {
            EmployeeId = dto.EmployeeId,
            Date = dto.Date,
            Hours = dto.Hours,
            HourlyRate = dto.HourlyRate,
            TotalAmount = dto.Hours * dto.HourlyRate,
            Status = "Pending",
            CreatedAt = DateTime.UtcNow
        };

        _context.Overtimes.Add(overtime);
        await _context.SaveChangesAsync();

        await _auditLogService.LogAsync(new CreateAuditLogDto
        {
            UserId = _currentUserService.GetCurrentUserId(),
            Action = "Create",
            EntityName = "Overtime",
            EntityId = overtime.Id,
            OldValues = null,
            NewValues = System.Text.Json.JsonSerializer.Serialize(overtime)
        });
    
            await _context.Entry(overtime).Reference(o => o.Employee).LoadAsync();

        await _context.Entry(overtime).Reference(o => o.Employee).LoadAsync();

        return new OvertimeResponseDto
        {
            Id = overtime.Id,
            EmployeeName = $"{overtime.Employee.FirstName} {overtime.Employee.LastName}",
            Date = overtime.Date,
            Hours = overtime.Hours,
            HourlyRate = overtime.HourlyRate,
            TotalAmount = overtime.TotalAmount,
            Status = overtime.Status
        };
    }

        public async Task<bool> DeleteAsync(int id)
        {
            var overtime = await _context.Overtimes.FindAsync(id);
            if (overtime == null) return false;

            await _auditLogService.LogAsync(new CreateAuditLogDto
            {
                UserId = _currentUserService.GetCurrentUserId(),
                Action = "Delete",
                EntityName = "Overtime",
                EntityId = overtime.Id,
                OldValues = System.Text.Json.JsonSerializer.Serialize(overtime),
                NewValues = null
            });

            _context.Overtimes.Remove(overtime);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<OvertimeResponseDto>> GetAllAsync()
        {
            return await _context.Overtimes.Include(o => o.Employee).Select(
                o => new OvertimeResponseDto
                {
                    Id = o.Id,
                    EmployeeName = $"{o.Employee.FirstName} {o.Employee.LastName}",
                    Date = o.Date,
                    Hours = o.Hours,
                    HourlyRate = o.HourlyRate,
                    TotalAmount = o.TotalAmount,
                    Status = o.Status
                }
            ).ToListAsync();
        }

        public async Task<OvertimeResponseDto?> GetByIdAsync(int id)
        {
            var overtime = await _context.Overtimes.Include(o => o.Employee).FirstOrDefaultAsync(o => o.Id == id);

            if (overtime == null) return null;

            return new OvertimeResponseDto
            {
                Id = overtime.Id,
                EmployeeName = $"{overtime.Employee.FirstName} {overtime.Employee.LastName}",
                Date = overtime.Date,
                Hours = overtime.Hours,
                HourlyRate = overtime.HourlyRate,
                TotalAmount = overtime.TotalAmount,
                Status = overtime.Status
            };
        }

        public async Task<IEnumerable<OvertimeResponseDto>> GetByEmployeeIdAsync(int employeeId)
        {
            _logger.LogInformation("EmployeeId {Id}", employeeId);

            return await _context.Overtimes
                .Include(o => o.Employee)
                .Where(o => o.EmployeeId == employeeId)
                .Select(o => new OvertimeResponseDto
                {
                    Id = o.Id,
                    EmployeeName = $"{o.Employee.FirstName} {o.Employee.LastName}",
                    Date = o.Date,
                    Hours = o.Hours,
                    HourlyRate = o.HourlyRate,
                    TotalAmount = o.TotalAmount,
                    Status = o.Status
                })
                .ToListAsync();
        }

        public async Task<OvertimeResponseDto?> UpdateAsync(int id, CreateOvertimeDto dto)
        {
            var overtime = await _context.Overtimes.FindAsync(id);
            if (overtime == null) return null; 

            if (overtime.Status != "Pending") return null;

            var oldValues = System.Text.Json.JsonSerializer.Serialize(overtime);

            overtime.Date = dto.Date;
            overtime.Hours = dto.Hours;
            overtime.HourlyRate = dto.HourlyRate;
            overtime.TotalAmount = dto.Hours * dto.HourlyRate;
            await _context.SaveChangesAsync();

            await _auditLogService.LogAsync(new CreateAuditLogDto
            {
                UserId = _currentUserService.GetCurrentUserId(),
                Action = "Update",
                EntityName = "Overtime",
                EntityId = overtime.Id,
                OldValues = oldValues,
                NewValues = System.Text.Json.JsonSerializer.Serialize(overtime)
            });

            await _context.Entry(overtime).Reference(o => o.Employee).LoadAsync();

            return new OvertimeResponseDto
            {
                Id = overtime.Id,
                EmployeeName = $"{overtime.Employee.FirstName} {overtime.Employee.LastName}",
                Date = overtime.Date,
                Hours = overtime.Hours,
                HourlyRate = overtime.HourlyRate,
                TotalAmount = overtime.TotalAmount,
                Status = overtime.Status
            };
        }

        public async Task<bool> ApproveAsync(int id)
        {
            var overtime = await _context.Overtimes.FindAsync(id);
            if (overtime == null) return false;

            if (overtime.Status != "Pending") return false;

            overtime.Status = "Approved";
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> RejectAsync(int id)
        {
            var overtime = await _context.Overtimes.FindAsync(id);
            if (overtime == null) return false;

            overtime.Status = "Rejected";
            await _context.SaveChangesAsync();
            return true;
        }
    }
}