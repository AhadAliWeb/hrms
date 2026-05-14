
namespace Backend.Models
{
    public class User
    {
        public int Id { get; set; }
        public string Username { get; set; } = null!;
        public string PasswordHash { get; set; } = null!;
        public string Role { get; set; } = null!;

        public int? EmployeeId { get; set; }
        public Employee? Employee { get; set; }

        public DateTime CreateAt { get; set; } = DateTime.UtcNow;

    }
}