import { Controller, Post, Body, Get, Param, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { User } from './user.entity';
import { CreateUserDto } from './create-user.dto';
import { BadRequestDto } from 'src/interface/BadRequestDto';

@Controller('users')
@ApiTags('Users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully.', type: User })
  @ApiBadRequestResponse({ description: 'Email is already in use or password is invalid', type: BadRequestDto  })
  async createUser(
    @Body() createUserDto: CreateUserDto,
  ): Promise<User> {
    return this.userService.createUser(createUserDto.email, createUserDto.password);
  }

  @Post('login')
  @ApiBadRequestResponse({ description: 'User not found', type: BadRequestDto  })
  async login(@Body() createUserDto: CreateUserDto): Promise<{ access_token: string }> {
    const { email, password } = createUserDto;
    const accessToken = await this.userService.validateUser(email, password);
    return { access_token: accessToken };
  }

  @Get('email')
  @ApiOperation({ summary: 'Find user by email' })
  @ApiBadRequestResponse({ description: 'Email not found', type: BadRequestDto  })
  @ApiResponse({ status: 200, description: 'User found by email.', type: User })
  async findByEmail(@Query('email') email: string): Promise<User> {
    return this.userService.findByEmail(email);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find user by ID' })
  @ApiBadRequestResponse({ description: 'Id user not found', type: BadRequestDto  })
  @ApiResponse({ status: 200, description: 'User found by ID.', type: User })
  async findById(@Param('id') id: number): Promise<User> {
    return this.userService.findById(id);
  }

  @Get()
  @ApiOperation({ summary: 'Find all users' })
  @ApiBadRequestResponse({ description: 'User not found', type: BadRequestDto  })
  @ApiResponse({ status: 200, description: 'Find all users', type: [User] })
  async findAll(): Promise<User[]> {
    return this.userService.findAll();  
  }
}
