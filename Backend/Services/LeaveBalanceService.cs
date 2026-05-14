using Backend.Data;
using Backend.DTOs;
using Backend.Interfaces;
using Microsoft.EntityFrameworkCore;
using Backend.Models;

namespace Backend.Services
{
    public class LeaveBalanceService: ILeaveBalanceService
    {
        private readonly AppDbContext _context;

        public LeaveBalanceService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<LeaveBalanceResponseDto>> GetAllAsync()
        {
            return await _context.LeaveBalances
                .Include(lb => lb.Employee)
                .Include(lb => lb.LeaveType)
                .Select(lb => new LeaveBalanceResponseDto
                {
                    Id = lb.Id,
                    EmployeeName = $"{lb.Employee.FirstName} {lb.Employee.LastName}",
                    LeaveTypeName = lb.LeaveType.Name,
                    Year = lb.Year,
                    TotalDays = lb.TotalDays,
                    UsedDays = lb.UsedDays,
                    RemainingDays = lb.RemainingDays
                })
                .ToListAsync();
        }

        public async Task<IEnumerable<LeaveBalanceResponseDto>> GetByEmployeeAsync(int employeeId, int year)
        {
            return await _context.LeaveBalances
                .Include(lb => lb.Employee)
                .Include(lb => lb.LeaveType)
                .Where(lb => lb.EmployeeId == employeeId && lb.Year == year)
                .Select(lb => new LeaveBalanceResponseDto
                {
                    Id = lb.Id,
                    EmployeeName = $"{lb.Employee.FirstName} {lb.Employee.LastName}",
                    LeaveTypeName = lb.LeaveType.Name,
                    Year = lb.Year,
                    TotalDays = lb.TotalDays,
                    UsedDays = lb.UsedDays,
                    RemainingDays = lb.RemainingDays
                })
                .ToListAsync();
        }

        public async Task<LeaveBalanceResponseDto?> GetByIdAsync(int id)
        {
            var lb = await _context.LeaveBalances
                .Include(lb => lb.Employee)
                .Include(lb => lb.LeaveType)
                .FirstOrDefaultAsync(lb => lb.Id == id);

            if (lb == null) return null;

            return new LeaveBalanceResponseDto
            {
                Id = lb.Id,
                EmployeeName = $"{lb.Employee.FirstName} {lb.Employee.LastName}",
                LeaveTypeName = lb.LeaveType.Name,
                Year = lb.Year,
                TotalDays = lb.TotalDays,
                UsedDays = lb.UsedDays,
                RemainingDays = lb.RemainingDays
            };
        }

        public async Task<LeaveBalanceResponseDto> CreateAsync(CreateLeaveBalanceDto dto)
        {
            var leaveType = await _context.LeaveTypes.FindAsync(dto.LeaveTypeId);
            if (leaveType == null) throw new Exception("LeaveType not found");

            var balance = new LeaveBalance
            {
                EmployeeId = dto.EmployeeId,
                LeaveTypeId = dto.LeaveTypeId,
                Year = dto.Year,
                TotalDays = leaveType.TotalDays,
                UsedDays = 0,
                RemainingDays = leaveType.TotalDays
            };

            _context.LeaveBalances.Add(balance);
            await _context.SaveChangesAsync();

            await _context.Entry(balance).Reference(b => b.Employee).LoadAsync();
            await _context.Entry(balance).Reference(b => b.LeaveType).LoadAsync();

            return new LeaveBalanceResponseDto
            {
                Id = balance.Id,
                EmployeeName = $"{balance.Employee.FirstName} {balance.Employee.LastName}",
                LeaveTypeName = balance.LeaveType.Name,
                Year = balance.Year,
                TotalDays = balance.TotalDays,
                UsedDays = balance.UsedDays,
                RemainingDays = balance.RemainingDays
            };
        }

        public async Task<bool> DeductLeaveAsync(int employeeId, int leaveTypeId, int year, int days)
        {
            var balance = await _context.LeaveBalances
                .FirstOrDefaultAsync(b => b.EmployeeId == employeeId 
                    && b.LeaveTypeId == leaveTypeId 
                    && b.Year == year);


            if (balance == null) return false;
            if (balance.RemainingDays < days) return false; // not enough days

            balance.UsedDays += days;
            balance.RemainingDays -= days;

            await _context.SaveChangesAsync();
            return true;
        }


    }
}