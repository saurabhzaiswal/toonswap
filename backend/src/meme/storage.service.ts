import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class StorageService {
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly publicBaseUrl: string;

  constructor(private readonly config: ConfigService) {
    this.bucket = this.config.get<string>('S3_BUCKET') as string;
    this.publicBaseUrl = this.config.get<string>('S3_PUBLIC_BASE_URL') as string;
    this.s3 = new S3Client({
      region: this.config.get<string>('S3_REGION') as string,
      endpoint: this.config.get<string>('S3_ENDPOINT'),
      credentials: {
        accessKeyId: this.config.get<string>('S3_ACCESS_KEY') as string,
        secretAccessKey: this.config.get<string>('S3_SECRET_KEY') as string,
      },
    });
  }

  async uploadBuffer(buffer: Buffer, mimeType: string, folder: string): Promise<string> {
    const ext = mimeType.split('/')[1] ?? 'bin';
    const key = `${folder}/${uuidv4()}.${ext}`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
        ACL: 'public-read',
      }),
    );

    return `${this.publicBaseUrl}/${key}`;
  }
}
