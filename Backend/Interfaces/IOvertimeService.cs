using Backend.DTOs;

namespace Backend.Interfaces
{
    public interface IOvertimeService
    {
        Task<IEnumerable<OvertimeResponseDto>> GetAllAsync();
        Task<OvertimeResponseDto?> GetByIdAsync(int id);

        Task<IEnumerable<OvertimeResponseDto>> GetByEmployeeIdAsync(int employeeId);

        Task<OvertimeResponseDto> CreateAsync(CreateOvertimeDto dto);
        Task<OvertimeResponseDto?> UpdateAsync(int id, CreateOvertimeDto dto);
        Task<bool> DeleteAsync(int id);

        Task<bool> ApproveAsync(int id);
        Task<bool> RejectAsync(int id);
    }
}