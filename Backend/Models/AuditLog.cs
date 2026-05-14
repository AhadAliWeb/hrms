

namespace Backend.Models 
{
    // Models/AuditLog.cs
    public class AuditLog
    {
        public int Id { get; set; }
        public int? UserId { get; set; }
        public string Action { get; set; } = null!;      // Create, Update, Delete
        public string EntityName { get; set; } = null!;  // Employee, Payroll etc.
        public int EntityId { get; set; }
        public string? OldValues { get; set; }            // JSON string
        public string? NewValues { get; set; }            // JSON string
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}