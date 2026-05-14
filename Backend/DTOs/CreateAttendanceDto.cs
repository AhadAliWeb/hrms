
namespace Backend.DTOs
{
    public class CreateAttendanceDto
    {

        public int EmployeeId { get; set;}
        public DateTime Date { get; set; }

        public TimeSpan? CheckIn {get; set;}
        public TimeSpan? CheckOut {get; set;}

        public string Status { get; set; } = null!;

    }
}