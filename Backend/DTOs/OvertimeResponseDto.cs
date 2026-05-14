

namespace Backend.DTOs
{
    public class OvertimeResponseDto
    {
        public int Id { get; set; }
        public string EmployeeName { get; set; } = null!;
        public DateTime Date { get; set; }
        public decimal Hours { get; set; }
        public decimal HourlyRate { get; set; }
        public decimal TotalAmount { get; set; }

        public string Status { get; set; } = null!;
    }
}

