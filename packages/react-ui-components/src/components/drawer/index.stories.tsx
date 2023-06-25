import React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { List, ListItem } from '../list';
import { Drawer, DrawerContent, DrawerHeader, DrawerSubtitle, DrawerTitle } from './';

const meta: Meta<typeof Drawer> = {
  component: Drawer,
};

type Story = StoryObj<typeof Drawer>;

export const drawerStory: Story = {
  render: () => (
    <>
      <Drawer>
        <DrawerHeader>
          <DrawerTitle>DrawerHeader</DrawerTitle>
          <DrawerSubtitle>Subtitle</DrawerSubtitle>
        </DrawerHeader>
        <DrawerContent>
          <List>
            <ListItem>Cookies</ListItem>
            <ListItem>Pizza</ListItem>
            <ListItem>Icecream</ListItem>
          </List>
        </DrawerContent>
      </Drawer>
    </>
  ),
};

export default meta;
