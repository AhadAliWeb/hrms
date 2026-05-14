using Backend.DTOs;

namespace Backend.Interfaces
{
    public interface IAttendanceService
    {
        Task<IEnumerable<AttendanceResponseDto>> GetAllAsync();

        Task<IEnumerable<AttendanceResponseDto>> GetByEmployeeIdAsync(int id);

        Task<AttendanceResponseDto?> GetByIdAsync(int id);

        Task<AttendanceResponseDto> CreateAsync(CreateAttendanceDto dto);

        Task<AttendanceResponseDto?> UpdateAsync(int id, CreateAttendanceDto dto);

        Task<bool> DeleteAsync(int id);

    }
}