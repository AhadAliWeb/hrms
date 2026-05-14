using Microsoft.AspNetCore.Mvc;
using Backend.Interfaces;
using Backend.DTOs;


namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LeaveBalanceController : ControllerBase
    {
        private readonly ILeaveBalanceService _leaveBalanceService;

        public LeaveBalanceController(ILeaveBalanceService leaveBalanceService)
        {
            _leaveBalanceService = leaveBalanceService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<LeaveBalanceResponseDto>>> GetAll()
        {
            var balances = await _leaveBalanceService.GetAllAsync();
            return Ok(balances);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<LeaveBalanceResponseDto>> GetById(int id)
        {
            var balance = await _leaveBalanceService.GetByIdAsync(id);
            if (balance == null) return NotFound();
            return Ok(balance);
        }

        [HttpGet("employee/{employeeId}/year/{year}")]
        public async Task<ActionResult<IEnumerable<LeaveBalanceResponseDto>>> GetByEmployee(int employeeId, int year)
        {
            var balances = await _leaveBalanceService.GetByEmployeeAsync(employeeId, year);
            return Ok(balances);
        }

        [HttpPost]
        public async Task<ActionResult<LeaveBalanceResponseDto>> Create(CreateLeaveBalanceDto dto)
        {
            var created = await _leaveBalanceService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        // [HttpPost("deduct")]
        // public async Task<ActionResult> DeductLeave(int employeeId, int leaveTypeId, int year, int days)
        // {
        //     var success = await _leaveBalanceService.DeductLeaveAsync(employeeId, leaveTypeId, year, days);
        //     if (!success) return BadRequest("Failed to deduct leave. Check if balance exists and has enough days.");
        //     return Ok();
        // }

    }
}