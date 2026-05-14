using Backend.DTOs;

namespace Backend.Interfaces
{
    public interface ILeaveRequestService
    {
        Task<IEnumerable<LeaveRequestResponseDto>> GetAllAsync();
        Task<LeaveRequestResponseDto?> GetByIdAsync(int id);

        Task<IEnumerable<LeaveRequestResponseDto>> GetByEmployeeIdAsync(int id);

        Task<LeaveRequestResponseDto> CreateAsync(CreateLeaveRequestDto dto);
        Task<LeaveRequestResponseDto?> UpdateAsync(int id, CreateLeaveRequestDto dto);

        Task<bool> ApproveAsync(int id);
        Task<bool> RejectAsync(int id);

        Task<bool> DeleteAsync(int id);
    }
}