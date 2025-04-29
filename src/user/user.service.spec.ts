import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './user.entity';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';

const mockUser = {
  id: 1,
  email: 'test@example.com',
  password: 'hashedpassword',
};

describe('UserService', () => {
  let service: UserService;
  let userRepo: jest.Mocked<Repository<User>>;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('fake-jwt-token'),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepo = module.get(getRepositoryToken(User));
    jwtService = module.get(JwtService);
  });

  describe('createUser', () => {
    it('should hash the password and save the user', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const hashed = await bcrypt.hash(password, 10);

      jest.spyOn(bcrypt, 'hash').mockResolvedValueOnce(hashed as never);
      userRepo.create.mockReturnValue({ email, password: hashed } as User);
      userRepo.save.mockResolvedValue({ id: 1, email, password: hashed } as User);

      const result = await service.createUser(email, password);
      expect(result).toEqual({ id: 1, email, password: hashed });
      expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
      expect(userRepo.save).toHaveBeenCalled();
    });
  });

  describe('validateUser', () => {
    it('should return JWT if email and password match', async () => {
      userRepo.findOne.mockResolvedValue(mockUser as User);
      
      jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(true as never);

      const token = await service.validateUser(mockUser.email, 'plainpassword');
      expect(token).toEqual('fake-jwt-token');
      expect(jwtService.sign).toHaveBeenCalledWith({ email: mockUser.email, sub: mockUser.id });
    });

    it('should throw if user not found', async () => {
      userRepo.findOne.mockResolvedValue(null);
      await expect(service.validateUser('notfound@example.com', 'any')).rejects.toThrow('User not found');
    });

    it('should throw if password is invalid', async () => {
      userRepo.findOne.mockResolvedValue(mockUser as User);
      
      jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(false as never);
      
      await expect(service.validateUser(mockUser.email, 'wrong')).rejects.toThrow('Invalid password');
    });
  });

  describe('findByEmail', () => {
    it('should return user by email', async () => {
      userRepo.findOne.mockResolvedValue(mockUser as User);
      const user = await service.findByEmail(mockUser.email);
      expect(user).toEqual(mockUser);
    });

    it('should throw if user not found', async () => {
      userRepo.findOne.mockResolvedValue(null);
      await expect(service.findByEmail('notfound@example.com')).rejects.toThrow('User not found');
    });
  });

  describe('findById', () => {
    it('should return user by id', async () => {
      userRepo.findOne.mockResolvedValue(mockUser as User);
      const user = await service.findById(1);
      expect(user).toEqual(mockUser);
    });

    it('should throw if user not found by id', async () => {
      userRepo.findOne.mockResolvedValue(null);
      await expect(service.findById(99)).rejects.toThrow('User by id not found');
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      userRepo.find.mockResolvedValue([mockUser as User]);
      const users = await service.findAll();
      expect(users).toEqual([mockUser]);
    });

    it('should throw if no users found', async () => {
      userRepo.find.mockResolvedValue([]);
      const result = await service.findAll();
      expect(result).toEqual([]);
    });
  });
});
