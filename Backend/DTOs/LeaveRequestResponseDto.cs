

namespace Backend.DTOs
{
    public class LeaveRequestResponseDto
    {
        public int Id { get; set; }
        public string EmployeeName { get; set; } = null!;
        public string LeaveTypeName { get; set; } = null!;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }

        public string? Reason { get; set; }

        public string Status { get; set; } = null!;
    }
}