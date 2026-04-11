import type { Storage } from '../../project-config.js';
import type { StorageStrategy } from './storage-strategy.js';
import { S3TemplateStrategy } from './s3-templates.js';
import { UploadThingTemplateStrategy } from './uploadthing-templates.js';
import { CloudinaryTemplateStrategy } from './cloudinary-templates.js';

export function createStorageStrategy(storage: Storage): StorageStrategy | null {
  switch (storage) {
    case 's3':
      return new S3TemplateStrategy();
    case 'uploadthing':
      return new UploadThingTemplateStrategy();
    case 'cloudinary':
      return new CloudinaryTemplateStrategy();
    case 'none':
      return null;
  }
}
