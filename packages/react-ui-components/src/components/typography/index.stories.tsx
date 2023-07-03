import React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { Typography } from './';
import './styles.js';

const meta: Meta<typeof Typography> = {
  component: Typography,
};

type Story = StoryObj<typeof Typography>;

export const typographyStory: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection:'column', gap: 20 }}>
      <>
        <Typography use="headline1">headline1</Typography>
        <Typography use="headline2">headline2</Typography>
        <Typography use="headline3">headline3</Typography>
        <Typography use="headline4">headline4</Typography>
        <Typography use="headline5">headline5</Typography>
        <Typography use="headline6">headline6</Typography>
        <Typography use="subtitle1">subtitle1</Typography>
        <Typography use="subtitle2">subtitle2</Typography>
        <Typography use="body1">body1</Typography>
        <Typography use="body2">body2</Typography>
        <Typography use="caption">caption</Typography>
      </>
    </div>
  ),
};

export default meta;
