import type { ProjectConfig } from '../../project-config.js';
import type { StorageStrategy } from './storage-strategy.js';

export class S3TemplateStrategy implements StorageStrategy {
  packageJson(config: ProjectConfig): string {
    return `{
  "name": "@${config.name}/storage",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts"
  },
  "dependencies": {
    "@aws-sdk/client-s3": "${config.versions['@aws-sdk/client-s3'] ?? '^3.750.0'}",
    "@aws-sdk/s3-request-presigner": "${config.versions['@aws-sdk/s3-request-presigner'] ?? '^3.750.0'}"
  },
  "devDependencies": {
    "typescript": "${config.versions['typescript'] ?? '^5.8.3'}"
  }
}
`;
  }

  index(_config: ProjectConfig): string {
    return `export { s3Client } from './client.js';
export { uploadFile, getUploadUrl } from './upload.js';
export { getDownloadUrl } from './download.js';
`;
  }

  client(_config: ProjectConfig): string {
    return `import { S3Client } from '@aws-sdk/client-s3';

export const s3Client = new S3Client({
  region: process.env.AWS_REGION ?? 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? '',
  },
  ...(process.env.S3_ENDPOINT ? { endpoint: process.env.S3_ENDPOINT, forcePathStyle: true } : {}),
});

export const BUCKET_NAME = process.env.S3_BUCKET ?? 'uploads';
`;
  }

  uploadService(_config: ProjectConfig): string {
    return `import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client, BUCKET_NAME } from './client.js';

/** Upload a file buffer directly to S3 */
export async function uploadFile(key: string, body: Buffer, contentType: string) {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: body,
    ContentType: contentType,
  });

  await s3Client.send(command);
  return { key, bucket: BUCKET_NAME };
}

/** Generate a presigned upload URL (client uploads directly to S3) */
export async function getUploadUrl(key: string, contentType: string, expiresIn = 3600) {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  const url = await getSignedUrl(s3Client, command, { expiresIn });
  return { url, key };
}
`;
  }

  downloadService(_config: ProjectConfig): string {
    return `import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client, BUCKET_NAME } from './client.js';

/** Generate a presigned download URL */
export async function getDownloadUrl(key: string, expiresIn = 3600) {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  return getSignedUrl(s3Client, command, { expiresIn });
}
`;
  }

  apiRoutes(_config: ProjectConfig): Record<string, string> {
    return {};
  }
}
