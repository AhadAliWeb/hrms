
namespace Backend.Models
{
    public class Attendance
    {
        public int Id {get; set;}

        public int EmployeeId { get; set;}
        
        public Employee Employee { get; set; } = null!;

        public DateTime Date { get; set; }

        public TimeSpan? CheckIn {get; set;}
        public TimeSpan? CheckOut {get; set;}

        public string Status { get; set; } = null!;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}