

namespace Backend.DTOs
{
    public class CreateLeaveBalanceDto
    {
       public int EmployeeId { get; set; }
        public int LeaveTypeId { get; set; }
        public int Year { get; set;  }
    }
}