import React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { ListDivider } from '../list';
import { Button } from '../button';
import { Menu, MenuItem, MenuSurfaceAnchor } from './';

const meta: Meta<typeof Menu> = {
  component: Menu,
};

type Story = StoryObj<typeof Menu>;

const MenuExample: React.FC  = () => {
    const [open, setOpen] = React.useState(false);

    return (
      <MenuSurfaceAnchor>
        <Menu
          open={open}
          onClose={(): void => setOpen(false)}
        >
          <MenuItem>Cookies</MenuItem>
          <MenuItem>Pizza</MenuItem>
          {/** MenuItem is just a ListItem, so you can intermingle other List components */}
          <ListDivider />
          <MenuItem>Icecream</MenuItem>
        </Menu>
  
        <Button raised onClick={(): void => setOpen(!open)}>
          Menu
        </Button>
      </MenuSurfaceAnchor>
    );
}

export const menuStory: Story = {
  render: () => (
    <>
      <MenuExample />
    </>
  ),
};

export default meta;
