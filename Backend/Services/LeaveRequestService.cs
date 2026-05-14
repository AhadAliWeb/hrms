using Backend.Interfaces;
using Backend.Data;
using Backend.DTOs;
using Backend.Models;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using Microsoft.Extensions.Logging;




namespace Backend.Services
{
    public class LeaveRequestService : ILeaveRequestService
    {
        private readonly AppDbContext _context;
        private readonly ILeaveBalanceService _leaveBalanceService;


        private readonly IAuditLogService _auditLogService;
        private readonly ICurrentUserService _currentUserService;

        public LeaveRequestService(AppDbContext context, ILeaveBalanceService leaveBalanceService, IAuditLogService auditLogService, ICurrentUserService currentUserService)
        {
            _context = context;
            _leaveBalanceService = leaveBalanceService;
            _auditLogService = auditLogService;
            _currentUserService = currentUserService;
        }

        public async Task<IEnumerable<LeaveRequestResponseDto>> GetAllAsync()
        {
            return await _context.LeaveRequests.Include(lr => lr.Employee)
                .Include(lr => lr.LeaveType)
                .Select(lr => new LeaveRequestResponseDto
                {
                    Id = lr.Id,
                    EmployeeName = $"{lr.Employee.FirstName} {lr.Employee.LastName}",
                    LeaveTypeName = lr.LeaveType.Name,
                    StartDate = lr.StartDate,
                    EndDate = lr.EndDate,
                    Status = lr.Status,
                    Reason = lr.Reason,
                })
                .ToListAsync();
        }

        public async Task<LeaveRequestResponseDto?> GetByIdAsync(int id)
        {
            var leaveRequest = await _context.LeaveRequests.Include(lr => lr.Employee)
                .Include(lr => lr.LeaveType)
                .FirstOrDefaultAsync(lr => lr.Id == id);

            if (leaveRequest == null) return null;

            return new LeaveRequestResponseDto
            {
                Id = leaveRequest.Id,
                EmployeeName = $"{leaveRequest.Employee.FirstName} {leaveRequest.Employee.LastName}",
                LeaveTypeName = leaveRequest.LeaveType.Name,
                StartDate = leaveRequest.StartDate,
                EndDate = leaveRequest.EndDate,
                Status = leaveRequest.Status,
                Reason = leaveRequest.Reason,
            };
        }


        public async Task<IEnumerable<LeaveRequestResponseDto>> GetByEmployeeIdAsync(int id)
        {
            var user = await _context.Users.FindAsync(id);

            

            return await _context.LeaveRequests.Include(lr => lr.Employee)
                .Include(lr => lr.LeaveType)
                .Where(lr => lr.EmployeeId == user.EmployeeId)
                .Select(lr => new LeaveRequestResponseDto
                {
                    Id = lr.Id,
                    EmployeeName = $"{lr.Employee.FirstName} {lr.Employee.LastName}",
                    LeaveTypeName = lr.LeaveType.Name,
                    StartDate = lr.StartDate,
                    EndDate = lr.EndDate,
                    Status = lr.Status,
                    Reason = lr.Reason,
                }).ToListAsync();

        }

        public async Task<LeaveRequestResponseDto> CreateAsync(CreateLeaveRequestDto dto)
        {
            var leaveRequest = new LeaveRequest
            {
                EmployeeId = dto.EmployeeId,
                LeaveTypeId = dto.LeaveTypeId,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                Reason = dto.Reason,
                Status = "Pending"
            };

            _context.LeaveRequests.Add(leaveRequest);
            await _context.SaveChangesAsync();

            await _context.Entry(leaveRequest).Reference(lr => lr.Employee).LoadAsync();
            await _context.Entry(leaveRequest).Reference(lr => lr.LeaveType).LoadAsync();

            return new LeaveRequestResponseDto
            {
                Id = leaveRequest.Id,
                EmployeeName = $"{leaveRequest.Employee.FirstName} {leaveRequest.Employee.LastName}",
                LeaveTypeName = leaveRequest.LeaveType.Name,
                StartDate = leaveRequest.StartDate,
                EndDate = leaveRequest.EndDate,
                Status = leaveRequest.Status,
                Reason = leaveRequest.Reason,
            };
        }

        public async Task<LeaveRequestResponseDto?> UpdateAsync(int id, CreateLeaveRequestDto dto)
        {
            var leaveRequest = await _context.LeaveRequests.FindAsync(id);
            if (leaveRequest == null) return null;

            var oldValues = JsonSerializer.Serialize(leaveRequest);

            leaveRequest.EmployeeId = dto.EmployeeId;
            leaveRequest.LeaveTypeId = dto.LeaveTypeId;
            leaveRequest.StartDate = dto.StartDate;
            leaveRequest.EndDate = dto.EndDate;
            leaveRequest.Reason = dto.Reason;


            await _context.SaveChangesAsync();

            await _context.Entry(leaveRequest).Reference(lr => lr.Employee).LoadAsync();
            await _context.Entry(leaveRequest).Reference(lr => lr.LeaveType).LoadAsync();

            await _auditLogService.LogAsync(new CreateAuditLogDto
            {
                UserId = _currentUserService.GetCurrentUserId(),
                Action = "Update",
                EntityName = "LeaveRequest",
                EntityId = leaveRequest.Id,
                OldValues = oldValues,
                NewValues = JsonSerializer.Serialize(leaveRequest)
            });

            return new LeaveRequestResponseDto
            {
                Id = leaveRequest.Id,
                EmployeeName = $"{leaveRequest.Employee.FirstName} {leaveRequest.Employee.LastName}",
                LeaveTypeName = leaveRequest.LeaveType.Name,
                StartDate = leaveRequest.StartDate,
                EndDate = leaveRequest.EndDate,
                Status = leaveRequest.Status,
                Reason = leaveRequest.Reason,
            };
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var leaveRequest = await _context.LeaveRequests.FindAsync(id);
            if (leaveRequest == null) return false;

                await _auditLogService.LogAsync(new CreateAuditLogDto
                {
                    UserId = _currentUserService.GetCurrentUserId(),
                    Action = "Delete",
                    EntityName = "LeaveRequest",
                    EntityId = leaveRequest.Id,
                    OldValues = JsonSerializer.Serialize(leaveRequest),
                    NewValues = null
                });

            _context.LeaveRequests.Remove(leaveRequest);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> ApproveAsync(int id)
        {

            var leaveRequest = await _context.LeaveRequests.FindAsync(id);


            if (leaveRequest == null) return false;

            if (leaveRequest.Status != "Pending") return false;

            var leaveDays = (leaveRequest.EndDate.Date - leaveRequest.StartDate.Date).Days + 1;




            var result = await _leaveBalanceService.DeductLeaveAsync(leaveRequest.EmployeeId, leaveRequest.LeaveTypeId, leaveRequest.StartDate.Year, leaveDays);


            if (!result) return false; // Not enough leave balance



            leaveRequest.Status = "Approved";

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> RejectAsync(int id)
        {
            var leaveRequest = await _context.LeaveRequests.FindAsync(id);
            if (leaveRequest == null) return false;

            leaveRequest.Status = "Rejected";
            await _context.SaveChangesAsync();

            await _auditLogService.LogAsync(new CreateAuditLogDto
            {
                UserId = _currentUserService.GetCurrentUserId(),
                Action = "Update",
                EntityName = "LeaveRequest",
                EntityId = leaveRequest.Id,
                OldValues = JsonSerializer.Serialize(leaveRequest),
                NewValues = JsonSerializer.Serialize(leaveRequest)
            });

            return true;
        }
    }
}