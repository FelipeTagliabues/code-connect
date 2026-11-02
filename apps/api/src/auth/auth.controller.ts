import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { ErrorResponseDto } from '../common/error-response.dto.js';
import { AuthService } from './auth.service.js';
import { AccessTokenDto } from './dto/access-token.dto.js';
import { SignInDto } from './dto/sign-in.dto.js';

@ApiTags('sessions')
@Controller('sessions')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  @ApiOperation({ summary: 'Efetuar login e obter um JWT' })
  @ApiCreatedResponse({ type: AccessTokenDto })
  @ApiUnauthorizedResponse({
    type: ErrorResponseDto,
    description: 'Credenciais inválidas',
  })
  @ApiUnprocessableEntityResponse({ type: ErrorResponseDto })
  signIn(@Body() dto: SignInDto): Promise<AccessTokenDto> {
    return this.authService.signIn(dto.email, dto.password);
  }
}
