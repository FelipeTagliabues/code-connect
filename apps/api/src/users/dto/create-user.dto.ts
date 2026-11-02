import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'Maria Silva', maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'maria@email.com' })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '11987654321',
    description:
      'Telefone brasileiro com DDD (10 ou 11 dígitos); a máscara é ignorada.',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.replace(/\D/g, '') : value,
  )
  @Matches(/^\d{10,11}$/, { message: 'phone must have 10 or 11 digits' })
  phone: string;

  @ApiProperty({ example: 'senhaSegura123', minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;
}
