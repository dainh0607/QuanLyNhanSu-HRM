using System;
using System.Threading.Tasks;
using ERP.DTOs.Auth;
using ERP.Services.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace ERP.API.Controllers
{
    [ApiController]
    [Route("api/user-admin")]
    [Authorize(Roles = "Manager,Admin")]
    public class UserAdminController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly IFirebaseService _firebaseService;
        private readonly IAuthService _authService;
        private readonly ILogger<UserAdminController> _logger;

        public UserAdminController(
            IUserService userService, 
            IFirebaseService firebaseService, 
            IAuthService authService,
            ILogger<UserAdminController> logger)
        {
            _userService = userService;
            _firebaseService = firebaseService;
            _authService = authService;
            _logger = logger;
        }

        [HttpPost("sync")]
        public async Task<IActionResult> SyncUsers()
        {
            try
            {
                var count = await _userService.SyncWithFirebaseAsync();
                return Ok(new { Message = $"Successfully synced {count} users from Firebase.", Count = count });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error syncing users");
                return StatusCode(500, new { Message = "Error syncing users", Error = ex.Message });
            }
        }

        [HttpPost("invite")]
        public async Task<IActionResult> InviteStaff([FromBody] PreRegisterStaffDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _authService.PreRegisterStaffAsync(dto);
            
            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// DANGEROUS: Wipes all users from the Firebase project. 
        /// </summary>
        [HttpDelete("nuke-firebase")]
        public async Task<IActionResult> DeleteAllFirebaseUsers()
        {
            try
            {
                var users = await _firebaseService.ListAllUsersAsync();
                int count = 0;

                foreach (var user in users)
                {
                    await _firebaseService.DeleteUserAsync(user.Uid);
                    count++;
                }

                return Ok(new { Message = $"Successfully wiped {count} users from Firebase.", Count = count });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error wiping Firebase users");
                return StatusCode(500, new { Message = "Error wiping users", Error = ex.Message });
            }
        }
    }
}
