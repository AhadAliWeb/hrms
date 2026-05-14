using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Backend.Interfaces;
using Backend.DTOs;


namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LeaveTypeController : ControllerBase
    {
        private readonly ILeaveTypeService _leaveTypeService;

        public LeaveTypeController(ILeaveTypeService leaveTypeService)
        {
            _leaveTypeService = leaveTypeService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var leaveTypes = await _leaveTypeService.GetAllAsync();
            return Ok(leaveTypes);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var leaveType = await _leaveTypeService.GetByIdAsync(id);
            if (leaveType == null) return NotFound();
            return Ok(leaveType);
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateLeaveTypeDto dto)
        {
            var created = await _leaveTypeService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, CreateLeaveTypeDto dto)
        {
            var updated = await _leaveTypeService.UpdateAsync(id, dto);
            if (updated == null) return NotFound();
            return Ok(updated);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _leaveTypeService.DeleteAsync(id);
            if (!deleted) return NotFound();
            return NoContent();
        }
    }
}