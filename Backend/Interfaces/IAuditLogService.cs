using Backend.DTOs;


namespace Backend.Interfaces
{
    public interface IAuditLogService
    {
        Task<IEnumerable<AuditLogResponseDto>> GetAllAsync();

        Task<AuditLogResponseDto?> GetByIdAsync(int id);

        Task <IEnumerable<AuditLogResponseDto>> GetByUserIdAsync(int userId);

        Task LogAsync(CreateAuditLogDto dto);


    }
}