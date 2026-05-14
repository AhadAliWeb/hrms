

namespace Backend.Models
{
    public class Department
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;

        public ICollection<Employee> Employees { get; set; } = new List<Employee>();
        public ICollection<Designation> Designations { get; set; } = new List<Designation>(); // add this

    }
}