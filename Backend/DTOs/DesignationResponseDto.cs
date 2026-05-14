

namespace Backend.DTOs
{
    public class DesignationResponseDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = null!;
        public string DepartmentName { get; set; } = null!;

        public int DepartmentId { get; set; }

    }
}