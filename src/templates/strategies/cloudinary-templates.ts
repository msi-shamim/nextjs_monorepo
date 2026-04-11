import type { ProjectConfig } from '../../project-config.js';
import type { StorageStrategy } from './storage-strategy.js';

export class CloudinaryTemplateStrategy implements StorageStrategy {
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
    "cloudinary": "${config.versions['cloudinary'] ?? '^2.6.0'}"
  },
  "devDependencies": {
    "typescript": "${config.versions['typescript'] ?? '^5.8.3'}"
  }
}
`;
  }

  index(_config: ProjectConfig): string {
    return `export { cloudinary } from './client.js';
export { uploadFile } from './upload.js';
export { getOptimizedUrl, getTransformUrl } from './download.js';
`;
  }

  client(_config: ProjectConfig): string {
    return `import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export { cloudinary };
`;
  }

  uploadService(_config: ProjectConfig): string {
    return `import { cloudinary } from './client.js';

interface UploadOptions {
  folder?: string;
  resourceType?: 'image' | 'video' | 'raw' | 'auto';
  transformation?: Record<string, unknown>;
}

/** Upload a file to Cloudinary */
export async function uploadFile(
  filePath: string,
  options: UploadOptions = {},
) {
  const result = await cloudinary.uploader.upload(filePath, {
    folder: options.folder ?? 'uploads',
    resource_type: options.resourceType ?? 'auto',
    transformation: options.transformation,
  });

  return {
    publicId: result.public_id,
    url: result.secure_url,
    format: result.format,
    width: result.width,
    height: result.height,
    bytes: result.bytes,
  };
}

/** Upload from a buffer */
export async function uploadBuffer(
  buffer: Buffer,
  options: UploadOptions = {},
): Promise<{ publicId: string; url: string }> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: options.folder ?? 'uploads',
          resource_type: options.resourceType ?? 'auto',
        },
        (error, result) => {
          if (error || !result) return reject(error ?? new Error('Upload failed'));
          resolve({ publicId: result.public_id, url: result.secure_url });
        },
      )
      .end(buffer);
  });
}
`;
  }

  downloadService(_config: ProjectConfig): string {
    return `import { cloudinary } from './client.js';

/** Get an optimized URL for an image */
export function getOptimizedUrl(publicId: string, options: { width?: number; height?: number; quality?: string } = {}) {
  return cloudinary.url(publicId, {
    fetch_format: 'auto',
    quality: options.quality ?? 'auto',
    ...(options.width ? { width: options.width, crop: 'scale' } : {}),
    ...(options.height ? { height: options.height, crop: 'scale' } : {}),
  });
}

/** Get a transformed URL */
export function getTransformUrl(publicId: string, transformation: Record<string, unknown>) {
  return cloudinary.url(publicId, transformation);
}
`;
  }

  apiRoutes(_config: ProjectConfig): Record<string, string> {
    return {};
  }
}
