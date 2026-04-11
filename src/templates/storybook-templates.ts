/**
 * Storybook templates — config and stories for packages/ui/.
 */

import type { ProjectConfig } from '../project-config.js';

/** packages/ui/.storybook/main.ts */
export function storybookMain(_config: ProjectConfig): string {
  return `import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-essentials'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
};

export default config;
`;
}

/** packages/ui/.storybook/preview.ts */
export function storybookPreview(_config: ProjectConfig): string {
  return `import type { Preview } from '@storybook/react';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
`;
}

/** packages/ui/src/components/button.stories.tsx */
export function buttonStories(_config: ProjectConfig): string {
  return `import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'outline', 'ghost'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: { variant: 'primary', children: 'Primary Button' },
};

export const Secondary: Story = {
  args: { variant: 'secondary', children: 'Secondary Button' },
};

export const Outline: Story = {
  args: { variant: 'outline', children: 'Outline Button' },
};

export const Ghost: Story = {
  args: { variant: 'ghost', children: 'Ghost Button' },
};

export const Small: Story = {
  args: { variant: 'primary', size: 'sm', children: 'Small' },
};

export const Large: Story = {
  args: { variant: 'primary', size: 'lg', children: 'Large' },
};
`;
}

/** packages/ui/src/components/card.stories.tsx */
export function cardStories(_config: ProjectConfig): string {
  return `import type { Meta, StoryObj } from '@storybook/react';
import { Card } from './card';

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  args: {
    title: 'Card Title',
    description: 'This is a card description with some example text.',
    children: 'Card content goes here.',
  },
};

export const TitleOnly: Story = {
  args: {
    title: 'Just a Title',
  },
};

export const WithContent: Story = {
  args: {
    title: 'Interactive Card',
    description: 'A card with custom content.',
    children: 'Custom child content rendered inside the card.',
  },
};
`;
}

/** packages/ui/src/components/input.stories.tsx */
export function inputStories(_config: ProjectConfig): string {
  return `import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './input';

const meta: Meta<typeof Input> = {
  title: 'Components/Input',
  component: Input,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    label: 'Email',
    placeholder: 'Enter your email',
  },
};

export const WithError: Story = {
  args: {
    label: 'Email',
    placeholder: 'Enter your email',
    error: 'Invalid email address',
  },
};

export const NoLabel: Story = {
  args: {
    placeholder: 'Search...',
  },
};
`;
}
