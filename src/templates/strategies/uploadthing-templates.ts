import type { ProjectConfig } from '../../project-config.js';
import type { StorageStrategy } from './storage-strategy';

export class UploadThingTemplateStrategy implements StorageStrategy {
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
    "uploadthing": "${config.versions['uploadthing'] ?? '^7.6.0'}",
    "@uploadthing/react": "${config.versions['@uploadthing/react'] ?? '^7.3.0'}"
  },
  "devDependencies": {
    "typescript": "${config.versions['typescript'] ?? '^5.8.3'}"
  }
}
`;
  }

  index(_config: ProjectConfig): string {
    return `export { utapi } from './client';
`;
  }

  client(_config: ProjectConfig): string {
    return `import { UTApi } from 'uploadthing/server';

export const utapi = new UTApi();
`;
  }

  uploadService(_config: ProjectConfig): string {
    return `// UploadThing handles uploads via file router (see apps/web/app/api/uploadthing/)
// Use the utapi for server-side file operations

export { utapi } from './client';
`;
  }

  downloadService(_config: ProjectConfig): string {
    return `import { utapi } from './client';

/** Get file URLs from UploadThing */
export async function getFileUrls(fileKeys: string[]) {
  const response = await utapi.getFileUrls(fileKeys);
  return response.data;
}

/** Delete files from UploadThing */
export async function deleteFiles(fileKeys: string[]) {
  await utapi.deleteFiles(fileKeys);
}
`;
  }

  apiRoutes(_config: ProjectConfig): Record<string, string> {
    return {
      'apps/web/app/api/uploadthing/core.ts': `import { createUploadthing, type FileRouter } from 'uploadthing/next';

const f = createUploadthing();

export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: '4MB', maxFileCount: 4 } })
    .onUploadComplete(async ({ file }) => {
      console.log('Upload complete:', file.url);
      return { url: file.url };
    }),

  documentUploader: f({ pdf: { maxFileSize: '16MB' }, text: { maxFileSize: '1MB' } })
    .onUploadComplete(async ({ file }) => {
      console.log('Document uploaded:', file.name);
      return { url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
`,
      'apps/web/app/api/uploadthing/route.ts': `import { createRouteHandler } from 'uploadthing/next';
import { ourFileRouter } from './core';

export const { GET, POST } = createRouteHandler({ router: ourFileRouter });
`,
    };
  }
}
