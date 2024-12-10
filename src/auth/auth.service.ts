import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { JsonWebTokenError, JwtService, TokenExpiredError } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schema/user.schema';
import { EmailAuthDto } from './dto/email-auth.dto';
import { ResetPasswordDto } from './dto/reset-password-dto';
import { Response } from 'express';
import {
  comparePassword,
  generateToken,
  hashPassword,
} from 'src/shared/shared.service';
import { MailerService } from '@nestjs-modules/mailer';
import { LoginAuthDto } from './dto/login-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly mailService: MailerService,
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {}

  private async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email });
  }

  private async sendEmail(
    to: string,
    subject: string,
    html: string,
  ): Promise<void> {
    const mail = await this.mailService.sendMail({
      to,
      from: process.env.MAIL_FROM || 'maissabfr@gmail.com',
      subject,
      html,
    });

    if (!mail) {
      throw new BadRequestException('Failed to send email');
    }
  }

  async signup(createAuthDto: CreateAuthDto) {
    const userExists = await this.findByEmail(createAuthDto.email);
    if (userExists) {
      throw new BadRequestException(
        'User already exists with this email address',
      );
    }

    const hashedPassword = await hashPassword(createAuthDto.password);
    const user = await this.userModel.create({
      ...createAuthDto,
      password: hashedPassword,
    });

    const token = await generateToken(this.jwtService, user);
    await this.sendActivationEmail(createAuthDto.email, token);

    return { message: 'User created. Activation email sent.' };
  }

  async sendActivationEmail(email: string, token: string) {
    const activationUrl = `${
      process.env.FRONTEND_URL || 'http://localhost:4200'
    }/authentication/activate/${token}`;
    const html = `
      <h1>Confirmation Mail</h1>
      <h2>Welcome</h2>
      <p>To activate your account, please click on this link</p>
      <a href="${activationUrl}">Click here to activate</a>
    `;

    await this.sendEmail(email, 'Account confirmation', html);
    return { message: 'Email sent.' };
  }

  async activateAccount(token: string) {
    try {
      const decodedToken = await this.jwtService.verifyAsync(token);
      const user = await this.userModel.findOne({ _id: decodedToken.userId });

      if (!user) {
        throw new BadRequestException('User not found');
      }

      if (user.isActive) {
        throw new BadRequestException('Account already active');
      }

      await this.userModel.updateOne(
        { _id: decodedToken.userId },
        { $set: { isActive: true } },
      );

      return { message: 'Account activated successfully' };
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new BadRequestException(
          'Token expired. A new activation email has been sent',
        );
      }
      if (error instanceof JsonWebTokenError) {
        throw new BadRequestException('Invalid activation token');
      }
      throw new BadRequestException('An error occurred during activation');
    }
  }

  async signin(loginAuthDto: LoginAuthDto, res: Response) {
    const { email, password } = loginAuthDto;
    const user = await this.findByEmail(email);

    if (!user || !(await comparePassword({ password, hash: user.password }))) {
      throw new BadRequestException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Please verify your email address');
    }

    const token = await this.jwtService.signAsync({ id: user.id });
    if (!token) {
      throw new ForbiddenException('Failed to generate token');
    }

    res.cookie('token', token);
    return { token };
  }

  async getUser(token: string) {
    if (!token) {
      throw new UnauthorizedException('Not authenticated');
    }

    const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token;

    const decoded = await this.jwtService.verifyAsync(cleanToken);
    if (!decoded) {
      throw new UnauthorizedException('Invalid token');
    }

    const user = await this.userModel.findOne({ _id: decoded.id });
    return { user };
  }

  signout(res: Response) {
    res.clearCookie('token');
    return { message: 'Logged out successfully' };
  }

  async sendPasswordResetEmail(email: string, token: string) {
    const resetUrl = `${
      process.env.FRONTEND_URL || 'http://localhost:4200'
    }/authentication/reset/${token}`;
    const html = `
      <h1>Reset Password</h1>
      <h2>Welcome</h2>
      <p>To reset your password, please click on this link</p>
      <a href="${resetUrl}">Click here to reset password</a>
    `;

    await this.sendEmail(email, 'Reset Password', html);
    return { message: 'Password reset email sent' };
  }

  async forgot(emailDto: EmailAuthDto) {
    const user = await this.findByEmail(emailDto.email);
    if (!user) {
      throw new BadRequestException('Invalid email');
    }

    const token = await generateToken(this.jwtService, user);
    return this.sendPasswordResetEmail(emailDto.email, token);
  }

  async resetPassword(token: string, resetPassword: ResetPasswordDto) {
    const decodedToken = await this.jwtService.verifyAsync(token);
    const user = await this.userModel.findOne({ _id: decodedToken.userId });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const hashedPassword = await hashPassword(resetPassword.password);
    await this.userModel.updateOne(
      { _id: decodedToken.userId },
      { $set: { password: hashedPassword } },
    );

    return { message: 'Password reset successful' };
  }
}
