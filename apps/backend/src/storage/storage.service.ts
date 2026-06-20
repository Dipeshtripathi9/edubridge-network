import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GetObjectCommand, PutObjectCommand, S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomBytes } from 'crypto';

export interface PresignedUpload {
  /** Presigned PUT URL, or null in dev when S3 is not configured. */
  uploadUrl: string | null;
  key: string;
  configured: boolean;
}

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly client: S3Client | null;
  private readonly bucket: string;
  private readonly ttl: number;

  constructor(private readonly config: ConfigService) {
    this.bucket = this.config.get<string>('s3.bucket') ?? '';
    this.ttl = this.config.get<number>('s3.signedUrlTtl') ?? 3600;
    const accessKeyId = this.config.get<string>('s3.accessKeyId');
    const secretAccessKey = this.config.get<string>('s3.secretAccessKey');

    if (this.bucket && accessKeyId && secretAccessKey) {
      this.client = new S3Client({
        region: this.config.get<string>('s3.region'),
        credentials: { accessKeyId, secretAccessKey },
      });
    } else {
      this.client = null;
      this.logger.warn('S3 not configured — file storage runs in dev (metadata-only) mode.');
    }
  }

  get isConfigured(): boolean {
    return this.client !== null;
  }

  /** Build a unique, namespaced object key. */
  buildKey(prefix: string, fileName: string): string {
    const safe = fileName.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-80);
    return `${prefix}/${randomBytes(8).toString('hex')}-${safe}`;
  }

  async getUploadUrl(key: string, contentType: string): Promise<PresignedUpload> {
    if (!this.client) return { uploadUrl: null, key, configured: false };
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });
    const uploadUrl = await getSignedUrl(this.client, command, { expiresIn: this.ttl });
    return { uploadUrl, key, configured: true };
  }

  async getDownloadUrl(key: string): Promise<string> {
    if (!this.client) {
      // Dev fallback: not a real URL, but lets the flow complete locally.
      return `about:blank#dev-storage/${encodeURIComponent(key)}`;
    }
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: key });
    return getSignedUrl(this.client, command, { expiresIn: this.ttl });
  }

  async delete(key: string): Promise<void> {
    if (!this.client) return;
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }
}
