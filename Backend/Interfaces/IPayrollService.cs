using Backend.DTOs;

namespace Backend.Interfaces
{
    public interface IPayrollService
    {
        Task<IEnumerable<PayrollResponseDto>> GetAllAsync();
        Task<PayrollResponseDto?> GetByIdAsync(int id);
        Task<PayrollResponseDto> CreateAsync(CreatePayrollDto dto);

        Task<PayslipResponseDto?> GeneratePayslipAsync(int employeeId, int month, int year);
        Task<PayrollResponseDto?> UpdateAsync(int id, CreatePayrollDto dto);
        Task<bool> DeleteAsync(int id);
    }
}

