using Backend.Interfaces;
using Backend.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Backend.Data;
using Backend.DTOs;


namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DesignationController : ControllerBase
    {
        private readonly IDesignationService _service;

        public DesignationController(IDesignationService service) => _service = service;

        [HttpGet]
        public async Task<IActionResult> GetAll() => Ok(await _service.GetAllAsync());

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _service.GetByIdAsync(id);

            return result == null ? NotFound() : Ok(result);
        }


        [HttpPost] public async Task<IActionResult> Create(CreateDesignationDto dto) => Ok(await _service.CreateAsync(dto));


        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id,CreateDesignationDto dto)
        {
            var result = await _service.UpdateAsync(id, dto);

            return result == null ? NotFound() : Ok(result);
        }

        [HttpPut("{employeeId}/change-designation/{newDesignationId}")]
        public async Task<IActionResult> ChangeDesignation(int employeeId, int newDesignationId)
        {
            var result = await _service.ChangeDesignationAsync(employeeId, newDesignationId);
            if (result == null) return NotFound();
            return Ok(result);
        }


        [HttpDelete("{id}")]

        public async Task<IActionResult> Delete(int id)
        {
            var result = await _service.DeleteAsync(id);

            return result == true ? Ok() : NotFound();
        }




    }
}