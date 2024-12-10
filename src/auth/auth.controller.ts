import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Res,
  Headers,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { EmailAuthDto } from './dto/email-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { ResetPasswordDto } from './dto/reset-password-dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Creates a new user account
   * @param createAuthDto - The user registration data
   * @returns A message indicating successful signup and email confirmation sent
   */
  @Post('signup')
  signup(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.signup(createAuthDto);
  }

  @Get('activateAccount')
  async activateAccount(@Param('token') token: string) {
    return this.authService.activateAccount(token);
  }

  /**
   * Resends the account confirmation email
   * @param emailDto - The email address to send confirmation to
   * @returns A message indicating the confirmation email was sent
   */
  // @Post('sendBackMailConfirmation')
  // sendBackMailConfirmation(@Body() emailDto: EmailAuthDto) {
  //   return this.authService.sendBackMailConfirmation(emailDto);
  // }

  /**
   * Authenticates a user and creates a session
   * @param loginAuthDto - The login credentials
   * @param res - The response object to set cookies
   * @returns The authentication token
   */
  @Post('signin')
  signin(@Body() loginAuthDto: LoginAuthDto, @Res({ passthrough: true }) res) {
    return this.authService.signin(loginAuthDto, res);
  }

  /**
   * Gets the current authenticated user's information
   * @param token - The authentication token from headers
   * @returns The user information
   */
  @Get('user')
  getUser(@Headers('Authorization') token: string) {
    return this.authService.getUser(token);
  }

  /**
   * Signs out the current user by clearing their session
   * @param res - The response object to clear cookies
   * @returns A message indicating successful signout
   */
  @Get('signout')
  signout(@Res() res) {
    return this.authService.signout(res);
  }

  /**
   * Initiates the password reset process
   * @param emailDto - The email address for password reset
   * @returns A message indicating password reset email sent
   */
  @Post('forgotPassword')
  forgot(@Body() emailDto: EmailAuthDto) {
    return this.authService.forgot(emailDto);
  }

  /**
   * Resets the user's password using a reset token
   * @param token - The password reset token
   * @param resetPassword - The new password information
   * @returns A message indicating successful password reset
   */
  @Post('resetPassword/:token')
  resetPassword(
    @Param('token') token: string,
    @Body() resetPassword: ResetPasswordDto,
  ) {
    return this.authService.resetPassword(token, resetPassword);
  }
}
