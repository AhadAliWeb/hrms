using Microsoft.AspNetCore.Mvc;
using Backend.Interfaces;
using Backend.DTOs;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // any authenticated user
    public class LeaveRequestController : ControllerBase
    {
        private readonly ILeaveRequestService _leaveRequestService;

        public LeaveRequestController(ILeaveRequestService leaveRequestService)
        {
            _leaveRequestService = leaveRequestService;
        }

        // =========================
        // ADMIN / HR ONLY
        // =========================

        [Authorize(Roles = "Admin,HRManager")]
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var leaveRequests = await _leaveRequestService.GetAllAsync();
            return Ok(leaveRequests);
        }

        [Authorize(Roles = "Admin,HRManager")]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var leaveRequest = await _leaveRequestService.GetByIdAsync(id);
            if (leaveRequest == null) return NotFound();
            return Ok(leaveRequest);
        }

        [Authorize(Roles = "Admin,HRManager")]
        [HttpPut("{id}/approve")]
        public async Task<IActionResult> Approve(int id)
        {
            var success = await _leaveRequestService.ApproveAsync(id);
            if (!success) return NotFound();
            return Ok();
        }

        [Authorize(Roles = "Admin,HRManager")]
        [HttpPut("{id}/reject")]
        public async Task<IActionResult> Reject(int id)
        {
            var success = await _leaveRequestService.RejectAsync(id);
            if (!success) return NotFound();
            return Ok();
        }

        [Authorize(Roles = "Admin,HRManager")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _leaveRequestService.DeleteAsync(id);
            if (!success) return NotFound();
            return NoContent();
        }

        // =========================
        // EMPLOYEE (SELF ACCESS)
        // =========================

        [HttpGet("me")]
        public async Task<IActionResult> GetAllByEmployee()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);

            var leaveRequests = await _leaveRequestService.GetByEmployeeIdAsync(userId);
            return Ok(leaveRequests);
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateLeaveRequestDto dto)
        {

            var createdLeaveRequest = await _leaveRequestService.CreateAsync(dto);

            return CreatedAtAction(
                nameof(GetById),
                new { id = createdLeaveRequest.Id },
                createdLeaveRequest
            );
        }
    }
}