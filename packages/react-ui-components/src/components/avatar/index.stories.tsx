import React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { Avatar, AvatarCount, AvatarGroup } from './';

const meta: Meta<typeof Avatar> = {
  component: Avatar,
};

type Story = StoryObj<typeof Avatar>;

export const avatarStory: Story = {
  render: () => (
    <>
      <Avatar src="./favicon.ico" contain interactive size="xsmall" name="xsmall" />
      <Avatar src="./favicon.ico" contain interactive size="small" name="small" />
      <Avatar src="./favicon.ico" contain interactive size="medium" name="medium" />
      <Avatar src="./favicon.ico" contain interactive size="large" name="large" />
      <Avatar src="./favicon.ico" contain interactive size="xlarge" name="xlarge" />
    </>
  ),
};

export const avatarGroupStory: Story = {
  render: () => (
    <>
      <AvatarGroup dense>
        <Avatar src="./favicon.ico" contain interactive size="large" name="large" />
        <Avatar src="./favicon.ico" contain interactive size="large" name="large" />
        <Avatar src="./favicon.ico" contain interactive size="large" name="large" />
        <Avatar src="./favicon.ico" contain interactive size="large" name="large" />
        <AvatarCount size="large" overflow value={12} interactive />
      </AvatarGroup>
    </>
  ),
};

export default meta;
