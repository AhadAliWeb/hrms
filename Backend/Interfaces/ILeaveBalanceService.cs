

using Backend.DTOs;

namespace Backend.Interfaces
{
    public interface ILeaveBalanceService
    {
        Task<IEnumerable<LeaveBalanceResponseDto>> GetAllAsync();

        Task<IEnumerable<LeaveBalanceResponseDto>> GetByEmployeeAsync(int employeeId, int year);

        Task<LeaveBalanceResponseDto?> GetByIdAsync(int id);

        Task<LeaveBalanceResponseDto> CreateAsync(CreateLeaveBalanceDto dto);

        Task<bool> DeductLeaveAsync(int employeeId, int leaveTypeId, int year, int days);

    }
}

