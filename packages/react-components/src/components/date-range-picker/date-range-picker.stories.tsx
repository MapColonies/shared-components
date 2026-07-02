import { action } from 'storybook/actions';
import type { StoryFn } from '@storybook/react';
import { CSFStory } from '../utils/story';
import { SupportedLocales } from '../models/enums';
import { DateTimeRangePicker } from './date-range-picker';
import { DateTimeRangePickerFormControl } from './date-range-picker.form-control';

const story = {
  title: 'Date Range Picker',
  component: DateTimeRangePicker,
};

export default story;

export const DateTime: CSFStory<JSX.Element> = () => <DateTimeRangePicker onChange={action('date changed')} />;

DateTime.story = {
  name: 'Date time range',
};

export const DateOnly: CSFStory<JSX.Element> = () => <DateTimeRangePicker showTime={false} onChange={action('date changed')} />;

DateOnly.story = {
  name: 'Date range (date only)',
};

export const DateNoFutureLimitTime: CSFStory<JSX.Element> = () => <DateTimeRangePicker disableFuture={false} onChange={action('date changed')} />;

DateNoFutureLimitTime.story = {
  name: 'Date time range no future limit',
};

export const DateMinMaxLimitTime: CSFStory<JSX.Element> = () => {
  const minDate = new Date();
  const maxDate = new Date();
  const deltaInDays = 6;
  minDate.setDate(maxDate.getDate() - deltaInDays);
  maxDate.setDate(maxDate.getDate() + deltaInDays);
  return <DateTimeRangePicker onChange={action('date changed')} disableFuture={false} minDate={minDate} maxDate={maxDate} />;
};

DateMinMaxLimitTime.story = {
  name: 'Date time range with minDate & maxDate ',
};

export const DateTimeFormControl: StoryFn = (args: Record<string, unknown>) => {
  return <DateTimeRangePickerFormControl {...args} onChange={action('date changed')} />;
};

DateTimeFormControl.storyName = 'Date time range form control';

DateTimeFormControl.argTypes = {
  controlsLayout: {
    defaultValue: 'column',
    control: {
      type: 'select',
      options: ['row', 'column'],
    },
  },
  local: {
    control: {
      type: 'object',
    },
  },
  offset: {
    defaultValue: 32,
    control: {
      type: 'number',
    },
  },
};

export const DateTimeLocalizedFormControl: StoryFn = (args: Record<string, unknown>) => {
  const local = {
    setText: 'MySet',
    startPlaceHolderText: 'MyStart',
    endPlaceHolderText: 'MyEnd',
  };
  return (
    <DateTimeRangePickerFormControl
      local={local}
      from={new Date(1990, 1, 1)}
      to={new Date(1990, 1, 1)}
      width={360}
      {...args}
      onChange={action('date changed')}
    />
  );
};

DateTimeLocalizedFormControl.storyName = 'Date time range localized form control';

DateTimeLocalizedFormControl.argTypes = {
  controlsLayout: {
    defaultValue: 'column',
    control: {
      type: 'select',
      options: ['row', 'column'],
    },
  },
  local: {
    control: {
      type: 'object',
    },
  },
  offset: {
    defaultValue: 32,
    control: {
      type: 'number',
    },
  },
};

export const DateTimeLocalizedAsFormControl: StoryFn = (args: Record<string, unknown>) => {
  const local = {
    setText: 'MySet',
    startPlaceHolderText: 'MyStart',
    endPlaceHolderText: 'MyEnd',
  };
  return <DateTimeRangePickerFormControl local={local} renderAsButton={false} width={360} {...args} onChange={action('date changed')} />;
};

DateTimeLocalizedAsFormControl.storyName = 'Date time range looks like input';

DateTimeLocalizedAsFormControl.argTypes = {
  controlsLayout: {
    defaultValue: 'column',
    control: {
      type: 'select',
      options: ['row', 'column'],
    },
  },
  local: {
    control: {
      type: 'object',
    },
  },
  offset: {
    defaultValue: 32,
    control: {
      type: 'number',
    },
  },
};

export const DateTimeHebrewLocalizedAsFormControl: StoryFn = (args: Record<string, unknown>) => {
  const local = {
    setText: 'אישור',
    startPlaceHolderText: 'זמן התחלה',
    endPlaceHolderText: 'זמן סיום',
    calendarLocale: SupportedLocales.HE,
  };
  return <DateTimeRangePickerFormControl local={local} renderAsButton={false} width={360} {...args} onChange={action('date changed')} />;
};

DateTimeHebrewLocalizedAsFormControl.storyName = 'Date time range looks like input with Hebrew calendar';

DateTimeHebrewLocalizedAsFormControl.argTypes = {
  controlsLayout: {
    defaultValue: 'column',
    control: {
      type: 'select',
      options: ['row', 'column'],
    },
  },
  local: {
    control: {
      type: 'object',
    },
  },
  offset: {
    defaultValue: 32,
    control: {
      type: 'number',
    },
  },
};
