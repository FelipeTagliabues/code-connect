import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

/** No multipart, uma tag única chega como string e não como array. */
function normalizeTags({ value }: { value: unknown }): unknown {
  const list: unknown[] = Array.isArray(value) ? value : [value];
  if (!list.every((tag) => typeof tag === 'string')) return value;

  const byLowerCase = new Map<string, string>();
  for (const tag of list as string[]) {
    const name = tag.trim();
    if (name && !byLowerCase.has(name.toLowerCase())) {
      byLowerCase.set(name.toLowerCase(), name);
    }
  }
  return [...byLowerCase.values()];
}

export class CreatePostDto {
  @ApiProperty({ example: 'React zero to hero', maxLength: 120 })
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  title: string;

  @ApiProperty({ example: 'Um guia do básico ao avançado.', maxLength: 5000 })
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  description: string;

  @ApiPropertyOptional({ example: 'const answer = 42', maxLength: 20000 })
  @IsOptional()
  @IsString()
  @MaxLength(20000)
  code?: string;

  @ApiPropertyOptional({ example: ['React', 'Front-end'], type: [String] })
  @IsOptional()
  @Transform(normalizeTags)
  @IsArray()
  @ArrayMaxSize(8)
  @IsString({ each: true })
  @MaxLength(30, { each: true })
  tags?: string[];
}

/** Apenas para o Swagger: o arquivo chega por FileInterceptor, fora do body. */
export class CreatePostFormDto extends CreatePostDto {
  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'PNG, JPG ou WebP de até 5 MB.',
  })
  thumbnail?: unknown;
}
