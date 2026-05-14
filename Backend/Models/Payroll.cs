

namespace Backend.Models
{
    public class Payroll
    {
        public int Id { get; set; }
        public int EmployeeId { get; set; }
        public Employee Employee { get; set; } = null!;
        public int Month { get; set; }
        public int Year { get; set; }
        public decimal BasicSalary { get; set; }
        public decimal Allowances { get; set; }
        public decimal Deductions { get; set; }
        public decimal NetSalary { get; set; }  // BasicSalary + Allowances - Deductions
        public string Status { get; set; } = "Pending"; // Pending, Paid
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}