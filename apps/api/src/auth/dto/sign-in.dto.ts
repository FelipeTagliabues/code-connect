import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SignInDto {
  @ApiProperty({ example: 'maria@email.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'senhaSegura123' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
