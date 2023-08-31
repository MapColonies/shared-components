import { forwardRef, useEffect, useMemo, useState } from 'react';
import DatePicker, { registerLocale, ReactDatePickerProps } from 'react-datepicker';
import datePickerHebrewLocale from 'date-fns/locale/he';
import moment from 'moment';
// import { ExtractProps } from '../typeHelpers';
import { TextField } from '../textfield';
import { Button } from '../button';
import { isSameDay } from 'date-fns';
import { ExtractProps } from '../typeHelpers';

export interface TimeRangeInputProps {
  setStartDate?: (startDate: Date | null) => void;
  setEndDate?: (endDate: Date | null) => void;
  startDate?: Date | null;
  endDate?: Date | null;
  timeRangeInputsWrapperClassName?: string;
  startTimeWrapperClassName?: string;
  endTimeWrapperClassName?: string;
  startTimeInputClassName?: string;
  endTimeInputClassName?: string;
  startTimeLabel?: string;
  endTimeLabel?: string;
}

interface Shortcut {
  id: string;
  label: string;
  startDate: Date;
  endDate: Date;
}

interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

const isDateRange = (date?: DateRange | Date | null): date is DateRange => {
  return typeof date !== 'undefined' && date !== null && 'startDate' in date && 'endDate' in date;
};

type DateRangePickerPropsToExclude =
  | 'selectsRange'
  | 'onChange'
  | 'customTimeInput'
  | 'timeInputLabel'
  | 'startDate'
  | 'endDate'
  | 'setStartDate'
  | 'setEndDate';
export interface ExtraDateRangePickerProps {
  locale?: 'he' | 'en';
  onChange?: (date: DateRange | Date | null, event?: React.SyntheticEvent<any>) => void;
  // withTimeRange?: boolean;
  withShortcuts?: (Shortcut | (() => Shortcut))[];
  selectsRange?: boolean;
}

interface ShortcutsProps {
  setStartDate?: (startDate: Date | null) => void;
  setEndDate?: (endDate: Date | null) => void;
  shortcuts: (Shortcut | (() => Shortcut))[];
  dateRange: DateRange;
}

export const TimeRangeInput: React.FC<TimeRangeInputProps> = ({
  endDate,
  startDate,
  setEndDate = () => {},
  setStartDate = () => {},
  endTimeInputClassName = '',
  endTimeLabel = '',
  endTimeWrapperClassName = '',
  timeRangeInputsWrapperClassName = '',
  startTimeInputClassName = '',
  startTimeLabel = '',
  startTimeWrapperClassName = '',
}) => {
  return (
    <div className={`timeRangeWrapper ${timeRangeInputsWrapperClassName}`}>
      <div className={`startTimeWrapper ${startTimeWrapperClassName}`}>
        <TextField
          label={startTimeLabel}
          disabled={startDate === null}
          className={`timeRangeInput ${startTimeInputClassName}`}
          name="start-time"
          type={'time'}
          value={moment(startDate).format('HH:mm')}
          onChange={(e) => {
            const dateStartMoment = moment(startDate);
            const startTime = moment(e.currentTarget.value, 'HH:mm');
            const withTime = dateStartMoment.set({
              hours: startTime.get('hours'),
              minutes: startTime.get('minutes'),
            });
            setStartDate(withTime.toDate());
          }}
        />
      </div>

      <div className={`endTimeWrapper ${endTimeWrapperClassName}`}>
        <TextField
          label={endTimeLabel}
          disabled={endDate === null}
          className={`timeRangeInput ${endTimeInputClassName}`}
          name="end-time"
          type={'time'}
          value={moment(endDate).format('HH:mm')}
          onChange={(e) => {
            const dateEndMoment = moment(endDate);
            const endTime = moment(e.currentTarget.value, 'HH:mm');
            const withTime = dateEndMoment.set({
              hours: endTime.get('hours'),
              minutes: endTime.get('minutes'),
            });
            setEndDate(withTime.toDate());
          }}
        />
      </div>
    </div>
  );
};

const CustomInput = forwardRef<HTMLInputElement, React.HTMLProps<HTMLInputElement>>(({ value, onClick, ...props }, ref) => (
  <TextField {...props} className="dateRangeCustomInput" readOnly onClick={onClick} ref={ref} value={value as string} />
));

const ShortcutsContainer: React.FC<ShortcutsProps> = ({ setStartDate = () => {}, setEndDate = () => {}, shortcuts, dateRange }) => {
  const [shortcutSelectedId, setShortcutSelectedId] = useState<string>();
  const shortcutsList = useMemo(
    () => shortcuts.map((shortcutOrFunction) => (shortcutOrFunction instanceof Function ? shortcutOrFunction() : shortcutOrFunction)),
    [shortcuts]
  );

  useEffect(() => {
    for (const shortcut of shortcutsList) {
      const isSelectedRangeAsShortcut =
        dateRange.startDate &&
        dateRange.endDate &&
        isSameDay(shortcut.startDate, dateRange.startDate) &&
        isSameDay(shortcut.endDate, dateRange.endDate);

      if (shortcutSelectedId) {
        if (shortcut.id === shortcutSelectedId) {
          if (!isSelectedRangeAsShortcut) {
            setShortcutSelectedId(undefined);
          }
        }
      } else if (isSelectedRangeAsShortcut) {
        setShortcutSelectedId(shortcut.id);
      }
    }
  }, [dateRange, shortcutSelectedId, shortcutsList]);

  return (
    <div className="shortcutsContainer">
      {shortcutsList.map((shortcut, i) => {
        const handleShortcutClick: React.MouseEventHandler<HTMLButtonElement> = () => {
          setStartDate(shortcut.startDate);
          setEndDate(shortcut.endDate);
        };

        return (
          <Button
            type="button"
            className={`shortcut ${shortcutSelectedId === shortcut.id ? 'selected' : ''}`}
            key={shortcut.id + i}
            onClick={handleShortcutClick}
            unelevated
            ripple={false}
            outlined
          >
            {shortcut.label}
          </Button>
        );
      })}
    </div>
  );
};

export const DateRangePicker: React.FC<Omit<ExtractProps<typeof DatePicker>, DateRangePickerPropsToExclude> & ExtraDateRangePickerProps> = (
  props
) => {
  const {
    // Time range input props
    // endTimeInputClassName,
    // endTimeLabel,
    // endTimeWrapperClassName,
    // timeRangeInputsWrapperClassName,
    // startTimeInputClassName,
    // startTimeLabel,
    // startTimeWrapperClassName,
    // ---------------
    calendarClassName,
    dayClassName,
    monthClassName,
    selectsRange,
    onChange,
    // withTimeRange,
    withShortcuts,
    locale = 'en',
  } = props;

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const date: DateRange | Date | null = selectsRange ? { startDate, endDate } : startDate;

  useEffect(() => {
    if (locale === 'he') {
      // Register external locale hebrew data from date-fns.
      registerLocale('he', datePickerHebrewLocale);
    }
  }, [locale]);

  const containerClassName = useMemo(() => {
    let className = locale === 'he' ? 'pickerContainer-rtl' : 'pickerContainer';
    if (withShortcuts && selectsRange) {
      className += ' pickerContainer-withShortcuts';
    }

    return className;
  }, [locale, withShortcuts, selectsRange]);

  return (
    <div className={containerClassName} style={{ direction: locale === 'he' ? 'rtl' : 'ltr' }}>
      <DatePicker
        {...props}
        startDate={isDateRange(date) ? startDate : undefined}
        selected={!isDateRange(date) ? startDate : undefined}
        endDate={isDateRange(date) ? endDate : undefined}
        monthsShown={props.monthsShown ?? 2}
        calendarClassName={`pickerCalendar ${calendarClassName}`}
        weekDayClassName={(date) => {
          return `pickerWeek ${dayClassName?.(date) ?? ''}`;
        }}
        dayClassName={(date) => {
          return `pickerDay ${dayClassName?.(date) ?? ''}`;
        }}
        monthClassName={(date) => {
          return `pickerMonth ${monthClassName?.(date) ?? ''}`;
        }}
        onChange={(newDate, event) => {
          if (Array.isArray(newDate)) {
            const [start, end] = newDate;
            setStartDate(start);
            setEndDate(end);

            onChange?.({ startDate: start, endDate: end }, event);
          } else {
            setStartDate(newDate);
            onChange?.(newDate, event);
          }
        }}
        customInput={<CustomInput />}
        showTimeInput={!!(withShortcuts && selectsRange)}
        timeInputLabel=""
        customTimeInput={
          withShortcuts &&
          isDateRange(date) && <ShortcutsContainer shortcuts={withShortcuts} setEndDate={setEndDate} setStartDate={setStartDate} dateRange={date} />
        }
      >
        {/* selectsRange && withTimeRange && isDateRange(date) && (
          <TimeRangeInput
            timeRangeInputsWrapperClassName={timeRangeInputsWrapperClassName}
            startTimeWrapperClassName={startTimeWrapperClassName}
            endTimeWrapperClassName={endTimeWrapperClassName}
            startTimeInputClassName={startTimeInputClassName}
            endTimeInputClassName={endTimeInputClassName}
            endTimeLabel={endTimeLabel}
            startTimeLabel={startTimeLabel}
            endDate={endDate}
            startDate={startDate}
            setEndDate={setEndDate}
            setStartDate={setStartDate}
          />
        ) */}
      </DatePicker>
    </div>
  );
};
