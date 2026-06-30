import type { Decorator, ArgTypes } from '@storybook/react';

export interface CSFStory<StoryFnReturnType = unknown> {
  story?: {
    name?: string;
    decorators?: Decorator<StoryFnReturnType>[];
    parameters?: { [name: string]: unknown };
  };
  argTypes?: ArgTypes;
  (): StoryFnReturnType;
}
