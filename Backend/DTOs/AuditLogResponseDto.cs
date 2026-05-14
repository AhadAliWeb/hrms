    namespace Backend.DTOs
    {
        public class AuditLogResponseDto
        {
            
            public int Id { get; set; }
            public int? UserId { get; set; }
            public string Action { get; set; } = null!;
            public string EntityName { get; set; } = null!;

            public int EntityId { get; set; }

            public string? OldValues { get; set; }
            public string? NewValues { get; set; }
            public DateTime Timestamp { get; set; }

        }
    }