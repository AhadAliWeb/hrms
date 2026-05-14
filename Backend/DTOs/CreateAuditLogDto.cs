namespace Backend.DTOs
{
    public class CreateAuditLogDto
    {
        public string Action { get; set; } = null!;

        public int? UserId { get; set; }

        public string EntityName { get; set; } = null!;

        public int EntityId { get; set; }

        public string? OldValues { get; set; }
        public string? NewValues { get; set; }


    }
}