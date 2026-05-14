using Backend.Data;
using Backend.DTOs;
using Microsoft.EntityFrameworkCore;
using Backend.Models;

using Backend.Interfaces;
using System.Text.Json;

namespace Backend.Services
{
    public class PayrollService : IPayrollService
    {
        private readonly AppDbContext _context;

        private readonly IAuditLogService _auditLogService;
        private readonly ICurrentUserService _currentUserService;

        public PayrollService(AppDbContext context, IAuditLogService auditLogService, ICurrentUserService currentUserService    )
        {
            _context = context;
            _auditLogService = auditLogService;
            _currentUserService = currentUserService;   
        }

        public async Task<IEnumerable<PayrollResponseDto>> GetAllAsync()
        {
            return await _context.Payrolls.Include(p => p.Employee)
                .Select(p => new PayrollResponseDto
                {
                    Id = p.Id,
                    EmployeeId = p.EmployeeId,
                    EmployeeName = $"{p.Employee.FirstName} {p.Employee.LastName}",
                    Month = p.Month,
                    Year = p.Year,
                    BasicSalary = p.BasicSalary,
                    Allowances = p.Allowances,
                    Deductions = p.Deductions,
                    NetSalary = p.NetSalary,
                    Status = p.Status
                })
                .ToListAsync();
        }


        public async Task<PayrollResponseDto?> GetByIdAsync(int id)
        {
            var payroll = await _context.Payrolls.Include(p => p.Employee)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (payroll == null) return null;

            return new PayrollResponseDto
            {
                Id = payroll.Id,
                EmployeeName = $"{payroll.Employee.FirstName} {payroll.Employee.LastName}",
                Month = payroll.Month,
                Year = payroll.Year,
                BasicSalary = payroll.BasicSalary,
                Allowances = payroll.Allowances,
                Deductions = payroll.Deductions,
                NetSalary = payroll.NetSalary,
                Status = payroll.Status
            };
        }

        
        public async Task<PayrollResponseDto> CreateAsync(CreatePayrollDto dto)
        {

            var payroll = new Payroll
            {
                EmployeeId = dto.EmployeeId,
                Month = dto.Month,
                Year = dto.Year,
                BasicSalary = dto.BasicSalary,
                Allowances = dto.Allowances,
                Deductions = dto.Deductions,
                NetSalary = dto.BasicSalary + dto.Allowances - dto.Deductions,
                Status = "Pending"
            };

            _context.Payrolls.Add(payroll);
            await _context.SaveChangesAsync();

            await _auditLogService.LogAsync(new CreateAuditLogDto
            {
                UserId = _currentUserService.GetCurrentUserId(),
                Action = "Create",
                EntityName = "Payroll",
                EntityId = payroll.Id,
                OldValues = null,
                NewValues = JsonSerializer.Serialize(payroll)
            });

            return new PayrollResponseDto
            {
                Id = payroll.Id,
                EmployeeId = payroll.EmployeeId,
                EmployeeName = "", // Will be filled in GetById or GetAll
                Month = payroll.Month,
                Year = payroll.Year,
                BasicSalary = payroll.BasicSalary,
                Allowances = payroll.Allowances,
                Deductions = payroll.Deductions,
                NetSalary = payroll.NetSalary,
                Status = payroll.Status
            };
        }


        public async Task<PayrollResponseDto?> UpdateAsync(int id, CreatePayrollDto dto)
        {
            var payroll = await _context.Payrolls.Include(p => p.Employee)
                .FirstOrDefaultAsync(p => p.Id == id);
            if (payroll == null) return null;

            var oldValues = JsonSerializer.Serialize(payroll);

            payroll.EmployeeId = dto.EmployeeId;
            payroll.Month = dto.Month;
            payroll.Year = dto.Year;
            payroll.BasicSalary = dto.BasicSalary;
            payroll.Allowances = dto.Allowances;
            payroll.Deductions = dto.Deductions;
            payroll.NetSalary = dto.BasicSalary + dto.Allowances - dto.Deductions;


            await _auditLogService.LogAsync(new CreateAuditLogDto
            {
                UserId = _currentUserService.GetCurrentUserId(),
                Action = "Update",
                EntityName = "Payroll",
                EntityId = payroll.Id,
                OldValues = oldValues,
                NewValues = JsonSerializer.Serialize(payroll)
            }); 
            await _context.SaveChangesAsync();

            await _context.Entry(payroll).Reference(p => p.Employee).LoadAsync();

            return new PayrollResponseDto 
            {
                Id = payroll.Id,
                EmployeeId = payroll.EmployeeId,
                EmployeeName = $"{payroll.Employee.FirstName} {payroll.Employee.LastName}",
                Month = payroll.Month,
                Year = payroll.Year,
                BasicSalary = payroll.BasicSalary,
                Allowances = payroll.Allowances,
                Deductions = payroll.Deductions,
                NetSalary = payroll.NetSalary,
                Status = payroll.Status
            };
        }

        public async Task<PayslipResponseDto?> GeneratePayslipAsync(int employeeId, int month, int year)
        {
            var employee = await _context.Employees.Include(e => e.Department).Include(e => e.Designation).FirstOrDefaultAsync(e => e.Id == employeeId);

            if (employee == null) return null;

            var payroll = await _context.Payrolls.FirstOrDefaultAsync(p => p.EmployeeId == employeeId && p.Month == month && p.Year == year);
            if (payroll == null) return null;

            // Get All overtime for month of employee, Then Separate approved and Pending Overtime
            var overtimes = await _context.Overtimes.Where(o => o.EmployeeId == employeeId && o.Date.Month == month && o.Date.Year == year).ToListAsync();

            var approvedOvertimeAmount = overtimes.Where(o => o.Status == "Approved").Sum(o => o.Hours * o.HourlyRate);
            var pendingOvertimeAmount = overtimes.Where(o => o.Status == "Pending").Sum(o => o.Hours * o.HourlyRate);


            return new PayslipResponseDto
            {
                EmployeeName = $"{employee.FirstName} {employee.LastName}",
                Designation = employee.Designation.Title,
                Department = employee.Department.Name,
                Month = payroll.Month,
                Year = payroll.Year,
                BasicSalary = payroll.BasicSalary,
                Allowances = payroll.Allowances,
                Deductions = payroll.Deductions,
                ApprovedOvertimeAmount = approvedOvertimeAmount,
                PendingOvertimeAmount = pendingOvertimeAmount,
                NetSalary = payroll.BasicSalary + payroll.Allowances + approvedOvertimeAmount - payroll.Deductions
            };
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var payroll = await _context.Payrolls.FindAsync(id);
            if (payroll == null) return false;

            _context.Payrolls.Remove(payroll);

            await _auditLogService.LogAsync(new CreateAuditLogDto
            {
                UserId = _currentUserService.GetCurrentUserId(),
                Action = "Delete",
                EntityName = "Payroll",
                EntityId = payroll.Id,
                OldValues = JsonSerializer.Serialize(payroll),
                NewValues = null
            });

            await _context.SaveChangesAsync();
            return true;
        }




    }
}