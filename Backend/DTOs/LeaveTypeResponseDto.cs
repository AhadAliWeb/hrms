

namespace Backend.DTOs
{
    public class LeaveTypeResponseDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public int TotalDays { get; set; }
    }
}