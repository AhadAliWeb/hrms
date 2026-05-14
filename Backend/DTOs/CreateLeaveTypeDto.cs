

namespace Backend.DTOs {
    public class CreateLeaveTypeDto
    {
        public string Name { get; set; } = null!;
        public int TotalDays { get; set; }
    }
}