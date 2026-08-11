import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
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
    await this.s3.send(new PutObjectCommand({ Bucket: this.bucket, Key: key, Body: buffer, ContentType: mimeType }));
    return `${this.publicBaseUrl}/${key}`;
  }

  async uploadPrivateBuffer(buffer: Buffer, mimeType: string, folder: string): Promise<string> {
    const ext = mimeType.split('/')[1] ?? 'bin';
    const key = `${folder}/${uuidv4()}.${ext}`;
    await this.s3.send(new PutObjectCommand({ Bucket: this.bucket, Key: key, Body: buffer, ContentType: mimeType, CacheControl: 'private, no-store' }));
    return `s3://${this.bucket}/${key}`;
  }

  async signedReadUrl(reference: string, expiresIn = 900): Promise<string> {
    const key = this.privateKey(reference);
    if (!key) return reference;
    return getSignedUrl(this.s3, new GetObjectCommand({ Bucket: this.bucket, Key: key }), { expiresIn: Math.min(3600, Math.max(60, expiresIn)) });
  }

  async deletePublicUrl(url: string): Promise<void> {
    const key = this.privateKey(url) || (url.startsWith(`${this.publicBaseUrl}/`) ? decodeURIComponent(url.slice(this.publicBaseUrl.length + 1)) : '');
    if (!key || key.includes('..')) return;
    await this.s3.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }

  private privateKey(reference: string) {
    const prefix = `s3://${this.bucket}/`;
    return reference.startsWith(prefix) ? reference.slice(prefix.length) : '';
  }
}
