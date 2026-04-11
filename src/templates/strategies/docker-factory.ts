import type { Docker } from '../../project-config.js';
import type { DockerStrategy } from './docker-strategy.js';
import { DockerFullTemplateStrategy } from './docker-full-templates.js';
import { DockerMinimalTemplateStrategy } from './docker-minimal-templates.js';

export function createDockerStrategy(docker: Docker): DockerStrategy | null {
  switch (docker) {
    case 'full':
      return new DockerFullTemplateStrategy();
    case 'minimal':
      return new DockerMinimalTemplateStrategy();
    case 'none':
      return null;
  }
}
