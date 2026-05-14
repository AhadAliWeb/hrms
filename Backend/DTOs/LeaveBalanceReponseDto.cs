

namespace Backend.DTOs
{
    public class LeaveBalanceResponseDto
    {
        public int Id { get; set; }
        public string EmployeeName { get; set; } = null!;
        public string LeaveTypeName { get; set; } = null!;
        public int Year { get; set; }
        public int TotalDays { get; set; }
        public int UsedDays { get; set; }
        public int RemainingDays { get; set; }
    }
}