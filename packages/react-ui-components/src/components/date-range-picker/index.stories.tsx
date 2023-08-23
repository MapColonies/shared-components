import { DateRangePicker } from '.';
import { Meta, StoryObj } from '@storybook/react';

import './styles';
import { useState } from 'react';

const meta: Meta<typeof DateRangePicker> = {
  component: DateRangePicker,
};

type Story = StoryObj<typeof DateRangePicker>;

function DateRangePickerExample() {
  const [dateStart, setDateStart] = useState<Date | null>(null);
  const [dateEnd, setDateEnd] = useState<Date | null>(null);

  return (
    <>
      <DateRangePicker
        wrapperClassName="wrapper"
        calendarClassName="calendar"
        popperClassName="popper"
        dayClassName={() => 'day'}
        monthClassName={() => 'month'}
        shouldCloseOnSelect={false}
        selectsRange
        setEndDate={setDateEnd}
        setStartDate={setDateStart}
        startDate={dateStart}
        endDate={dateEnd}
        locale="he"
        autoFocus={false}
        dateFormat="dd/MM/yyyy HH:mm"
        placeholderText="Pick date and time range"
        isClearable
        showIcon
        startTimeLabel='Start time'
        endTimeLabel='End time'
      />
      <div>
        <a rel="noreferrer" target="_blank" href="https://reactdatepicker.com/">
          More examples here
        </a>
      </div>
    </>
  );
}

export const DateRangePickerStory: Story = {
  render: () => (
    <>
      <DateRangePickerExample />
    </>
  ),
};

export default meta;
