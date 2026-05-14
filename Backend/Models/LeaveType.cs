// Models/LeaveType.cs

namespace Backend.Models
{
    public class LeaveType
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!; // Casual, Sick, Annual
        public int TotalDays { get; set; } // allowed days per year

        public ICollection<LeaveRequest> LeaveRequests { get; set; } = new List<LeaveRequest>();
    }
}