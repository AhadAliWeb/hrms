
namespace Backend.Models
{
        public class LeaveBalance
    {
        public int Id { get; set; }
        public int EmployeeId { get; set; }
        public Employee Employee { get; set; } = null!;
        public int LeaveTypeId { get; set; }
        public LeaveType LeaveType { get; set; } = null!;
        public int Year { get; set; }
        public int TotalDays { get; set; }    // copied from LeaveType
        public int UsedDays { get; set; }
        public int RemainingDays { get; set; } // TotalDays - UsedDays
    }
}