

using Backend.Interfaces;
using Backend.DTOs;
using Backend.Models;
using Microsoft.EntityFrameworkCore;
using Backend.Data;

namespace Backend.Services
{
    public class AuditLogService : IAuditLogService
    {
        private readonly AppDbContext _context;

        public AuditLogService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<AuditLogResponseDto?> GetByIdAsync(int id)
        {
            var log = await _context.AuditLogs.FindAsync(id);
            if (log == null) return null;

            return new AuditLogResponseDto
            {
                Id = log.Id,
                UserId = log.UserId,
                Action = log.Action,
                EntityName = log.EntityName,
                EntityId = log.EntityId,
                OldValues = log.OldValues,
                NewValues = log.NewValues,
                Timestamp = log.Timestamp
            };
        }

        public async Task<IEnumerable<AuditLogResponseDto>> GetAllAsync()
        {
            return await _context.AuditLogs.Select(log => new AuditLogResponseDto
            {
                Id = log.Id,
                UserId = log.UserId,
                Action = log.Action,
                EntityName = log.EntityName,
                EntityId = log.EntityId,
                OldValues = log.OldValues,
                NewValues = log.NewValues,
                Timestamp = log.Timestamp
            }).ToListAsync();
        }

        public async Task<IEnumerable<AuditLogResponseDto>> GetByUserIdAsync(int userId)
        {
            return await _context.AuditLogs.Where(log => log.UserId == userId).Select(log => new AuditLogResponseDto
            {
                Id = log.Id,
                UserId = log.UserId,
                Action = log.Action,
                EntityName = log.EntityName,
                EntityId = log.EntityId,
                OldValues = log.OldValues,
                NewValues = log.NewValues,
                Timestamp = log.Timestamp
            }).ToListAsync();
        }

        public async Task LogAsync(CreateAuditLogDto dto)
        {
            var log = new AuditLog
            {
                UserId = dto.UserId,
                Action = dto.Action,
                EntityName = dto.EntityName,
                EntityId = dto.EntityId,
                OldValues = dto.OldValues,
                NewValues = dto.NewValues,
                Timestamp = DateTime.UtcNow
            };

            _context.AuditLogs.Add(log);
            await _context.SaveChangesAsync();
        }
    }
}


