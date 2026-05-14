using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Backend.DTOs;
using Backend.Interfaces;
using Microsoft.AspNetCore.Authorization;


namespace Backend.Controllers
{
    [Authorize(Roles = "Admin, HRManager")]
    [Route("api/[controller]")]
    [ApiController]

    public class DepartmentController: ControllerBase
    {
        private readonly IDepartmentService _service;
        public DepartmentController(IDepartmentService service) => _service = service;

        [HttpGet]
        public async Task<IActionResult> GetAll() => Ok(await _service.GetAllAsync());

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _service.GetByIdAsync(id);

            return result == null ? NotFound() : Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateDepartmentDto dto) => Ok(await _service.CreateAsync(dto));

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, CreateDepartmentDto dto) {
            
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