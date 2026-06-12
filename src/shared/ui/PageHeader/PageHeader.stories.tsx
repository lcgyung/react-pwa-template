import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '@/shared/ui/button';

import { PageHeader } from './PageHeader';

const meta = {
  title: 'Common/PageHeader',
  component: PageHeader,
  tags: ['autodocs'],
} satisfies Meta<typeof PageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: '사용자',
    description: '등록된 사용자 목록',
  },
};

export const WithAction: Story = {
  args: {
    title: '사용자',
    description: '등록된 사용자 목록',
    action: <Button>추가</Button>,
  },
};
