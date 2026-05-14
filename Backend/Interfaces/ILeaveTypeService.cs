using Backend.DTOs;

namespace Backend.Interfaces
{
    public interface ILeaveTypeService
    {
        Task<IEnumerable<LeaveTypeResponseDto>> GetAllAsync();
        Task<LeaveTypeResponseDto?> GetByIdAsync(int id);
        Task<LeaveTypeResponseDto> CreateAsync(CreateLeaveTypeDto dto);
        Task<LeaveTypeResponseDto?> UpdateAsync(int id, CreateLeaveTypeDto dto);
        Task<bool> DeleteAsync(int id);
    }
}