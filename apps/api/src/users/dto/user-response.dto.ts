import { ApiProperty } from '@nestjs/swagger';
import type { User } from '../user.entity.js';

export class UserResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'Maria Silva' })
  name: string;

  @ApiProperty({ example: 'maria@email.com' })
  email: string;

  @ApiProperty({ example: '11987654321' })
  phone: string;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date;

  static fromEntity(user: User): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = user.id;
    dto.name = user.name;
    dto.email = user.email;
    dto.phone = user.phone;
    dto.createdAt = user.createdAt;
    return dto;
  }
}
