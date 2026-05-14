using Microsoft.AspNetCore.Mvc;
using Backend.Services;
using Microsoft.AspNetCore.Http;
using Backend.Interfaces;
using Backend.DTOs;
using Microsoft.AspNetCore.Authorization;
using Backend.Documents;
using QuestPDF.Fluent;

namespace Backend.Controllers
{
    // [Authorize(Roles = "Admin, HRManager")]
    [Route("api/[controller]")]
    [ApiController]
    public class PayrollController : ControllerBase
    {
        private readonly IPayrollService _payrollService;


        public PayrollController(IPayrollService payrollService)
        {
            _payrollService = payrollService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var payrolls = await _payrollService.GetAllAsync();
            return Ok(payrolls);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var payroll = await _payrollService.GetByIdAsync(id);
            if (payroll == null) return NotFound();
            return Ok(payroll);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreatePayrollDto dto)
        {
            var createdPayroll = await _payrollService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = createdPayroll.Id }, createdPayroll);
        }


        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] CreatePayrollDto dto)
        {
            var updatedPayroll = await _payrollService.UpdateAsync(id, dto);
            if (updatedPayroll == null) return NotFound();
            return Ok(updatedPayroll);
        }

        [HttpGet("generate-payslip")]
        public async Task<IActionResult> GeneratePayslip([FromQuery] int employeeId, [FromQuery] int month, [FromQuery] int year)
        {
            var payslip = await _payrollService.GeneratePayslipAsync(employeeId, month, year);
            if (payslip == null) return NotFound();
            
            var document = new PayslipDocument(payslip);
            var pdfBytes = document.GeneratePdf();

            return File(pdfBytes, "application/pdf", $"Payslip_{employeeId}_{month}_{year}.pdf");
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _payrollService.DeleteAsync(id);
            if (!success) return NotFound();
            return NoContent();
        }

    }



}