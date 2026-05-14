using Backend.Interfaces;
using Backend.DTOs;
using Backend.Data;
using Backend.Models;
using Microsoft.EntityFrameworkCore;


namespace Backend.Services
{
    public class LeaveTypeService : ILeaveTypeService
    {
        private readonly AppDbContext _context;

        public LeaveTypeService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<LeaveTypeResponseDto>> GetAllAsync()
        {
            return await _context.LeaveTypes
                .Select(lt => new LeaveTypeResponseDto
                {
                    Id = lt.Id,
                    Name = lt.Name,
                    TotalDays = lt.TotalDays
                })
                .ToListAsync();
        }

        public async Task<LeaveTypeResponseDto?> GetByIdAsync(int id)
        {
            var leaveType = await _context.LeaveTypes.FindAsync(id);
            if (leaveType == null) return null;

            return new LeaveTypeResponseDto
            {
                Id = leaveType.Id,
                Name = leaveType.Name,
                TotalDays = leaveType.TotalDays
            };
        }

        public async Task<LeaveTypeResponseDto> CreateAsync(CreateLeaveTypeDto dto)
        {
            var leaveType = new LeaveType
            {
                Name = dto.Name,
                TotalDays = dto.TotalDays
            };

            _context.LeaveTypes.Add(leaveType);
            await _context.SaveChangesAsync();

            return new LeaveTypeResponseDto
            {
                Id = leaveType.Id,
                Name = leaveType.Name,
                TotalDays = leaveType.TotalDays
            };
        }

        public async Task<LeaveTypeResponseDto?> UpdateAsync(int id, CreateLeaveTypeDto dto)
        {
            var leaveType = await _context.LeaveTypes.FindAsync(id);
            if (leaveType == null) return null;

            leaveType.Name = dto.Name;
            leaveType.TotalDays = dto.TotalDays;

            await _context.SaveChangesAsync();

            return new LeaveTypeResponseDto
            {
                Id = leaveType.Id,
                Name = leaveType.Name,
                TotalDays = leaveType.TotalDays
            };
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var leaveType = await _context.LeaveTypes.FindAsync(id);
            if (leaveType == null) return false;

            _context.LeaveTypes.Remove(leaveType);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}