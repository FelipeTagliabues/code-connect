import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ValidationErrorDto {
  @ApiProperty({ example: 'email' })
  field: string;

  @ApiProperty({ example: ['email must be an email'], type: [String] })
  messages: string[];
}

export class ErrorResponseDto {
  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({ example: 'Unauthorized' })
  message: string;

  @ApiPropertyOptional({ type: [ValidationErrorDto] })
  errors?: ValidationErrorDto[];
}
