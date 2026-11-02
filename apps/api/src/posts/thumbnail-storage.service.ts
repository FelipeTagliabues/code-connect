import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { basename, join, resolve } from 'node:path';

export const THUMBNAIL_MAX_BYTES = 5 * 1024 * 1024;
export const UPLOADS_ROUTE = '/uploads';

export type ThumbnailFile = { buffer: Buffer };

export function getUploadsDir(): string {
  return resolve(process.env.UPLOADS_DIR ?? 'uploads');
}

/** Olha os bytes iniciais: o mimetype e o nome do arquivo vêm do cliente. */
function detectImageExtension(buffer: Buffer): string | undefined {
  const startsWith = (bytes: number[], offset = 0) =>
    bytes.every((byte, index) => buffer[offset + index] === byte);

  if (startsWith([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return 'png';
  }
  if (startsWith([0xff, 0xd8, 0xff])) {
    return 'jpg';
  }
  // WebP: "RIFF", 4 bytes de tamanho e "WEBP".
  if (
    startsWith([0x52, 0x49, 0x46, 0x46]) &&
    startsWith([0x57, 0x45, 0x42, 0x50], 8)
  ) {
    return 'webp';
  }
  return undefined;
}

@Injectable()
export class ThumbnailStorageService {
  async save(file: ThumbnailFile): Promise<string> {
    const extension = detectImageExtension(file.buffer);
    if (!extension) {
      throw new UnprocessableEntityException({
        statusCode: 422,
        message: 'Validation failed',
        errors: [
          {
            field: 'thumbnail',
            messages: ['thumbnail must be a PNG, JPG or WebP image'],
          },
        ],
      });
    }

    const directory = getUploadsDir();
    await mkdir(directory, { recursive: true });
    const fileName = `${randomUUID()}.${extension}`;
    await writeFile(join(directory, fileName), file.buffer);
    return `${UPLOADS_ROUTE}/${fileName}`;
  }

  async remove(thumbnailUrl: string): Promise<void> {
    await rm(join(getUploadsDir(), basename(thumbnailUrl)), { force: true });
  }
}
