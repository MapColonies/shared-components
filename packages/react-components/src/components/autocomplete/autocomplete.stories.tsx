import type { StoryFn } from '@storybook/react';
import { TextField } from '@map-colonies/react-core';
import { CSFStory } from '../utils/story';

import Autocomplete from './autocomplete';

const meta = {
  title: 'Autocomplete',
  component: Autocomplete,
};
export default meta;

export const AutocompleteTextArea: CSFStory<JSX.Element> = () => (
  <>
    <h1>Autocomplete with native HTML TEXTAREA</h1>
    <Autocomplete
      {...{
        options: ['apple', 'apricot', 'banana', 'bounty'],
      }}
    />
  </>
);
AutocompleteTextArea.story = {
  name: 'Autocomplete with TEXTAREA HTML',
};

export const AutocompleteTextField: StoryFn = (args: Record<string, unknown>) => {
  return (
    <>
      <h1>Autocomplete with TEXTFIELD react-core component</h1>
      <Autocomplete
        {...{
          Component: <TextField />,
          ComponentProps: {
            name: 'autocomplete',
          },
          options: ['apple', 'apricot', 'banana', 'bounty'],
        }}
        {...args}
      />
    </>
  );
};
AutocompleteTextField.storyName = 'Autocomplete with TEXTFIELD component';
AutocompleteTextField.argTypes = {
  disabled: {
    defaultValue: false,
    control: {
      type: 'boolean',
    },
  },
  trigger: {
    defaultValue: '@',
    control: {
      type: 'text',
    },
  },
  spacer: {
    defaultValue: ' ',
    control: {
      type: 'text',
    },
  },
};

export const AutocompleteInCompletionModeEN: StoryFn = (args: Record<string, unknown>) => {
  return (
    <>
      <h1>Autocomplete with TEXTFIELD in AUTOCOMPLETE mode in English (LTR)</h1>
      <Autocomplete
        {...{
          Component: <TextField />,
          mode: 'autocomplete',
          options: ['apple', 'apricot', 'banana', 'bounty'],
        }}
        {...args}
      />
    </>
  );
};
AutocompleteInCompletionModeEN.storyName = 'Autocomplete in autocomplete MODE RTL';

export const AutocompleteInCompletionModeHEB: StoryFn = (args: Record<string, unknown>) => {
  return (
    <div style={{ direction: 'rtl' }}>
      <h1>Autocomplete with TEXTFIELD in AUTOCOMPLETE mode in Hebrew (RTL)</h1>
      <Autocomplete
        {...{
          Component: <TextField />,
          mode: 'autocomplete',
          options: ['אגוזאגוז', 'תפוח', 'אפרסק', 'בננה', 'אגוז'],
        }}
        {...args}
      />
    </div>
  );
};
AutocompleteInCompletionModeHEB.storyName = 'Autocomplete in autocomplete MODE LTR';
