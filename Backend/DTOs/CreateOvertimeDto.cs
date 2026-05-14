
namespace Backend.DTOs
{
    public class CreateOvertimeDto
    {
        public int EmployeeId { get; set; }
        public DateTime Date { get; set; }
        public decimal Hours { get; set; }
        public decimal HourlyRate { get; set; }
    }
}