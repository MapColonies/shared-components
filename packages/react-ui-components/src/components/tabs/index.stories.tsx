import React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { Tab, TabBar } from './';

const meta: Meta<typeof TabBar> = {
  component: TabBar,
};

type Story = StoryObj<typeof TabBar>;

export const tabBarStory: Story = {
  render: () => (
    <div style={{ display: 'flex',flexDirection: 'column', gap: 20 }}>
      <TabBar>
        <Tab>Cookies</Tab>
        <Tab>Pizza</Tab>
        <Tab>Icecream</Tab>
      </TabBar>

      <TabBar>
        <Tab icon="star_border" label="Cookies" />
        <Tab icon="favorite_border" label="Pizza" />
        <Tab icon="mood" label="Icecream" />
      </TabBar>
    </div>
  ),
};

export default meta;
