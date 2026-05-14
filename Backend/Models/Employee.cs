
namespace Backend.Models 
{
    public class Employee 
    {
        public int Id { get; set; }
        public string FirstName { get; set; } = null!;
        public string LastName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Phone { get; set; } = null!;
        public DateTime DateOfBirth { get; set; }
        public DateTime HireDate { get; set; }
        public decimal Salary { get; set; }
        public bool IsActive { get; set; }

        public int DepartmentId { get; set; }

        public Department Department { get; set; } = null!;

        public int DesignationId { get; set; }

        public Designation Designation { get; set; } = null!;  // add this


        public DateTime CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }
    }
}