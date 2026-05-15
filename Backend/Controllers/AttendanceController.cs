using Microsoft.AspNetCore.Mvc;
using Backend.Interfaces;
using Backend.DTOs;
using Microsoft.AspNetCore.Authorization;


namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]

    public class AttendanceController : ControllerBase
    {
        private readonly IAttendanceService _service;

        public AttendanceController(IAttendanceService service) => _service = service;

        [Authorize(Roles = "Admin,HRManager")]
        [HttpGet]
        public async Task<IActionResult> GetAll() => Ok(await _service.GetAllAsync());

        [Authorize(Roles = "Admin,HRManager,Employee")]
        [HttpGet("employee/{id}")]
        public async Task<IActionResult> GetByEmployeeId(int id)
        {
            var result = await _service.GetByEmployeeIdAsync(id);

            return result == null ? NotFound() : Ok(result);
        }
    
        [Authorize(Roles = "Admin,HRManager,Employee")]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _service.GetByIdAsync(id);

            return result == null ? NotFound() : Ok(result);
        }

        [Authorize(Roles = "Admin,HRManager")]
        [HttpPost] public async Task<IActionResult> Create(CreateAttendanceDto dto) => Ok(await _service.CreateAsync(dto));

        [Authorize(Roles = "Admin,HRManager")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, CreateAttendanceDto dto)
        {
            var result = await _service.UpdateAsync(id, dto);

            return result == null ? NotFound() : Ok(result);
        }

        [Authorize(Roles = "Admin,HRManager")]
        [HttpDelete("{id}")]

        public async Task<IActionResult> Delete(int id)
        {
            var result = await _service.DeleteAsync(id);

            return result == true ? Ok() : NotFound();
        }
    }
}