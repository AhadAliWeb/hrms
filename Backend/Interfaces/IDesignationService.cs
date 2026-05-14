using Backend.DTOs;


namespace Backend.Interfaces
{
    // Interfaces/IDesignationService.cs
    public interface IDesignationService
    {
        Task<IEnumerable<DesignationResponseDto>> GetAllAsync();
        Task<DesignationResponseDto?> GetByIdAsync(int id);
        Task<DesignationResponseDto> CreateAsync(CreateDesignationDto dto);
        Task<DesignationResponseDto?> UpdateAsync(int id, CreateDesignationDto dto);

        Task<EmployeeResponseDto?> ChangeDesignationAsync(int employeeId, int newDesignationId);

        Task<bool> DeleteAsync(int id);
    }
}