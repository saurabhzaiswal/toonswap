import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
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
    await this.s3.send(
      new PutObjectCommand({ Bucket: this.bucket, Key: key, Body: buffer, ContentType: mimeType }),
    );
    return `${this.publicBaseUrl}/${key}`;
  }

  async uploadPrivateBuffer(buffer: Buffer, mimeType: string, folder: string): Promise<string> {
    const ext = mimeType.split('/')[1] ?? 'bin';
    const key = `${folder}/${uuidv4()}.${ext}`;
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
        CacheControl: 'private, no-store',
      }),
    );
    return `s3://${this.bucket}/${key}`;
  }

  async createPrivateUpload(mimeType: string, folder: string, expiresIn = 600) {
    const ext = this.extensionFor(mimeType);
    const key = `${folder}/${uuidv4()}.${ext}`;
    const reference = `s3://${this.bucket}/${key}`;
    const uploadUrl = await getSignedUrl(
      this.s3,
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        ContentType: mimeType,
        CacheControl: 'private, no-store',
      }),
      { expiresIn: Math.min(900, Math.max(60, expiresIn)) },
    );
    return { reference, uploadUrl, expiresIn: Math.min(900, Math.max(60, expiresIn)) };
  }

  async privateObjectExists(reference: string): Promise<boolean> {
    const key = this.privateKey(reference);
    if (!key) return false;
    try {
      await this.s3.send(new HeadObjectCommand({ Bucket: this.bucket, Key: key }));
      return true;
    } catch {
      return false;
    }
  }

  async readPrivateObject(reference: string) {
    const key = this.privateKey(reference);
    if (!key) throw new Error('invalid private media reference');
    return this.s3.send(new GetObjectCommand({ Bucket: this.bucket, Key: key }));
  }

  async signedReadUrl(reference: string, expiresIn = 900): Promise<string> {
    const key = this.privateKey(reference);
    if (!key) return reference;
    return getSignedUrl(this.s3, new GetObjectCommand({ Bucket: this.bucket, Key: key }), {
      expiresIn: Math.min(3600, Math.max(60, expiresIn)),
    });
  }

  async deletePublicUrl(url: string): Promise<void> {
    const key =
      this.privateKey(url) ||
      (url.startsWith(`${this.publicBaseUrl}/`)
        ? decodeURIComponent(url.slice(this.publicBaseUrl.length + 1))
        : '');
    if (!key || key.includes('..')) return;
    await this.s3.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }

  private privateKey(reference: string) {
    const prefix = `s3://${this.bucket}/`;
    return reference.startsWith(prefix) ? reference.slice(prefix.length) : '';
  }

  private extensionFor(mimeType: string) {
    const extensions: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'audio/mpeg': 'mp3',
      'audio/mp4': 'm4a',
      'audio/x-m4a': 'm4a',
      'audio/wav': 'wav',
      'audio/webm': 'webm',
      'video/mp4': 'mp4',
    };
    return extensions[mimeType] || 'bin';
  }
}
