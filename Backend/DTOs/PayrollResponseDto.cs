

namespace Backend.DTOs
{
    
    public class PayrollResponseDto
    {

        public int Id { get; set; }

        public int EmployeeId {get; set;}

        public string EmployeeName { get; set; } = null!;

        public int Month { get; set; }
        public int Year { get; set; }

        public decimal BasicSalary { get; set; }
        public decimal Allowances { get; set; }
        public decimal Deductions { get; set; }

        public decimal NetSalary { get; set; }

        public string Status { get; set; } = null!;
    }
}

