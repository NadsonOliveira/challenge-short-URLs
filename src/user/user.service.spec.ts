import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { validatePassword } from '../utils/passwordValidator';
jest.mock('../utils/passwordValidator');


describe('UserService', () => {
  let service: UserService;
  let userRepository: jest.Mocked<Repository<User>>;
  let jwtService: jest.Mocked<JwtService>;

  const mockUser = { id: 1, email: 'test@example.com', password: 'hashedpass' } as User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get(getRepositoryToken(User));
    jwtService = module.get(JwtService);
  });

  describe('createUser', () => {
    it('should create a user with valid email and password', async () => {
      userRepository.findOne.mockResolvedValue(null);
      (validatePassword as jest.Mock).mockReturnValue({ isValid: true, errors: [] });
      userRepository.create.mockReturnValue(mockUser);
      userRepository.save.mockResolvedValue(mockUser);

      const result = await service.createUser('test@example.com', 'ValidPassword123');

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
      expect(result).toEqual(mockUser);
    });

    it('should throw if email already exists', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.createUser('test@example.com', 'ValidPassword123')).rejects.toThrow(BadRequestException);
    });

    it('should throw if password is invalid', async () => {
      userRepository.findOne.mockResolvedValue(null);
      (validatePassword as jest.Mock).mockReturnValue({ isValid: false, errors: ['too short'] });

      await expect(service.createUser('test@example.com', '123')).rejects.toThrow(BadRequestException);
    });
  });

  describe('validateUser', () => {
    it('should return JWT token when credentials are valid', async () => {
      userRepository.findOne.mockResolvedValue({ ...mockUser, password: await bcrypt.hash('password', 10) });
      jwtService.sign.mockReturnValue('token');

      const token = await service.validateUser('test@example.com', 'password');

      expect(token).toEqual('token');
    });

    it('should throw if user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.validateUser('notfound@example.com', 'password')).rejects.toThrow(BadRequestException);
    });

    it('should throw if password is invalid', async () => {
      userRepository.findOne.mockResolvedValue({ ...mockUser, password: await bcrypt.hash('correct', 10) });

      await expect(service.validateUser('test@example.com', 'wrong')).rejects.toThrow(BadRequestException);
    });
  });

  describe('findByEmail', () => {
    it('should return user if found', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);

      const user = await service.findByEmail('test@example.com');

      expect(user).toEqual(mockUser);
    });

    it('should throw if not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.findByEmail('notfound@example.com')).rejects.toThrow(BadRequestException);
    });
  });

  describe('findById', () => {
    it('should return user by id', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);

      const user = await service.findById(1);

      expect(user).toEqual(mockUser);
    });

    it('should throw if user by id not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.findById(999)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return a list of users', async () => {
      userRepository.find.mockResolvedValue([mockUser]);

      const result = await service.findAll();

      expect(result).toEqual([mockUser]);
    });

    it('should throw if no users found', async () => {
      userRepository.find.mockResolvedValue([]);

      await expect(service.findAll()).rejects.toThrow(BadRequestException);
    });
  });
});
