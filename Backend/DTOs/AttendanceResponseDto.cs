
namespace Backend.DTOs
{
    public class AttendanceResponseDto
    {
        public int Id {get; set;}

        public int EmployeeId { get; set;}

        public string EmployeeName { get; set;} = null!;

        public DateTime Date { get; set; }

        public TimeSpan? CheckIn {get; set;}
        public TimeSpan? CheckOut {get; set;}

        public string Status { get; set; } = null!;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}