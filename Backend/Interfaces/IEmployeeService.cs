// Interfaces/IEmployeeService.cs
using Backend.DTOs;

namespace Backend.Interfaces
{
    public interface IEmployeeService
    {
        Task<IEnumerable<EmployeeResponseDto>> GetAllAsync();
        Task<EmployeeResponseDto?> GetByIdAsync(int id);
        Task<EmployeeResponseDto> CreateAsync(CreateEmployeeDto dto);
        Task<EmployeeResponseDto?> UpdateAsync(int id, UpdateEmployeeDto dto);

        Task<EmployeeResponseDto?> GetMyProfileAsync(int userId);
        Task<bool> DeleteAsync(int id); // soft delete — sets IsActive = false
    }
}