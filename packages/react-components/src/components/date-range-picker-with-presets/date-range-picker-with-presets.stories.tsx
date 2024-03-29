import { DateRangePicker as DateRangePickerWithPresets} from '.';
import { Meta, Story } from '@storybook/react';
import './styles';
import { endOfWeek, startOfMonth, startOfWeek, startOfYear, subWeeks } from 'date-fns';

const meta: Meta<typeof DateRangePickerWithPresets> = {
  title: 'Date Range Picker With Presets',
  component: DateRangePickerWithPresets,
};

export const DateRangePickerExample: Story = (args: Record<string, unknown>) => {
  return (
    <>
      <DateRangePickerWithPresets
        wrapperClassName="wrapper"
        calendarClassName="calendar"
        popperClassName="popper"
        dayClassName={() => 'day'}
        monthClassName={() => 'month'}
        shouldCloseOnSelect={false}
        selectsRange
        locale="en"
        autoFocus={false}
        dateFormat="dd/MM/yyyy"
        placeholderText="Pick date and time range"
        maxDate={new Date()}
        withShortcuts={[
          {id: "1", label: 'היום', startDate: new Date(), endDate: new Date()},
          {id: "2", label: 'מתחילת השבוע', startDate: startOfWeek(new Date(), {weekStartsOn: 0}), endDate: new Date()},
          () => {
            const lastWeekStart = startOfWeek(subWeeks(new Date(), 1));
            const lastWeekEnd = endOfWeek(lastWeekStart);

            return { id: "3", label: 'שבוע שעבר', startDate: lastWeekStart, endDate: lastWeekEnd }
          },
          {id: "4", label: 'מתחילת החודש', startDate: startOfMonth(new Date()), endDate: new Date()},
          {id: "5", label: 'מתחילת השנה', startDate: startOfYear(new Date()), endDate: new Date()},
        ]}
        isClearable
        showMonthYearDropdown
        dateFormatCalendar="MMMM"
      />
      <div>
        <a rel="noreferrer" target="_blank" href="https://reactdatepicker.com/">
          More examples here
        </a>
      </div>
    </>
  );
}


export default meta;
