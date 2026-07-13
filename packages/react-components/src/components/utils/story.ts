import type { Decorator, ArgTypes } from '@storybook/react';

export interface CSFStory<StoryFnReturnType = unknown, StoryArgs = unknown> {
  story?: {
    name?: string;
    decorators?: Decorator<StoryFnReturnType>[];
    parameters?: { [name: string]: unknown };
  };
  args?: Partial<StoryArgs>;
  argTypes?: ArgTypes;
  (args: StoryArgs): StoryFnReturnType;
}
