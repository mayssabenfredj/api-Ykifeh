import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import { getModelToken } from '@nestjs/mongoose';
import { User } from './schema/user.schema';
import { Model } from 'mongoose';
import { BadRequestException } from '@nestjs/common';

const mockUserModel = {
  create: jest.fn(),
  findOne: jest.fn(),
};

const mockMailerService = {
  sendMail: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn(),
  verify: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;
  let userModel: Model<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: MailerService,
          useValue: mockMailerService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userModel = module.get<Model<User>>(getModelToken(User.name));
  });

  describe('signup', () => {
    it('should create a new user and send activation email', async () => {
      const createAuthDto = {
        email: 'test@example.com',
        password: 'password123',
        fullName: 'Test User',
        phoneNumber: '1234567890',
        address: { street: '123 Test St' },
      };

      mockUserModel.findOne.mockResolvedValue(null);
      mockUserModel.create.mockResolvedValue({
        id: '123',
        ...createAuthDto,
      });
      mockMailerService.sendMail.mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue('mock-token');

      const result = await service.signup(createAuthDto);

      expect(result.message).toBe('User created. Activation email sent.');
      expect(mockUserModel.create).toHaveBeenCalled();
      expect(mockMailerService.sendMail).toHaveBeenCalled();
    });

    it('should throw BadRequestException if user already exists', async () => {
      const createAuthDto = {
        email: 'existing@example.com',
        password: 'password123',
        fullName: 'Existing User',
        phoneNumber: '1234567890',
        address: { street: '123 Test St' },
      };

      mockUserModel.findOne.mockResolvedValue({ email: createAuthDto.email });

      await expect(service.signup(createAuthDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findByEmail', () => {
    it('should find a user by email', async () => {
      const mockUser = {
        email: 'test@example.com',
        fullName: 'Test User',
      };

      mockUserModel.findOne.mockResolvedValue(mockUser);

      const result = await service['findByEmail']('test@example.com');
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      mockUserModel.findOne.mockResolvedValue(null);

      const result = await service['findByEmail']('nonexistent@example.com');
      expect(result).toBeNull();
    });
  });
});
