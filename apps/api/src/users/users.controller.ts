import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { AuthGuard, type JwtPayload } from '../auth/auth.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { ErrorResponseDto } from '../common/error-response.dto.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UserResponseDto } from './dto/user-response.dto.js';
import { UsersService } from './users.service.js';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Cadastrar um usuário' })
  @ApiCreatedResponse({ type: UserResponseDto })
  @ApiConflictResponse({
    type: ErrorResponseDto,
    description: 'E-mail já cadastrado',
  })
  @ApiUnprocessableEntityResponse({ type: ErrorResponseDto })
  async create(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    return UserResponseDto.fromEntity(await this.usersService.create(dto));
  }

  @Get('me')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter os dados do usuário logado' })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  async getMe(@CurrentUser() payload: JwtPayload): Promise<UserResponseDto> {
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return UserResponseDto.fromEntity(user);
  }
}
