

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Backend.Interfaces;
using Backend.DTOs;

namespace Backend.Controllers
{   
    [Route("api/[controller]")]
    [ApiController]

    public class OvertimeController : ControllerBase
    {
        private readonly IOvertimeService _overtimeService;

        public OvertimeController(IOvertimeService overtimeService)
        {
            _overtimeService = overtimeService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<OvertimeResponseDto>>> GetAll()
        {
            var overtimes = await _overtimeService.GetAllAsync();
            return Ok(overtimes);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<OvertimeResponseDto>> GetById(int id)
        {
            var overtime = await _overtimeService.GetByIdAsync(id);
            if (overtime == null) return NotFound();
            return Ok(overtime);
        }

        [HttpPost]
        public async Task<ActionResult<OvertimeResponseDto>> Create(CreateOvertimeDto dto)
        {
            var created = await _overtimeService.CreateAsync(dto);
            return Ok(created);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<OvertimeResponseDto>> Update(int id, CreateOvertimeDto dto)
        {
            var updated = await _overtimeService.UpdateAsync(id, dto);
            if (updated == null) return NotFound();
            return Ok(updated);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            var success = await _overtimeService.DeleteAsync(id);
            if (!success) return NotFound();
            return NoContent();
        }

        [HttpGet("employee/{employeeId}")]
        public async Task<ActionResult<IEnumerable<OvertimeResponseDto>>> GetByEmployeeId(int employeeId)
        {
            var overtimes = await _overtimeService.GetByEmployeeIdAsync(employeeId);
            return Ok(overtimes);
        }

        [HttpPut("{id}/approve")]
        public async Task<IActionResult> Approve(int id)
        {
            var success = await _overtimeService.ApproveAsync(id);
            if (!success) return BadRequest("Already approved/rejected or not found");
            return Ok();
        }

        [HttpPut("{id}/reject")]
        public async Task<IActionResult> Reject(int id)
        {
            var success = await _overtimeService.RejectAsync(id);
            if (!success) return BadRequest("Already approved/rejected or not found");
            return Ok();
        }
    }

}