using Microsoft.AspNetCore.Mvc;
using Backend.Interfaces;
using Backend.DTOs;
using Microsoft.AspNetCore.Authorization;


namespace Backend.Controllers
{
    [Authorize(Roles = "Admin,HRManager")]
    [Route("api/[controller]")]
    [ApiController]

    public class AttendanceController : ControllerBase
    {
        private readonly IAttendanceService _service;

        public AttendanceController(IAttendanceService service) => _service = service;

        [HttpGet]
        public async Task<IActionResult> GetAll() => Ok(await _service.GetAllAsync());

        [HttpGet("employee/{id}")]
        public async Task<IActionResult> GetByEmployeeId(int id)
        {
            var result = await _service.GetByEmployeeIdAsync(id);

            return result == null ? NotFound() : Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _service.GetByIdAsync(id);

            return result == null ? NotFound() : Ok(result);
        }

        [HttpPost] public async Task<IActionResult> Create(CreateAttendanceDto dto) => Ok(await _service.CreateAsync(dto));

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, CreateAttendanceDto dto)
        {
            var result = await _service.UpdateAsync(id, dto);

            return result == null ? NotFound() : Ok(result);
        }

        [HttpDelete("{id}")]

        public async Task<IActionResult> Delete(int id)
        {
            var result = await _service.DeleteAsync(id);

            return result == true ? Ok() : NotFound();
        }
    }
}