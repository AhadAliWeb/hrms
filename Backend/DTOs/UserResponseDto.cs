

namespace Backend.DTOs
{
    public class UserResponseDto
    {
        public int Id { get; set; }
        public string Username { get; set; } = null!;
        public string Role { get; set; } = null!;
        
        public string? EmployeeName { get; set; } = null!;
    }
}

