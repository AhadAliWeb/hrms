using Backend.DTOs;

namespace Backend.Interfaces
{
    public interface IAuthService
    {
        Task<string?> LoginAsync(LoginDto dto);
        Task<UserResponseDto> RegisterAsync(CreateUserDto dto);
    }
}