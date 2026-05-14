

namespace Backend.DTOs
{
    public class PayslipResponseDto
{
    public string EmployeeName { get; set; } = null!;
    public string Designation { get; set; } = null!;
    public string Department { get; set; } = null!;
    public int Month { get; set; }
    public int Year { get; set; }
    public decimal BasicSalary { get; set; }
    public decimal Allowances { get; set; }
    public decimal Deductions { get; set; }
    public decimal ApprovedOvertimeAmount { get; set; }
    public decimal PendingOvertimeAmount { get; set; }
    public decimal NetSalary { get; set; } // BasicSalary + Allowances + ApprovedOvertimeAmount - Deductions
}
}