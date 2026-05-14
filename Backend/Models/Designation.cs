

namespace Backend.Models
{
    public class Designation
    {
        public int Id { get; set; }
        public string Title { get; set; } = null!;
        public int DepartmentId { get; set; }

        public Department Department { get; set; } = null!;
    }
}