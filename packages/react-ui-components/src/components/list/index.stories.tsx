import React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { List, ListItem, ListItemGraphic, ListItemMeta, ListItemPrimaryText, ListItemSecondaryText, ListItemText } from '../list';
import './styles.js';

const meta: Meta<typeof List> = {
  component: List,
};

type Story = StoryObj<typeof List>;

export const listStory: Story = {
  render: () => (
    <>
      <List twoLine>
        <ListItem>
          <ListItemGraphic icon="star_border" />
          <ListItemText>
            <ListItemPrimaryText>Cookies</ListItemPrimaryText>
            <ListItemSecondaryText>$4.99 a dozen</ListItemSecondaryText>
          </ListItemText>
          <ListItemMeta icon="info" />
        </ListItem>
        <ListItem>
          <ListItemGraphic icon="local_pizza" />
          <ListItemText>
            <ListItemPrimaryText>Pizza</ListItemPrimaryText>
            <ListItemSecondaryText>$1.99 a slice</ListItemSecondaryText>
          </ListItemText>
          <ListItemMeta icon="info" />
        </ListItem>
        <ListItem activated>
          <ListItemGraphic icon="mood" />
          <ListItemText>
            <ListItemPrimaryText>Icecream</ListItemPrimaryText>
            <ListItemSecondaryText>$0.99 a scoop</ListItemSecondaryText>
          </ListItemText>
          <ListItemMeta>Winner!</ListItemMeta>
        </ListItem>
      </List>
    </>
  ),
};

export default meta;
